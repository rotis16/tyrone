"use client";

import { useCallback, useEffect, useState } from "react";
import { isStorageEphemeral, listReports, listResults } from "./db";
import type { BiomarkerResult, LabReport } from "./types";

export type LabData = {
  reports: LabReport[];
  results: BiomarkerResult[];
  loading: boolean;
  error: string | null;
  /** True when this browser blocked persistent storage — data lasts only for this session. */
  ephemeral: boolean;
  reload: () => void;
};

/**
 * Reads everything from IndexedDB. Loading state matters here — the first
 * paint happens before the database is open, and rendering "no results yet"
 * during that window would be wrong (and alarming to someone who has data).
 */
export function useLabData(): LabData {
  const [reports, setReports] = useState<LabReport[]>([]);
  const [results, setResults] = useState<BiomarkerResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [ephemeral, setEphemeral] = useState(false);
  const [nonce, setNonce] = useState(0);
  // Loading is derived rather than set synchronously in the effect: the
  // request generation we've finished loading vs. the one currently wanted.
  const [loadedNonce, setLoadedNonce] = useState(-1);

  const reload = useCallback(() => setNonce((n) => n + 1), []);

  useEffect(() => {
    let cancelled = false;
    Promise.all([listReports(), listResults()])
      .then(([r, b]) => {
        if (cancelled) return;
        setReports(r);
        setResults(b);
        setError(null);
        setEphemeral(isStorageEphemeral());
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(
          err instanceof Error && err.name === "SecurityError"
            ? "Your browser is blocking local storage, so results can't be saved on this device."
            : "Couldn't read your saved results on this device."
        );
      })
      .finally(() => {
        if (!cancelled) setLoadedNonce(nonce);
      });
    return () => {
      cancelled = true;
    };
  }, [nonce]);

  return { reports, results, loading: loadedNonce !== nonce, error, ephemeral, reload };
}

/** Results for one biomarker, oldest first, paired with the report they came from. */
export function timelineFor(
  biomarkerKey: string,
  reports: LabReport[],
  results: BiomarkerResult[]
): { result: BiomarkerResult; report: LabReport }[] {
  const byId = new Map(reports.map((r) => [r.id, r]));
  return results
    .filter((r) => r.biomarkerKey === biomarkerKey)
    .map((result) => ({ result, report: byId.get(result.reportId) }))
    .filter((pair): pair is { result: BiomarkerResult; report: LabReport } => Boolean(pair.report))
    .sort((a, b) => a.report.collectionDate.localeCompare(b.report.collectionDate));
}

/** Distinct biomarker keys present in stored data, plus unmatched raw labels. */
export function trackedBiomarkers(results: BiomarkerResult[]): string[] {
  const keys = new Set<string>();
  for (const r of results) {
    if (r.biomarkerKey) keys.add(r.biomarkerKey);
  }
  return Array.from(keys);
}

export function unmatchedLabels(results: BiomarkerResult[]): string[] {
  const labels = new Set<string>();
  for (const r of results) {
    if (!r.biomarkerKey) labels.add(r.rawLabel);
  }
  return Array.from(labels);
}
