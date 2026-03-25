import { Address, Client, getAddress } from "viem";
import { getSourceCode } from "@bgd-labs/toolbox";
import { getCode } from "viem/actions";

interface GetVerificationStatusParams {
  client: Client;
  addresses: readonly Address[];
  contractDb: Record<Address, string>;
  contractsDeployedDuringExec?: Set<string>;
  apiKey?: string;
  apiUrl?: string;
}

export enum VerificationStatus {
  EOA,
  CONTRACT,
  ERROR,
  DEPLOYED_ON_EXECUTION,
}

export function verificationStatusToString(status: VerificationStatus) {
  switch (status) {
    case VerificationStatus.EOA:
      return "EOA";
    case VerificationStatus.CONTRACT:
      return "Contract";
    case VerificationStatus.ERROR:
      return "Error";
    case VerificationStatus.DEPLOYED_ON_EXECUTION:
      return "Deployed on execution";
  }
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Iterates a list of addresses and returns their verification status
 * @param param0
 * @returns
 */
export async function getVerificationStatus({
  client,
  addresses,
  contractDb = {},
  contractsDeployedDuringExec,
  apiKey,
  apiUrl,
}: GetVerificationStatusParams) {
  const results: {
    address: Address;
    status: VerificationStatus;
    name?: string;
    new?: boolean;
  }[] = [];
  for (const address of addresses) {
    if (contractsDeployedDuringExec?.has(address.toLowerCase())) {
      results.push({
        address,
        status: VerificationStatus.DEPLOYED_ON_EXECUTION,
      });
      continue;
    }
    const normalizedAddress = getAddress(address);
    if (contractDb[normalizedAddress]) {
      results.push({
        address,
        name: contractDb[normalizedAddress],
        status: VerificationStatus.CONTRACT,
      });
      continue;
    }
    const code = await getCode(client, { address });
    if (!code) {
      results.push({
        address,
        status: VerificationStatus.EOA,
      });
      continue;
    }
    // Etherscan free tier: 3 calls/sec — pace requests and retry on rate limit
    let resolved = false;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        if (attempt > 0) await delay(1000);
        await delay(350); // ~2.8 calls/sec max
        const code = await getSourceCode({
          chainId: client.chain!.id,
          address,
          apiKey,
          apiUrl,
        });
        results.push({
          address,
          name: code.ContractName,
          status: VerificationStatus.CONTRACT,
          new: true,
        });
        resolved = true;
        break;
      } catch (e) {
        const msg = (e as Error).message;
        if (!msg.includes("rate limit")) {
          results.push({
            address,
            status: VerificationStatus.ERROR,
          });
          resolved = true;
          break;
        }
        console.warn(`Rate limited on ${address}, retrying (${attempt + 1}/3)...`);
      }
    }
    if (!resolved) {
      console.error(`Verification failed for ${address} after retries`);
      results.push({
        address,
        status: VerificationStatus.ERROR,
      });
    }
  }
  return results;
}
