import { randomUUID } from "crypto";
import { db } from "./firestore";
import { normalizeDomain, normalizeName } from "./format";
import type { Report } from "./types";

const COLLECTION = "reports";

/** A persisted report: the Report plus the firm it was prepared for and ids. */
export type StoredReport = Report & {
  id: string;
  firmId: string;
  createdAt: number;
  /** Normalized name keys (raw input + resolved name) for the generation cache. */
  nameKeys?: string[];
  /** Normalized anchor domain for the generation cache. */
  domainKey?: string;
};

/** URL-safe short id derived from a UUID. */
function newId(): string {
  return randomUUID().replace(/-/g, "").slice(0, 12);
}

/**
 * Save a finished report. Returns its id, or null when Firestore isn't
 * configured (the caller then simply doesn't offer a share link).
 */
export async function saveReport(
  report: Report,
  firmId: string,
  rawQuery?: string,
  /** When set (and valid), overwrite this existing report id instead of minting a
   *  new one. Used by "Regenerate" so a shared /r/[id] link keeps working. */
  existingId?: string,
): Promise<string | null> {
  const fs = db();
  if (!fs) return null;
  try {
    const id = existingId && /^[a-z0-9]{8,32}$/i.test(existingId) ? existingId : newId();
    const nameKeys = Array.from(
      new Set(
        [rawQuery, report.anchor?.name, report.query]
          .map((s) => normalizeName(s || ""))
          .filter(Boolean),
      ),
    );
    const domainKey = report.anchor?.domain ? normalizeDomain(report.anchor.domain) : undefined;
    const doc: StoredReport = {
      ...report,
      id,
      firmId,
      createdAt: Date.now(),
      nameKeys,
      ...(domainKey ? { domainKey } : {}),
    };
    await fs.collection(COLLECTION).doc(id).set(doc);
    return id;
  } catch (e) {
    console.error("[store] saveReport failed:", (e as Error)?.message);
    return null;
  }
}

/** Latest doc id in a snapshot (by createdAt), or null if empty. */
function latestId(snap: FirebaseFirestore.QuerySnapshot): string | null {
  let bestId: string | null = null;
  let bestAt = -1;
  snap.forEach((doc) => {
    const at = (doc.get("createdAt") as number) ?? 0;
    if (at > bestAt) {
      bestAt = at;
      bestId = doc.id;
    }
  });
  return bestId;
}

/**
 * Generation cache: find an existing deck for a company so we don't regenerate
 * from scratch. Matches by normalized name first, then by resolved domain.
 * Returns the latest matching report id, or null. Safe no-op without Firestore.
 */
export async function findExistingReport(
  input: string,
  domain?: string,
): Promise<string | null> {
  const fs = db();
  if (!fs) return null;
  try {
    const key = normalizeName(input);
    if (key) {
      const snap = await fs
        .collection(COLLECTION)
        .where("nameKeys", "array-contains", key)
        .limit(12)
        .get();
      const id = latestId(snap);
      if (id) return id;
    }
    if (domain) {
      const dkey = normalizeDomain(domain);
      const snap = await fs.collection(COLLECTION).where("domainKey", "==", dkey).limit(12).get();
      const id = latestId(snap);
      if (id) return id;
    }
    return null;
  } catch (e) {
    console.error("[store] findExistingReport failed:", (e as Error)?.message);
    return null;
  }
}

/** Delete every report in the collection (batched). Returns the count removed.
 *  Used by the one-off `scripts/clear-reports.ts`; safe no-op without Firestore. */
export async function deleteAllReports(): Promise<number> {
  const fs = db();
  if (!fs) return 0;
  let total = 0;
  // Loop in pages so we stay well under Firestore's per-batch limit.
  for (;;) {
    const snap = await fs.collection(COLLECTION).limit(300).get();
    if (snap.empty) break;
    const batch = fs.batch();
    snap.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
    total += snap.size;
  }
  return total;
}

/** Load a saved report by id, or null if missing / Firestore unavailable. */
export async function getReport(id: string): Promise<StoredReport | null> {
  const fs = db();
  if (!fs) return null;
  if (!/^[a-z0-9]{8,32}$/i.test(id)) return null;
  try {
    const snap = await fs.collection(COLLECTION).doc(id).get();
    if (!snap.exists) return null;
    return snap.data() as StoredReport;
  } catch (e) {
    console.error("[store] getReport failed:", (e as Error)?.message);
    return null;
  }
}
