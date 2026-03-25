import { Address, Client, getAddress, Hex, zeroAddress } from "viem";
import {
  StateDiff,
  bitmapToIndexes,
  IPool_ABI,
  decodeReserveConfiguration,
  decodeReserveConfigurationV2,
} from "@bgd-labs/toolbox";
import { readContract } from "viem/actions";

import {
  addAssetPrice,
  assetIndexesToAsset,
  findAsset,
  prettifyNumber,
  toBinaryString,
} from "./utils";

type ValueType = string | Record<string, string>;

type ReservesChangedType = { configuration?: { data?: string } };
type EModeChangedType = {
  collateralBitmap?: string;
  borrowableBitmap?: string;
  collateralBitmap_decoded?: string;
  borrowableBitmap_decoded?: string;
};
type StreamChangedType = {
  tokenAddress?: Address;
  ratePerSecond?: string;
  remainingBalance?: string;
  deposit?: string;
};
type InterestDataChangedType = {
  optimalUsageRatio: number | string;
  variableRateSlope1: number | string;
  variableRateSlope2: number | string;
};

type ChangeMap = {
  _reserves: ReservesChangedType;
  _eModeCategories: EModeChangedType;
  _streams: StreamChangedType;
  _interestRateData: InterestDataChangedType;
  assetsSources: string;
  totalSupply: string;
  _balances: Record<string, string>;
  _allowances: Record<string, string>;
  balanceOf: Record<string, string>;
  allowed: Record<string, string>;
  balances: Record<string, string>;
};

type Change<TName extends string = string> = {
  type: string;
  key?: string;
  name: TName;
  before: TName extends keyof ChangeMap
    ? ChangeMap[TName]
    : string | Record<string, ValueType>;
  after: TName extends keyof ChangeMap
    ? ChangeMap[TName]
    : string | Record<string, ValueType>;
};

function isChangeOfType<TName extends keyof ChangeMap>(
  change: Change,
  name: TName,
): change is Change<TName> {
  return change.name === name;
}

/**
 * Transforms the tenderly state diff into a format that aligns more with foundry state diffs.
 */
export function transformTenderlyStateDiff(
  stateDiff: StateDiff[],
): Record<Address, Change[]> {
  // reformat to have diffs per contract
  const formattedDiffs = stateDiff.reduce(
    (diffs, diff) => {
      // TODO: double check if that's safe to skip
      if (!diff.raw?.[0]) return diffs;
      const addr = getAddress(diff.raw[0].address);
      if (!diffs[addr]) diffs[addr] = [diff];
      else diffs[addr].push(diff);
      return diffs;
    },
    {} as Record<string, StateDiff[]>,
  );

  const allChanges: Record<Address, Change[]> = {};
  for (const [address, diffs] of Object.entries(formattedDiffs)) {
    const changes: Change[] = [];
    for (const diff of diffs) {
      if (!diff.soltype) {
        // In this branch, state change is not decoded, so return raw data of each storage write
        // (all other branches have decoded state changes)
        for (const w of diff.raw) {
          const oldVal = JSON.stringify(w.original);
          const newVal = JSON.stringify(w.dirty);
          changes.push({
            before: oldVal,
            after: newVal,
            type: "raw",
            name: w.key,
          });
        }
      } else if (diff.soltype.simple_type) {
        // This is a simple type with a single changed value
        // const oldVal = JSON.parse(JSON.stringify(diff.original))
        // const newVal = JSON.parse(JSON.stringify(diff.dirty))
        changes.push({
          before: diff.original as string,
          after: diff.dirty as string,
          name: diff.soltype.name,
          type: diff.soltype?.name,
        });
      } else if (diff.soltype.type.startsWith("mapping")) {
        // This is a complex type like a mapping, which may have multiple changes. The diff.original
        // and diff.dirty fields can be strings or objects, and for complex types they are objects,
        // so we cast them as such
        const keys = Array.from(
          new Set([
            ...Object.keys(diff.original || {}),
            ...Object.keys(diff.dirty || {}),
          ]),
        );
        const original = (diff.original || {}) as Record<string, any>;
        const dirty = (diff.dirty || {}) as Record<string, any>;
        for (const k of keys as Hex[]) {
          if (original[k] || dirty[k]) {
            const objDiff = getObjectDiff(original[k] as any, dirty[k] as any);

            changes.push({
              before: objDiff.before,
              after: objDiff.after,
              name: diff.soltype?.name,
              type: diff.soltype?.type,
              key: k,
            });
          }
        }
      } else {
        // TODO arrays and nested mapping are currently not well supported -- find a transaction
        // that changes state of these types to inspect the Tenderly simulation response and
        // handle it accordingly. In the meantime we show the raw state changes and print a
        // warning about decoding the data
        for (const w of diff.raw) {
          //const diff = getObjectDiff(w.original as any, w.dirty as any);
          // info += `\n        - Slot \`${w.key}\` changed from \`${oldVal}\` to \`${newVal}\``
          changes.push({
            before: JSON.stringify(w.original),
            after: JSON.stringify(w.dirty),
            name: w.key,
            type: "raw nested",
          });
        }
      }
    }
    allChanges[address as Address] = changes;
  }
  return allChanges;
}

