/**
 * One-off: delete EVERY saved report from Firestore.
 *
 * Destructive and irreversible. All existing /r/[id] share links 404 afterward
 * (until regenerated). Run with the project's credentials loaded, e.g.:
 *
 *   node --env-file=.env.local --import tsx scripts/clear-reports.ts
 */
import { deleteAllReports } from "../lib/store";
import { isFirestoreConfigured } from "../lib/firestore";

async function main() {
  if (!isFirestoreConfigured()) {
    console.error("Firestore is not configured (set GCP_SERVICE_ACCOUNT_KEY or GCP_PROJECT_ID).");
    process.exit(1);
  }
  console.log("Deleting all reports from Firestore...");
  const n = await deleteAllReports();
  console.log(`Done. Deleted ${n} report(s).`);
  process.exit(0);
}

main().catch((e) => {
  console.error("clear-reports failed:", e);
  process.exit(1);
});
