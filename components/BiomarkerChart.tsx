"use client";

import { useId, useMemo } from "react";
import { shouldDrawTrendLine } from "@/lib/trend";
import type { BiomarkerResult, LabReport } from "@/lib/types";

type Point = {
  date: string; // ISO
  value: number;
  unit: string;
  referenceLow: number | null;
  referenceHigh: number | null;
  labName: string | null;
  flag: string | null;
};

const WIDTH = 600;
const HEIGHT = 220;
const PAD = { top: 16, right: 16, bottom: 28, left: 44 };

function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00Z");
  // Explicit locale (not `undefined`) so server and client render identical
  // text — an implicit runtime-default locale is a classic SSR hydration
  // mismatch source, since the server's locale and the browser's don't
  // have to match.
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", timeZone: "UTC" });
}

export default function BiomarkerChart({
  results,
  reports,
  displayUnit,
}: {
  results: BiomarkerResult[];
  reports: LabReport[];
  /** Which unit to plot in — always the normalized unit, so mixed-unit history still lines up correctly. */
  displayUnit: string;
}) {
  const uid = useId();

  const points: Point[] = useMemo(() => {
    return results
      .map((r) => {
        const report = reports.find((rep) => rep.id === r.reportId);
        return {
          date: report?.collectionDate ?? "",
          value: r.normalizedValue ?? r.value,
          unit: r.normalizedUnit ?? r.unit,
          referenceLow: r.referenceLow,
          referenceHigh: r.referenceHigh,
          labName: report?.labName ?? null,
          flag: r.flagAsPrinted,
        };
      })
      .filter((p) => p.date)
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [results, reports]);

  if (points.length === 0) return null;

  if (points.length === 1) {
    const p = points[0];
    return (
      <div className="viz-root text-sm text-[var(--text-secondary)]">
        <p>
          Only one result so far ({formatDate(p.date)}: {p.value} {p.unit}). Not enough history yet
          to show a trend — that takes at least {3} results.
        </p>
      </div>
    );
  }

  const drawLine = shouldDrawTrendLine(points.length);

  const dates = points.map((p) => new Date(p.date + "T00:00:00Z").getTime());
  const minDate = Math.min(...dates);
  const maxDate = Math.max(...dates);
  const dateSpan = maxDate - minDate || 1;

  const allValues = points.flatMap((p) => [p.value, p.referenceLow ?? p.value, p.referenceHigh ?? p.value]);
  const minValue = Math.min(...allValues);
  const maxValue = Math.max(...allValues);
  const valuePad = (maxValue - minValue) * 0.15 || Math.abs(maxValue) * 0.1 || 1;
  const yMin = minValue - valuePad;
  const yMax = maxValue + valuePad;

  const x = (iso: string) => {
    const t = new Date(iso + "T00:00:00Z").getTime();
    return PAD.left + ((t - minDate) / dateSpan) * (WIDTH - PAD.left - PAD.right);
  };
  const y = (v: number) => {
    const innerH = HEIGHT - PAD.top - PAD.bottom;
    return PAD.top + innerH - ((v - yMin) / (yMax - yMin || 1)) * innerH;
  };

  // Segment the reference band by contiguous runs of the same printed range,
  // so a range change between labs renders as a visible seam rather than one
  // continuous band that overstates agreement between labs.
  const bandSegments: { x1: number; x2: number; low: number; high: number }[] = [];
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    if (p.referenceLow === null || p.referenceHigh === null) continue;
    const segX1 = i === 0 ? x(p.date) : (x(points[i - 1].date) + x(p.date)) / 2;
    const segX2 = i === points.length - 1 ? x(p.date) : (x(p.date) + x(points[i + 1].date)) / 2;
    const last = bandSegments[bandSegments.length - 1];
    if (last && last.low === p.referenceLow && last.high === p.referenceHigh) {
      last.x2 = segX2;
    } else {
      bandSegments.push({ x1: segX1, x2: segX2, low: p.referenceLow, high: p.referenceHigh });
    }
  }
  const rangeChanged = bandSegments.length > 1;

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${x(p.date)} ${y(p.value)}`).join(" ");
  const lastPoint = points[points.length - 1];

  return (
    <div className="viz-root">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-labelledby={`${uid}-title`}
        className="w-full h-auto"
      >
        <title id={`${uid}-title`}>
          {`${displayUnit} over time, ${points.length} results from ${formatDate(points[0].date)} to ${formatDate(lastPoint.date)}`}
        </title>

        {/* reference band segments */}
        {bandSegments.map((seg, i) => (
          <rect
            key={i}
            x={seg.x1}
            y={y(seg.high)}
            width={Math.max(0, seg.x2 - seg.x1)}
            height={Math.max(0, y(seg.low) - y(seg.high))}
            fill="var(--band-fill)"
          />
        ))}
        {rangeChanged &&
          bandSegments.slice(1).map((seg, i) => (
            <line
              key={i}
              x1={seg.x1}
              x2={seg.x1}
              y1={PAD.top}
              y2={HEIGHT - PAD.bottom}
              stroke="var(--gridline)"
              strokeDasharray="3 3"
            />
          ))}

        {/* y gridlines (min/max only, kept recessive) */}
        <line x1={PAD.left} x2={WIDTH - PAD.right} y1={y(yMin)} y2={y(yMin)} stroke="var(--gridline)" strokeWidth={1} />
        <line x1={PAD.left} x2={WIDTH - PAD.right} y1={y(yMax)} y2={y(yMax)} stroke="var(--gridline)" strokeWidth={1} />

        {/* baseline */}
        <line
          x1={PAD.left}
          x2={WIDTH - PAD.right}
          y1={HEIGHT - PAD.bottom}
          y2={HEIGHT - PAD.bottom}
          stroke="var(--baseline)"
          strokeWidth={1}
        />

        {drawLine && <path d={linePath} fill="none" stroke="var(--series-1)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />}

        {points.map((p, i) => (
          <g key={i}>
            <circle cx={x(p.date)} cy={y(p.value)} r={5} fill="var(--series-1)" stroke="var(--chart-surface)" strokeWidth={2} />
          </g>
        ))}

        {/* endpoint direct label */}
        <text
          x={x(lastPoint.date)}
          y={y(lastPoint.value) - 12}
          textAnchor="end"
          className="fill-[var(--text-primary)]"
          fontSize={13}
          fontWeight={600}
        >
          {lastPoint.value} {lastPoint.unit}
        </text>

        {/* x-axis endpoint date labels */}
        <text x={PAD.left} y={HEIGHT - 8} fontSize={11} fill="var(--muted)">
          {formatDate(points[0].date)}
        </text>
        <text x={WIDTH - PAD.right} y={HEIGHT - 8} fontSize={11} fill="var(--muted)" textAnchor="end">
          {formatDate(lastPoint.date)}
        </text>
      </svg>

      {!drawLine && (
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Only {points.length} results — shown as separate points, not connected. It takes at least{" "}
          {3} results before this shows a trend line.
        </p>
      )}
      {rangeChanged && (
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          The reference range shown changed between labs — the dashed line marks where. Results from
          different labs aren&apos;t always perfectly comparable.
        </p>
      )}

      <details className="mt-2">
        <summary className="cursor-pointer text-sm text-[var(--text-secondary)]">View as a table</summary>
        <table className="mt-2 w-full text-sm border-collapse">
          <thead>
            <tr className="text-left text-[var(--muted)]">
              <th className="py-1 pr-3">Date</th>
              <th className="py-1 pr-3">Value</th>
              <th className="py-1 pr-3">Lab range</th>
              <th className="py-1 pr-3">Lab</th>
            </tr>
          </thead>
          <tbody>
            {points.map((p, i) => (
              <tr key={i} className="border-t border-[var(--gridline)]">
                <td className="py-1 pr-3">{formatDate(p.date)}</td>
                <td className="py-1 pr-3 tabular-nums">
                  {p.value} {p.unit}
                  {p.flag ? ` (${p.flag})` : ""}
                </td>
                <td className="py-1 pr-3 tabular-nums">
                  {p.referenceLow !== null && p.referenceHigh !== null
                    ? `${p.referenceLow}–${p.referenceHigh} ${p.unit}`
                    : "not printed"}
                </td>
                <td className="py-1 pr-3">{p.labName ?? "unknown"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}
