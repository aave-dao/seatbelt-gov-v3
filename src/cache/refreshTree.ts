/**
 * Constructs a tree of all currently existing proposals and their attached payloads
 */
import { writeFileSync } from "node:fs";
import path from "node:path";
import { Address, createPublicClient, getContract, http } from "viem";
import { mainnet } from "viem/chains";
import { GovernanceV3Ethereum } from "@aave-dao/aave-address-book";
import {
  ChainId,
  ProposalState,
  getRPCUrl,
  isProposalFinal,
  IGovernance_ABI,
} from "@bgd-labs/toolbox";
import tree from "./tree.json";
import { providerConfig } from "../common";
import { refreshLogs } from "./logs";

const mainnetClient = createPublicClient({
  chain: mainnet,
  transport: http(getRPCUrl(ChainId.mainnet, providerConfig)),
});

const governanceContract = getContract({
  client: mainnetClient,
  abi: IGovernance_ABI,
  address: GovernanceV3Ethereum.GOVERNANCE,
});

type ProposalId = number;
type PayloadId = number;
type PayloadsController = Address;

export interface TreeStructure {
  governance: Record<
    ProposalId,
    {
      state: ProposalState;
      payloads: {
        chain: number;
        payloadsController: PayloadsController;
        payloadId: number;
      }[];
    }
  >;
  payloads: Record<
    number,
    Record<PayloadsController, Record<PayloadId, Record<ProposalId, boolean>>>
  >;
}

(async function syncTree() {
  const treeCopy = tree as TreeStructure;
  const count = await governanceContract.read.getProposalsCount();
  for (let i = 0; i < count; i++) {
    if (
      !treeCopy.governance[i] ||
      !isProposalFinal(treeCopy.governance[i].state)
    ) {
      const proposal = await governanceContract.read.getProposal([BigInt(i)]);
      treeCopy.governance[i] = {
        state: proposal.state,
        payloads: proposal.payloads.map((pl) => ({
          chain: Number(pl.chain),
          payloadId: pl.payloadId,
          payloadsController: pl.payloadsController,
        })),
      };
      proposal.payloads.map((val) => {
        if (!treeCopy.payloads[Number(val.chain)])
          treeCopy.payloads[Number(val.chain)] = {
            [val.payloadsController]: { [val.payloadId]: {} },
          };
        if (!treeCopy.payloads[Number(val.chain)][val.payloadsController])
          treeCopy.payloads[Number(val.chain)][val.payloadsController] = {};
        if (
          !treeCopy.payloads[Number(val.chain)][val.payloadsController][
            val.payloadId
          ]
        )
          treeCopy.payloads[Number(val.chain)][val.payloadsController][
            val.payloadId
          ] = {};
        treeCopy.payloads[Number(val.chain)][val.payloadsController][
          val.payloadId
        ][i] = true;
      });
    }
  }
  writeFileSync(
    path.join(process.cwd(), "src/cache/tree.json"),
    JSON.stringify(treeCopy, null, 2),
  );
  if (!process.env.INDEXER_API) {
    await refreshLogs();
  }
  return treeCopy;
})();
