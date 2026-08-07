import { describe, expect, it } from "vitest";
import { federalPovertyLevelForHousehold, percentOfFpl } from "../data/fpl";
import { INCOME_RANGES } from "../data/incomeRanges";
import type { Hospital } from "../data/types";
import { screenHousehold } from "./screening";

function range(id: string) {
  const r = INCOME_RANGES.find((r) => r.id === id);
  if (!r) throw new Error(`no such range: ${id}`);
  return r;
}

function makeHospital(overrides: Partial<Hospital> = {}): Hospital {
  return {
    id: "test-hospital",
    name: "Test Hospital",
    aliases: [],
    system: "Test System",
    city: "Test City",
    county: "Test County",
    state: "MI",
    isNonprofit: true,
    fapUrl: "https://example.org/fap.pdf",
    freeCareThresholdPct: 200,
    discountTiers: [
      { fplMaxPct: 300, discountPct: 75 },
      { fplMaxPct: 400, discountPct: 50 },
    ],
    applicationWindowDays: 240,
    acceptsInsured: true,
    applicationUrl: "https://example.org/apply",
    financialAssistancePhone: "555-0100",
    coversPhysicianBilling: false,
    notes: null,
    dataConfidence: "primary_source_confirmed",
    lastVerified: "2026-01-01",
    ...overrides,
  };
}

describe("federalPovertyLevelForHousehold", () => {
  it("matches the published 2026 table for household sizes 1-8", () => {
    expect(federalPovertyLevelForHousehold(1)).toBe(15960);
    expect(federalPovertyLevelForHousehold(2)).toBe(21640);
    expect(federalPovertyLevelForHousehold(3)).toBe(27320);
    expect(federalPovertyLevelForHousehold(4)).toBe(33000);
    expect(federalPovertyLevelForHousehold(8)).toBe(55720);
  });

  it("extrapolates beyond 8 using the per-person increment", () => {
    expect(federalPovertyLevelForHousehold(9)).toBe(61400);
  });

  it("clamps household size to a minimum of 1", () => {
    expect(federalPovertyLevelForHousehold(0)).toBe(15960);
    expect(federalPovertyLevelForHousehold(-3)).toBe(15960);
  });
});

describe("percentOfFpl", () => {
  it("computes income as a percentage of the household's FPL", () => {
    // household of 1, FPL = 15960; income of 31920 is exactly 200%
    expect(percentOfFpl(31920, 1)).toBeCloseTo(200, 5);
  });
});

describe("screenHousehold", () => {
  it("returns 'unknown' when the hospital has no verified tier data", () => {
    const hospital = makeHospital({ freeCareThresholdPct: null, discountTiers: [] });
    const result = screenHousehold({
      householdSize: 1,
      incomeRange: range("under_15k"),
      hospital,
    });
    expect(result.status).toBe("unknown");
    expect(result.discountPct).toBeNull();
  });

  it("returns 'likely' with 100% discount when even the top of the income range is under the free-care threshold", () => {
    // household of 4, FPL = 33000, free care threshold 200% = $66,000
    // range 50k-64,999k tops out well under 66,000
    const hospital = makeHospital({ freeCareThresholdPct: 200 });
    const result = screenHousehold({
      householdSize: 4,
      incomeRange: range("50k_65k"),
      hospital,
    });
    expect(result.status).toBe("likely");
    expect(result.discountPct).toBe(100);
  });

  it("returns 'likely' with a partial discount when the top of the range falls in a lower tier", () => {
    // household of 4, FPL = 33000. free care <=200% ($66,000), 75% off <=300% ($99,000)
    // range 85k-109,999 -> pct at max ~333%, exceeds the 75% tier's 300% cap,
    // but falls within the 50%-off tier's 400% cap ($132,000)
    const hospital = makeHospital();
    const result = screenHousehold({
      householdSize: 4,
      incomeRange: range("85k_110k"),
      hospital,
    });
    expect(result.status).toBe("likely");
    expect(result.discountPct).toBe(50);
  });

  it("returns 'possible' when only the bottom of the income range would qualify", () => {
    // household of 1, FPL = 15960. free care <=200% ($31,920), 75% off <=300% ($47,880)
    // range 35k-49,999: min end ($35,000 = ~219%) falls in the 75% tier,
    // max end ($49,999 = ~313%) exceeds even the 400%/50%-off tier's cap? check: 400% = $63,840, so max end still qualifies at 50%.
    // Use a narrower hospital to force a genuine straddle instead.
    const hospital = makeHospital({
      freeCareThresholdPct: null,
      discountTiers: [{ fplMaxPct: 220, discountPct: 60 }],
    });
    const result = screenHousehold({
      householdSize: 1,
      incomeRange: range("35k_50k"), // 35000 = 219% (qualifies), 49999 = 313% (does not)
      hospital,
    });
    expect(result.status).toBe("possible");
    expect(result.discountPct).toBe(60);
  });

  it("returns 'unlikely' when even the bottom of the income range exceeds every tier", () => {
    const hospital = makeHospital({
      freeCareThresholdPct: 150,
      discountTiers: [{ fplMaxPct: 200, discountPct: 50 }],
    });
    const result = screenHousehold({
      householdSize: 1,
      incomeRange: range("over_110k"),
      hospital,
    });
    expect(result.status).toBe("unlikely");
    expect(result.discountPct).toBeNull();
  });

  it("treats an open-ended top range (max: null) as exceeding any finite tier", () => {
    const hospital = makeHospital({
      freeCareThresholdPct: 600,
      discountTiers: [],
    });
    const result = screenHousehold({
      householdSize: 1,
      incomeRange: range("over_110k"),
      hospital,
    });
    // 110,000 / 15,960 = ~689%, exceeds even a generous 600% free-care threshold
    expect(result.status).toBe("unlikely");
  });

  it("is a pure function - same input always produces the same output", () => {
    const hospital = makeHospital();
    const input = { householdSize: 3, incomeRange: range("25k_35k"), hospital };
    const a = screenHousehold(input);
    const b = screenHousehold(input);
    expect(a).toEqual(b);
  });
});
