import {
  Address,
  Client,
  formatUnits,
  getAddress,
  getContract,
  Hex,
  zeroAddress,
} from "viem";
import {
  IAggregatorInterface_ABI,
  IERC20Metadata_ABI,
  IPool_ABI,
  TenderlySimulationResponse,
} from "@aave-dao/toolbox";

export type AssetInfo = { symbol: string; decimals: number };

export const fmtGas = (g: bigint) => g.toLocaleString("en-US");

/**
 * Gas the executePayload tx actually executes: intrinsic + call trace.
 * `transaction.gas_used` is the charged gas, which Tenderly derives from the gas limit
 * on chains billing by limit (Avalanche: limit / 2, Monad: full limit), so it is not used.
 * Returns undefined when the trace is missing.
 */
export function getExecutionGas(sim: TenderlySimulationResponse) {
  const info = sim.transaction.transaction_info as {
    intrinsic_gas?: number;
    call_trace?: { gas_used?: number };
  };
  if (info?.intrinsic_gas == null || info.call_trace?.gas_used == null)
    return undefined;
  return BigInt(info.intrinsic_gas) + BigInt(info.call_trace.gas_used);
}

/**
 * Resolves a network's max per-transaction gas limit — the cap a single tx may
 * consume; a payload exceeding it can never be included on-chain.
 *
 * We assume 2^24 (16,777,216, Ethereum's EIP-7825 cap) is the LOWEST such cap of
 * any supported network, so it is the default and this function always returns at
 * least that value. Unconfigured chains therefore get the most conservative bound
 * (most likely to flag), never an under-estimate.
 */
export function getMaxTxGasLimit(chainId: number): bigint {
  switch (chainId) {
    // Polygon PoS — Madhugiri hardfork (Gigagas Phase 3, Dec 2025); EIP-8123: "Arbitrum and Polygon both use 32,000,000".
    case 137:
    // Arbitrum One — ArbOS 51 ("Dia") MaxTxGasLimit, live 2026-01-08; configurable via the ArbOwner precompile but 32M is the shipping value. https://docs.arbitrum.io/run-arbitrum-node/arbos-releases/arbos51
    case 42161:
      return 32_000_000n;
    // ZKsync Era — bootloader-enforced MAX_TX_GAS for computation; no traditional block.gasLimit. https://docs.zksync.io/zksync-protocol/era-vm/contracts/bootloader
    case 324:
      return 80_000_000n;
    // MegaETH — protocol-level compute gas limit (block limit is 10B, this is far tighter). https://docs.megaeth.com/spec
    case 4326:
      return 200_000_000n;
    // Monad - 30M transaction gas limit. 200M block gas limit, https://docs.monad.xyz/developer-essentials/gas-pricing
    case 143:
      return 30_000_000n;
    // Default: 2^24 = 16,777,216 — Ethereum's EIP-7825 cap (https://eips.ethereum.org/EIPS/eip-7825).
    // Gnosis (100, Fusaka EIP-7825) and Base (8453, Azul hardfork) are also exactly
    // 2^24, and we assume this is the lowest cap across networks, so every other
    // chain (known or not) safely falls back to it.
    default:
      return 16_777_216n;
  }
}

const assetsCache: Record<number, Record<Hex, AssetInfo>> = {};

/**
 * Small utility function to find asset information either via cache or via contract call
 * @param client
 * @param address
 * @returns {symbol, decimals}
 */
export async function findAsset(client: Client, address: Hex) {
  const chainId = client.chain!.id;
  if (!assetsCache[chainId]) assetsCache[chainId] = {};
  const asset = assetsCache[chainId][address];
  if (asset) return asset;
  const erc20Contract = getContract({
    client,
    address: address,
    abi: IERC20Metadata_ABI,
  });
  let symbol = "unknown";
  let decimals = 0;
  try {
    symbol = await erc20Contract.read.symbol();
  } catch (e) {}
  try {
    decimals = await erc20Contract.read.decimals();
  } catch (e) {}
  assetsCache[chainId][address] = {
    symbol,
    decimals,
  };
  return assetsCache[chainId][address];
}

const cachedReservesList: Record<number, readonly Hex[]> = {};

