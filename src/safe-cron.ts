import "dotenv/config";
import { existsSync, writeFileSync } from "fs";
import {
  TRACKED_SAFES,
  BACKFILL,
  FORCE_RERUN_PENDING,
  PARALLEL_SAFES,
  type TrackedSafe,
} from "./safe-config";
import {
  chainPrefixToChainId,
  fetchPendingSafeTransactions,
  fetchExecutedSafeTransactions,
  type SafeMultisigTransaction,
} from "./safe-api";
import { simulateSafeTransaction, getSafeReportFileName } from "./safe";

const DELAY_BETWEEN_SIMS_MS = 1500;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function simulateIfMissing(
  tag: string,
  chainId: number,
  safeAddress: string,
  tx: SafeMultisigTransaction,
  force = false,
) {
  const reportFile = getSafeReportFileName(
    chainId,
    safeAddress as any,
    tx.nonce,
  );

  if (!force && existsSync(reportFile)) {
    return false;
  }

  console.info(
    `${tag} Nonce ${tx.nonce}: simulating${force ? " (forced rerun)" : ""} (safeTxHash: ${tx.safeTxHash})`,
  );

  try {
    const report = await simulateSafeTransaction(chainId, tx);
    writeFileSync(reportFile, report);
    console.info(`${tag} Nonce ${tx.nonce}: report written`);
    await sleep(DELAY_BETWEEN_SIMS_MS);
    return true;
  } catch (e) {
    console.error(`${tag} Nonce ${tx.nonce}: simulation failed: ${e}`);
    await sleep(DELAY_BETWEEN_SIMS_MS);
    return false;
  }
}

async function processSafe(safe: TrackedSafe) {
  const chainId = chainPrefixToChainId(safe.chainPrefix);
  const tag = `[${safe.label}]`;
  console.info(
    `${tag} === starting (${safe.chainPrefix}:${safe.address}) ===`,
  );

  // 1. Pending transactions (actionable, nonce >= current nonce)
  try {
    const pendingTxs = await fetchPendingSafeTransactions(
      safe.chainPrefix,
      safe.address,
    );

    if (pendingTxs.length > 0) {
      console.info(
        `${tag} Pending: ${pendingTxs.length} actionable transaction(s)`,
      );
      for (const tx of pendingTxs) {
        await simulateIfMissing(
          tag,
          chainId,
          safe.address,
          tx,
          FORCE_RERUN_PENDING,
        );
      }
    } else {
      console.info(`${tag} No pending actionable transactions`);
    }
  } catch (e) {
    console.error(`${tag} Failed to fetch pending transactions: ${e}`);
  }

  // 2. Executed transactions (backfill missing reports)
  if (!BACKFILL) {
    console.info(`${tag} Backfill disabled, skipping executed transactions`);
    return;
  }
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
        `${tag} Executed: ${missing.length} of ${executedTxs.length} missing reports, backfilling...`,
      );
      for (const tx of missing) {
        await simulateIfMissing(tag, chainId, safe.address, tx);
      }
    } else {
      console.info(
        `${tag} Executed: all ${executedTxs.length} transactions have reports`,
      );
    }
  } catch (e) {
    console.error(`${tag} Failed to fetch executed transactions: ${e}`);
  }
}

async function main() {
  const concurrency = Math.max(1, PARALLEL_SAFES);
  console.info(
    `Processing ${TRACKED_SAFES.length} safe(s) with concurrency ${concurrency}`,
  );

  // Worker-pool: each worker pulls the next safe from a shared queue until empty.
  // Keeps the pipeline full (no waiting for the slowest safe in a batch to finish).
  let next = 0;
  const workers = Array.from({ length: concurrency }, async () => {
    while (true) {
      const idx = next++;
      if (idx >= TRACKED_SAFES.length) return;
      await processSafe(TRACKED_SAFES[idx]);
    }
  });
  await Promise.all(workers);
}

main().catch((e) => {
  console.error("Safe cron failed:", e);
  process.exit(1);
});
