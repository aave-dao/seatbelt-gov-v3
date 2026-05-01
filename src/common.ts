export const providerConfig = {
  alchemyKey: process.env.ALCHEMY_API_KEY,
  quicknodeToken: process.env.QUICKNODE_TOKEN,
  quicknodeEndpointName: process.env.QUICKNODE_ENDPOINT_NAME,
};

/**
 * Governance V3 proposal ids to exclude from the seatbelt tree.
 * Proposals listed here will not be written to `src/cache/tree.json`,
 * which prevents the Governance UI from rendering a seatbelt report for them.
 */
export const SKIPPED_PROPOSAL_IDS = new Set<number>([
  // <proposalId>, // reason
  477, // (estimated) rsETH Liquidation Proposal : gatekeeping on Payloads, block normal seatbelt simulation
]);

/**
 * Payload identifiers to exclude from seatbelt simulation.
 * Skipped payloads will not be simulated and no report will be written/updated.
 * Format: `${chainId}:${payloadsController}:${payloadId}` (controller lowercased).
 */
export const SKIPPED_PAYLOADS = new Set<string>([
  // rsETH Liquidation Payloads :
  "1:0xdabad81af85554e9ae636395611c58f7ec1aaec5:430",
  "42161:0x89644ca1bb8064760312ae4f03ea41b05da3637c:120",
  "1:0xdabad81af85554e9ae636395611c58f7ec1aaec5:431",
  "1:0xdabad81af85554e9ae636395611c58f7ec1aaec5:432",
  "42161:0x89644ca1bb8064760312ae4f03ea41b05da3637c:121",
  "42161:0x89644ca1bb8064760312ae4f03ea41b05da3637c:122",
  "42161:0x89644ca1bb8064760312ae4f03ea41b05da3637c:123",
  "42161:0x89644ca1bb8064760312ae4f03ea41b05da3637c:124",
  "42161:0x89644ca1bb8064760312ae4f03ea41b05da3637c:125",
  "42161:0x89644ca1bb8064760312ae4f03ea41b05da3637c:126",
]);

export function isPayloadSkipped(
  chainId: number,
  payloadsController: string,
  payloadId: number,
): boolean {
  return SKIPPED_PAYLOADS.has(
    `${chainId}:${payloadsController.toLowerCase()}:${payloadId}`,
  );
}
