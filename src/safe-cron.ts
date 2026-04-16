import "dotenv/config";
import { existsSync, writeFileSync } from "fs";
import { TRACKED_SAFES } from "./safe-config";
import {
  chainPrefixToChainId,
  fetchPendingSafeTransactions,
  fetchExecutedSafeTransactions,
  type SafeMultisigTransaction,
} from "./safe-api";
import {
  simulateSafeTransaction,
  getSafeReportFileName,
} from "./safe";

async function simulateIfMissing(
  chainId: number,
  safeAddress: string,
  tx: SafeMultisigTransaction,
) {
  const reportFile = getSafeReportFileName(
    chainId,
    safeAddress as any,
    tx.nonce,
  );

  if (existsSync(reportFile)) {
    return false; // already exists
  }

  console.info(
    `  Nonce ${tx.nonce}: simulating (safeTxHash: ${tx.safeTxHash})`,
  );

  try {
    const report = await simulateSafeTransaction(chainId, tx);
    writeFileSync(reportFile, report);
    console.info(`  Nonce ${tx.nonce}: report written`);
    return true;
  } catch (e) {
    console.error(`  Nonce ${tx.nonce}: simulation failed: ${e}`);
    return false;
  }
}

async function main() {
  for (const safe of TRACKED_SAFES) {
    const chainId = chainPrefixToChainId(safe.chainPrefix);
    console.info(
      `\n=== ${safe.label} (${safe.chainPrefix}:${safe.address}) ===`,
    );

    // 1. Pending transactions (actionable, nonce >= current nonce)
    try {
      const pendingTxs = await fetchPendingSafeTransactions(
        safe.chainPrefix,
        safe.address,
      );

      if (pendingTxs.length > 0) {
        console.info(`\nPending: ${pendingTxs.length} actionable transaction(s)`);
        for (const tx of pendingTxs) {
          await simulateIfMissing(chainId, safe.address, tx);
        }
      } else {
        console.info("No pending actionable transactions");
      }
    } catch (e) {
      console.error(`Failed to fetch pending transactions: ${e}`);
    }

    // 2. Executed transactions (backfill missing reports)
    try {
      const executedTxs = await fetchExecutedSafeTransactions(
        safe.chainPrefix,
        safe.address,
      );

      const missing = executedTxs.filter(
        (tx) =>
          !existsSync(
            getSafeReportFileName(chainId, safe.address as any, tx.nonce),
          ),
      );

      if (missing.length > 0) {
        console.info(
          `\nExecuted: ${missing.length} of ${executedTxs.length} missing reports, backfilling...`,
        );
        for (const tx of missing) {
          await simulateIfMissing(chainId, safe.address, tx);
        }
      } else {
        console.info(
          `Executed: all ${executedTxs.length} transactions have reports`,
        );
      }
    } catch (e) {
      console.error(`Failed to fetch executed transactions: ${e}`);
    }
  }
}

main().catch((e) => {
  console.error("Safe cron failed:", e);
  process.exit(1);
});
