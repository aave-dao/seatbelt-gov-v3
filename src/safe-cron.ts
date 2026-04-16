import "dotenv/config";
import { existsSync, writeFileSync } from "fs";
import { TRACKED_SAFES } from "./safe-config";
import {
  chainPrefixToChainId,
  fetchPendingSafeTransactions,
} from "./safe-api";
import {
  simulateSafeTransaction,
  getSafeReportFileName,
} from "./safe";

async function main() {
  for (const safe of TRACKED_SAFES) {
    const chainId = chainPrefixToChainId(safe.chainPrefix);
    console.info(`\n=== ${safe.label} (${safe.chainPrefix}:${safe.address}) ===`);

    let pendingTxs;
    try {
      pendingTxs = await fetchPendingSafeTransactions(
        safe.chainPrefix,
        safe.address,
      );
    } catch (e) {
      console.error(`Failed to fetch pending transactions: ${e}`);
      continue;
    }

    if (pendingTxs.length === 0) {
      console.info("No pending transactions");
      continue;
    }

    console.info(`Found ${pendingTxs.length} pending transaction(s)`);

    for (const tx of pendingTxs) {
      const reportFile = getSafeReportFileName(chainId, safe.address, tx.nonce);

      if (existsSync(reportFile)) {
        console.info(`Nonce ${tx.nonce}: report already exists, skipping`);
        continue;
      }

      console.info(
        `Nonce ${tx.nonce}: no report found, simulating (safeTxHash: ${tx.safeTxHash})`,
      );

      try {
        const report = await simulateSafeTransaction(chainId, tx);
        writeFileSync(reportFile, report);
        console.info(`Nonce ${tx.nonce}: report written to ${reportFile}`);
      } catch (e) {
        console.error(`Nonce ${tx.nonce}: simulation failed: ${e}`);
      }
    }
  }
}

main().catch((e) => {
  console.error("Safe cron failed:", e);
  process.exit(1);
});
