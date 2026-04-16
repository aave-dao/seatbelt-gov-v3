import { AbiEvent, Address, Client, Hex, zeroAddress } from "viem";
import { enhanceLogs, parseLogs } from "./logs";
import {
  checkForSelfdestruct,
  SelfdestructCheckState,
  selfDestructStatusToString,
} from "./selfdestruct";
import {
  getVerificationStatus,
  VerificationStatus,
  verificationStatusToString,
} from "./verified";
import {
  enhanceStateDiff,
  renderMarkdownStateDiffReport,
  transformTenderlyStateDiff,
} from "./state";
import {
  tenderly_logsToAbiLogs,
  tenderly_pingExplorer,
  TenderlySimulationResponse,
} from "@bgd-labs/toolbox";
import { getMdContractName } from "./utils";
import { toAddressLink, toTxLink } from "./tenderly-report";
import type {
  SafeMultisigTransaction,
  SafeSubTransaction,
} from "../safe-api";

type RenderSafeReportParams = {
  client: Client;
  safeTx: SafeMultisigTransaction;
  /** Single sim result for Call, or array for MultiSend sub-txs */
  simResults: TenderlySimulationResponse[];
  /** Decoded sub-transactions if MultiSend, otherwise undefined */
  subTransactions?: SafeSubTransaction[];
  eventCache?: AbiEvent[];
  config: {
    etherscanApiKey: string;
  };
};

