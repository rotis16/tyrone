import { federalPovertyLevelForHousehold } from "../data/fpl";
import type { DiscountTier, Hospital, IncomeRange } from "../data/types";

export type ScreeningStatus = "likely" | "possible" | "unlikely" | "unknown";

export type ScreeningResult = {
  status: ScreeningStatus;
  /** Discount % this household would get at the relevant case (100 = fully free). Null if no tier applies or data is unknown. */
  discountPct: number | null;
  /** % of FPL computed at the income figure driving the verdict. */
  percentOfFpl: number;
  fplForHousehold: number;
  hospital: Hospital;
};

function tierForPercentOfFpl(hospital: Hospital, pct: number): DiscountTier | null {
  if (hospital.freeCareThresholdPct !== null && pct <= hospital.freeCareThresholdPct) {
    return { fplMaxPct: hospital.freeCareThresholdPct, discountPct: 100 };
  }
  const sorted = [...hospital.discountTiers].sort((a, b) => a.fplMaxPct - b.fplMaxPct);
  for (const tier of sorted) {
    if (pct <= tier.fplMaxPct) return tier;
  }
  return null;
}

function hasVerifiedTierData(hospital: Hospital): boolean {
  return hospital.freeCareThresholdPct !== null || hospital.discountTiers.length > 0;
}

/**
 * Screens one household against one hospital's financial assistance policy.
 *
 * Income is collected as a range, not an exact figure, so this checks both
 * ends: if the household would qualify even at the TOP of their stated
 * income range, that's a confident "likely." If they'd only qualify at the
 * BOTTOM of the range, that's an honest "possible" — still worth applying,
 * since applying is free, but the copy shouldn't overpromise.
 */
export function screenHousehold(input: {
  householdSize: number;
  incomeRange: IncomeRange;
  hospital: Hospital;
}): ScreeningResult {
  const { householdSize, incomeRange, hospital } = input;
  const fpl = federalPovertyLevelForHousehold(householdSize);

  if (!hasVerifiedTierData(hospital)) {
    return {
      status: "unknown",
      discountPct: null,
      percentOfFpl: percentAt(incomeRange.min, fpl),
      fplForHousehold: fpl,
      hospital,
    };
  }

  const pctAtMin = percentAt(incomeRange.min, fpl);
  const pctAtMax = incomeRange.max === null ? Infinity : percentAt(incomeRange.max, fpl);

  const tierAtWorstCase = tierForPercentOfFpl(hospital, pctAtMax);
  if (tierAtWorstCase) {
    return {
      status: "likely",
      discountPct: tierAtWorstCase.discountPct,
      percentOfFpl: pctAtMax,
      fplForHousehold: fpl,
      hospital,
    };
  }

  const tierAtBestCase = tierForPercentOfFpl(hospital, pctAtMin);
  if (tierAtBestCase) {
    return {
      status: "possible",
      discountPct: tierAtBestCase.discountPct,
      percentOfFpl: pctAtMin,
      fplForHousehold: fpl,
      hospital,
    };
  }

  return {
    status: "unlikely",
    discountPct: null,
    percentOfFpl: pctAtMin,
    fplForHousehold: fpl,
    hospital,
  };
}

function percentAt(income: number, fpl: number): number {
  return (income / fpl) * 100;
}