/**
 * Returns the difference between two objects, showing what changed from obj1 to obj2
 */
export function getObjectDiff(
  obj1: Record<string, ValueType>,
  obj2: Record<string, ValueType>,
): {
  before: Record<string, ValueType> | string;
  after: Record<string, ValueType> | string;
} {
  const diff: {
    before: Record<string, ValueType>;
    after: Record<string, ValueType>;
  } = { before: {}, after: {} };

  // If both non-objects, return raw (scalar change)
  if (typeof obj1 !== "object" && typeof obj2 !== "object")
    return { before: obj1, after: obj2 };

  // Treat non-object side as empty so field-level diff still works
  // (e.g. undefined -> {addCap: "229", active: true, ...})
  const a = typeof obj1 === "object" && obj1 !== null ? obj1 : {};
  const b = typeof obj2 === "object" && obj2 !== null ? obj2 : {};

  const allKeys = new Set([...Object.keys(a), ...Object.keys(b)]);

  for (const key of allKeys) {
    const val1 = a[key];
    const val2 = b[key];

    // Only include in diff if values are different
    // null and undefined both represent unset/zero storage — treat as equivalent
    if (val1 == null && val2 == null) continue;
    if (JSON.stringify(val1) !== JSON.stringify(val2)) {
      diff.before[key] = val1;
      diff.after[key] = val2;
    }
  }

  return diff;
}

export function renderMarkdownStateDiffReport(
  changes: Record<Address, Change[]>,
  getContractName: (address: Address) => string = (address) => `${address}`,
) {
  let report = "";
  for (const contract of Object.keys(changes).sort((a, b) =>
    a.localeCompare(b),
  )) {
    report += `#### ${getContractName(contract as Address)}\n\n\`\`\`diff\n`;
    for (const change of changes[contract as Address]) {
      report += deepDiff(change as any);
    }
    report += `\`\`\`\n`;
  }
  return report;
}

