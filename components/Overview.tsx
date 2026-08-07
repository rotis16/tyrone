"use client";

import Link from "next/link";
import { findBiomarkerContent } from "@/data/biomarkerContent";
import { timelineFor, trackedBiomarkers, unmatchedLabels, useLabData } from "@/lib/store";
import { changeSinceLast } from "@/lib/trend";

function Sparkline({ values }: { values: number[] }) {
  if (values.length < 2) return <div className="h-6 w-16 shrink-0" aria-hidden />;
  const w = 64;
  const h = 24;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * (w - 4) + 2;
    const y = h - 2 - ((v - min) / span) * (h - 4);
    return `${x},${y}`;
  });
  const [lastX, lastY] = pts[pts.length - 1].split(",");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-6 w-16 shrink-0" aria-hidden>
      <polyline
        points={pts.join(" ")}
        fill="none"
        stroke="#2a78d6"
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle cx={lastX} cy={lastY} r={2.5} fill="#2a78d6" />
    </svg>
  );
}

export default function Overview() {
  const { reports, results, loading, error } = useLabData();

  if (loading) {
    return <p className="text-sm text-neutral-500 dark:text-neutral-400">Loading your results…</p>;
  }

  if (error) {
    return (
      <p className="rounded-lg border border-amber-400 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-300">
        {error}
      </p>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-neutral-300 p-8 text-center dark:border-neutral-700">
        <p className="font-medium">No lab reports yet</p>
        <p className="mx-auto mt-1 max-w-sm text-sm text-neutral-600 dark:text-neutral-400">
          Add your first report and you&apos;ll see each biomarker explained in plain language. Add a
          second and you&apos;ll start seeing how your numbers move over time.
        </p>
        <Link
          href="/add"
          className="mt-4 inline-block rounded-xl bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700"
        >
          Add a lab report
        </Link>
      </div>
    );
  }

  const keys = trackedBiomarkers(results).sort((a, b) => {
    const an = findBiomarkerContent(a)?.displayName ?? a;
    const bn = findBiomarkerContent(b)?.displayName ?? b;
    return an.localeCompare(bn);
  });
  const unexplained = unmatchedLabels(results);

  return (
    <div className="flex flex-col gap-3">
      {keys.map((key) => {
        const timeline = timelineFor(key, reports, results);
        const latest = timeline[timeline.length - 1];
        if (!latest) return null;
        const content = findBiomarkerContent(key);
        const change = changeSinceLast(
          timeline.map(({ result, report }) => ({
            date: report.collectionDate,
            value: result.normalizedValue ?? result.value,
            unit: result.normalizedUnit ?? result.unit,
          }))
        );

        return (
          <Link
            key={key}
            href={`/biomarker/${key}`}
            className="flex items-center justify-between gap-4 rounded-xl border border-neutral-200 px-4 py-3 hover:border-neutral-400 dark:border-neutral-800 dark:hover:border-neutral-600"
          >
            <div className="min-w-0">
              <div className="truncate font-medium">{content?.displayName ?? latest.result.rawLabel}</div>
              <div className="text-sm text-neutral-500 dark:text-neutral-400">
                <span className="tabular-nums">
                  {latest.result.value} {latest.result.unit}
                </span>
                {change && (
                  <span>
                    {" · "}
                    {change.direction === "flat"
                      ? "unchanged"
                      : `${change.direction === "up" ? "↑" : "↓"} ${change.delta.toFixed(2)}`}
                  </span>
                )}
                {timeline.length === 1 && " · 1 result"}
              </div>
            </div>
            <Sparkline values={timeline.map(({ result }) => result.normalizedValue ?? result.value)} />
          </Link>
        );
      })}

      {unexplained.length > 0 && (
        <div className="mt-2 rounded-xl border border-neutral-200 p-4 text-sm dark:border-neutral-800">
          <p className="font-medium">Saved, but not explained yet</p>
          <p className="mt-1 text-neutral-600 dark:text-neutral-400">
            These tests are stored and will be charted, but this app doesn&apos;t have a plain-language
            explanation for them yet: {unexplained.join(", ")}.
          </p>
        </div>
      )}
    </div>
  );
}
