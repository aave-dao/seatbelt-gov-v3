import { Abi, AbiEvent, Address, getAddress, Hex } from "viem";
import { StateDiff, TenderlyLog } from "@aave-dao/toolbox";
import { decodeRawStorage, RawStorage } from "@aave-dao/aave-helpers-js";
import { parseLogs } from "./logs";

/** Tenderly state_diff[].raw -> foundry vm.getStateDiffJson() shape */
export function tenderlyStateDiffToRawStorage(
  stateDiff: StateDiff[],
): RawStorage {
  const raw: RawStorage = {};
  for (const diff of stateDiff) {
    for (const write of diff.raw ?? []) {
      const address = getAddress(write.address);
      raw[address] ??= {
        label: null,
        contract: null,
        balanceDiff: null,
        nonceDiff: null,
        stateDiff: {},
      };
      // a slot written twice keeps its value from before the first write
      const previous = raw[address].stateDiff[write.key];
      raw[address].stateDiff[write.key] = {
        previousValue: (previous?.previousValue ?? write.original) as Hex,
        newValue: write.dirty as Hex,
      };
    }
  }
  return raw;
}

/**
 * Raw storage writes of the simulation, decoded against aave-helpers-js storage layouts.
 * Logs are parsed again here because enhanceLogs rewrites args in place, and the decoder
 * needs the raw values as mapping-key candidates.
 */
export function renderDecodedStorageSection(
  chainId: number,
  stateDiff: StateDiff[],
  logs: TenderlyLog[],
  eventDb: AbiEvent[],
  getContractName: (address: Address) => string,
): string {
  const raw = tenderlyStateDiffToRawStorage(stateDiff);
  if (!Object.keys(raw).length) return "";
  const parsedLogs = parseLogs({
    logs: logs.map(({ raw }) => ({
      address: raw.address as Address,
      topics: raw.topics as [Hex],
      data: raw.data as Hex,
    })),
    eventDb: eventDb as Abi,
  });
  const decoded = decodeRawStorage(raw, { chainId }, parsedLogs);

  let md = "## Decoded storage changes\n\n";
  for (const [address, entry] of Object.entries(raw)) {
    const slots = decoded[address] ?? {};
    md += `#### ${getContractName(address as Address)}\n\n`;
    md +=
      "| slot | variable | type | previous value | new value |\n| --- | --- | --- | --- | --- |\n";
    for (const [slot, diff] of Object.entries(entry.stateDiff)) {
      const fields = slots[slot]?.fields;
      if (fields?.length) {
        for (const f of fields)
          md += `| \`${slot}\` | ${f.label} | ${f.type} | ${f.previousValue} | ${f.newValue} |\n`;
      } else {
        md += `| \`${slot}\` | - | - | ${diff.previousValue} | ${diff.newValue} |\n`;
      }
    }
    md += "\n";
  }
  return md;
}
