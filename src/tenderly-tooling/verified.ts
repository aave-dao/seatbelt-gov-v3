import { Address, Client } from "viem";
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

// Process-level cache: keyed by `${chainId}:${lowercaseAddress}` → { name } or null for unverified.
// Avoids re-fetching Etherscan source code for the same address across many simulations (e.g. the cron).
const sourceCodeCache: Record<string, { ContractName: string } | null> = {};

async function getCachedSourceCode(
  chainId: number,
  address: Address,
  apiKey?: string,
  apiUrl?: string,
): Promise<{ ContractName: string } | null> {
  const key = `${chainId}:${address.toLowerCase()}`;
  if (key in sourceCodeCache) return sourceCodeCache[key];
  try {
    const result = await getSourceCode({ chainId, address, apiKey, apiUrl });
    sourceCodeCache[key] = { ContractName: result.ContractName };
    return sourceCodeCache[key];
  } catch (e) {
    sourceCodeCache[key] = null;
    return null;
  }
}

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
    if (contractDb[address]) {
      results.push({
        address,
        name: contractDb[address],
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
    const source = await getCachedSourceCode(
      client.chain!.id,
      address,
      apiKey,
      apiUrl,
    );
    if (source) {
      results.push({
        address,
        name: source.ContractName,
        status: VerificationStatus.CONTRACT,
        new: true,
      });
    } else {
      results.push({
        address,
        status: VerificationStatus.ERROR,
      });
    }
  }
  return results;
}
