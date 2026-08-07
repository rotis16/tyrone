import { describe, expect, it } from "vitest";
import {
  allNormalizedAliases,
  isKnownUnit,
  matchBiomarkerKey,
  normalizeLabel,
  normalizeUnit,
} from "./aliases";

describe("normalizeLabel", () => {
  it("is case- and punctuation-insensitive", () => {
    expect(normalizeLabel("T4, Free")).toBe(normalizeLabel("t4 free"));
    expect(normalizeLabel("AST (SGOT)")).toBe("ast sgot");
    expect(normalizeLabel("  Hemoglobin  ")).toBe("hemoglobin");
  });
});

describe("matchBiomarkerKey", () => {
  it("matches canonical display names", () => {
    expect(matchBiomarkerKey("Hemoglobin")).toBe("hemoglobin");
  });

  it("matches real-world label variants across labs", () => {
    expect(matchBiomarkerKey("T4, Free")).toBe("free_t4");
    expect(matchBiomarkerKey("FT4")).toBe("free_t4");
    expect(matchBiomarkerKey("Free Thyroxine")).toBe("free_t4");
    expect(matchBiomarkerKey("SGPT")).toBe("alt");
    expect(matchBiomarkerKey("Alk Phos")).toBe("alp");
    expect(matchBiomarkerKey("A1c")).toBe("hba1c");
    expect(matchBiomarkerKey("25(OH)D")).toBe("vitamin_d");
  });

  it("returns null for unrecognized labels rather than guessing", () => {
    expect(matchBiomarkerKey("Zonulin")).toBeNull();
    expect(matchBiomarkerKey("Some Novel Assay")).toBeNull();
    expect(matchBiomarkerKey("")).toBeNull();
  });

  it("does NOT fuzzy-match near-miss labels onto the wrong biomarker", () => {
    // These are the dangerous cases: one character or one word apart from a
    // real alias. Attaching them to the wrong key would chart a value against
    // the wrong history. Null is the correct, safe answer.
    expect(matchBiomarkerKey("Free T5")).toBeNull();
    expect(matchBiomarkerKey("Hemoglobin A1")).toBeNull();
    expect(matchBiomarkerKey("Total Bilirubin Direct")).toBeNull();
  });

  it("never confuses free T3 with free T4", () => {
    expect(matchBiomarkerKey("Free T3")).toBe("free_t3");
    expect(matchBiomarkerKey("Free T4")).toBe("free_t4");
    expect(matchBiomarkerKey("FT3")).toBe("free_t3");
    expect(matchBiomarkerKey("FT4")).toBe("free_t4");
  });
});

describe("alias table integrity", () => {
  it("has no alias claimed by two different biomarkers", () => {
    const seen = new Map<string, string>();
    const collisions: string[] = [];
    for (const { alias, biomarkerKey } of allNormalizedAliases()) {
      const existing = seen.get(alias);
      if (existing && existing !== biomarkerKey) {
        collisions.push(`"${alias}" claimed by both ${existing} and ${biomarkerKey}`);
      }
      seen.set(alias, biomarkerKey);
    }
    expect(collisions).toEqual([]);
  });
});

describe("normalizeUnit", () => {
  it("treats micro-sign variants as equivalent", () => {
    expect(normalizeUnit("µIU/mL")).toBe(normalizeUnit("uIU/mL"));
    expect(normalizeUnit("μg/L")).toBe(normalizeUnit("ug/L"));
  });

  it("treats scientific-notation variants as equivalent", () => {
    expect(normalizeUnit("x10E3/uL")).toBe(normalizeUnit("x10^3/uL"));
  });
});

describe("isKnownUnit", () => {
  it("accepts the conventional and SI units for a biomarker", () => {
    expect(isKnownUnit("hemoglobin", "g/dL")).toBe(true);
    expect(isKnownUnit("hemoglobin", "g/L")).toBe(true);
  });

  it("rejects a unit that belongs to a different biomarker", () => {
    // mg/dL is a real lab unit, but not one hemoglobin is ever reported in —
    // converting it silently would be exactly the failure the spec forbids.
    expect(isKnownUnit("hemoglobin", "mg/dL")).toBe(false);
  });

  it("rejects units for an unknown biomarker key", () => {
    expect(isKnownUnit("not_a_real_key", "g/dL")).toBe(false);
  });
});
