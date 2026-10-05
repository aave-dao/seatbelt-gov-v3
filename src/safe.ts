import "dotenv/config";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import {
  Address,
  Hex,
  PublicClient,
  encodeFunctionData,
  getAddress,
  pad,
  toHex,
  zeroAddress,
} from "viem";
import { getAddressBookReferences } from "@aave-dao/aave-address-book/utils";
import { ISafe_ABI, getClient, tenderly_sim } from "@aave-dao/toolbox";
import { eventDb } from "@aave-dao/aave-helpers-js";
import { Option, program } from "commander";
import { providerConfig } from "./common";
import {
  MULTI_SEND_CALL_ONLY,
  TxBuilderBatch,
  buildPrevalidatedSignature,
  buildSafeTransaction,
} from "./safe-tooling/tx-builder";
import { renderSafeTenderlyReport } from "./tenderly-tooling/safe-report";
import { getMdContractName } from "./tenderly-tooling/utils";
import { UNCAPPED_GAS_LIMIT_CHAINS, flagAsKnown } from "./tenderly";

// slot of `threshold` on the safe (identical on 1.3.0 & 1.4.1)
const SAFE_THRESHOLD_SLOT = pad(toHex(4), { size: 32 });

function getReportFileName(chainId: number, safe: Address, file: string) {
  const storagePath = `./reports/multisig/${chainId}/${safe}`;
  if (!existsSync(storagePath)) mkdirSync(storagePath, { recursive: true });
  return path.join(storagePath, `${path.basename(file, ".json")}.md`);
}

export async function simulateSafeBatch(file: string, safeOverride?: Address) {
  const batch = JSON.parse(readFileSync(file, "utf8")) as TxBuilderBatch;
  const chainId = Number(batch.chainId);
  const safe =
    safeOverride ??
    (batch.meta.createdFromSafeAddress
      ? getAddress(batch.meta.createdFromSafeAddress)
      : undefined);
  if (!safe) throw new Error("safe address missing (use --safe)");
  if (!batch.transactions?.length) throw new Error("batch has no transactions");

  const client = getClient(chainId, { providerConfig }) as PublicClient;
  const [version, owners, threshold, nonce] = await Promise.all([
    client.readContract({
      address: safe,
      abi: ISafe_ABI.abi,
      functionName: "VERSION",
    }),
    client.readContract({
      address: safe,
      abi: ISafe_ABI.abi,
      functionName: "getOwners",
    }),
    client.readContract({
      address: safe,
      abi: ISafe_ABI.abi,
      functionName: "getThreshold",
    }),
    client.readContract({
      address: safe,
      abi: ISafe_ABI.abi,
      functionName: "nonce",
    }),
  ]);
  console.info(
    `Safe ${safe} on ${chainId}: version ${version}, threshold ${threshold}/${owners.length}, nonce ${nonce}`,
  );

  // the transaction builder batches through the newest MultiSendCallOnly deployed on the
  // chain, independently of the safe version, and the safeTxHash has to match the one it shows
  let multiSendCallOnly: Address | undefined;
  if (batch.transactions.length > 1) {
    for (const deployment of MULTI_SEND_CALL_ONLY) {
      if (await client.getCode({ address: deployment })) {
        multiSendCallOnly = deployment;
        break;
      }
    }
    if (!multiSendCallOnly)
      throw new Error(
        `no MultiSendCallOnly deployment found on chain ${chainId}`,
      );
  }
  const safeTx = buildSafeTransaction(batch.transactions, multiSendCallOnly);

  // the hash the signers will actually sign, assuming the batch is executed at the current nonce
  const safeTxHash = await client.readContract({
    address: safe,
    abi: ISafe_ABI.abi,
    functionName: "getTransactionHash",
    args: [
      safeTx.to,
      safeTx.value,
      safeTx.data,
      safeTx.operation,
      BigInt(0),
      BigInt(0),
      BigInt(0),
      zeroAddress,
      zeroAddress,
      nonce,
    ],
  });

  // simulate the actual execTransaction, sent by an owner with a pre-validated
  // signature, overriding the threshold to 1 so a single "signature" suffices
  const sender = owners[0];
  const simResult = await tenderly_sim(
    {
      projectSlug: process.env.TENDERLY_PROJECT_SLUG!,
      accountSlug: process.env.TENDERLY_ACCOUNT!,
      accessToken: process.env.TENDERLY_ACCESS_TOKEN!,
    },
    {
      network_id: chainId.toString(),
      from: sender,
      to: safe,
      input: encodeFunctionData({
        abi: ISafe_ABI.abi,
        functionName: "execTransaction",
        args: [
          safeTx.to,
          safeTx.value,
          safeTx.data,
          safeTx.operation,
          BigInt(0),
          BigInt(0),
          BigInt(0),
          zeroAddress,
          zeroAddress,
          buildPrevalidatedSignature(sender),
        ],
      }),
      gas: UNCAPPED_GAS_LIMIT_CHAINS.includes(chainId) ? 0 : 16_000_000,
      value: "0",
      state_objects: {
        [safe]: {
          storage: {
            [SAFE_THRESHOLD_SLOT]: pad(toHex(1), { size: 32 }),
          },
        },
      },
      save: true,
    },
  );

  const { report } = await renderSafeTenderlyReport({
    client,
    sim: simResult,
    batch,
    safe: {
      address: safe,
      version,
      threshold,
      owners,
      nonce,
      safeTxHash: safeTxHash as Hex,
    },
    multiSendCallOnly:
      batch.transactions.length > 1 ? multiSendCallOnly : undefined,
    eventCache: eventDb,
    config: {
      etherscanApiKey: process.env.ETHERSCAN_API_KEY!,
    },
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
  const fileName = getReportFileName(chainId, safe, file);
  writeFileSync(fileName, report);
  console.info(`report written to ${fileName}`);
}

program
  .requiredOption(
    "-f, --file <file>",
    "path to a json batch exported from the safe transaction builder",
  )
  .addOption(
    new Option(
      "--safe [safe]",
      "the address of the safe (defaults to meta.createdFromSafeAddress)",
    ),
  )
  .action(async (options) => {
    await simulateSafeBatch(
      options.file,
      options.safe ? getAddress(options.safe) : undefined,
    );
  })
  .showHelpAfterError()
  .parse();