export async function assetIndexesToAsset(
  client: Client,
  poolAddress: Hex,
  indexes: number[],
): Promise<string[]> {
  if (!cachedReservesList[client.chain!.id])
    cachedReservesList[client.chain!.id] = await getContract({
      client,
      abi: IPool_ABI,
      address: poolAddress,
    }).read.getReservesList();
  const reservesList = cachedReservesList[client.chain!.id];
  // Warning: this is potentially fragile, as it assumes the reserveList to reflect reserve indexes
  // which is not a fair assumption given the existence of dropReserve
  return await Promise.all(
    indexes.map(async (index) => {
      if (index < reservesList.length) {
        const reserve = reservesList[index];
        const info = await findAsset(client, reserve);
        return `${info.symbol}(id: ${index})`;
      }
      return `unknown(id: ${index})`;
    }),
  );
}

export function addAssetSymbol(asset: AssetInfo, value: Address) {
  return `${value} (symbol: ${asset.symbol})`;
}

/**
 * Returns a string with `,` separators.
 * Not using toLocalString() as it forces us to use `number` types, which can be problematic with decimals & big numbers
 * @param x
 * @returns
 * credits: https://stackoverflow.com/a/2901298
 */
export function formatNumberString(x: string | number) {
  return String(x).replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
}

function limitDecimalsWithoutRounding(val: string, decimals: number) {
  const parts = val.split(".");
  if (parts.length != 2) return val;
  return parts[0] + "." + parts[1].substring(0, decimals);
}

export function prettifyNumber({
  value,
  decimals,
  prefix,
  suffix,
  showDecimals,
  patchedValue,
}: {
  value: string | number | bigint;
  decimals: number;
  prefix?: string;
  suffix?: string;
  showDecimals?: boolean;
  // allow overwriting the value when formatting
  // this is useful for e.g. 1e4 % numbers, when the 100% should be removed in the formatting
  patchedValue?: string | number | bigint;
}) {
  const formattedNumber = limitDecimalsWithoutRounding(
    formatNumberString(formatUnits(BigInt(patchedValue || value), decimals)),
    4,
  );
  return `${prefix ? `${prefix} ` : ""}${formattedNumber}${
    suffix ? ` ${suffix}` : ""
  } [${value}${showDecimals ? `, ${decimals} decimals` : ""}]`;
}

export function toBinaryString(value: bigint) {
  return `0b` + value.toString(2);
}

export async function addAssetPrice(client: Client, address: Address) {
  const clProxy = getContract({
    client,
    address,
    abi: IAggregatorInterface_ABI,
  });
  if (address === zeroAddress) return address;
  let decimals,
    latestAnswer = 0n,
    description = "unknown";
  try {
    decimals = await clProxy.read.decimals();
  } catch (e) {}
  try {
    latestAnswer = await clProxy.read.latestAnswer();
  } catch (e) {}
  try {
    description = await clProxy.read.description();
  } catch (e) {}
  return `${address} (latestAnswer: ${
    decimals
      ? prettifyNumber({ value: latestAnswer, decimals, showDecimals: true })
      : latestAnswer
  }, description: ${description})`;
}

/**
 * @notice Given a Tenderly contract object, generates a descriptive human-friendly name for that contract
 * @param contract Tenderly contract object to generate name from
 */
export function getMdContractName(
  contracts: TenderlySimulationResponse["contracts"],
  address: Address,
): string {
  // lower-case comparison as strict equality would fail on child contracts which are lower-cased when returned from tenderly
  const contract = contracts.find(
    (c) => c.address.toLowerCase() === address.toLowerCase(),
  );
  if (!contract) return `unknown contract name at \`${getAddress(address)}\``;
  let contractName = contract?.contract_name;

  // If the contract is a token, include the full token name. This is useful in cases where the
  // token is a proxy, so the contract name doesn't give much useful information
  if (contract?.token_data?.name)
    contractName += ` (${contract?.token_data?.name})`;

  // if the contract is a proxy include it's child
  if (
    contract.standards?.includes("eip1967") &&
    contract.child_contracts?.[0].address
  ) {
    return `${contractName} at \`${getAddress(address)}\` with implementation ${getMdContractName(contracts, contract.child_contracts?.[0].address)}`;
  }

  // Lastly, append the contract address and save it off
  return `${contractName} at \`${getAddress(address)}\``;
}
