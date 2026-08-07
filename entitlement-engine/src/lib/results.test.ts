import { describe, expect, it } from "vitest";
import type { Answers } from "../data/answers";
import { EMPTY_ANSWERS } from "../data/answers";
import type { Hospital } from "../data/types";
import { buildActionPlan } from "./results";

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
    discountTiers: [{ fplMaxPct: 400, discountPct: 50 }],
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

function answers(overrides: Partial<Answers>): Answers {
  return { ...EMPTY_ANSWERS, ...overrides };
}

describe("buildActionPlan", () => {
  it("throws if income range or household size is missing", () => {
    const hospital = makeHospital();
    expect(() => buildActionPlan(answers({ householdSize: 2 }), hospital)).toThrow();
  });

  it("leads with a free-care verdict and a written-request script when the household clearly qualifies", () => {
    const hospital = makeHospital();
    const plan = buildActionPlan(
      answers({ householdSize: 1, incomeRangeId: "under_15k", insuranceStatus: "uninsured" }),
      hospital
    );
    expect(plan[0].id).toBe("verdict");
    expect(plan[0].verdict).toMatch(/100% free care/i);
    expect(plan[0].script?.channel).toBe("email");
  });

  it("leads with a phone-script 'unknown' verdict when the hospital has no verified tier data", () => {
    const hospital = makeHospital({ freeCareThresholdPct: null, discountTiers: [] });
    const plan = buildActionPlan(
      answers({ householdSize: 2, incomeRangeId: "under_15k" }),
      hospital
    );
    expect(plan[0].verdict).toMatch(/don't have .* confirmed yet/i);
    expect(plan[0].script?.channel).toBe("phone");
  });

  it("never dead-ends: adds FQHC/payment-plan/self-pay cards when the household likely doesn't qualify", () => {
    const hospital = makeHospital({ freeCareThresholdPct: 100, discountTiers: [] });
    const plan = buildActionPlan(
      answers({ householdSize: 1, incomeRangeId: "over_110k" }),
      hospital
    );
    expect(plan[0].verdict).toMatch(/likely don't qualify/i);
    const ids = plan.map((c) => c.id);
    expect(ids).toContain("fqhc");
    expect(ids).toContain("payment-plan");
    expect(ids).toContain("self-pay-discount");
  });

  it("always includes the itemized-bill and don't-pay-yet cards regardless of outcome", () => {
    const hospital = makeHospital();
    const plan = buildActionPlan(
      answers({ householdSize: 1, incomeRangeId: "under_15k" }),
      hospital
    );
    const ids = plan.map((c) => c.id);
    expect(ids).toContain("itemized-bill");
    expect(ids).toContain("dont-pay-yet");
  });

  it("adds the Medicare-rate benchmark card only for uninsured / insured-at-time-of-care", () => {
    const hospital = makeHospital();
    const insuredPlan = buildActionPlan(
      answers({ householdSize: 1, incomeRangeId: "under_15k", insuranceStatus: "insured" }),
      hospital
    );
    const uninsuredPlan = buildActionPlan(
      answers({ householdSize: 1, incomeRangeId: "under_15k", insuranceStatus: "uninsured" }),
      hospital
    );
    expect(insuredPlan.map((c) => c.id)).not.toContain("medicare-benchmark");
    expect(uninsuredPlan.map((c) => c.id)).toContain("medicare-benchmark");
  });

  it("adds the in-collections note only when the bill is in collections", () => {
    const hospital = makeHospital();
    const plan = buildActionPlan(
      answers({ householdSize: 1, incomeRangeId: "under_15k", billAge: "in_collections" }),
      hospital
    );
    expect(plan.map((c) => c.id)).toContain("in-collections-note");
  });

  it("flags hospitals whose data isn't primary-source-confirmed directly in the verdict text", () => {
    const hospital = makeHospital({ dataConfidence: "secondary_source_reported" });
    const plan = buildActionPlan(
      answers({ householdSize: 1, incomeRangeId: "under_15k" }),
      hospital
    );
    expect(plan[0].verdict).toMatch(/haven't independently confirmed/i);
  });
});
