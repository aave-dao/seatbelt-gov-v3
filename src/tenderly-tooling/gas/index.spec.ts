import { describe, expect, it, vi } from "vitest";
import { createClient, custom } from "viem";
import type { TenderlySimulationResponse } from "@aave-dao/toolbox";
import { monad, sonic } from "viem/chains";
import { prepareGas } from "./index";

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
const simulation = (gasUsed: number) =>
  ({
    transaction: { gas_used: gasUsed },
    simulation: { status: true },
  }) as unknown as TenderlySimulationResponse;

describe.each([
  {
    name: "Monad",
    chain: monad,
    cap: 30_000_000n,
    inflated: 750_000_000,
  },
  {
    name: "Sonic",
    chain: sonic,
    cap: 29_954_400n,
    inflated: 560_160_288,
  },
])("$name gas", ({ chain, cap, inflated }) => {
  const options = {
    client: createClient({
      chain,
      transport: custom({ request: async () => rules }),
    }),
    blockNumber: 100,
  };

  it("ignores inflated charged gas and estimates against the transaction cap", async () => {
    const estimate = vi.fn().mockResolvedValue(600_001n);
    const gas = await prepareGas({ ...options, estimate });
    expect(estimate).toHaveBeenCalledWith(cap);
    expect(gas.gasLimit).toBe(720_002n);
    const report = gas.render(simulation(inflated));
    expect(report).toContain(
      "estimated gas: 600,001 (prepared VNet eth_estimateGas)",
    );
    expect(report).not.toContain(inflated.toLocaleString("en-US"));
  });

  it("caps the buffer without declaring an otherwise fitting estimate impossible", async () => {
    const gas = await prepareGas({
      ...options,
      estimate: async () => cap - 1n,
    });
    expect(gas.gasLimit).toBe(cap);
    expect(gas.render(simulation(inflated))).toContain(
      "20% safety margin exceeds",
    );
    expect(gas.render(simulation(inflated))).not.toContain(
      "cannot be executed",
    );
  });
});
