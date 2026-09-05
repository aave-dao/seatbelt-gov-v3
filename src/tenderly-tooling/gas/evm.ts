import { ChainId, type TenderlySimulationResponse } from "@aave-dao/toolbox";
import type { Client } from "viem";

export const UNCAPPED_GAS_LIMIT_CHAINS: number[] = [
  ChainId.mantle,
  ChainId.megaeth,
];

export const fmtGas = (g: bigint) => g.toLocaleString("en-US");

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
    // Default: 2^24 = 16,777,216 — Ethereum's EIP-7825 cap (https://eips.ethereum.org/EIPS/eip-7825).
    // Gnosis (100, Fusaka EIP-7825) and Base (8453, Azul hardfork) are also exactly
    // 2^24, and we assume this is the lowest cap across networks, so every other
    // chain (known or not) safely falls back to it.
    default:
      return 16_777_216n;
  }
}

export function prepareEvmGas({ client }: { client: Client }) {
  const gasLimit = UNCAPPED_GAS_LIMIT_CHAINS.includes(client.chain!.id)
    ? 0n
    : 16_000_000n;
  return {
    gasLimit,
    vnetOverrides: { gas_limit: Number(gasLimit) },
    // Preserve wallet-side estimation for the default path.
    transactionOverrides: {},
    render(sim: TenderlySimulationResponse): string {
      const gasUsed = BigInt((sim.transaction as any).gas_used ?? 0);
      const maxTxGasLimit = getMaxTxGasLimit(client.chain!.id);
      if (gasUsed > maxTxGasLimit) {
        return `- :sos: gasUsed: ${fmtGas(gasUsed)} — **exceeds ${client.chain!.name}'s max transaction gas limit of ${fmtGas(maxTxGasLimit)}; this payload cannot be executed in a single transaction**\n`;
      }
      return `- gasUsed: ${fmtGas(gasUsed)} (max tx gas limit: ${fmtGas(maxTxGasLimit)})\n`;
    },
  };
}
