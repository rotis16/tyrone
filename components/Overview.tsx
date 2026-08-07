import Link from "next/link";
import { findBiomarkerContent } from "@/data/biomarkerContent";
import { FIXTURE_REPORTS, FIXTURE_RESULTS, resultsFor } from "@/lib/fixtures";
import { changeSinceLast } from "@/lib/trend";

function Sparkline({ values }: { values: number[] }) {
  if (values.length < 2) {
    return <div className="h-6 w-16 shrink-0" aria-hidden />;
  }
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
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-6 w-16 shrink-0" aria-hidden>
      <polyline points={pts.join(" ")} fill="none" stroke="#2a78d6" strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={pts[pts.length - 1].split(",")[0]} cy={pts[pts.length - 1].split(",")[1]} r={2.5} fill="#2a78d6" />
    </svg>
  );
}

export default function Overview() {
  const keys = Array.from(new Set(FIXTURE_RESULTS.map((r) => r.biomarkerKey).filter(Boolean))) as string[];

  return (
    <div className="space-y-3">
      {keys.map((key) => {
        const results = resultsFor(key).sort((a, b) => {
          const ra = FIXTURE_REPORTS.find((r) => r.id === a.reportId)?.collectionDate ?? "";
          const rb = FIXTURE_REPORTS.find((r) => r.id === b.reportId)?.collectionDate ?? "";
          return ra.localeCompare(rb);
        });
        const latest = results[results.length - 1];
        const content = findBiomarkerContent(key);
        const change = changeSinceLast(
          results.map((r) => {
            const report = FIXTURE_REPORTS.find((rep) => rep.id === r.reportId);
            return { date: report?.collectionDate ?? "", value: r.normalizedValue ?? r.value, unit: r.normalizedUnit ?? r.unit };
          })
        );

        return (
          <Link
            key={key}
            href={`/biomarker/${key}`}
            className="flex items-center justify-between gap-4 rounded-xl border border-neutral-200 dark:border-neutral-800 px-4 py-3 hover:border-neutral-400 dark:hover:border-neutral-600"
          >
            <div className="min-w-0">
              <div className="font-medium truncate">{content?.displayName ?? latest.rawLabel}</div>
              <div className="text-sm text-neutral-500 dark:text-neutral-400">
                {latest.value} {latest.unit}
                {change && (
                  <span>
                    {" · "}
                    {change.direction === "flat" ? "unchanged" : `${change.direction === "up" ? "↑" : "↓"} ${change.delta.toFixed(2)}`}
                  </span>
                )}
              </div>
            </div>
            <Sparkline values={results.map((r) => r.normalizedValue ?? r.value)} />
          </Link>
        );
      })}
    </div>
  );
}
