import { Address, Hex } from "viem";
import {
  renderTenderlySimulationBody,
  RenderTenderlySimulationBodyParams,
  toAddressLink,
} from "./tenderly-report";
import {
  TxBuilderBatch,
  encodeTxBuilderTransaction,
  getTxBuilderTransactionSignature,
} from "../safe-tooling/tx-builder";

/**
 * Makes batch-supplied text inert in the markdown report: one line, no html, no code spans.
 */
export function sanitizeMarkdown(value: string): string {
  return value
    .replace(/\s+/g, " ")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/`/g, "'");
}

type RenderSafeTenderlyReportParams = RenderTenderlySimulationBodyParams & {
  batch: TxBuilderBatch;
  safe: {
    address: Address;
    version: string;
    threshold: bigint;
    owners: readonly Address[];
    nonce: bigint;
    safeTxHash: Hex;
  };
  multiSendCallOnly?: Address;
};

export async function renderSafeTenderlyReport({
  client,
  sim,
  batch,
  safe,
  multiSendCallOnly,
  eventCache,
  config,
  getContractName,
}: RenderSafeTenderlyReportParams) {
  let report = `## Safe transaction batch "${sanitizeMarkdown(batch.meta.name)}" on ${client.chain!.name}

- safe: [${safe.address}](${toAddressLink(safe.address, client)}) (version: ${safe.version}, threshold: ${safe.threshold}/${safe.owners.length})
- safeTxHash: ${safe.safeTxHash} (at nonce ${safe.nonce}${multiSendCallOnly ? `, batched via MultiSendCallOnly ${multiSendCallOnly}` : ""})
${batch.meta.description ? `- description: ${sanitizeMarkdown(batch.meta.description)}\n` : ""}${batch.meta.checksum ? `- tx-builder checksum: ${sanitizeMarkdown(batch.meta.checksum)}\n` : ""}- transactions:
${batch.transactions
  .map(
    (tx) =>
      `  - [${tx.to}](${toAddressLink(tx.to, client)}), value: ${sanitizeMarkdown(tx.value)}, signature: ${sanitizeMarkdown(getTxBuilderTransactionSignature(tx))}, ${tx.contractMethod && tx.contractInputsValues ? `args: ${sanitizeMarkdown(JSON.stringify(tx.contractInputsValues))}, ` : ""}callData: ${encodeTxBuilderTransaction(tx)}`,
  )
  .join("\n")}
`;
  const timestamp = Math.floor(
    new Date(sim.transaction.timestamp).getTime() / 1000,
  );
  report += `- simulatedExecutionAt: ${new Date(
    timestamp * 1000,
  ).toLocaleString("en-GB", {
    timeZone: "UTC",
  })}, timestamp: ${timestamp}, block: ${sim.transaction.block_number}\n`;

  const body = await renderTenderlySimulationBody({
    client,
    sim,
    eventCache,
    config,
    getContractName,
  });
  report += body.report;
  return { report, eventCache: body.eventCache };
}
