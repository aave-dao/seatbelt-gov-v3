import {
  AbiFunction,
  AbiParameter,
  Address,
  Hex,
  concatHex,
  encodeFunctionData,
  encodePacked,
  pad,
  size,
} from "viem";

/**
 * A single transaction as exported by the Safe transaction builder app.
 * Either `data` is set (raw calldata) or `contractMethod` + `contractInputsValues`
 * describe the call to be encoded.
 */
export type TxBuilderTransaction = {
  to: Address;
  value: string;
  data: Hex | null;
  contractMethod: {
    inputs: AbiParameter[];
    name: string;
    payable: boolean;
  } | null;
  contractInputsValues: Record<string, string> | null;
};

/**
 * The json format exported by the Safe transaction builder app.
 */
export type TxBuilderBatch = {
  version: string;
  chainId: string;
  createdAt: number;
  meta: {
    name: string;
    description: string;
    txBuilderVersion?: string;
    createdFromSafeAddress: string;
    createdFromOwnerAddress?: string;
    checksum?: string;
  };
  transactions: TxBuilderTransaction[];
};

// https://github.com/safe-global/safe-deployments (canonical MultiSendCallOnly deployments, newest first)
export const MULTI_SEND_CALL_ONLY: Address[] = [
  "0xA83c336B20401Af773B6219BA5027174338D1836", // 1.5.0
  "0x9641d764fc13c8B624c04430C7356C1C7C8102e2", // 1.4.1
  "0x40A2aCCbd92BCA938b02010E17A5b8929b49130D", // 1.3.0
];

const MULTI_SEND_ABI = [
  {
    type: "function",
    name: "multiSend",
    inputs: [{ type: "bytes", name: "transactions" }],
    outputs: [],
    stateMutability: "payable",
  },
] as const;

/**
 * Parses a stringified tx-builder value into json, quoting bare integer
 * literals first so values above Number.MAX_SAFE_INTEGER keep full precision.
 */
function parseJsonValue(value: string): unknown {
  const quoted = value.replace(
    /-?\d+(?=(?:[^"]*"[^"]*")*[^"]*$)/g,
    (match) => `"${match}"`,
  );
  return JSON.parse(quoted);
}

/**
 * Converts a tx-builder input value (string encoded) into the shape viem
 * expects for the given abi parameter.
 */
function parseInputValue(param: AbiParameter, value: unknown): unknown {
  if (value === undefined || value === null)
    throw new Error(
      `missing value for parameter ${param.name} (${param.type})`,
    );
  if (param.type.endsWith("]")) {
    const elementType = param.type.slice(0, param.type.lastIndexOf("["));
    const values = typeof value === "string" ? parseJsonValue(value) : value;
    if (!Array.isArray(values))
      throw new Error(
        `expected array for parameter ${param.name} (${param.type})`,
      );
    return values.map((v) =>
      parseInputValue({ ...param, type: elementType }, v),
    );
  }
  if (param.type === "tuple") {
    const components = (param as { components?: AbiParameter[] }).components;
    if (!components)
      throw new Error(`missing components for tuple parameter ${param.name}`);
    const values = typeof value === "string" ? parseJsonValue(value) : value;
    if (!Array.isArray(values) || values.length !== components.length)
      throw new Error(
        `expected ${components.length} values for tuple parameter ${param.name}`,
      );
    return components.map((component, i) =>
      parseInputValue(component, values[i]),
    );
  }
  if (param.type.startsWith("uint") || param.type.startsWith("int"))
    return BigInt(value as string | number);
  if (param.type === "bool")
    return typeof value === "boolean" ? value : value === "true";
  return value;
}

/**
 * Returns the calldata of a single tx-builder transaction.
 */
export function encodeTxBuilderTransaction(tx: TxBuilderTransaction): Hex {
  if (tx.data) return tx.data;
  if (!tx.contractMethod)
    throw new Error(
      `transaction to ${tx.to} has neither data nor contractMethod`,
    );
  const abiFunction: AbiFunction = {
    type: "function",
    name: tx.contractMethod.name,
    inputs: tx.contractMethod.inputs,
    outputs: [],
    stateMutability: tx.contractMethod.payable ? "payable" : "nonpayable",
  };
  const args = tx.contractMethod.inputs.map((input) =>
    parseInputValue(input, tx.contractInputsValues?.[input.name!]),
  );
  return encodeFunctionData({ abi: [abiFunction], args });
}

/**
 * Returns the human readable signature of a tx-builder transaction (e.g. `addSpoke(address,address,uint256,(uint40,uint40,uint24,bool,bool))`).
 */
export function getTxBuilderTransactionSignature(
  tx: TxBuilderTransaction,
): string {
  if (!tx.contractMethod) return "raw calldata";
  const typeToString = (param: AbiParameter): string => {
    if (param.type.startsWith("tuple")) {
      const components = (param as { components?: AbiParameter[] }).components!;
      return `(${components.map(typeToString).join(",")})${param.type.slice("tuple".length)}`;
    }
    return param.type;
  };
  return `${tx.contractMethod.name}(${tx.contractMethod.inputs.map(typeToString).join(",")})`;
}

export type SafeTransaction = {
  to: Address;
  value: bigint;
  data: Hex;
  operation: 0 | 1;
};

/**
 * Aggregates the batch into the transaction executed by the safe:
 * a plain call for a single transaction, a multiSend delegatecall otherwise.
 */
export function buildSafeTransaction(
  transactions: TxBuilderTransaction[],
  multiSendCallOnly?: Address,
): SafeTransaction {
  if (transactions.length === 0) throw new Error("empty batch");
  if (transactions.length === 1) {
    const tx = transactions[0];
    return {
      to: tx.to,
      value: BigInt(tx.value || 0),
      data: encodeTxBuilderTransaction(tx),
      operation: 0,
    };
  }
  if (!multiSendCallOnly)
    throw new Error(
      "multiSendCallOnly required for batches with multiple transactions",
    );
  const packed = transactions.map((tx) => {
    const data = encodeTxBuilderTransaction(tx);
    return encodePacked(
      ["uint8", "address", "uint256", "uint256", "bytes"],
      [0, tx.to, BigInt(tx.value || 0), BigInt(size(data)), data],
    );
  });
  return {
    to: multiSendCallOnly,
    value: BigInt(0),
    data: encodeFunctionData({
      abi: MULTI_SEND_ABI,
      functionName: "multiSend",
      args: [concatHex(packed)],
    }),
    operation: 1,
  };
}

/**
 * Returns a pre-validated safe signature (r = owner, s = 0, v = 1),
 * valid when the transaction sender is the encoded owner.
 */
export function buildPrevalidatedSignature(owner: Address): Hex {
  return concatHex([
    pad(owner.toLowerCase() as Address, { size: 32 }),
    pad("0x", { size: 32 }),
    "0x01",
  ]);
}
