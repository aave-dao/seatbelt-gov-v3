import "dotenv/config";
import { existsSync, writeFileSync, mkdirSync } from "fs";
import path from "path";
import {
  Address,
  Hex,
  encodeFunctionData,
  getAddress,
  parseEther,
  toHex,
} from "viem";
import {
  getClient,
  tenderly_createVnet,
  tenderly_sim,
  ChainId,
  TenderlySimulationResponse,
} from "@bgd-labs/toolbox";
import { Option, program } from "commander";
import { eventDb } from "@aave-dao/aave-helpers-js";
import { providerConfig } from "./common";
import {
  parseSafeUrl,
  fetchSafeTransaction,
  chainPrefixToChainId,
  decodeMultiSend,
  isKnownMultiSend,
  type SafeMultisigTransaction,
  type SafeSubTransaction,
} from "./safe-api";
import { renderSafeReport } from "./tenderly-tooling/safe-report";
import { CHAIN_NOT_SUPPORTED_ON_TENDERLY } from "./tenderly";
import { simulateSafeViaFoundry } from "./foundry";

// Minimal Safe v1.3+ ABI: just what we need to simulate execTransaction atomically
const SAFE_ABI = [
  {
    type: "function",
    name: "getOwners",
    inputs: [],
    outputs: [{ type: "address[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "execTransaction",
    inputs: [
      { name: "to", type: "address" },
      { name: "value", type: "uint256" },
      { name: "data", type: "bytes" },
      { name: "operation", type: "uint8" },
      { name: "safeTxGas", type: "uint256" },
      { name: "baseGas", type: "uint256" },
      { name: "gasPrice", type: "uint256" },
      { name: "gasToken", type: "address" },
      { name: "refundReceiver", type: "address" },
      { name: "signatures", type: "bytes" },
    ],
    outputs: [{ type: "bool" }],
    stateMutability: "payable",
  },
] as const;

// Slot 4 in Safe v1.3+ (OwnerManager: owners mapping @2, ownerCount @3, threshold @4)
const SAFE_THRESHOLD_SLOT = toHex(4, { size: 32 });

/**
 * Build an approved-hash signature (v=1) for Safe.execTransaction.
 * Format: r (32 bytes, owner address right-padded) || s (32 bytes, zero) || v (1 byte, 0x01).
 * When `from == owner` on the vnet, Safe's checkNSignatures accepts this without needing a real signature.
 */
function buildApprovedHashSignature(owner: Address): Hex {
  return ("0x" +
    owner.slice(2).toLowerCase().padStart(64, "0") +
    "0".repeat(64) +
    "01") as Hex;
}

export function getSafeReportFileName(
  chainId: number,
  safeAddress: Address,
  nonce: number,
) {
  const storagePath = `./reports/safe/${chainId}/${safeAddress}`;
  if (!existsSync(storagePath)) mkdirSync(storagePath, { recursive: true });
  return path.join(storagePath, `${nonce}.md`);
}

export async function simulateSafeTransaction(
  chainId: number,
  safeTx: SafeMultisigTransaction,
) {
  const tenderlyConfig = {
    projectSlug: process.env.TENDERLY_PROJECT_SLUG!,
    accountSlug: process.env.TENDERLY_ACCOUNT!,
    accessToken: process.env.TENDERLY_ACCESS_TOKEN!,
  };

  const client = getClient(chainId, { providerConfig });

  // Determine if this is a MultiSend DelegateCall
  const isMultiSend =
    safeTx.operation === 1 && isKnownMultiSend(safeTx.to);
  let subTransactions: SafeSubTransaction[] | undefined;

  if (isMultiSend && safeTx.data) {
    subTransactions = decodeMultiSend(safeTx.data);
    console.info(
      `Decoded MultiSend with ${subTransactions.length} sub-transactions`,
    );
  } else if (safeTx.operation === 1) {
    console.warn(
      `DelegateCall to non-MultiSend target ${safeTx.to} — simulation may be inaccurate`,
    );
  }

  const simResults: TenderlySimulationResponse[] = [];

  // For already-executed txs, simulate at the block before execution
  const blockNumber =
    safeTx.isExecuted && safeTx.blockNumber
      ? safeTx.blockNumber - 1
      : -2; // -2 = latest
  if (safeTx.isExecuted) {
    console.info(
      `Transaction already executed at block ${safeTx.blockNumber}, simulating at block ${blockNumber}`,
    );
  }

  if (CHAIN_NOT_SUPPORTED_ON_TENDERLY.includes(chainId)) {
    // Foundry simulation for chains Tenderly doesn't support (e.g. MegaETH)
    console.info("Chain not supported on Tenderly, using Foundry simulation");
    const forgeBlock = blockNumber === -2 ? 0n : BigInt(blockNumber);

    const txsToSimulate = isMultiSend && subTransactions
      ? subTransactions.map((sub) => ({
          to: sub.to,
          value: sub.value.toString(),
          data: sub.data || "0x",
        }))
      : [{ to: safeTx.to, value: safeTx.value, data: safeTx.data || "0x" }];

    const traceOutputs: string[] = [];
    for (let i = 0; i < txsToSimulate.length; i++) {
      const tx = txsToSimulate[i];
      if (txsToSimulate.length > 1) {
        console.info(`Simulating sub-tx ${i + 1}/${txsToSimulate.length}: ${tx.to}`);
      }
      try {
        const output = simulateSafeViaFoundry(
          { chain: chainId, safe: safeTx.safe, to: tx.to, value: tx.value, data: tx.data },
          forgeBlock,
        );
        traceOutputs.push(output);
      } catch (e: any) {
        traceOutputs.push(e.stdout?.toString() || e.message || "Simulation failed");
      }
    }

    return renderFoundrySafeReport(safeTx, txsToSimulate, subTransactions, traceOutputs);
  } else {
    // Vnet-based simulation
    try {
      const vnet = await tenderly_createVnet(
        {
          baseChainId: chainId,
          forkChainId: chainId,
          displayName: `Safe ${safeTx.safe} nonce ${safeTx.nonce}`,
          slug: `safe_${chainId}_${safeTx.nonce}`,
          blockNumber: blockNumber === -2 ? "latest" : (blockNumber as any),
          force: true,
        },
        tenderlyConfig,
      );

      // If the Safe tx sends ETH, ensure the Safe has enough balance
      if (BigInt(safeTx.value) > 0n) {
        await vnet.testClient.setBalance({
          address: safeTx.safe,
          value: BigInt(safeTx.value) * 2n, // 2x margin
        });
      }

      if (safeTx.operation === 1) {
        // DelegateCall: atomic simulation via Safe.execTransaction with storage overrides.
        // This reproduces the real onchain path (Safe delegatecalls the target; target's code
        // runs in Safe's storage context; msg.sender at sub-targets = Safe).
        const owners = (await client.readContract({
          address: safeTx.safe,
          abi: SAFE_ABI,
          functionName: "getOwners",
        })) as readonly Address[];

        if (owners.length === 0) {
          throw new Error(`Safe ${safeTx.safe} has no owners`);
        }
        const owner = owners[0];

        // Override threshold to 1 so a single signature suffices.
        await vnet.testClient.setStorageAt({
          address: safeTx.safe,
          index: SAFE_THRESHOLD_SLOT,
          value: toHex(1, { size: 32 }),
        });

        // Fund the owner for gas.
        await vnet.testClient.setBalance({
          address: owner,
          value: parseEther("100"),
        });

        const signatures = buildApprovedHashSignature(owner);

        const input = encodeFunctionData({
          abi: SAFE_ABI,
          functionName: "execTransaction",
          args: [
            safeTx.to,
            BigInt(safeTx.value),
            (safeTx.data || "0x") as Hex,
            1, // operation = DelegateCall
            BigInt(safeTx.safeTxGas),
            BigInt(safeTx.baseGas),
            BigInt(safeTx.gasPrice),
            safeTx.gasToken,
            safeTx.refundReceiver,
            signatures,
          ],
        });

        const simResult = await vnet.simulate({
          network_id: chainId.toString(),
          from: owner,
          to: safeTx.safe,
          input,
          value: "0",
          block_number: -2,
          transaction_index: 0,
          gas_limit: chainId !== ChainId.mantle ? 16_000_000 : 0,
          gas_price: "0",
          access_list: [],
          generate_access_list: true,
          save: true,
          source: "dashboard",
        });
        simResults.push(simResult);
      } else {
        // Call (operation=0): direct sim from the Safe.
        const simPayload = {
          network_id: chainId.toString(),
          from: safeTx.safe,
          to: safeTx.to,
          input: safeTx.data || "0x",
          value: safeTx.value,
          block_number: -2,
          transaction_index: 0,
          gas_limit: chainId !== ChainId.mantle ? 16_000_000 : 0,
          gas_price: "0",
          access_list: [],
          generate_access_list: true,
          save: true,
          source: "dashboard",
        };

        const simResult = await vnet.simulate(simPayload);
        simResults.push(simResult);
      }
    } catch (e) {
      console.error("Vnet simulation failed, falling back to direct sim:", e);
      // Fallback to direct simulation
      const result = await tenderly_sim(tenderlyConfig, {
        network_id: chainId.toString(),
        from: safeTx.safe,
        to: safeTx.to,
        input: safeTx.data || "0x",
        value: safeTx.value,
        block_number: -2,
        save: true,
      });
      simResults.push(result);
      // Reset sub-transactions for fallback (no multi-sim)
      subTransactions = undefined;
    }
  }

  // Render report
  const { report } = await renderSafeReport({
    client,
    safeTx,
    simResults,
    subTransactions,
    eventCache: eventDb,
    config: {
      etherscanApiKey: process.env.ETHERSCAN_API_KEY!,
    },
  });

  return report;
}

function renderFoundrySafeReport(
  safeTx: SafeMultisigTransaction,
  _txsSimulated: { to: string; value: string; data: string }[],
  subTransactions: SafeSubTransaction[] | undefined,
  traceOutputs: string[],
): string {
  let report = `## Safe Transaction (Foundry)\n\n`;
  report += `- Safe: \`${safeTx.safe}\`\n`;
  report += `- SafeTxHash: \`${safeTx.safeTxHash}\`\n`;
  report += `- Nonce: ${safeTx.nonce}\n`;
  report += `- Proposer: ${safeTx.proposer}\n`;
  report += `- Confirmations: ${safeTx.confirmations.length}/${safeTx.confirmationsRequired}\n`;
  report += `- Operation: ${safeTx.operation === 0 ? "Call" : "DelegateCall"}\n`;
  report += `- Target: \`${safeTx.to}\`\n`;
  report += `- Value: ${safeTx.value}\n`;
  if (safeTx.data) {
    report += `- Data: \`${safeTx.data}\`\n`;
  }
  if (safeTx.dataDecoded) {
    report += `- Decoded: \`${safeTx.dataDecoded.method}\`\n`;
  }
  report += `- Submitted: ${safeTx.submissionDate}\n`;
  if (safeTx.isExecuted) {
    report += `- Executed: ${safeTx.executionDate} (tx: \`${safeTx.transactionHash}\`)\n`;
  } else {
    report += `- Status: Pending\n`;
  }
  report += "\n";

  for (let i = 0; i < traceOutputs.length; i++) {
    if (traceOutputs.length > 1) {
      const sub = subTransactions?.[i];
      report += `### Sub-transaction ${i + 1} of ${traceOutputs.length}\n\n`;
      if (sub) {
        report += `- To: \`${sub.to}\`\n`;
        report += `- Value: ${sub.value}\n`;
        report += `- Data: \`${sub.data}\`\n\n`;
      }
    }

    const trace = traceOutputs[i];
    const succeeded = trace.includes("SAFE_SIM_SUCCESS");
    const reverted = trace.includes("SAFE_SIM_REVERTED");

    if (reverted) {
      report += `:sos: Simulation reverted\n\n`;
    } else if (succeeded) {
      report += `Simulation succeeded\n\n`;
    }

    report += `<details>\n<summary>Forge trace</summary>\n\n\`\`\`\n${trace}\n\`\`\`\n</details>\n\n`;
  }

  return report;
}

// --- CLI (only runs when executed directly) ---

if ((import.meta as any).main) {
  program
    .addOption(
      new Option("--url [url]", "Safe app transaction URL"),
    )
    .addOption(
      new Option("--chain [chain]", "Chain prefix (e.g. eth, arb1, base)"),
    )
    .addOption(
      new Option("--safe [safe]", "Safe address"),
    )
    .addOption(
      new Option(
        "--safeTxHash [safeTxHash]",
        "Safe transaction hash",
      ),
    )
    .action(async (options) => {
      let chainPrefix: string;
      let safeAddress: Address;
      let safeTxHash: Hex;

      if (options.url && typeof options.url === "string") {
        // Parse from URL
        const parsed = parseSafeUrl(options.url);
        chainPrefix = parsed.chainPrefix;
        safeAddress = parsed.safeAddress;
        safeTxHash = parsed.safeTxHash;
      } else if (options.chain && options.safe && options.safeTxHash) {
        chainPrefix = options.chain;
        safeAddress = getAddress(options.safe);
        safeTxHash = options.safeTxHash as Hex;
      } else {
        throw new Error(
          "Provide either --url or all of --chain, --safe, --safeTxHash",
        );
      }

      const chainId = chainPrefixToChainId(chainPrefix);
      console.info(
        `Fetching Safe transaction on ${chainPrefix} (chainId: ${chainId})`,
      );
      console.info(`Safe: ${safeAddress}`);
      console.info(`SafeTxHash: ${safeTxHash}`);

      // Fetch from Safe API
      const safeTx = await fetchSafeTransaction(chainPrefix, safeTxHash);
      console.info(
        `Transaction fetched: nonce=${safeTx.nonce}, operation=${safeTx.operation}, isExecuted=${safeTx.isExecuted}`,
      );
      console.info(
        `Confirmations: ${safeTx.confirmations.length}/${safeTx.confirmationsRequired}`,
      );

      if (safeTx.dataDecoded) {
        console.info(`Method: ${safeTx.dataDecoded.method}`);
      }

      // Simulate
      console.info("Starting simulation...");
      const report = await simulateSafeTransaction(chainId, safeTx);

      // Write report
      const fileName = getSafeReportFileName(
        chainId,
        safeAddress,
        safeTx.nonce,
      );
      writeFileSync(fileName, report);
      console.info(`Report written to ${fileName}`);
    })
    .showHelpAfterError()
    .parse();
}
