"use client";

import { findBiomarkerContent } from "@/data/biomarkerContent";
import { WARNING_TEXT, refreshDraftRow, type DraftRow } from "@/lib/intake";

/**
 * The confirmation screen. Nothing reaches the timeline until the user has
 * seen and accepted every row here — this step is not optional, because OCR
 * on a phone photo of a folded printout will misread decimal points.
 */
export default function ConfirmTable({
  rows,
  onChange,
}: {
  rows: DraftRow[];
  onChange: (rows: DraftRow[]) => void;
}) {
  function update(id: string, patch: Partial<DraftRow>) {
    onChange(rows.map((r) => (r.id === id ? refreshDraftRow({ ...r, ...patch }) : r)));
  }

  return (
    <ul className="flex flex-col gap-3">
      {rows.map((row) => {
        const content = row.biomarkerKey ? findBiomarkerContent(row.biomarkerKey) : undefined;
        const flagged = row.warnings.length > 0;
        return (
          <li
            key={row.id}
            className={`rounded-xl border p-3 ${
              flagged
                ? "border-amber-400 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/30"
                : "border-neutral-200 dark:border-neutral-800"
            } ${row.include ? "" : "opacity-50"}`}
          >
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={row.include}
                onChange={(e) => update(row.id, { include: e.target.checked })}
                className="mt-1.5 h-4 w-4 shrink-0"
                aria-label={`Include ${row.rawLabel || "this row"}`}
              />
              <div className="min-w-0 flex-1">
                <label className="block">
                  <span className="sr-only">Test name as printed</span>
                  <input
                    type="text"
                    value={row.rawLabel}
                    onChange={(e) => update(row.id, { rawLabel: e.target.value })}
                    placeholder="Test name"
                    className="w-full bg-transparent font-medium outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
                  />
                </label>
                {content && (
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Matched to {content.displayName}
                  </p>
                )}

                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <label className="text-xs">
                    <span className="text-neutral-500 dark:text-neutral-400">Value</span>
                    <input
                      type="number"
                      step="any"
                      inputMode="decimal"
                      value={Number.isNaN(row.value) ? "" : row.value}
                      onChange={(e) => update(row.id, { value: Number(e.target.value) })}
                      className="mt-0.5 w-full rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-2 py-1.5 text-sm tabular-nums"
                    />
                  </label>
                  <label className="text-xs">
                    <span className="text-neutral-500 dark:text-neutral-400">Unit</span>
                    <input
                      type="text"
                      value={row.unit ?? ""}
                      onChange={(e) => update(row.id, { unit: e.target.value || null })}
                      className="mt-0.5 w-full rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-2 py-1.5 text-sm"
                    />
                  </label>
                  <label className="text-xs">
                    <span className="text-neutral-500 dark:text-neutral-400">Range low</span>
                    <input
                      type="number"
                      step="any"
                      inputMode="decimal"
                      value={row.referenceLow ?? ""}
                      onChange={(e) =>
                        update(row.id, {
                          referenceLow: e.target.value === "" ? null : Number(e.target.value),
                        })
                      }
                      className="mt-0.5 w-full rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-2 py-1.5 text-sm tabular-nums"
                    />
                  </label>
                  <label className="text-xs">
                    <span className="text-neutral-500 dark:text-neutral-400">Range high</span>
                    <input
                      type="number"
                      step="any"
                      inputMode="decimal"
                      value={row.referenceHigh ?? ""}
                      onChange={(e) =>
                        update(row.id, {
                          referenceHigh: e.target.value === "" ? null : Number(e.target.value),
                        })
                      }
                      className="mt-0.5 w-full rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-2 py-1.5 text-sm tabular-nums"
                    />
                  </label>
                </div>

                {flagged && (
                  <ul className="mt-2 flex flex-col gap-1">
                    {row.warnings.map((w) => (
                      <li key={w} className="text-xs text-amber-800 dark:text-amber-400">
                        {WARNING_TEXT[w]}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
