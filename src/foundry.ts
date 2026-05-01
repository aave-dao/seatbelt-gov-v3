import { ChainId, getClient } from "@bgd-labs/toolbox";
import { execSync } from "child_process";
import { encodeAbiParameters, Hex } from "viem";
import { providerConfig } from "./common";
import { CustomCall, CustomSimulation } from "./customSimulation";

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

function encodeCalls(calls: CustomCall[] | undefined): Hex {
  return encodeAbiParameters(CALLS_ABI_PARAM, [
    (calls ?? []).map((c) => ({
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
    custom?: CustomSimulation;
  },
  blockNumber: number | bigint,
) {
  const client = getClient(Number(payload.chain), {
    providerConfig,
  });
  const hasCustom = !!(
    payload.custom?.preCalls?.length || payload.custom?.postCalls?.length
  );
  const sigArgs = hasCustom
    ? `--sig "run(uint40,address,bytes,bytes)" -- ${payload.payloadId} ${payload.payloadsController} ${encodeCalls(payload.custom?.preCalls)} ${encodeCalls(payload.custom?.postCalls)}`
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
