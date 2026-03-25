import { AbiEvent, Address, Client, Hash, Hex, zeroAddress } from "viem";
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
  HUMAN_READABLE_PAYLOAD_STATE,
  Payload,
} from "@bgd-labs/toolbox";

import { getMdContractName } from "./utils";

type RenderTenderlyReportParams = {
  client: Client;
  sim: TenderlySimulationResponse;
  payloadId: number;
  payload: Payload;
  onchainLogs: {
    createdLog: { transactionHash: Hash; blockNumber: number };
    queuedLog?: { transactionHash: Hash; blockNumber: number };
    executedLog?: { transactionHash: Hash; blockNumber: number };
  };
  eventCache?: AbiEvent[];
  config: {
    etherscanApiKey: string;
  };
  getContractName?: (
    sim: TenderlySimulationResponse,
    address: Address,
  ) => string;
};

export async function renderTenderlyReport({
  client,
  sim,
  payloadId,
  payload,
  onchainLogs: { createdLog, queuedLog, executedLog },
  eventCache = [],
  config,
  getContractName = (sim, address) => getMdContractName(sim.contracts, address),
}: RenderTenderlyReportParams) {
  let report = `## Payload ${payloadId} on ${client.chain!.name}

- creator: ${payload.creator}
- maximumAccessLevelRequired: ${payload.maximumAccessLevelRequired}
- state: ${payload.state}(${
    (HUMAN_READABLE_PAYLOAD_STATE as any)[payload.state]
  })
- actions:
${payload.actions
  .map(
    (a) =>
      `  - [${a.target}](${toAddressLink(a.target, client)}), accessLevel: ${
        a.accessLevel
      }, withDelegateCall: ${a.withDelegateCall}, value: ${
        a.value
      }, signature: ${a.signature}, callData: ${a.callData}`,
  )
  .join("\n")}
`;
  if (createdLog) {
    report += `- createdAt: [${renderUnixTime(payload.createdAt)}](${toTxLink(
      createdLog.transactionHash,
      client,
    )})\n`;
    if (queuedLog) {
      report += `- queuedAt: [${renderUnixTime(payload.queuedAt)}](${toTxLink(
        queuedLog.transactionHash,
        client,
      )})\n`;
      if (executedLog) {
        report += `- executedAt: [${renderUnixTime(payload.executedAt)}, block: ${
          executedLog.blockNumber
        }](${toTxLink(executedLog.transactionHash, client)})\n`;
      } else {
        report += `- earliest execution at: [${renderUnixTime(
          payload.queuedAt + payload.delay,
        )}](https://www.epochconverter.com/countdown?q=${
          payload.queuedAt + payload.delay
        })\n`;
        const timestamp = Math.floor(
          new Date(sim.transaction.timestamp).getTime() / 1000,
        );
        report += `- simulatedExecutionAt: ${renderUnixTime(
          timestamp,
        )}, timestamp: ${timestamp}, block: ${sim.transaction.block_number}`;
      }
    }
  }

  report += "\n";

  if (sim.simulation.status === false) {
    report += `### :sos: simulation failed: ${sim.transaction.error_message}\n`;

    return { report, eventCache };
  }

  const events = sim.transaction.transaction_info?.logs
    ? tenderly_logsToAbiLogs(sim.transaction.transaction_info?.logs)
    : [];
  events.map((e) => {
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
  // deduplicate touched addresses
  sim.transaction.addresses = [...new Set(sim.transaction.addresses)];
  const selfDestruct = await checkForSelfdestruct(
    client,
    sim.transaction.addresses,
    [], // trusted addresses
  );
  const deployedOnPayload = getContractsDeployedDuringSimulation(
    sim.transaction.transaction_info.call_trace?.calls ?? [],
  );
  const verified = await getVerificationStatus({
    client: client,
    addresses: sim.transaction.addresses,
    contractsDeployedDuringExec: deployedOnPayload,
    // In the future we might want to maintain our own db, so we do not need to rely on tenderly so much for contract name lookup.
    contractDb: sim.contracts.reduce(
      (acc, val) => {
        acc[val.address] = val.contract_name;
        return acc;
      },
      {} as Record<Address, string>,
    ),
    apiKey: config.etherscanApiKey,
  });

  const stateDiff = await enhanceStateDiff(
    client,
    transformTenderlyStateDiff(sim.transaction.transaction_info.state_diff),
  );

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
      // we don't really care about errors here
      // the point is to ping the explorer because tenderly is not always reliable in fetching unknown contracts
    }
    report += `:sos: Found unverified contracts!\n\n`;
    report += unverified
      .map(
        (ctr) => ` - [${ctr.address}](${toAddressLink(ctr.address, client)})`,
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

  report += renderMarkdownStateDiffReport(stateDiff, (address) =>
    getContractName(sim, address),
  );

  if (verified.length) {
    report +=
      "### Verification status for contracts touched in the proposal\n\n";
    report += "| Contract | Status |\n";
    report += "|---------|------------|\n";
    verified
      .sort((a, b) => a.address.localeCompare(b.address))
      .map((contract) => {
        report += `| ${getContractName(sim, contract.address)} | ${verificationStatusToString(contract.status)} |\n`;
      });
    report += "\n";
  }

  if (selfDestruct.length) {
    report += `### Selfdestruct analysis\n\n`;
    report += "| Address | Result |\n";
    report += "|---------|------------|\n";
    selfDestruct
      .sort((a, b) => a.address.localeCompare(b.address))
      .map((selfDestruct) => {
        report += `| ${getContractName(sim, selfDestruct.address)} | ${selfDestructStatusToString(
          selfDestruct.state,
        )} |\n`;
      });
    report += "\n";
  }

  if (logs.length) {
    report += "### Events emitted from the proposal\n\n";
    let ctr: Address = zeroAddress;
    logs
      .sort((a, b) => a.address.localeCompare(b.address))
      .map((log) => {
        if (log.address !== ctr) {
          report += `- ${getContractName(sim, log.address)}\n`;
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

function renderUnixTime(time: number) {
  return new Date(time * 1000).toLocaleString("en-GB", { timeZone: "UTC" });
}

export function toTxLink(txn: Hex, client: Client): string {
  return `${client.chain?.blockExplorers?.default.url}/tx/${txn}`;
}

export function toAddressLink(address: Address, client: Client): string {
  return `${client.chain?.blockExplorers?.default.url}/address/${address}`;
}
