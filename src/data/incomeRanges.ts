import type { IncomeRange } from "./types";

/**
 * Deliberately ranges, not an exact-figure input — reduces friction and
 * the shame/hesitation of typing an exact income into a stranger's website.
 */
export const INCOME_RANGES: IncomeRange[] = [
  { id: "under_15k", label: "Under $15,000", min: 0, max: 14999 },
  { id: "15k_25k", label: "$15,000 – $24,999", min: 15000, max: 24999 },
  { id: "25k_35k", label: "$25,000 – $34,999", min: 25000, max: 34999 },
  { id: "35k_50k", label: "$35,000 – $49,999", min: 35000, max: 49999 },
  { id: "50k_65k", label: "$50,000 – $64,999", min: 50000, max: 64999 },
  { id: "65k_85k", label: "$65,000 – $84,999", min: 65000, max: 84999 },
  { id: "85k_110k", label: "$85,000 – $109,999", min: 85000, max: 109999 },
  { id: "over_110k", label: "$110,000 or more", min: 110000, max: null },
];

export function findIncomeRange(id: string): IncomeRange | undefined {
  return INCOME_RANGES.find((r) => r.id === id);
}
