import type { TenderlySimulationResponse } from "@aave-dao/toolbox";
import { type Client, type EIP1193RequestFn, type Hex, toHex } from "viem";
import { fmtGas } from "./evm";

type SonicRules = {
  Dag: { MaxParents: number; MaxFreeParents: number; MaxExtraData: number };
  Economy: {
    Gas: {
      MaxEventGas: number;
      EventGas: number;
      ParentGas: number;
      ExtraDataGas: number;
    };
  };
};

// https://docs.soniclabs.com/sonic/build-on-sonic/network-parameters
// CurrentMaxGasLimit: https://github.com/0xsoniclabs/sonic/blob/51d8de55e8e3752919ef41b26dccf28e5f69d9d8/gossip/evm_state_reader.go#L86-L96
export async function prepareSonicGas({
  client,
  blockNumber,
  estimate,
}: {
  client: Client;
  blockNumber: number | Hex | "latest";
  estimate?: (gasLimit: bigint) => Promise<bigint>;
}) {
  let maxGas = 29_954_400n;
  let source = ":warning: documented fallback; active rules unverified";
  try {
    const request = client.request as EIP1193RequestFn<
      [
        {
          Method: "eth_getRules";
          Parameters: [Hex | "latest"];
          ReturnType: SonicRules;
        },
      ]
    >;
    const block =
      typeof blockNumber === "number" ? toHex(blockNumber) : blockNumber;
    const {
      Dag: dag,
      Economy: { Gas: gas },
    } = await request({
      method: "eth_getRules",
      params: [block],
    });
    const values = [
      dag.MaxParents,
      dag.MaxFreeParents,
      dag.MaxExtraData,
      gas.MaxEventGas,
      gas.EventGas,
      gas.ParentGas,
      gas.ExtraDataGas,
    ];
    if (
      values.some((value) => !Number.isSafeInteger(value) || value < 0) ||
      dag.MaxParents < dag.MaxFreeParents
    ) {
      throw new Error("Invalid Sonic gas rules");
    }
    const limit =
      BigInt(gas.MaxEventGas) -
      BigInt(gas.EventGas) -
      BigInt(dag.MaxParents - dag.MaxFreeParents) * BigInt(gas.ParentGas) -
      BigInt(dag.MaxExtraData) * BigInt(gas.ExtraDataGas);
    if (limit <= 0n) throw new Error("Invalid Sonic transaction gas limit");
    maxGas = limit;
    source = `eth_getRules at ${block}`;
  } catch {
    // Some gateways do not expose Sonic's nonstandard RPC. Label the fallback.
  }

  let estimatedGas: bigint | undefined;
  try {
    const value = await estimate?.(maxGas);
    if (typeof value === "bigint" && value > 0n) estimatedGas = value;
  } catch {
    // Preserve the prepared VNet and simulate at the cap when estimation fails.
  }
  // https://docs.soniclabs.com/sonic/build-on-sonic/gas-pricing
  const bufferedGas = estimatedGas && (estimatedGas * 120n + 99n) / 100n;
  const gasLimit = bufferedGas && bufferedGas < maxGas ? bufferedGas : maxGas;

  return {
    gasLimit,
    vnetOverrides: { gas: Number(gasLimit), block_number: null },
    transactionOverrides: { gas: gasLimit },
    render(sim: TenderlySimulationResponse): string {
      let report = `- requested simulation gas limit: ${fmtGas(gasLimit)} (Sonic max tx gas limit: ${fmtGas(maxGas)}; ${source})\n`;
      if (estimatedGas !== undefined) {
        report += `- estimated gas: ${fmtGas(estimatedGas)} (prepared VNet eth_estimateGas)\n`;
        if (estimatedGas > maxGas) {
          report +=
            "- :warning: gas estimate exceeds Sonic's transaction limit; execution within the cap is not established.\n";
        } else if (bufferedGas! > maxGas) {
          report +=
            "- :warning: gas estimate fits, but the 20% safety margin exceeds the transaction limit.\n";
        }
      } else {
        report +=
          "- :warning: prepared VNet gas estimate unavailable; gas executability is not established.\n";
      }
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
        "- Tenderly's top-level gas_used is excluded: Sonic gas accounting can include unused-gas charges.\n"
      );
    },
  };
}
