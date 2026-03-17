import { getAddressBookReferences } from "@aave-dao/aave-address-book/utils";
import {
  ChainId,
  Payload,
  getClient,
  tenderly_createVnet,
  tenderly_sim,
  IPayloadsController_ABI,
} from "@bgd-labs/toolbox";
import { Address, encodeFunctionData, Hash, Hex } from "viem";
import { providerConfig } from "./common";
import { eventDb } from "@aave-dao/aave-helpers-js";
import { renderTenderlyReport } from "./tenderly-tooling/tenderly-report";
import { getMdContractName } from "./tenderly-tooling/utils";
import {
  getPayloadStorageOverrides,
  makePayloadExecutableOnTestClient,
} from "./tenderly-tooling/payloads-controller";

export const CHAIN_NOT_SUPPORTED_ON_TENDERLY: number[] = [ChainId.zkEVM];
export const NO_V_NET: number[] = [ChainId.zksync];

type SimulateOnTenderlyParams = {
  chainId: number;
  executeBefore: number[];
  payloadId: number;
  payloadsController: Address;
  cache: {
    logs: {
      createdLog: {
        transactionHash: Hash;
        blockNumber: number;
        timestamp: number;
      };
      queuedLog?: {
        transactionHash: Hash;
        blockNumber: number;
        timestamp: number;
      };
      executedLog?: {
        transactionHash: Hash;
        blockNumber: number;
        timestamp: number;
      };
    };
    payload: Payload;
  };
};

const EOA = "0xD73a92Be73EfbFcF3854433A5FcbAbF9c1316073";

export async function simulateOnTenderly({
  chainId,
  executeBefore,
  payloadId,
  payloadsController,
  cache,
}: SimulateOnTenderlyParams) {
  const tenderlyConfig = {
    projectSlug: process.env.TENDERLY_PROJECT_SLUG!,
    accountSlug: process.env.TENDERLY_ACCOUNT!,
    accessToken: process.env.TENDERLY_ACCESS_TOKEN!,
  };
  const executedLog = cache.logs.executedLog;
  const blockNumber = executedLog?.blockNumber
    ? Number(executedLog?.blockNumber)
    : -2;
  try {
    const vnet = await tenderly_createVnet(
      {
        baseChainId: chainId,
        forkChainId: chainId,
        displayName: `Seatbelt ${chainId} ${payloadId}`,
        slug: `seatbelt_${chainId}_${payloadId}`,
        blockNumber: blockNumber === -2 ? "latest" : blockNumber,
        force: true,
      },
      tenderlyConfig,
    );
    if (executedLog) {
      vnet.testClient.setNextBlockTimestamp({
        timestamp: BigInt(executedLog.timestamp),
      });
    }
    // first execute all previous payloads
    for (const before of executeBefore) {
      console.log(`assuming execution of ${before}`);
      try {
        await makePayloadExecutableOnTestClient(
          vnet.testClient,
          payloadsController,
          before,
        );
        await vnet.walletClient.writeContract({
          chain: { id: chainId } as any,
          abi: IPayloadsController_ABI,
          account: EOA,
          address: payloadsController,
          functionName: "executePayload",
          args: [before],
        });
      } catch (e) {
        console.error(`Failed to execute payload ${before}: ${e}`);
      }
    }
    // prepare the actual payload execution via state overrides
    await makePayloadExecutableOnTestClient(
      vnet.testClient,
      payloadsController,
      payloadId,
    );
    const simPayload = {
      network_id: chainId.toString(),
      from: EOA,
      to: payloadsController,
      input: encodeFunctionData({
        abi: IPayloadsController_ABI,
        functionName: "executePayload",
        args: [payloadId],
      }),
      block_number: blockNumber,
      transaction_index: 0,
      gas_limit: chainId !== ChainId.mantle ? 16_000_000 : 0,
      gas_price: "0",
      value: "0",
      access_list: [],
      generate_access_list: true,
      save: true,
      source: "dashboard",
    };
    const simResult = await vnet.simulate(simPayload);
    // after simulation execute payload
    await vnet.walletClient.writeContract({
      chain: { id: chainId } as any,
      abi: IPayloadsController_ABI,
      account: EOA,
      address: payloadsController,
      functionName: "executePayload",
      args: [payloadId],
    });
    const report = await renderTenderlyReport({
      payloadId: payloadId,
      payload: cache.payload,
      onchainLogs: cache.logs as any,
      sim: simResult,
      client: vnet.testClient,
      config: {
        etherscanApiKey: process.env.ETHERSCAN_API_KEY!,
      },
      eventCache: eventDb,
      getContractName: (sim, address) => {
        const references = getAddressBookReferences(
          address,
          Number(sim.simulation.network_id),
        );
        if (references.length > 0)
          return flagAsKnown(
            getMdContractName(sim.contracts, address),
            references[0],
          );
        return getMdContractName(sim.contracts, address);
      },
    });
    // await vnet.delete();
    return report;
  } catch (e) {
    console.log(e);
    console.log(
      "error simulating against a vnet, trying against the simulation endpoint",
    );
    const overrides = await getPayloadStorageOverrides(
      getClient(chainId, { providerConfig }),
      payloadsController,
      payloadId,
    );
    const simPayload = {
      network_id: chainId.toString(),
      from: EOA,
      to: payloadsController,
      input: encodeFunctionData({
        abi: IPayloadsController_ABI,
        functionName: "executePayload",
        args: [payloadId],
      }),
      block_number: blockNumber,
      state_objects: {
        [payloadsController]: {
          storage: overrides.reduce(
            (acc, val) => {
              acc[val.slot] = val.value;
              return acc;
            },
            {} as Record<Hex, Hex>,
          ),
        },
      },
      save: true,
    } as const;
    const simResult = await tenderly_sim(tenderlyConfig, simPayload);
    const report = await renderTenderlyReport({
      payload: cache.payload,
      payloadId: payloadId,
      onchainLogs: cache.logs as any,
      sim: simResult,
      client: getClient(chainId, {
        providerConfig,
      }),
      config: {
        etherscanApiKey: process.env.ETHERSCAN_API_KEY!,
      },
      eventCache: eventDb,
      getContractName: (sim, address) => {
        const references = getAddressBookReferences(
          address,
          Number(sim.simulation.network_id),
        );
        if (references.length)
          return flagAsKnown(
            getMdContractName(sim.contracts, address),
            references[0],
          );
        return getMdContractName(sim.contracts, address);
      },
    });
    return report;
  }
}

function flagAsKnown(value: string, reference: string) {
  return `${value} [:ghost:](https://github.com/aave-dao/aave-address-book  "${reference}")`;
}
