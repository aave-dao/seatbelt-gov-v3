import { Address } from "viem";

export type TrackedSafe = {
  /** EIP-3770 chain prefix (e.g. "eth", "arb1") */
  chainPrefix: string;
  /** Safe address */
  address: Address;
  /** Human-readable label for logs */
  label: string;
};

/**
 * List of Safes to track in the cron job.
 * Add new Safes here to automatically generate reports for their pending transactions.
 */
export const TRACKED_SAFES: TrackedSafe[] = [
  {
    chainPrefix: "eth",
    address: "0x47c71dFEB55Ebaa431Ae3fbF99Ea50e0D3d30fA8",
    label: "RiskCouncil Multisig",
  },
  {
    chainPrefix: "eth",
    address: "0x187AAE17d4931310B3fc75743e7F16Bdc9eD77e9",
    label: "V4 Security Council Multisig",
  },
];
