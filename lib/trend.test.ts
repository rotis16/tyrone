import { describe, expect, it } from "vitest";
import { changeSinceLast, positionInRange, shouldDrawTrendLine } from "./trend";

describe("positionInRange", () => {
  it("returns null when the lab printed no range", () => {
    expect(positionInRange(5, null, null)).toBeNull();
  });

  it("labels a value below the range without saying 'abnormal'", () => {
    const r = positionInRange(1, 2, 10);
    expect(r?.status).toBe("below");
    expect(r?.label.toLowerCase()).not.toMatch(/normal|abnormal/);
    expect(r?.fractionWithinRange).toBeNull();
  });

  it("labels a value above the range without saying 'abnormal'", () => {
    const r = positionInRange(12, 2, 10);
    expect(r?.status).toBe("above");
    expect(r?.label.toLowerCase()).not.toMatch(/normal|abnormal/);
  });

  it("computes a clamped fraction for a value within range, and never says 'normal'", () => {
    const r = positionInRange(6, 2, 10);
    expect(r?.status).toBe("within");
    expect(r?.fractionWithinRange).toBeCloseTo(0.5, 5);
    expect(r?.label.toLowerCase()).not.toMatch(/\bnormal\b/);
  });

  it("handles a zero-width range without dividing by zero", () => {
    const r = positionInRange(5, 5, 5);
    expect(r?.fractionWithinRange).toBe(0.5);
  });
});

describe("changeSinceLast", () => {
  it("returns null with fewer than 2 points", () => {
    expect(changeSinceLast([])).toBeNull();
    expect(changeSinceLast([{ date: "2026-01-01", value: 1, unit: "x" }])).toBeNull();
  });

  it("compares the two most recent points regardless of input order", () => {
    const points = [
      { date: "2026-01-01", value: 2.0, unit: "mIU/L" },
      { date: "2025-01-01", value: 1.0, unit: "mIU/L" }, // out of order on purpose
      { date: "2024-01-01", value: 0.5, unit: "mIU/L" },
    ];
    const result = changeSinceLast(points);
    expect(result?.fromDate).toBe("2025-01-01");
    expect(result?.toDate).toBe("2026-01-01");
    expect(result?.direction).toBe("up");
    expect(result?.delta).toBeCloseTo(1.0, 5);
  });

  it("reports 'flat' with zero judgment when unchanged", () => {
    const points = [
      { date: "2025-01-01", value: 2.0, unit: "mIU/L" },
      { date: "2026-01-01", value: 2.0, unit: "mIU/L" },
    ];
    expect(changeSinceLast(points)?.direction).toBe("flat");
  });
});

describe("shouldDrawTrendLine", () => {
  it("refuses to draw a line for 0, 1, or 2 points", () => {
    expect(shouldDrawTrendLine(0)).toBe(false);
    expect(shouldDrawTrendLine(1)).toBe(false);
    expect(shouldDrawTrendLine(2)).toBe(false);
  });

  it("allows a line at 3+ points", () => {
    expect(shouldDrawTrendLine(3)).toBe(true);
    expect(shouldDrawTrendLine(10)).toBe(true);
  });
});