function deepDiff({
  name,
  type,
  before,
  after,
  key,
  path,
}: {
  name: string;
  type: string;
  before: Record<string, ValueType> | string;
  after: Record<string, ValueType> | string;
  key: string;
  path?: string;
}) {
  let diff = "";

  const beforeIsObj = typeof before === "object" && before !== null;
  const afterIsObj = typeof after === "object" && after !== null;

  if (!beforeIsObj && !afterIsObj) {
    // null and undefined both represent unset/zero storage — treat as equivalent
    if (before == null && after == null) return diff;
    // Both scalars — render as a single line
    const beforeString = JSON.stringify(before, (_, v) =>
      typeof v === "bigint" ? v.toString() : v,
    );
    const afterString = JSON.stringify(after, (_, v) =>
      typeof v === "bigint" ? v.toString() : v,
    );
    if (beforeString === afterString) return diff;
    diff += `@@ \`${name}\` ${type} ${key ? `key \`${key}\`` : ""}${path ? `.${path}` : ""} @@\n`;
    diff += `- ${beforeString}\n`;
    diff += `+ ${afterString}\n\n`;
  } else {
    // At least one side is an object — recurse into fields
    // Treat non-object side as empty so we get field-level diffs
    const beforeObj = beforeIsObj ? (before as Record<string, ValueType>) : {};
    const afterObj = afterIsObj ? (after as Record<string, ValueType>) : {};
    const allKeys = new Set([
      ...Object.keys(beforeObj),
      ...Object.keys(afterObj),
    ]);
    for (const pathKey of allKeys) {
      diff += deepDiff({
        name,
        type,
        before: beforeObj[pathKey],
        after: afterObj[pathKey],
        key,
        path: path ? `${path}.${pathKey}` : pathKey,
      });
    }
  }

  return diff;
}

async function formatBeforeAndAfter<TName extends string>(
  change: Change<TName>,
  formatInput: (
    input: TName extends keyof ChangeMap
      ? ChangeMap[TName]
      : string | Record<string, ValueType>,
  ) =>
    | (TName extends keyof ChangeMap
        ? ChangeMap[TName]
        : string | Record<string, ValueType>)
    | Promise<
        TName extends keyof ChangeMap
          ? ChangeMap[TName]
          : string | Record<string, ValueType>
      >,
) {
  change.before = await formatInput(change.before);
  change.after = await formatInput(change.after);
}

/**
 * Replacing primitive values with their string representation
 * @param data
 * @param key
 * @returns
 */
function primitiveReplacer(
  data: string | Record<string, ValueType>,
  key?: string,
): string | Record<string, ValueType> {
  // guard needed as apparently can be null
  if (data && typeof data === "object") {
    return Object.keys(data).reduce((acc, k) => {
      (acc as unknown as any)[k] = primitiveReplacer(acc[k], k);
      return acc;
    }, data);
  }
  if (key) {
    if (["liquidityIndex", "variableBorrowIndex"].includes(key))
      return prettifyNumber({ decimals: 27, value: data, showDecimals: true });
    if (
      [
        "liquidationThreshold",
        "reserveFactor",
        "liquidationProtocolFee",
        "ltv",
        "optimalUsageRatio",
        "variableRateSlope1",
        "variableRateSlope2",
      ].includes(key)
    )
      return prettifyNumber({
        decimals: 2,
        value: data,
        suffix: "%",
        showDecimals: true,
      });
    if (
      [
        "currentLiquidityRate",
        "currentVariableBorrowRate",
        "currentStableBorrowRate",
      ].includes(key)
    )
      return prettifyNumber({
        decimals: 25,
        value: data,
        suffix: "%",
        showDecimals: true,
      });
    if (["liquidationBonus"].includes(key))
      return prettifyNumber({
        decimals: 2,
        value: data,
        suffix: "%",
        showDecimals: true,
        patchedValue: BigInt(data) == 0n ? 0n : BigInt(data) - BigInt(1e4),
      });
  }
  return data;
}

/**
 * Enhancing the state diff on complex data types where enhancing requires context aware mutation
 * @param client
 * @param diff
 * @returns
 */
export async function enhanceStateDiff(
  client: Client,
  diff: Record<Address, Change[]>,
) {
  for (const key of Object.keys(diff) as Address[]) {
    for (const change of diff[key as keyof typeof diff]) {
      // reserve configuration is a bitmap not properly decoded by default
      // therefore we manually decode it, to understand if it is v3 or v3, we rely on the eMode feature
      // which did not exist on v2
      if (isChangeOfType(change, "_reserves")) {
        let method: (n: bigint) => any = decodeReserveConfigurationV2;
        try {
          await readContract(client, {
            abi: IPool_ABI,
            functionName: "getUserEMode",
            args: [zeroAddress],
            address: key,
          });
          method = decodeReserveConfiguration;
        } catch (e) {}
        await formatBeforeAndAfter(change, (data) => {
          return {
            ...data,
            configuration: {
              ...data.configuration,
              ...method(BigInt(data.configuration?.data || 0)),
            },
          };
        });
      }
      // eModes are bitmaps that will not be decoded by tenderly etc.
      if (isChangeOfType(change, "_eModeCategories")) {
        await formatBeforeAndAfter(change, async (data) => {
          if (data.collateralBitmap) {
            data.collateralBitmap_decoded = (
              await assetIndexesToAsset(
                client,
                key,
                bitmapToIndexes(BigInt(data.collateralBitmap || 0)),
              )
            ).toString();
            data.collateralBitmap = toBinaryString(
              BigInt(data.collateralBitmap || 0),
            );
          }
          if (data.borrowableBitmap) {
            data.borrowableBitmap_decoded = (
              await assetIndexesToAsset(
                client,
                key,
                bitmapToIndexes(BigInt(data.borrowableBitmap || 0)),
              )
            ).toString();
            data.borrowableBitmap = toBinaryString(
              BigInt(data.borrowableBitmap || 0),
            );
          }
          return data;
        });
      }
      if (isChangeOfType(change, "_streams")) {
        await formatBeforeAndAfter(change, async (data) => {
          if (data.tokenAddress) {
            const assetInfo = await findAsset(client, data.tokenAddress);
            if (data.ratePerSecond)
              data.ratePerSecond = prettifyNumber({
                decimals: assetInfo.decimals,
                value: data.ratePerSecond,
                showDecimals: true,
              });
            if (data.remainingBalance)
              data.remainingBalance = prettifyNumber({
                showDecimals: true,
                decimals: assetInfo.decimals,
                value: data.remainingBalance,
              });
            if (data.deposit)
              data.deposit = prettifyNumber({
                showDecimals: true,
                decimals: assetInfo.decimals,
                value: data.deposit,
              });
          }
          return data;
        });
      }
      if (isChangeOfType(change, "assetsSources")) {
        await formatBeforeAndAfter(change, async (data) => {
          return addAssetPrice(client, data as Address);
        });
      }
      if (
        change.type === "mapping (address => uint256)" ||
        isChangeOfType(change, "totalSupply")
      ) {
        await formatBeforeAndAfter(change, async (data) => {
          const asset = await findAsset(client, key);
          if (asset) {
            return prettifyNumber({
              decimals: asset.decimals,
              value: data as string,
              showDecimals: true,
            });
          }
          return data;
        });
      }
      if (
        isChangeOfType(change, "_allowances") ||
        isChangeOfType(change, "allowed")
      ) {
        await formatBeforeAndAfter(change, async (data) => {
          const asset = await findAsset(client, key);
          if (asset && typeof data === "object") {
            Object.keys(data).forEach((key) => {
              data[key] = prettifyNumber({
                decimals: asset.decimals,
                value: data[key],
                showDecimals: true,
              });
            });
          }
          return data;
        });
      }
      change.after = primitiveReplacer(change.after);
      change.before = primitiveReplacer(change.before);
    }
  }
  return diff;
}
