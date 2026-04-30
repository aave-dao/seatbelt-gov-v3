import {
  AbiEvent,
  Address,
  Client,
  Hex,
  decodeFunctionData,
  zeroAddress,
} from "viem";
import { getSourceCode } from "@bgd-labs/toolbox";
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
import { findAsset, getMdContractName } from "./utils";
import { toAddressLink, toTxLink } from "./tenderly-report";
import type {
  SafeMultisigTransaction,
  SafeSubTransaction,
} from "../safe-api";

// --- Decoded param enrichment ---

const ADDRESS_RE = /^0x[a-fA-F0-9]{40}$/;
const DIGITS_RE = /^\d+$/;
const MIN_TIMESTAMP = 1_500_000_000; // ~2017
const MAX_TIMESTAMP = 2_500_000_000; // ~2049
const UINT256_MAX = (1n << 256n) - 1n;
const MAX_SENTINEL_DIFF = 1000n; // if value is within 1000 of uint256 max → show as type(uint256).max - N

type DecodedParam = { name?: string; type?: string; value: any; [k: string]: any };
type DataDecoded = { method: string; parameters: DecodedParam[] };

function renderTimestamp(n: bigint): string {
  const d = new Date(Number(n) * 1000);
  const iso = d.toISOString().replace("T", " ").slice(0, 16);
  return `${iso} UTC`;
}

async function annotateValue(client: Client, value: any): Promise<any> {
  if (Array.isArray(value)) {
    return Promise.all(value.map((v) => annotateValue(client, v)));
  }

  if (value !== null && typeof value === "object") {
    const out: Record<string, any> = {};
    for (const k of Object.keys(value)) {
      out[k] = await annotateValue(client, value[k]);
    }
    return out;
  }

  if (typeof value !== "string") return value;

  // Address
  if (ADDRESS_RE.test(value)) {
    const asset = await findAsset(client, value as Address);
    if (asset.symbol !== "unknown") {
      return `${value} (symbol: ${asset.symbol}, decimals: ${asset.decimals})`;
    }
    return value;
  }

  // Numeric
  if (DIGITS_RE.test(value)) {
    const n = BigInt(value);

    // Near-max-uint256 sentinel (used by Aave RiskSteward as "no change")
    if (n > UINT256_MAX - MAX_SENTINEL_DIFF && n <= UINT256_MAX) {
      const diff = UINT256_MAX - n;
      return diff === 0n
        ? `${value} (type(uint256).max)`
        : `${value} (type(uint256).max - ${diff})`;
    }

    // Timestamp
    if (n >= BigInt(MIN_TIMESTAMP) && n <= BigInt(MAX_TIMESTAMP)) {
      return `${value} (${renderTimestamp(n)})`;
    }
  }

  return value;
}

// ABI cache for Etherscan-based fallback decoding of sub-txs that the Safe API didn't decode.
// Keyed by `${chainId}:${address}`. Stores parsed ABI array or null (unverified/unavailable).
// Also deduplicates concurrent fetches so parallel MultiSend sub-txs don't hit Etherscan N times.
const abiCache: Record<string, any[] | null> = {};
const abiInFlight: Record<string, Promise<any[] | null>> = {};

async function getCachedABI(
  chainId: number,
  address: Address,
  apiKey?: string,
): Promise<any[] | null> {
  const key = `${chainId}:${address.toLowerCase()}`;
  if (key in abiCache) return abiCache[key];
  if (key in abiInFlight) return abiInFlight[key];
  abiInFlight[key] = (async () => {
    try {
      const source: any = await getSourceCode({ chainId, address, apiKey });
      if (source?.ABI && source.ABI !== "Contract source code not verified") {
        abiCache[key] = JSON.parse(source.ABI);
      } else {
        abiCache[key] = null;
      }
    } catch {
      abiCache[key] = null;
    }
    delete abiInFlight[key];
    return abiCache[key];
  })();
  return abiInFlight[key];
}

function normalizeAbiValue(v: any): any {
  if (typeof v === "bigint") return v.toString();
  if (typeof v === "boolean") return v.toString();
  if (Array.isArray(v)) return v.map(normalizeAbiValue);
  if (v !== null && typeof v === "object") {
    const out: Record<string, any> = {};
    for (const k of Object.keys(v)) out[k] = normalizeAbiValue(v[k]);
    return out;
  }
  return v;
}

