import type { BiomarkerResult, LabReport } from "./types";

/**
 * Local-first storage. Everything lives in the browser's IndexedDB — there is
 * no server database, no account, and no sync. This is the architectural
 * expression of the privacy requirement: health data cannot leak from a
 * server that was never given it.
 *
 * Trade-off, stated plainly: no cross-device sync, and clearing browser
 * storage deletes the data. The export in settings is the user's backup.
 */

const DB_NAME = "lab-intelligence";
const DB_VERSION = 1;

export const STORE_REPORTS = "reports";
export const STORE_RESULTS = "results";
export const STORE_FILES = "files";

export type StoredFile = {
  reportId: string;
  filename: string;
  mediaType: string;
  /** Base64, without the data: prefix. Only present if the user opted to retain the source file. */
  data: string;
};

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof indexedDB !== "undefined";
}

let dbPromise: Promise<IDBDatabase> | null = null;

function openDB(): Promise<IDBDatabase> {
  if (!isBrowser()) {
    return Promise.reject(new Error("IndexedDB is unavailable outside the browser"));
  }
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_REPORTS)) {
        const reports = db.createObjectStore(STORE_REPORTS, { keyPath: "id" });
        reports.createIndex("collectionDate", "collectionDate");
      }
      if (!db.objectStoreNames.contains(STORE_RESULTS)) {
        const results = db.createObjectStore(STORE_RESULTS, { keyPath: "id" });
        results.createIndex("reportId", "reportId");
        results.createIndex("biomarkerKey", "biomarkerKey");
      }
      if (!db.objectStoreNames.contains(STORE_FILES)) {
        db.createObjectStore(STORE_FILES, { keyPath: "reportId" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  return dbPromise;
}

function tx<T>(
  storeNames: string[],
  mode: IDBTransactionMode,
  fn: (stores: IDBObjectStore[]) => IDBRequest<T> | void
): Promise<T | void> {
  return openDB().then(
    (db) =>
      new Promise<T | void>((resolve, reject) => {
        const transaction = db.transaction(storeNames, mode);
        const stores = storeNames.map((n) => transaction.objectStore(n));
        let request: IDBRequest<T> | void;
        try {
          request = fn(stores);
        } catch (err) {
          reject(err);
          return;
        }
        transaction.oncomplete = () => resolve(request ? request.result : undefined);
        transaction.onerror = () => reject(transaction.error);
        transaction.onabort = () => reject(transaction.error);
      })
  );
}

function getAll<T>(storeName: string): Promise<T[]> {
  return openDB().then(
    (db) =>
      new Promise<T[]>((resolve, reject) => {
        const request = db.transaction(storeName, "readonly").objectStore(storeName).getAll();
        request.onsuccess = () => resolve(request.result as T[]);
        request.onerror = () => reject(request.error);
      })
  );
}

// ---- Reports ----

export async function listReports(): Promise<LabReport[]> {
  const reports = await getAll<LabReport>(STORE_REPORTS);
  return reports.sort((a, b) => a.collectionDate.localeCompare(b.collectionDate));
}

export async function saveReport(report: LabReport, results: BiomarkerResult[]): Promise<void> {
  await tx([STORE_REPORTS, STORE_RESULTS], "readwrite", ([reports, resultsStore]) => {
    reports.put(report);
    for (const r of results) resultsStore.put(r);
  });
}

export async function deleteReport(reportId: string): Promise<void> {
  const all = await listResults();
  await tx([STORE_REPORTS, STORE_RESULTS, STORE_FILES], "readwrite", ([reports, results, files]) => {
    reports.delete(reportId);
    files.delete(reportId);
    for (const r of all) {
      if (r.reportId === reportId) results.delete(r.id);
    }
  });
}

// ---- Results ----

export async function listResults(): Promise<BiomarkerResult[]> {
  return getAll<BiomarkerResult>(STORE_RESULTS);
}

// ---- Source files (opt-in retention) ----

export async function saveSourceFile(file: StoredFile): Promise<void> {
  await tx([STORE_FILES], "readwrite", ([files]) => {
    files.put(file);
  });
}

export async function listSourceFiles(): Promise<StoredFile[]> {
  return getAll<StoredFile>(STORE_FILES);
}

// ---- Whole-database operations (privacy surface) ----

export type ExportBundle = {
  exportedAt: string;
  schemaVersion: number;
  reports: LabReport[];
  results: BiomarkerResult[];
  /** Filenames only — retained source file bytes are deliberately not included in the JSON export. */
  retainedSourceFiles: { reportId: string; filename: string }[];
};

export async function exportAll(): Promise<ExportBundle> {
  const [reports, results, files] = await Promise.all([listReports(), listResults(), listSourceFiles()]);
  return {
    exportedAt: new Date().toISOString(),
    schemaVersion: DB_VERSION,
    reports,
    results,
    retainedSourceFiles: files.map((f) => ({ reportId: f.reportId, filename: f.filename })),
  };
}

/**
 * Deletes every stored record and file. "One-tap full account and data
 * deletion that actually deletes" — this clears the object stores rather
 * than marking rows inactive.
 */
export async function deleteEverything(): Promise<void> {
  await tx([STORE_REPORTS, STORE_RESULTS, STORE_FILES], "readwrite", ([reports, results, files]) => {
    reports.clear();
    results.clear();
    files.clear();
  });
}

export function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `id_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}
