import { describe, expect, it } from "vitest";
import { getExecutionGas } from "./utils";

// fields trimmed from real Tenderly /simulate responses (2026-09-25)
const sim = (transaction: object) => ({ transaction }) as any;

describe("getExecutionGas", () => {
  it("ignores the limit-derived charged gas on Avalanche", () => {
    // payload 125 on 0x1140CB7CAfAcC745771C2Ea31e7B5C653c5d0B80, no gas limit sent; eth_call reports 735,954
    const avalanche = sim({
      gas_used: 4611686018427388000,
      transaction_info: {
        intrinsic_gas: 21204,
        call_trace: { gas_used: 714750 },
      },
    });
    expect(getExecutionGas(avalanche)).toBe(735_954n);
  });

  it("matches gas_used on chains that charge executed gas", () => {
    // WETH (0xC02a…6Cc2).totalSupply() on mainnet
    const mainnet = sim({
      gas_used: 21407,
      transaction_info: {
        intrinsic_gas: 21064,
        call_trace: { gas_used: 343 },
      },
    });
    expect(getExecutionGas(mainnet)).toBe(21_407n);
  });

  it("returns undefined without a call trace", () => {
    expect(
      getExecutionGas(sim({ gas_used: 8000000, transaction_info: {} })),
    ).toBe(undefined);
  });
});
