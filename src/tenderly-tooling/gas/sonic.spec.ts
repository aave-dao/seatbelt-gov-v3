import { describe, expect, it, vi } from "vitest";
import { createClient, custom } from "viem";
import type { TenderlySimulationResponse } from "@aave-dao/toolbox";
import { prepareSonicGas } from "./sonic";

const rules = {
  Dag: { MaxParents: 12, MaxFreeParents: 6, MaxExtraData: 128 },
  Economy: {
    Gas: {
      MaxEventGas: 30_000_000,
      EventGas: 28_000,
      ParentGas: 2_400,
      ExtraDataGas: 25,
    },
  },
};
const simulation = {
  transaction: {},
  simulation: { status: true },
} as TenderlySimulationResponse;

describe("Sonic rules", () => {
  it("reads rules at the fork block, including historical caps", async () => {
    const historicalRequest = vi.fn().mockResolvedValue({
      ...rules,
      Economy: { Gas: { ...rules.Economy.Gas, MaxEventGas: 100_000_000 } },
    });
    const gas = await prepareSonicGas({
      client: createClient({
        transport: custom({ request: historicalRequest }),
      }),
      blockNumber: "0x1234",
    });
    expect(historicalRequest).toHaveBeenCalledWith({
      method: "eth_getRules",
      params: ["0x1234"],
    });
    expect(gas.gasLimit).toBe(99_954_400n);
    expect(gas.render(simulation)).toContain("eth_getRules at 0x1234");
  });

  it("still estimates if the provider does not support eth_getRules", async () => {
    const estimate = vi.fn().mockResolvedValue(500_000n);
    const gas = await prepareSonicGas({
      client: createClient({
        transport: custom(
          {
            request: async () => {
              throw new Error("unsupported");
            },
          },
          { retryCount: 0 },
        ),
      }),
      blockNumber: "latest",
      estimate,
    });
    expect(estimate).toHaveBeenCalledWith(29_954_400n);
    expect(gas.render(simulation)).toContain("estimated gas: 500,000");
    expect(gas.render(simulation)).toContain("active rules unverified");
  });
});
