import { Address, Client } from "viem";
import { getSourceCode } from "@bgd-labs/toolbox";
import { getCode } from "viem/actions";

interface GetVerificationStatusParams {
  client: Client;
  addresses: readonly Address[];
  contractDb: Record<Address, string>;
  deployedDuringExecution?: Set<string>;
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

/**
 * Iterates a list of addresses and returns their verification status
 * @param param0
 * @returns
 */
export async function getVerificationStatus({
  client,
  addresses,
  contractDb = {},
  deployedDuringExecution,
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
    if (deployedDuringExecution?.has(address.toLowerCase())) {
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
    try {
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
    } catch (e) {
      results.push({
        address,
        status: VerificationStatus.ERROR,
      });
    }
  }
  return results;
}
