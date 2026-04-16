import "dotenv/config";
import { existsSync, writeFileSync, mkdirSync } from "fs";
import path from "path";
import { Address, Hex, getAddress } from "viem";
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
    // Direct simulation fallback — no vnet support
    console.info("Chain not supported on Tenderly vnets, using direct sim");
    if (isMultiSend && subTransactions) {
      // Simulate each sub-tx individually (loses sequential state)
      console.warn(
        "MultiSend on non-vnet chain: sub-txs simulated independently (no shared state)",
      );
      for (const subTx of subTransactions) {
        const result = await tenderly_sim(tenderlyConfig, {
          network_id: chainId.toString(),
          from: safeTx.safe,
          to: subTx.to,
          input: subTx.data || "0x",
          value: subTx.value.toString(),
          block_number: blockNumber,
          save: true,
        });
        simResults.push(result);
      }
    } else {
      const result = await tenderly_sim(tenderlyConfig, {
        network_id: chainId.toString(),
        from: safeTx.safe,
        to: safeTx.to,
        input: safeTx.data || "0x",
        value: safeTx.value,
        block_number: blockNumber,
        save: true,
      });
      simResults.push(result);
    }
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

      if (isMultiSend && subTransactions) {
        // Simulate each sub-tx sequentially on the vnet
        for (let i = 0; i < subTransactions.length; i++) {
          const subTx = subTransactions[i];
          console.info(
            `Simulating sub-tx ${i + 1}/${subTransactions.length}: ${subTx.to}`,
          );

          if (subTx.operation === 1) {
            console.warn(
              `Sub-tx ${i + 1} is a DelegateCall — simulating as Call (may be inaccurate)`,
            );
          }

          // Ensure balance for sub-tx value
          if (subTx.value > 0n) {
            await vnet.testClient.setBalance({
              address: safeTx.safe,
              value: subTx.value * 2n,
            });
          }

          const simPayload = {
            network_id: chainId.toString(),
            from: safeTx.safe,
            to: subTx.to,
            input: subTx.data || "0x",
            value: subTx.value.toString(),
            block_number: -2, // latest on vnet
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

          // Execute on vnet to persist state for the next sub-tx
          if (i < subTransactions.length - 1) {
            try {
              await vnet.walletClient.sendTransaction({
                chain: { id: chainId } as any,
                account: safeTx.safe,
                to: subTx.to,
                data: subTx.data || "0x",
                value: subTx.value,
              });
            } catch (e) {
              console.warn(
                `Failed to execute sub-tx ${i + 1} on vnet for state persistence: ${e}`,
              );
            }
          }
        }
      } else {
        // Single transaction simulation
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