export async function renderSafeReport({
  client,
  safeTx,
  simResults,
  subTransactions,
  eventCache = [],
  config,
}: RenderSafeReportParams) {
  const chainName = client.chain?.name || `Chain ${client.chain?.id}`;
  const isMultiSend = subTransactions && subTransactions.length > 0;

  // --- Header ---
  let report = `## Safe Transaction on ${chainName}\n\n`;
  report += `- Safe: [${safeTx.safe}](${toAddressLink(safeTx.safe, client)})\n`;
  report += `- SafeTxHash: \`${safeTx.safeTxHash}\`\n`;
  report += `- Nonce: ${safeTx.nonce}\n`;
  report += `- Proposer: ${safeTx.proposer}\n`;
  report += `- Confirmations: ${safeTx.confirmations.length}/${safeTx.confirmationsRequired}\n`;
  report += `- Operation: ${safeTx.operation === 0 ? "Call" : "DelegateCall"}\n`;
  report += `- Target: [${safeTx.to}](${toAddressLink(safeTx.to, client)})\n`;
  report += `- Value: ${safeTx.value}\n`;

  if (safeTx.dataDecoded) {
    const params = safeTx.dataDecoded.parameters
      .map((p: any) => p.type)
      .join(", ");
    report += `- Decoded: \`${safeTx.dataDecoded.method}(${params})\`\n`;
  }

  report += `- Submitted: ${safeTx.submissionDate}\n`;

  if (safeTx.isExecuted && safeTx.transactionHash) {
    report += `- Executed: [${safeTx.executionDate}](${toTxLink(safeTx.transactionHash, client)})\n`;
  } else {
    report += `- Status: Pending\n`;
  }

  report += "\n";

  // --- MultiSend actions summary ---
  if (isMultiSend) {
    report += `### Actions (${subTransactions.length} sub-transactions)\n\n`;
    subTransactions.forEach((subTx, i) => {
      const opStr = subTx.operation === 0 ? "Call" : "DelegateCall";
      report += `${i + 1}. ${opStr} to [${subTx.to}](${toAddressLink(subTx.to, client)})`;
      if (subTx.value > 0n) report += ` (value: ${subTx.value})`;
      if (subTx.data !== "0x")
        report += ` — data: \`${subTx.data.slice(0, 10)}...\``;
      report += "\n";
    });
    report += "\n";
  }

  // --- Per-simulation results ---
  for (let simIdx = 0; simIdx < simResults.length; simIdx++) {
    const sim = simResults[simIdx];

    if (isMultiSend && simResults.length > 1) {
      const subTx = subTransactions[simIdx];
      report += `### Sub-transaction ${simIdx + 1} of ${simResults.length}\n\n`;
      report += `- To: [${subTx.to}](${toAddressLink(subTx.to, client)})\n`;
      report += `- Value: ${subTx.value.toString()}\n`;
      report += `- Operation: ${subTx.operation === 0 ? "Call" : "DelegateCall"}\n\n`;
    }

    if (sim.simulation.status === false) {
      report += `:sos: Simulation failed: ${sim.transaction.error_message}\n\n`;
      continue;
    }

    // Events
    const events = sim.transaction.transaction_info?.logs
      ? tenderly_logsToAbiLogs(sim.transaction.transaction_info?.logs)
      : [];
    events.forEach((e) => {
      if (!eventCache.find((eC) => JSON.stringify(eC) === JSON.stringify(e))) {
        eventCache.push(e as any);
      }
    });

    const logs = await enhanceLogs(
      client,
      parseLogs({
        logs: (sim.transaction.transaction_info.logs || []).map(
          (l: any) => l.raw,
        ),
        eventDb: eventCache,
      }),
    );

    // Addresses
    const addresses = [...new Set(sim.transaction.addresses)];

    // Selfdestruct check
    const selfDestruct = await checkForSelfdestruct(client, addresses, []);

    // Contracts deployed during simulation
    const deployedOnSim = getContractsDeployedDuringSimulation(
      sim.transaction.transaction_info.call_trace?.calls ?? [],
    );

    // Verification
    const verified = await getVerificationStatus({
      client,
      addresses,
      contractsDeployedDuringExec: deployedOnSim,
      contractDb: sim.contracts.reduce(
        (acc, val) => {
          acc[val.address as Address] = val.contract_name;
          return acc;
        },
        {} as Record<Address, string>,
      ),
      apiKey: config.etherscanApiKey,
    });

    // State diffs
    const stateDiff = await enhanceStateDiff(
      client,
      transformTenderlyStateDiff(sim.transaction.transaction_info.state_diff || []),
    );

    const getContractName = (address: Address) =>
      getMdContractName(sim.contracts, address);

    // Unverified contracts warning
    const unverified = verified.filter(
      (contract) => contract.status === VerificationStatus.ERROR,
    );
    if (unverified.length !== 0) {
      try {
        await Promise.all(
          unverified.map((ctr) =>
            tenderly_pingExplorer(client.chain!.id, ctr.address),
          ),
        );
      } catch (e) {
        // best effort
      }
      report += `:sos: Found unverified contracts!\n\n`;
      report += unverified
        .map(
          (ctr) =>
            ` - [${ctr.address}](${toAddressLink(ctr.address, client)})`,
        )
        .join("\n");
      report += "\n\n";
    }

    if (
      selfDestruct.find(
        (contract) => contract.state === SelfdestructCheckState.SELF_DESTRUCT,
      )
    ) {
      report += `:sos: Found selfDestruct!\n\n`;
    }

    // State changes
    report += renderMarkdownStateDiffReport(stateDiff, getContractName);

    // Verification table
    if (verified.length) {
      report +=
        "### Verification status for contracts touched\n\n";
      report += "| Contract | Status |\n";
      report += "|---------|------------|\n";
      verified
        .sort((a, b) => a.address.localeCompare(b.address))
        .forEach((contract) => {
          report += `| ${getContractName(contract.address)} | ${verificationStatusToString(contract.status)} |\n`;
        });
      report += "\n";
    }

    // Selfdestruct table
    if (selfDestruct.length) {
      report += `### Selfdestruct analysis\n\n`;
      report += "| Address | Result |\n";
      report += "|---------|------------|\n";
      selfDestruct
        .sort((a, b) => a.address.localeCompare(b.address))
        .forEach((sd) => {
          report += `| ${getContractName(sd.address)} | ${selfDestructStatusToString(sd.state)} |\n`;
        });
      report += "\n";
    }

    // Events
    if (logs.length) {
      report += "### Events emitted\n\n";
      let ctr: Address = zeroAddress;
      logs
        .sort((a, b) => a.address.localeCompare(b.address))
        .forEach((log) => {
          if (log.address !== ctr) {
            report += `- ${getContractName(log.address)}\n`;
            ctr = log.address;
          }
          report += `  - \`${log.eventName || log.topics}(${
            log.args
              ? JSON.stringify(log.args, (_, v) =>
                  typeof v === "bigint" ? v.toString() : v,
                )
              : log.data
          })\`\n`;
        });
      report += "\n";
    }
  }

  return { report, eventCache };
}

function getContractsDeployedDuringSimulation(
  calls: { to?: string; caller_op: string; calls?: any[] }[],
  result: Set<string> = new Set(),
): Set<string> {
  for (const call of calls) {
    if (
      (call.caller_op === "CREATE" || call.caller_op === "CREATE2") &&
      call.to
    ) {
      result.add(call.to.toLowerCase());
    }
    if (call.calls?.length) {
      getContractsDeployedDuringSimulation(call.calls, result);
    }
  }
  return result;
}
