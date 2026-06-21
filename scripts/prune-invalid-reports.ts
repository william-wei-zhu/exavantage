/**
 * One-off maintenance: delete saved reports whose query no longer passes the
 * input-validity guard (a personal name, gibberish, or otherwise not a company
 * or sector). These are leftovers from before the guard existed; afterward their
 * /r/[id] share links 404.
 *
 * Re-runs the SAME `routeInput` classification used at generation time, so the
 * accept/reject decision matches the live product exactly (high-precision: only
 * obvious non-companies are removed; plausible/unrecognized or chef-named brands
 * like "Peter Chang" are kept).
 *
 * Dry-run by default (lists what WOULD be deleted). Pass --apply to delete.
 *
 *   node --env-file=.env.local --import tsx scripts/prune-invalid-reports.ts
 *   node --env-file=.env.local --import tsx scripts/prune-invalid-reports.ts --apply
 */
import { routeInput } from "../lib/pipeline";
import { getAllReports, deleteReport } from "../lib/store";
import { isFirestoreConfigured } from "../lib/firestore";

async function main() {
  if (!isFirestoreConfigured()) {
    console.error("Firestore is not configured (set GCP_SERVICE_ACCOUNT_KEY or GCP_PROJECT_ID).");
    process.exit(1);
  }
  const apply = process.argv.includes("--apply");

  const reports = await getAllReports();
  console.log(`Scanning ${reports.length} report(s)${apply ? " (APPLY: will delete)" : " (dry run)"}...`);

  let removed = 0;
  for (const r of reports) {
    const subject = (r.query || r.anchor?.name || "").trim();
    if (!subject) continue;
    let valid = true;
    let reason = "";
    try {
      const route = await routeInput(subject);
      valid = route.valid;
      reason = route.reason ?? "";
    } catch (e) {
      // On any classification error, keep the report (never delete on doubt).
      console.warn(`  ? ${r.id} "${subject}" — check failed, keeping (${(e as Error)?.message})`);
      continue;
    }
    if (!valid) {
      removed++;
      console.log(`  ${apply ? "DELETE" : "would delete"} ${r.id} "${subject}"${reason ? ` — ${reason}` : ""}`);
      if (apply) await deleteReport(r.id);
    }
  }

  console.log(
    apply
      ? `Done. Deleted ${removed} invalid report(s).`
      : `Done. ${removed} report(s) would be deleted. Re-run with --apply to remove them.`,
  );
  process.exit(0);
}

main().catch((e) => {
  console.error("prune-invalid-reports failed:", e);
  process.exit(1);
});
