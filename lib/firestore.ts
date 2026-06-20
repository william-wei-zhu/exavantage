import { Firestore } from "@google-cloud/firestore";

// Firestore client singleton. Credentials come from a service-account JSON in
// GCP_SERVICE_ACCOUNT_KEY (set in Vercel + .env.local); falls back to Application
// Default Credentials locally when only GCP_PROJECT_ID is set. Returns null when
// nothing is configured, so the app degrades gracefully (reports just aren't
// shareable) instead of crashing.

let _db: Firestore | null = null;
let _tried = false;

export function db(): Firestore | null {
  if (_tried) return _db;
  _tried = true;
  const projectId = process.env.GCP_PROJECT_ID;
  const rawKey = process.env.GCP_SERVICE_ACCOUNT_KEY;
  try {
    if (rawKey) {
      const creds = JSON.parse(rawKey);
      _db = new Firestore({
        projectId: projectId || creds.project_id,
        credentials: {
          client_email: creds.client_email,
          private_key: creds.private_key,
        },
        ignoreUndefinedProperties: true,
      });
    } else if (projectId) {
      _db = new Firestore({ projectId, ignoreUndefinedProperties: true });
    }
  } catch (e) {
    console.error("[firestore] init failed:", (e as Error)?.message);
    _db = null;
  }
  return _db;
}

export function isFirestoreConfigured(): boolean {
  return Boolean(process.env.GCP_SERVICE_ACCOUNT_KEY || process.env.GCP_PROJECT_ID);
}
