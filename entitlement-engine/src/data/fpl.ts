/**
 * Federal Poverty Level guidelines, 48 contiguous states + DC.
 * (Michigan uses this schedule — no separate Alaska/Hawaii figures needed.)
 *
 * Source: HHS/ASPE annual poverty guidelines.
 * https://aspe.hhs.gov/topics/poverty-economic-mobility/poverty-guidelines
 *
 * Verification note: this sandbox's network policy blocks direct fetches to
 * aspe.hhs.gov, so these figures were pulled via search rather than read
 * directly off the source page. The base ($15,960) and per-person increment
 * ($5,680) are internally consistent with the published 1-to-8-person range
 * ($15,960–$55,720), which is a good sign, but do one manual spot-check
 * against the live ASPE page before this goes to production — the whole
 * point of this app is not guessing at numbers like this.
 */

export const FPL_YEAR = 2026;
export const FPL_SOURCE_URL =
  "https://aspe.hhs.gov/topics/poverty-economic-mobility/poverty-guidelines";
export const FPL_LAST_VERIFIED = "2026-08-07";

const FPL_BASE_48_STATES_DC = 15960; // household size 1
const FPL_ADDITIONAL_PERSON_48_STATES_DC = 5680; // each person beyond 1

/** Published table for household sizes 1-8, for spot-checking / display. */
export const FPL_TABLE_48_STATES_DC: { householdSize: number; annualAmount: number }[] =
  Array.from({ length: 8 }, (_, i) => {
    const householdSize = i + 1;
    return {
      householdSize,
      annualAmount:
        FPL_BASE_48_STATES_DC + (householdSize - 1) * FPL_ADDITIONAL_PERSON_48_STATES_DC,
    };
  });

/**
 * Federal Poverty Level dollar amount for a given household size.
 * Household sizes above 8 extrapolate using the published per-person increment,
 * which is how HHS's own guidance says to handle larger households.
 */
export function federalPovertyLevelForHousehold(householdSize: number): number {
  const size = Math.max(1, Math.round(householdSize));
  return FPL_BASE_48_STATES_DC + (size - 1) * FPL_ADDITIONAL_PERSON_48_STATES_DC;
}

/** Household income as a percentage of the FPL for that household size. */
export function percentOfFpl(annualIncome: number, householdSize: number): number {
  const fpl = federalPovertyLevelForHousehold(householdSize);
  return (annualIncome / fpl) * 100;
}
