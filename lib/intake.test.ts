import { describe, expect, it } from "vitest";
import { computeWarnings, normalizeValue, toDraftRow } from "./intake";
import type { ExtractedResult } from "./extractionSchema";

function extracted(overrides: Partial<ExtractedResult> = {}): ExtractedResult {
  return {
    rawLabel: "TSH",
    value: 2.1,
    unit: "µIU/mL",
    referenceLow: 0.4,
    referenceHigh: 4.0,
    flagAsPrinted: null,
    confidence: 0.98,
    ...overrides,
  };
}

describe("toDraftRow", () => {
  it("matches a known label to its canonical key", () => {
    expect(toDraftRow(extracted()).biomarkerKey).toBe("tsh");
  });

  it("keeps an unmatched label verbatim and flags it, rather than dropping the row", () => {
    const row = toDraftRow(extracted({ rawLabel: "Zonulin", value: 42 }));
    expect(row.biomarkerKey).toBeNull();
    expect(row.rawLabel).toBe("Zonulin");
    expect(row.value).toBe(42);
    expect(row.warnings).toContain("unmatched_label");
    expect(row.include).toBe(true);
  });
});

describe("computeWarnings", () => {
  const base = {
    biomarkerKey: "tsh",
    value: 2.1,
    unit: "µIU/mL",
    referenceLow: 0.4,
    referenceHigh: 4.0,
    extractionConfidence: 0.99,
  };

  it("returns no warnings for a clean, confident row", () => {
    expect(computeWarnings(base)).toEqual([]);
  });

  it("flags low extraction confidence", () => {
    expect(computeWarnings({ ...base, extractionConfidence: 0.4 })).toContain("low_confidence");
  });

  it("flags a missing unit", () => {
    expect(computeWarnings({ ...base, unit: null })).toContain("missing_unit");
  });

  it("flags a unit that isn't recognized for that biomarker", () => {
    expect(computeWarnings({ ...base, unit: "mg/dL" })).toContain("ambiguous_unit");
  });

  it("flags a missing reference range", () => {
    expect(computeWarnings({ ...base, referenceLow: null, referenceHigh: null })).toContain(
      "no_reference_range"
    );
  });

  it("does NOT flag a value merely for being outside its clinical reference range", () => {
    // Being outside the lab's range is ordinary and must never be surfaced as
    // a data-entry problem — that would be a judgment this app doesn't make.
    const wayAboveRange = computeWarnings({ ...base, value: 9.5 });
    expect(wayAboveRange).not.toContain("implausible_value");
    expect(wayAboveRange).toEqual([]);
  });

  it("does flag a value far outside any physically plausible bound (slipped decimal)", () => {
    expect(computeWarnings({ ...base, value: 21000 })).toContain("implausible_value");
  });
});

describe("normalizeValue", () => {
  it("converts a recognized conventional unit to the canonical unit", () => {
    const { normalizedValue, normalizedUnit } = normalizeValue("hemoglobin", 13.9, "g/dL");
    expect(normalizedValue).toBeCloseTo(139, 5);
    expect(normalizedUnit).toBe("g/L");
  });

  it("passes a value already in the canonical unit through unchanged", () => {
    const { normalizedValue, normalizedUnit } = normalizeValue("hemoglobin", 139, "g/L");
    expect(normalizedValue).toBe(139);
    expect(normalizedUnit).toBe("g/L");
  });

  it("refuses to convert an unrecognized unit rather than guessing", () => {
    // The spec's rule: never silently convert an ambiguous unit.
    expect(normalizeValue("hemoglobin", 13.9, "mg/dL")).toEqual({
      normalizedValue: null,
      normalizedUnit: null,
    });
  });

  it("refuses to convert when the biomarker is unmatched", () => {
    expect(normalizeValue(null, 5, "g/dL")).toEqual({ normalizedValue: null, normalizedUnit: null });
  });

  it("applies the affine HbA1c conversion, not a bare scale", () => {
    const { normalizedValue } = normalizeValue("hba1c", 7.0, "%");
    expect(normalizedValue).toBeCloseTo(53, 0);
  });
});
