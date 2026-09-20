import type { Client, Hex } from "viem";
import { prepareEvmGas } from "./evm";
import { prepareMonadGas } from "./monad";
import { prepareSonicGas } from "./sonic";

export async function prepareGas(params: {
  client: Client;
  blockNumber: number | Hex | "latest";
  estimate?: (gasLimit: bigint) => Promise<bigint>;
}) {
  switch (params.client.chain!.id) {
    case 146:
      return prepareSonicGas(params);
    case 143:
      return prepareMonadGas(params);
    default:
      return prepareEvmGas(params);
  }
}
