"use client";

import { useState } from "react";
import { deleteReport } from "@/lib/db";
import type { BiomarkerResult, LabReport } from "@/lib/types";

function formatDate(iso: string): string {
  return new Date(iso + "T00:00:00Z").toLocaleDateString("en-US", { timeZone: "UTC" });
}

export default function ReportList({
  reports,
  results,
  onChange,
}: {
  reports: LabReport[];
  results: BiomarkerResult[];
  onChange: () => void;
}) {
  const [confirming, setConfirming] = useState<string | null>(null);

  if (reports.length === 0) {
    return <p className="text-sm text-neutral-500 dark:text-neutral-400">No reports saved yet.</p>;
  }

  async function remove(id: string) {
    await deleteReport(id);
    setConfirming(null);
    onChange();
  }

  return (
    <ul className="flex flex-col gap-2">
      {[...reports]
        .sort((a, b) => b.collectionDate.localeCompare(a.collectionDate))
        .map((report) => {
          const count = results.filter((r) => r.reportId === report.id).length;
          return (
            <li
              key={report.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-neutral-200 px-3 py-2 dark:border-neutral-800"
            >
              <div className="min-w-0">
                <div className="text-sm font-medium">{formatDate(report.collectionDate)}</div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400">
                  {report.labName ?? "Unknown lab"} · {count} {count === 1 ? "result" : "results"}
                </div>
              </div>
              {confirming === report.id ? (
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => remove(report.id)}
                    className="rounded border border-red-400 px-2 py-1 text-xs font-medium text-red-700 dark:border-red-800 dark:text-red-400"
                  >
                    Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirming(null)}
                    className="rounded border border-neutral-300 px-2 py-1 text-xs dark:border-neutral-700"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirming(report.id)}
                  className="shrink-0 text-xs text-neutral-500 hover:text-red-700 dark:text-neutral-400 dark:hover:text-red-400"
                >
                  Remove
                </button>
              )}
            </li>
          );
        })}
    </ul>
  );
}
