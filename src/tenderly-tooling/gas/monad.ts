import type { TenderlySimulationResponse } from "@aave-dao/toolbox";
import { fmtGas } from "./evm";

// Monad charges the submitted limit, so transaction.gas_used is not an estimate.
// https://docs.monad.xyz/developer-essentials/gas-pricing
export async function prepareMonadGas({
  estimate,
}: {
  estimate?: (gasLimit: bigint) => Promise<bigint>;
}) {
  const maxGas = 30_000_000n;
  let estimatedGas: bigint | undefined;
  try {
    const value = await estimate?.(maxGas);
    if (typeof value === "bigint" && value > 0n) estimatedGas = value;
  } catch {
    // Keep the prepared VNet; a failed estimator must not trigger stateless replay.
  }
  const bufferedGas = estimatedGas && (estimatedGas * 120n + 99n) / 100n;
  const gasLimit = bufferedGas && bufferedGas < maxGas ? bufferedGas : maxGas;

  return {
    gasLimit,
    vnetOverrides: { gas: Number(gasLimit), block_number: null },
    transactionOverrides: { gas: gasLimit },
    render(sim: TenderlySimulationResponse): string {
      let report = `- requested simulation gas limit: ${fmtGas(gasLimit)} (Monad max tx gas limit: ${fmtGas(maxGas)})\n`;
      if (estimatedGas !== undefined) {
        report += `- estimated gas: ${fmtGas(estimatedGas)} (prepared VNet eth_estimateGas)\n`;
        if (estimatedGas > maxGas) {
          report +=
            "- :warning: gas estimate exceeds Monad's transaction limit; execution within the cap is not established.\n";
        } else if (bufferedGas! > maxGas) {
          report +=
            "- :warning: gas estimate fits, but the 20% safety margin exceeds the transaction limit.\n";
        }
      } else {
        report +=
          "- :warning: prepared VNet gas estimate unavailable; gas executability is not established.\n";
      }

      // Trace consumption is useful evidence, but not the minimum gas allowance
      // (refunds and EIP-150 call forwarding can make those differ).
      const info = sim.transaction.transaction_info as
        | {
            intrinsic_gas?: number;
            call_trace?: { gas_used?: number };
          }
        | undefined;
      const intrinsic = info?.intrinsic_gas;
      const execution = info?.call_trace?.gas_used;
      if (
        sim.simulation.status &&
        Number.isSafeInteger(intrinsic) &&
        intrinsic! >= 0 &&
        Number.isSafeInteger(execution) &&
        execution! >= 0
      ) {
        report += `- trace gas: ${fmtGas(BigInt(intrinsic!) + BigInt(execution!))} (approximate consumption, not a gas-limit estimate)\n`;
      }
      if (!estimate) {
        report +=
          "- :warning: prepared VNet state was unavailable; this assessment is provisional.\n";
      }
      return (
        report +
        "- Monad charges the submitted gas limit; Tenderly's top-level gas_used is excluded from the execution estimate.\n"
      );
    },
  };
}
