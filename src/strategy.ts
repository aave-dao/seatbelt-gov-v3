import { Address, getContract, PublicClient } from "viem";
import {
  getClient,
  getNonFinalizedPayloads,
  isPayloadFinal,
  isProposalFinal,
  Payload,
  IPayloadsController_ABI,
} from "@aave-dao/toolbox";
import treeJson from "./cache/tree.json";
import { TreeStructure } from "./cache/refreshTree";

const executeBeforeKey = (chainId: number, controller: Address, id: number) =>
  `${chainId}:${controller.toLowerCase()}:${id}`;

// payloads attached to a proposal that won't be queued, so later payloads must not assume their execution
const SKIP_EXECUTE_BEFORE = new Set([
  // lists the same asset as payload 128, which replaces it
  executeBeforeKey(43114, "0x1140CB7CAfAcC745771C2Ea31e7B5C653c5d0B80", 127),
]);

export type PayloadExecutionStrategy = {
  executeBefore: number[];
  alerts: string[];
  proposals?: number[];
  payload: Payload;
};

export async function generatePayloadsStrategy(
  chainId: number,
  payloadsController: Address,
  payloadId: number,
): Promise<PayloadExecutionStrategy> {
  const tree = treeJson as TreeStructure;
  const alerts: string[] = [];
  const client = getClient(chainId, {
    providerConfig: {
      alchemyKey: process.env.ALCHEMY_API_KEY,
      quicknodeToken: process.env.QUICKNODE_TOKEN,
      quicknodeEndpointName: process.env.QUICKNODE_ENDPOINT_NAME,
    },
  }) as PublicClient;
  const controllerContract = getContract({
    abi: IPayloadsController_ABI,
    client,
    address: payloadsController,
  });
  // if it's already final, we just simulate the existing transaction
  const payload = await controllerContract.read.getPayloadById([payloadId]);
  if (isPayloadFinal(payload.state)) {
    return { executeBefore: [], alerts, payload };
  }

  const node = tree.payloads[chainId]?.[payloadsController]?.[payloadId];
  if (node) {
    // there is at least one proposal which tries executing the payload
    // in this case we simulate the proposal based on the assumption that:
    // - all payload referenced on proposals with an id < payload.proposalId are already executed
    const allAttachedProposals = Object.keys(node) as unknown as number[];
    const activeProposalIds = allAttachedProposals.filter(
      (id) => !isProposalFinal(tree.governance[id as unknown as number].state),
    );
    if (activeProposalIds.length > 1) {
      alerts.push(
        `There are multiple running proposals that try executing the same payload. Proposals: ${activeProposalIds.join(
          ", ",
        )}`,
      );
    }
    if (!activeProposalIds.length) {
      alerts.push(
        `The payload was included in inactive proposals. Proposals: ${allAttachedProposals.join(
          ", ",
        )}`,
      );
      return { executeBefore: [], alerts, payload };
    }
    const nonFinalizedPayloads: number[] = [];
    for (let i = 0; i < activeProposalIds[0]; i++) {
      if (!isProposalFinal(tree.governance[i].state))
        nonFinalizedPayloads.push(
          ...tree.governance[i].payloads
            .filter((p) => p.chain === chainId)
            .map((p) => p.payloadId),
        );
    }
    return {
      executeBefore: nonFinalizedPayloads.filter(
        (pl) =>
          !SKIP_EXECUTE_BEFORE.has(
            executeBeforeKey(chainId, payloadsController, pl),
          ),
      ),
      alerts,
      proposals: allAttachedProposals,
      payload,
    };
  } else {
    // This state will only be reached before proposal creation
    // in this case we simulate the proposal based on the assumption that all currently existing payloads that are attached on a proposal are already executed
    const nonFilizedPayloads = await getNonFinalizedPayloads(
      client,
      payloadsController,
    );
    return {
      executeBefore: nonFilizedPayloads.filter(
        (pl) =>
          pl != payloadId &&
          tree.payloads[chainId]?.[payloadsController]?.[pl] &&
          !SKIP_EXECUTE_BEFORE.has(
            executeBeforeKey(chainId, payloadsController, pl),
          ),
      ),
      alerts,
      payload,
    };
  }
}
