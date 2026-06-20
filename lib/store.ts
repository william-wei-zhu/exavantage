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

/** A lightweight listing for the homepage "Recent decks" gallery. */
export type DeckListing = {
  id: string;
  name: string;
  domain?: string;
  marketStat?: string;
  createdAt: number;
};

/**
 * The most recent saved decks, deduped to one per company (latest wins), newest
 * first. Powers the homepage gallery so visitors can browse real generated decks
 * without waiting. Returns [] when Firestore isn't configured.
 */
export async function listRecentReports(limit = 9): Promise<DeckListing[]> {
  const fs = db();
  if (!fs) return [];
  try {
    const snap = await fs
      .collection(COLLECTION)
      .orderBy("createdAt", "desc")
      .limit(48)
      .select("query", "anchor", "marketContext", "createdAt")
      .get();
    const seen = new Set<string>();
    const out: DeckListing[] = [];
    for (const doc of snap.docs) {
      const d = doc.data() as Partial<StoredReport>;
      const name = (d.anchor?.name || d.query || "").trim();
      if (!name) continue;
      const key = name.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({
        id: doc.id,
        name,
        domain: d.anchor?.domain,
        marketStat: d.marketContext?.stat,
        createdAt: d.createdAt ?? 0,
      });
      if (out.length >= limit) break;
    }
    return out;
  } catch (e) {
    console.error("[store] listRecentReports failed:", (e as Error)?.message);
    return [];
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
