import { describe, expect, it } from "vitest";
import { createClient, custom, pad } from "viem";
import { mainnet } from "viem/chains";
import { TenderlySimulationResponse } from "@aave-dao/toolbox";
import { getNamedContracts } from "./tenderly-report";
import { getMdContractName } from "./utils";
import { VerificationStatus } from "./verified";

const IMPLEMENTATION_SLOT =
  "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc";

const PROXY = "0x1111111111111111111111111111111111111111";
const STALE_IMPL = "0x2222222222222222222222222222222222222222";
const CURRENT_IMPL = "0x3333333333333333333333333333333333333333";
const CREATED_PROXY = "0x4444444444444444444444444444444444444444";
const CREATED_IMPL = "0x5555555555555555555555555555555555555555";
const EOA = "0x6666666666666666666666666666666666666666";
const EXPLORER_ONLY = "0x7777777777777777777777777777777777777777";

const sim = {
  simulation: { network_id: "1" },
  contracts: [
    {
      address: PROXY,
      contract_name: "TransparentUpgradeableProxy",
      standards: ["eip1967"],
      child_contracts: [
        { id: `eth:1:${STALE_IMPL}`, address: STALE_IMPL, network_id: "1" },
      ],
    },
    { address: CURRENT_IMPL, contract_name: "CurrentImpl" },
    { address: CREATED_IMPL, contract_name: "CreatedImpl" },
  ],
  transaction: {
    transaction_info: {
      state_diff: [
        {
          address: CREATED_PROXY,
          soltype: null,
          original: "",
          dirty: "",
          raw: [
            {
              address: CREATED_PROXY,
              key: IMPLEMENTATION_SLOT,
              original: pad("0x"),
              dirty: pad(CREATED_IMPL),
            },
          ],
        },
      ],
    },
  },
} as unknown as TenderlySimulationResponse;

describe("getNamedContracts", () => {
  it("should name contracts tenderly has no metadata for and read implementations from storage", async () => {
    const reads: string[] = [];
    const client = createClient({
      chain: mainnet,
      transport: custom({
        async request({ method, params }) {
          if (method !== "eth_getStorageAt") throw new Error(method);
          reads.push(params[0].toLowerCase());
          return params[0].toLowerCase() === PROXY
            ? pad(CURRENT_IMPL)
            : pad("0x");
        },
      }),
    });
    const contracts = await getNamedContracts(client, sim, [
      { address: PROXY, status: VerificationStatus.CONTRACT },
      {
        address: CREATED_PROXY,
        status: VerificationStatus.DEPLOYED_ON_EXECUTION,
      },
      { address: EOA, status: VerificationStatus.EOA },
      {
        address: EXPLORER_ONLY,
        status: VerificationStatus.CONTRACT,
        name: "ExplorerName",
      },
    ]);

    expect(getMdContractName(contracts, PROXY)).toBe(
      `TransparentUpgradeableProxy at \`${PROXY}\` with implementation CurrentImpl at \`${CURRENT_IMPL}\``,
    );
    expect(getMdContractName(contracts, CREATED_PROXY)).toBe(
      `contract deployed on execution at \`${CREATED_PROXY}\` with implementation CreatedImpl at \`${CREATED_IMPL}\``,
    );
    expect(getMdContractName(contracts, EOA)).toBe(`EOA at \`${EOA}\``);
    expect(getMdContractName(contracts, EXPLORER_ONLY)).toBe(
      `ExplorerName at \`${EXPLORER_ONLY}\``,
    );
    // the implementation written during the simulation is not read from the chain
    expect(reads).toEqual([PROXY]);
    // tenderly's response is left untouched
    expect(sim.contracts[0].child_contracts![0].address).toBe(STALE_IMPL);
  });
});
