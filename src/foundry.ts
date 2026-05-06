import { ChainId, getClient } from "@bgd-labs/toolbox";
import { execSync } from "child_process";
import { providerConfig } from "./common";

function getChainName(chainId: number) {
  return Object.keys(ChainId)
    .find((key) => ChainId[key as keyof typeof ChainId] === chainId)
    ?.toLowerCase();
}

export function simulateViaFoundry(
  payload: { chain: bigint | number; payloadId: number | bigint; payloadsController: string },
  blockNumber: number | bigint,
) {
  const client = getClient(Number(payload.chain), {
    providerConfig,
  });
  const command = [
    `FOUNDRY_PROFILE=${getChainName(Number(payload.chain))}`,
    `forge script ${
      Number(payload.chain) === ChainId.zksync ? "zksync/" : ""
    }script/E2EPayload.s.sol:E2EPayload`,
    Number(payload.chain) === ChainId.zksync ? "--zksync --offline" : "",
    `--fork-url ${client.transport.url!}`,
    blockNumber != 0n ? ` --fork-block-number ${blockNumber}` : "",
    "-vvvv",
    `--sig "run(uint40,address)" -- ${payload.payloadId} ${payload.payloadsController}`,
  ]
    .filter((c) => c)
    .join(" ");
  if (process.env.VERBOSE === "true") console.log(command);
  return execSync(command, { stdio: "inherit" });
}

export function simulateSafeViaFoundry(
  params: {
    chain: number;
    safe: string;
    to: string;
    value: string;
    data: string;
  },
  blockNumber: number | bigint,
): string {
  const client = getClient(params.chain, { providerConfig });
  const command = [
    `FOUNDRY_PROFILE=${getChainName(params.chain)}`,
    `forge script script/E2ESafe.s.sol:E2ESafe`,
    `--fork-url ${client.transport.url!}`,
    blockNumber != 0n ? `--fork-block-number ${blockNumber}` : "",
    "-vvvv",
    `--sig "run(address,address,uint256,bytes)"`,
    `-- ${params.safe} ${params.to} ${params.value} ${params.data}`,
  ]
    .filter((c) => c)
    .join(" ");
  if (process.env.VERBOSE === "true") console.log(command);
  return execSync(command, { encoding: "utf-8", maxBuffer: 10 * 1024 * 1024 });
}
