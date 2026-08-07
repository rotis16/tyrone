export type DiscountTier = {
  /** Upper bound of % of Federal Poverty Level for this tier (inclusive). */
  fplMaxPct: number;
  /** Discount off the bill at this tier, 0-100. */
  discountPct: number;
};

/**
 * How confident we are in a hospital's numeric fields:
 * - "primary_source_confirmed": a human (or this tool, in an environment that
 *   can actually fetch it) read the hospital's own published FAP/PDF directly.
 * - "secondary_source_reported": pulled from search-engine-indexed summaries,
 *   aggregator sites, or news coverage that cites the policy, without this
 *   tool being able to open the primary document itself.
 * - "unverified": no usable source found; numeric fields should be null.
 */
export type DataConfidence = "primary_source_confirmed" | "secondary_source_reported" | "unverified";

export type Hospital = {
  id: string;
  name: string;
  aliases: string[];
  system: string;
  city: string;
  county: string;
  state: string;
  isNonprofit: boolean;
  fapUrl: string | null;
  /** % of FPL at/under which care is 100% free. Null if unverified. */
  freeCareThresholdPct: number | null;
  /** Partial-discount tiers above the free-care threshold. Empty if unverified. */
  discountTiers: DiscountTier[];
  /** Days after the bill/service date the FAP application must be filed, if known. */
  applicationWindowDays: number | null;
  /** Whether the policy extends to insured/underinsured patients, not just uninsured. */
  acceptsInsured: boolean | null;
  applicationUrl: string | null;
  financialAssistancePhone: string | null;
  /** Whether the hospital's FAP covers physician bills that arrive separately (ER docs, anesthesia, radiology). */
  coversPhysicianBilling: boolean | null;
  notes: string | null;
  dataConfidence: DataConfidence;
  /** ISO date a human (or a tool with real document access) confirmed this against the primary source. Null if not yet primary-source-confirmed. */
  lastVerified: string | null;
};

export type IncomeRange = {
  id: string;
  label: string;
  /** Inclusive lower bound. */
  min: number;
  /** Inclusive upper bound, or null for "and above." */
  max: number | null;
};

export type InsuranceStatus = "insured" | "uninsured" | "insured_at_time_of_care" | "not_sure";

export type BillAge =
  | "under_30_days"
  | "1_to_3_months"
  | "3_to_8_months"
  | "over_8_months"
  | "in_collections";
