import { describe, expect, it } from "vitest";
import { affine, fromSI, linear, toSI } from "./units";

describe("linear conversion", () => {
  it("converts glucose mg/dL to mmol/L", () => {
    // 100 mg/dL glucose is the textbook ~5.55 mmol/L reference point
    const conv = linear(0.0555);
    expect(toSI(100, conv)).toBeCloseTo(5.55, 2);
  });

  it("round-trips through fromSI", () => {
    const conv = linear(88.4); // creatinine mg/dL -> umol/L
    const si = toSI(1.0, conv);
    expect(fromSI(si, conv)).toBeCloseTo(1.0, 6);
  });

  it("handles a 1:1 equivalence (e.g. WBC x10^3/uL == x10^9/L)", () => {
    const conv = linear(1);
    expect(toSI(6.2, conv)).toBe(6.2);
  });
});

describe("affine conversion", () => {
  it("converts HbA1c NGSP % to IFCC mmol/mol", () => {
    // IFCC (mmol/mol) = NGSP(%) * 10.929 - 23.5
    const conv = affine(10.929, -23.5);
    // an NGSP of 7.0% is the well-known ~53 mmol/mol IFCC equivalent
    expect(toSI(7.0, conv)).toBeCloseTo(53.0, 0);
  });

  it("round-trips through fromSI for an affine conversion", () => {
    const conv = affine(10.929, -23.5);
    const si = toSI(6.5, conv);
    expect(fromSI(si, conv)).toBeCloseTo(6.5, 6);
  });

  it("is NOT equivalent to a pure linear scale (proves the offset matters)", () => {
    const affineConv = affine(10.929, -23.5);
    const linearOnly = linear(10.929);
    expect(toSI(7.0, affineConv)).not.toBeCloseTo(toSI(7.0, linearOnly), 1);
  });
});
