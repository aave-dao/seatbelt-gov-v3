import { Address, getAddress } from "viem";

export type TrackedSafe = {
  /** EIP-3770 chain prefix (e.g. "eth", "arb1") */
  chainPrefix: string;
  /** Safe address */
  address: Address;
  /** Human-readable label for logs */
  label: string;
};

export const BACKFILL = false; // set to true to backfill all transactions (pending and executed), false to only simulate pending transactions

/**
 * List of Safes to track in the cron job.
 * Add new Safes here to automatically generate reports for their pending transactions.
 */
export const TRACKED_SAFES: TrackedSafe[] = [
  {
    chainPrefix: "eth",
    address: "0x47c71dFEB55Ebaa431Ae3fbF99Ea50e0D3d30fA8",
    label: "RiskCouncil Ethereum",
  },
  {
    chainPrefix: "eth",
    address: "0xE6ec1f0Ae6Cd023bd0a9B4d0253BDC755103253c",
    label: "Horizon Operational",
  },
  {
    chainPrefix: "eth",
    address: "0x187AAE17d4931310B3fc75743e7F16Bdc9eD77e9",
    label: "V4 Security Council Multisig",
  },
  // {
  //   chainPrefix: "megaeth",
  //   address: "0x36CF7a4377aAf1988E01a4b38224FC8D583E50A9",
  //   label: "RiskCouncil MegaEth",
  // },
  {
    chainPrefix: "arb1",
    address: "0x3Be327F22eB4BD8042e6944073b8826dCf357Aa2",
    label: "RiskCouncil Arbitrum",
  },
  {
    chainPrefix: "avax",
    address: "0xCa66149425E7DC8f81276F6D80C4b486B9503D1a",
    label: "RiskCouncil Avalanche",
  },
  {
    chainPrefix: "base",
    address: "0xfbeB4AcB31340bA4de9C87B11dfBf7e2bc8C0bF1",
    label: "RiskCouncil Base",
  },
  {
    chainPrefix: "bnb",
    address: "0x126dc589cc75f17385dD95516F3F1788d862E7bc",
    label: "RiskCouncil Bnb",
  },
  // {
  //   chainPrefix: "bob",
  //   address: "0xE71C189C7D8862EfDa0D9E031157199D2F3B4893",
  //   label: "RiskCouncil Bob",
  // },
  {
    chainPrefix: "celo",
    address: "0xd85786B5FC61E2A0c0a3144a33A0fC70646a99f6",
    label: "RiskCouncil Celo",
  },

  {
    chainPrefix: "gno",
    address: "0xF221B08dD10e0C68D74F035764931Baa3b030481",
    label: "RiskCouncil Gnosis",
  },

  {
    chainPrefix: "linea",
    address: "0xF092A5aC5E284E7c433dAFE5b8B138bFcA53a4Ee",
    label: "RiskCouncil linea",
  },

  {
    chainPrefix: "mnt",
    address: "0xfF0ACe5060bd25f6900eb4bD91a868213C5346B5",
    label: "RiskCouncil mantle",
  },

  {
    chainPrefix: "oeth",
    address: "0xCb86256A994f0c505c5e15c75BF85fdFEa0F2a56",
    label: "RiskCouncil Oeth",
  },

  // {
  //   chainPrefix: "plasma",
  //   address: "0xE71C189C7D8862EfDa0D9E031157199D2F3B4893",
  //   label: "RiskCouncil plamsa",
  // },

  {
    chainPrefix: "sonic",
    address: "0x1dE39A17a9Fa8c76899fff37488482EEb7835d04",
    label: "RiskCouncil Sonic",
  },

  // {
  //   chainPrefix: "bob",
  //   address: "0xE71C189C7D8862EfDa0D9E031157199D2F3B4893",
  //   label: "RiskCouncil Bob",
  // },
].map(({ chainPrefix, address, label }) => {
  return {
    chainPrefix,
    address: getAddress(address),
    label,
  };
});
