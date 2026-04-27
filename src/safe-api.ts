import { Address, Hex, getAddress, decodeAbiParameters } from "viem";

// --- Types ---

export type SafeMultisigTransaction = {
  safe: Address;
  to: Address;
  value: string;
  data: Hex | null;
  operation: 0 | 1; // 0=Call, 1=DelegateCall
  gasToken: Address;
  safeTxGas: number;
  baseGas: number;
  gasPrice: string;
  refundReceiver: Address;
  nonce: number;
  executionDate: string | null;
  submissionDate: string;
  modified: string;
  blockNumber: number | null;
  transactionHash: Hex | null;
  safeTxHash: Hex;
  proposer: Address;
  executor: Address | null;
  isExecuted: boolean;
  isSuccessful: boolean | null;
  confirmationsRequired: number;
  confirmations: {
    owner: Address;
    submissionDate: string;
    signature: Hex;
    signatureType: string;
  }[];
  dataDecoded: {
    method: string;
    parameters: any[];
  } | null;
  origin: string | null;
};

export type SafeSubTransaction = {
  operation: number; // 0=Call, 1=DelegateCall
  to: Address;
  value: bigint;
  data: Hex;
};

export type ParsedSafeUrl = {
  chainPrefix: string;
  safeAddress: Address;
  safeTxHash: Hex;
};

// --- Chain prefix mapping (EIP-3770) ---

const CHAIN_PREFIX_MAP: Record<string, number> = {
  eth: 1,
  matic: 137,
  arb1: 42161,
  oeth: 10,
  base: 8453,
  gno: 100,
  bnb: 56,
  avax: 43114,
  scr: 534352,
  linea: 59144,
  zksync: 324,
  mnt: 5000,
  sep: 11155111,
  celo: 42220,
  sonic: 146,
  megaeth: 4326,
};

export function chainPrefixToChainId(prefix: string): number {
  const chainId = CHAIN_PREFIX_MAP[prefix];
  if (!chainId) throw new Error(`Unknown chain prefix: "${prefix}"`);
  return chainId;
}

// Known MultiSend contract addresses (canonical deployments)
const KNOWN_MULTISEND_ADDRESSES = new Set(
  [
    "0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761", // MultiSend v1.3.0
    "0x998739BFdAAdde7C933B942a68053933098f9EDa", // MultiSend v1.3.0 (alt)
    "0x38869bf66a61cF6bDB996A6aE40D5853Fd43B526", // MultiSend Call Only v1.3.0
    "0x9641d764fc13c8B624c04430C7356C1C7C8102e2", // MultiSend v1.4.1
    "0xA1dabEF33b3B82c7814B6D82A79e50F4AC44102B", // MultiSend Call Only v1.4.1
  ].map((a) => a.toLowerCase()),
);

export function isKnownMultiSend(address: Address): boolean {
  return KNOWN_MULTISEND_ADDRESSES.has(address.toLowerCase());
}

// --- URL Parsing ---

/**
 * Parse a Safe app URL into its components.
 *
 * Format: https://app.safe.global/transactions/tx?safe={prefix}:{address}&id=multisig_{address}_{safeTxHash}
 */
export function parseSafeUrl(url: string): ParsedSafeUrl {
  const parsed = new URL(url);

  const safeParam = parsed.searchParams.get("safe");
  if (!safeParam) throw new Error("Missing 'safe' parameter in URL");

  const [chainPrefix, safeAddressRaw] = safeParam.split(":");
  if (!chainPrefix || !safeAddressRaw)
    throw new Error(`Invalid safe parameter format: "${safeParam}"`);

  const idParam = parsed.searchParams.get("id");
  if (!idParam) throw new Error("Missing 'id' parameter in URL");

  // Format: multisig_{address}_{safeTxHash}
  const idMatch = idParam.match(
    /^multisig_0x[a-fA-F0-9]{40}_(0x[a-fA-F0-9]{64})$/,
  );
  if (!idMatch) throw new Error(`Invalid id parameter format: "${idParam}"`);

  return {
    chainPrefix,
    safeAddress: getAddress(safeAddressRaw),
    safeTxHash: idMatch[1] as Hex,
  };
}

// --- Fetch with retry ---

async function fetchWithRetry(url: string, maxRetries = 3): Promise<Response> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const response = await fetch(url);
    if (response.status === 429 && attempt < maxRetries) {
      const delay = Math.pow(2, attempt + 1) * 1000; // 2s, 4s, 8s
      console.warn(`Rate limited (429), retrying in ${delay / 1000}s...`);
      await new Promise((r) => setTimeout(r, delay));
      continue;
    }
    return response;
  }
  throw new Error("Unreachable");
}

// --- Safe Transaction Service API ---

function safeApiBase(chainPrefix: string) {
  return `https://api.safe.global/tx-service/${chainPrefix}/api/v1`;
}

/**
 * Fetch a multisig transaction from the Safe Transaction Service API.
 */
export async function fetchSafeTransaction(
  chainPrefix: string,
  safeTxHash: Hex,
): Promise<SafeMultisigTransaction> {
  const apiUrl = `${safeApiBase(chainPrefix)}/multisig-transactions/${safeTxHash}/`;

  const response = await fetchWithRetry(apiUrl);
  if (!response.ok) {
    throw new Error(
      `Safe API request failed: ${response.status} ${response.statusText} (${apiUrl})`,
    );
  }

  const data = await response.json();
  return data as SafeMultisigTransaction;
}

