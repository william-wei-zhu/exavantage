import { randomUUID } from "crypto";
import { db } from "./firestore";
import type { Report } from "./types";

const COLLECTION = "reports";

/** A persisted report: the Report plus the firm it was prepared for and ids. */
export type StoredReport = Report & {
  id: string;
  firmId: string;
  createdAt: number;
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
): Promise<string | null> {
  const fs = db();
  if (!fs) return null;
  try {
    const id = newId();
    const doc: StoredReport = {
      ...report,
      id,
      firmId,
      createdAt: Date.now(),
    };
    await fs.collection(COLLECTION).doc(id).set(doc);
    return id;
  } catch (e) {
    console.error("[store] saveReport failed:", (e as Error)?.message);
    return null;
  }
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
