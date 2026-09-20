import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getClient,
  tenderly_createVnet,
  tenderly_sim,
} from "@aave-dao/toolbox";
import { renderTenderlyReport } from "./tenderly-tooling/tenderly-report";
import { makePayloadExecutableOnTestClient } from "./tenderly-tooling/payloads-controller";
import { simulateOnTenderly } from "./tenderly";

vi.mock("@aave-dao/toolbox", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@aave-dao/toolbox")>()),
  getClient: vi.fn(),
  tenderly_createVnet: vi.fn(),
  tenderly_sim: vi.fn(),
}));
vi.mock("./tenderly-tooling/tenderly-report", () => ({
  renderTenderlyReport: vi
    .fn()
    .mockResolvedValue({ report: "report", eventCache: [] }),
}));
vi.mock("./tenderly-tooling/payloads-controller", () => ({
  makePayloadExecutableOnTestClient: vi.fn(),
  getPayloadStorageOverrides: vi.fn().mockResolvedValue([]),
}));

const result = {
  simulation: { status: true },
  transaction: {
    gas_used: 750_000_000,
  },
};
let order: string[];
let vnet: any;
const params = (chainId: number) =>
  ({
    chainId,
    payloadId: 2,
    payloadsController: "0x0000000000000000000000000000000000000001" as const,
    executeBefore: [1],
    cache: {
      logs: {
        createdLog: { transactionHash: "0x01", blockNumber: 1, timestamp: 1 },
      },
      payload: {} as Parameters<
        typeof simulateOnTenderly
      >[0]["cache"]["payload"],
    },
  }) as Parameters<typeof simulateOnTenderly>[0];

beforeEach(() => {
  vi.clearAllMocks();
  order = [];
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
  const rulesRequest = vi.fn().mockResolvedValue({
    Dag: { MaxParents: 12, MaxFreeParents: 6, MaxExtraData: 128 },
    Economy: {
      Gas: {
        MaxEventGas: 30_000_000,
        EventGas: 28_000,
        ParentGas: 2_400,
        ExtraDataGas: 25,
      },
    },
  });
  vi.mocked(getClient).mockImplementation(
    (chainId) =>
      ({
        request: rulesRequest,
        chain: { id: chainId, name: `Chain ${chainId}` },
      }) as any,
  );
  vi.mocked(makePayloadExecutableOnTestClient).mockImplementation(
    async (_client, _controller, id) => {
      order.push(`prepare ${id}`);
    },
  );
  vnet = {
    vnet: { fork_config: { block_number: "0x1234" } },
    testClient: {
      estimateGas: vi.fn(async () => {
        order.push("estimate");
        return 600_000n;
      }),
    },
    walletClient: {
      writeContract: vi.fn(async ({ args }) => {
        order.push(`execute ${args[0]}`);
      }),
    },
    simulate: vi.fn(async () => {
      order.push("simulate");
      return result;
    }),
    delete: vi.fn(),
  };
  vi.mocked(tenderly_createVnet).mockResolvedValue(vnet);
  vi.mocked(tenderly_sim).mockResolvedValue(result as any);
});

describe.each([143, 146])("gas integration on chain %i", (chainId) => {
  it("estimates after prerequisites and applies the same bounded gas to simulation and execution", async () => {
    await simulateOnTenderly(params(chainId));
    expect(order).toEqual([
      "prepare 1",
      "execute 1",
      "prepare 2",
      "estimate",
      "simulate",
      "execute 2",
    ]);
    const body = vnet.simulate.mock.calls[0][0];
    expect(vnet.testClient.estimateGas).toHaveBeenCalledWith({
      account: body.from,
      to: body.to,
      data: body.input,
      gas: chainId === 143 ? 30_000_000n : 29_954_400n,
      gasPrice: 0n,
      value: 0n,
    });
    expect(body.gas).toBe(720_000);
    expect(body.block_number).toBeNull(); // Use prepared VNet head, not the base-chain block.
    expect(vnet.walletClient.writeContract).toHaveBeenLastCalledWith(
      expect.objectContaining({ gas: 720_000n, args: [2] }),
    );
    expect(renderTenderlyReport).toHaveBeenCalledWith(
      expect.objectContaining({
        gasReport: expect.stringContaining("estimated gas: 600,000"),
      }),
    );
    expect(tenderly_sim).not.toHaveBeenCalled();
  });

  it("retains the prepared VNet on estimator failure", async () => {
    vnet.testClient.estimateGas.mockRejectedValue(new Error("estimate failed"));
    await simulateOnTenderly(params(chainId));
    expect(tenderly_sim).not.toHaveBeenCalled();
    expect(vnet.simulate).toHaveBeenCalledWith(
      expect.objectContaining({
        gas: chainId === 143 ? 30_000_000 : 29_954_400,
      }),
    );
    expect(renderTenderlyReport).toHaveBeenCalledWith(
      expect.objectContaining({
        gasReport: expect.stringContaining("estimate unavailable"),
      }),
    );
  });
});
