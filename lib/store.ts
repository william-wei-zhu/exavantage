import { randomUUID } from "crypto";
import { db } from "./firestore";
import { normalizeDomain, normalizeName } from "./util";
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
): Promise<string | null> {
  const fs = db();
  if (!fs) return null;
  try {
    const id = newId();
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