/**
 * Fetch the Safe's current nonce from the Safe Transaction Service API.
 */
export async function fetchSafeNonce(
  chainPrefix: string,
  safeAddress: Address,
): Promise<number> {
  const apiUrl = `${safeApiBase(chainPrefix)}/safes/${safeAddress}/`;

  const response = await fetchWithRetry(apiUrl);
  if (!response.ok) {
    throw new Error(
      `Safe API request failed: ${response.status} ${response.statusText} (${apiUrl})`,
    );
  }

  const data = await response.json();
  return data.nonce as number;
}

/**
 * Fetch pending (non-executed) multisig transactions for a Safe
 * that are still actionable (nonce >= current Safe nonce).
 */
export async function fetchPendingSafeTransactions(
  chainPrefix: string,
  safeAddress: Address,
): Promise<SafeMultisigTransaction[]> {
  const [currentNonce, allPending] = await Promise.all([
    fetchSafeNonce(chainPrefix, safeAddress),
    fetchAllPendingSafeTransactions(chainPrefix, safeAddress),
  ]);

  const actionable = allPending.filter((tx) => tx.nonce >= currentNonce);
  const stale = allPending.length - actionable.length;
  if (stale > 0) {
    console.info(
      `Filtered out ${stale} stale pending tx(s) below current nonce ${currentNonce}`,
    );
  }

  return actionable;
}

async function fetchAllPendingSafeTransactions(
  chainPrefix: string,
  safeAddress: Address,
): Promise<SafeMultisigTransaction[]> {
  return fetchSafeTransactionsPaginated(
    `${safeApiBase(chainPrefix)}/safes/${safeAddress}/multisig-transactions/?executed=false&limit=100&ordering=-nonce`,
  );
}

/**
 * Fetch all executed multisig transactions for a Safe.
 */
export async function fetchExecutedSafeTransactions(
  chainPrefix: string,
  safeAddress: Address,
): Promise<SafeMultisigTransaction[]> {
  return fetchSafeTransactionsPaginated(
    `${safeApiBase(chainPrefix)}/safes/${safeAddress}/multisig-transactions/?executed=true&limit=100&ordering=-nonce`,
  );
}

async function fetchSafeTransactionsPaginated(
  url: string,
): Promise<SafeMultisigTransaction[]> {
  const results: SafeMultisigTransaction[] = [];
  let nextUrl: string | null = url;

  while (nextUrl) {
    const response: Response = await fetchWithRetry(nextUrl);
    if (!response.ok) {
      throw new Error(
        `Safe API request failed: ${response.status} ${response.statusText} (${nextUrl})`,
      );
    }

    const data: { results?: SafeMultisigTransaction[]; next?: string } =
      await response.json();
    results.push(...(data.results || []));
    nextUrl = data.next || null;
  }

  return results;
}

// --- MultiSend Decoding ---

const MULTISEND_SELECTOR = "0x8d80ff0a";

/**
 * Decode a MultiSend.multiSend(bytes transactions) calldata into individual sub-transactions.
 *
 * The inner `transactions` bytes are packed as:
 *   [operation: 1 byte][to: 20 bytes][value: 32 bytes][dataLength: 32 bytes][data: dataLength bytes]
 * Repeated for each sub-transaction.
 */
export function decodeMultiSend(data: Hex): SafeSubTransaction[] {
  // Strip 0x prefix and the 4-byte multiSend selector
  if (!data.toLowerCase().startsWith(MULTISEND_SELECTOR)) {
    throw new Error(
      `Data does not start with MultiSend selector (${MULTISEND_SELECTOR})`,
    );
  }

  // ABI-decode the outer bytes parameter: multiSend(bytes transactions)
  const [transactionsBytes] = decodeAbiParameters(
    [{ type: "bytes" }],
    `0x${data.slice(10)}` as Hex,
  );

  const txBytes = transactionsBytes as Hex;
  const buf = Buffer.from(txBytes.slice(2), "hex");

  const subTxs: SafeSubTransaction[] = [];
  let offset = 0;

  while (offset < buf.length) {
    // operation: 1 byte
    const operation = buf[offset];
    offset += 1;

    // to: 20 bytes
    const to = getAddress(
      `0x${buf.subarray(offset, offset + 20).toString("hex")}`,
    );
    offset += 20;

    // value: 32 bytes (uint256)
    const value = BigInt(
      `0x${buf.subarray(offset, offset + 32).toString("hex")}`,
    );
    offset += 32;

    // dataLength: 32 bytes (uint256)
    const dataLength = Number(
      BigInt(`0x${buf.subarray(offset, offset + 32).toString("hex")}`),
    );
    offset += 32;

    // data: dataLength bytes
    const txData =
      dataLength > 0
        ? (`0x${buf.subarray(offset, offset + dataLength).toString("hex")}` as Hex)
        : ("0x" as Hex);
    offset += dataLength;

    subTxs.push({ operation, to, value, data: txData });
  }

  return subTxs;
}
