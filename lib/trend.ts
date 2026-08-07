/**
 * Pure functions for describing a biomarker's position and change over time.
 * Deliberately neutral language throughout: no "normal"/"abnormal" verdicts,
 * no "good"/"bad" framing on direction of change — a rising or falling value
 * isn't inherently either, and assigning that meaning is a clinical judgment
 * this app doesn't make.
 */

export type RangePosition = {
  status: "below" | "within" | "above";
  label: string; // "within the range this lab used", etc. — never "normal"/"abnormal"
  /** 0-1 position within [low, high], clamped; null if outside that band. */
  fractionWithinRange: number | null;
};

export function positionInRange(
  value: number,
  referenceLow: number | null,
  referenceHigh: number | null
): RangePosition | null {
  if (referenceLow === null || referenceHigh === null) return null;

  if (value < referenceLow) {
    return { status: "below", label: "below the range this lab used", fractionWithinRange: null };
  }
  if (value > referenceHigh) {
    return { status: "above", label: "above the range this lab used", fractionWithinRange: null };
  }
  const span = referenceHigh - referenceLow;
  const fraction = span === 0 ? 0.5 : (value - referenceLow) / span;
  return {
    status: "within",
    label: "within the range this lab used",
    fractionWithinRange: Math.min(1, Math.max(0, fraction)),
  };
}

export type TimePoint = { date: string; value: number; unit: string };

export type ChangeSinceLast = {
  direction: "up" | "down" | "flat";
  delta: number;
  unit: string;
  fromDate: string;
  toDate: string;
};

/** Compares the two most recent points. Purely descriptive — no judgment on whether the direction is good or bad. */
export function changeSinceLast(pointsChronological: TimePoint[]): ChangeSinceLast | null {
  if (pointsChronological.length < 2) return null;
  const sorted = [...pointsChronological].sort((a, b) => a.date.localeCompare(b.date));
  const prev = sorted[sorted.length - 2];
  const latest = sorted[sorted.length - 1];
  const delta = latest.value - prev.value;
  return {
    direction: delta > 0 ? "up" : delta < 0 ? "down" : "flat",
    delta: Math.abs(delta),
    unit: latest.unit,
    fromDate: prev.date,
    toDate: latest.date,
  };
}

/**
 * "Two data points is not a trend. Do not draw one." A connecting line
 * implies a continuous trajectory; with fewer than 3 real results, that's
 * not honest. Below the threshold, points should still be plotted, just
 * not connected.
 */
export const MIN_POINTS_FOR_TREND_LINE = 3;

export function shouldDrawTrendLine(pointCount: number): boolean {
  return pointCount >= MIN_POINTS_FOR_TREND_LINE;
}
