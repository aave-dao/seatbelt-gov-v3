import { ChainId, getClient } from "@bgd-labs/toolbox";
import { execSync } from "child_process";
import { encodeAbiParameters, Hex } from "viem";
import { providerConfig } from "./common";
import { Hook, SimulationHooks } from "./hooks";

function getChainName(chainId: number) {
  return Object.keys(ChainId)
    .find((key) => ChainId[key as keyof typeof ChainId] === chainId)
    ?.toLowerCase();
}

const CALLS_ABI_PARAM = [
  {
    type: "tuple[]",
    components: [
      { name: "from", type: "address" },
      { name: "target", type: "address" },
      { name: "value", type: "uint256" },
      { name: "data", type: "bytes" },
    ],
  },
] as const;

function encodeHook(hook: Hook[] | undefined): Hex {
  return encodeAbiParameters(CALLS_ABI_PARAM, [
    (hook ?? []).map((c) => ({
      from: c.from,
      target: c.target,
      value: c.value ?? 0n,
      data: c.data,
    })),
  ]);
}

export function simulateViaFoundry(
  payload: {
    chain: bigint | number;
    payloadId: number | bigint;
    payloadsController: string;
    hooks?: SimulationHooks;
  },
  blockNumber: number | bigint,
) {
  const client = getClient(Number(payload.chain), {
    providerConfig,
  });
  const hasHooks = !!(
    payload.hooks?.preHook?.length || payload.hooks?.postHook?.length
  );
  const sigArgs = hasHooks
    ? `--sig "run(uint40,address,bytes,bytes)" -- ${payload.payloadId} ${payload.payloadsController} ${encodeHook(payload.hooks?.preHook)} ${encodeHook(payload.hooks?.postHook)}`
    : `--sig "run(uint40,address)" -- ${payload.payloadId} ${payload.payloadsController}`;
  const command = [
    `FOUNDRY_PROFILE=${getChainName(Number(payload.chain))}`,
    `forge script ${
      Number(payload.chain) === ChainId.zksync ? "zksync/" : ""
    }script/E2EPayload.s.sol:E2EPayload`,
    Number(payload.chain) === ChainId.zksync ? "--zksync --offline" : "",
    `--fork-url ${client.transport.url!}`,
    blockNumber != 0n ? ` --fork-block-number ${blockNumber}` : "",
    "-vvvv",
    sigArgs,
  ]
    .filter((c) => c)
    .join(" ");
  if (process.env.VERBOSE === "true") console.log(command);
  return execSync(command, { stdio: "inherit" });
}