/**
 * Fallback decoder: when Safe API doesn't provide `dataDecoded` for a sub-tx,
 * fetch the target's ABI from Etherscan and decode ourselves.
 */
async function decodeFromEtherscan(
  client: Client,
  target: Address,
  data: Hex,
  apiKey?: string,
): Promise<DataDecoded | null> {
  if (!data || data.length < 10) return null;
  const abi = await getCachedABI(client.chain!.id, target, apiKey);
  if (!abi) return null;
  try {
    const { functionName, args } = decodeFunctionData({
      abi,
      data,
    });
    const fn = abi.find(
      (x: any) => x.type === "function" && x.name === functionName,
    );
    if (!fn || !Array.isArray(args)) return null;
    const parameters = (fn.inputs || []).map((input: any, i: number) => ({
      name: input.name,
      type: input.type,
      value: normalizeAbiValue((args as any[])[i]),
    }));
    return { method: functionName, parameters };
  } catch {
    return null;
  }
}

async function enhanceDecodedParams(
  client: Client,
  dataDecoded: DataDecoded,
  apiKey?: string,
): Promise<DataDecoded> {
  const parameters = await Promise.all(
    dataDecoded.parameters.map(async (p: any) => {
      // MultiSend case: param has `valueDecoded` array of sub-txs. Recurse into each.
      if (Array.isArray(p.valueDecoded)) {
        const valueDecoded = await Promise.all(
          p.valueDecoded.map(async (sub: any) => {
            // If Safe API didn't decode this sub-tx, try our Etherscan-based fallback.
            let dataDecoded = sub.dataDecoded;
            if (!dataDecoded && sub.to && sub.data && sub.data !== "0x") {
              dataDecoded = await decodeFromEtherscan(
                client,
                sub.to as Address,
                sub.data as Hex,
                apiKey,
              );
            }
            return {
              ...sub,
              to: sub.to ? await annotateValue(client, sub.to) : sub.to,
              dataDecoded: dataDecoded
                ? await enhanceDecodedParams(client, dataDecoded, apiKey)
                : dataDecoded,
            };
          }),
        );
        return { ...p, valueDecoded };
      }
      return { ...p, value: await annotateValue(client, p.value) };
    }),
  );
  return { ...dataDecoded, parameters };
}

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

  // Pre-enrich decoded params with human-readable annotations. Pass etherscan API key
  // so we can fallback-decode sub-txs that the Safe API didn't decode (common on new chains).
  const apiKey = config.etherscanApiKey;
  const topDecoded = safeTx.dataDecoded
    ? await enhanceDecodedParams(client, safeTx.dataDecoded, apiKey)
    : null;
  const subDecodedRaw = topDecoded
    ? (
        topDecoded.parameters.find((p: any) => p.name === "transactions") as any
      )?.valueDecoded
    : undefined;
  const subDecoded = subDecodedRaw
    ? subDecodedRaw.map((sub: any) => ({ dataDecoded: sub.dataDecoded }))
    : undefined;

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

  if (topDecoded) {
    const rendered = formatDecoded(topDecoded);
    if (rendered.includes("\n")) {
      report += `- Decoded:\n\n\`\`\`\n${rendered}\n\`\`\`\n`;
    } else {
      report += `- Decoded: \`${rendered}\`\n`;
    }
  } else if (safeTx.data) {
    // Only show raw data when we couldn't decode it — otherwise it's redundant with Decoded above.
    report += `- Data: \`${safeTx.data}\`\n`;
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
      const decoded = subDecoded?.[i];
      report += `${i + 1}. ${opStr} to [${subTx.to}](${toAddressLink(subTx.to, client)})`;
      if (subTx.value > 0n) report += ` (value: ${subTx.value})`;
      if (decoded?.dataDecoded) {
        report += ` — \`${formatDecoded(decoded.dataDecoded)}\``;
      }
      report += "\n";
      // Show raw calldata only when decoding failed — otherwise it's already above.
      if (subTx.data !== "0x" && !decoded?.dataDecoded) {
        report += `   - data: \`${subTx.data}\`\n`;
      }
    });
    report += "\n";
  }

  // --- Per-simulation results ---
  for (let simIdx = 0; simIdx < simResults.length; simIdx++) {
    const sim = simResults[simIdx];

    if (isMultiSend && simResults.length > 1) {
      const subTx = subTransactions[simIdx];
      report += `### Sub-transaction ${simIdx + 1} of ${simResults.length}\n\n`;
      const decoded = subDecoded?.[simIdx];
      report += `- To: [${subTx.to}](${toAddressLink(subTx.to, client)})\n`;
      report += `- Value: ${subTx.value.toString()}\n`;
      report += `- Operation: ${subTx.operation === 0 ? "Call" : "DelegateCall"}\n`;
      if (decoded?.dataDecoded) {
        report += `- Decoded: \`${formatDecoded(decoded.dataDecoded)}\`\n`;
      } else if (subTx.data !== "0x") {
        report += `- Data: \`${subTx.data}\`\n`;
      }
      report += "\n";
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

function pad(n: number): string {
  return "  ".repeat(n);
}

/**
 * Render a decoded-params value as JSON-like text. Recurses into nested arrays/tuples.
 * Used for leaf values (addresses, numbers, tuples) — not for valueDecoded sub-txs.
 */
function formatValue(v: any): string {
  if (v === null || v === undefined) return String(v);
  if (Array.isArray(v)) return "[" + v.map(formatValue).join(", ") + "]";
  if (typeof v === "bigint") return v.toString();
  if (typeof v === "string") return JSON.stringify(v);
  if (typeof v === "object") {
    const parts = Object.keys(v).map((k) => `${k}: ${formatValue(v[k])}`);
    return "{" + parts.join(", ") + "}";
  }
  return JSON.stringify(v, (_, val) =>
    typeof val === "bigint" ? val.toString() : val,
  );
}

function formatSubTx(sub: any, depth: number): string {
  const op = sub.operation === 0 ? "call" : "delegatecall";
  const valuePart =
    sub.value && sub.value !== "0" ? ` value=${sub.value}` : "";
  const header = `${op} to ${sub.to}${valuePart}`;
  if (sub.dataDecoded) {
    return `${header} =>\n${pad(depth + 1)}${formatDecoded(sub.dataDecoded, depth + 1)}`;
  }
  return `${header} data=${sub.data || "0x"}`;
}

/**
 * Render a decoded method call. When any parameter has `valueDecoded` (MultiSend sub-txs),
 * expand it as a multi-line nested structure. Otherwise render compact single-line.
 */
function formatDecoded(
  dataDecoded: { method: string; parameters: any[] },
  depth = 0,
): string {
  const params = dataDecoded.parameters;
  if (params.length === 0) return `${dataDecoded.method}()`;

  const hasNested = params.some((p: any) => Array.isArray(p.valueDecoded));
  if (!hasNested) {
    const inline = params
      .map((p: any) => `${p.name}: ${formatValue(p.value)}`)
      .join(", ");
    return `${dataDecoded.method}(${inline})`;
  }

  const lines: string[] = [];
  for (const p of params) {
    if (Array.isArray((p as any).valueDecoded)) {
      const subs = (p as any).valueDecoded;
      if (subs.length === 0) {
        lines.push(`${pad(depth + 1)}${p.name}: []`);
        continue;
      }
      const subLines = subs.map(
        (sub: any, i: number) =>
          `${pad(depth + 2)}[${i}] ${formatSubTx(sub, depth + 2)}`,
      );
      lines.push(
        `${pad(depth + 1)}${p.name}: [\n${subLines.join(",\n")}\n${pad(depth + 1)}]`,
      );
    } else {
      lines.push(`${pad(depth + 1)}${p.name}: ${formatValue(p.value)}`);
    }
  }
  return `${dataDecoded.method}(\n${lines.join(",\n")}\n${pad(depth)})`;
}

function getDecodedSubTransactions(
  safeTx: SafeMultisigTransaction,
): { dataDecoded?: { method: string; parameters: any[] } }[] | undefined {
  if (!safeTx.dataDecoded) return undefined;
  const txsParam = safeTx.dataDecoded.parameters?.find(
    (p: any) => p.name === "transactions",
  );
  return txsParam?.valueDecoded as any;
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
