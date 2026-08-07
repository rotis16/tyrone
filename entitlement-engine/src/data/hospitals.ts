import type { Hospital } from "./types";

/**
 * Michigan hospital seed data — first 5 of the planned 20 largest systems.
 *
 * IMPORTANT — read before trusting or shipping this file:
 * This sandbox's network policy blocks direct fetches to external sites
 * (confirmed: aspe.hhs.gov, hospital .org domains, even Wikipedia all
 * returned 403 at the proxy level). Every number below was pulled through
 * WebSearch's synthesized summaries of secondary sources (aggregator sites,
 * news coverage, and search-engine indexing of the hospitals' own published
 * policies) — not read directly off the primary FAP PDF by this tool.
 *
 * That's exactly the distinction `dataConfidence` exists to capture:
 * "secondary_source_reported" here means "real, sourced, multi-corroborated,
 * NOT invented" — but it is one step short of what this app's own rules
 * demand before calling it verified. `lastVerified` is deliberately left
 * null for all of these until a human (or a tool with real fetch access)
 * confirms each figure against the hospital's actual published PDF. Do not
 * flip these to primary_source_confirmed without doing that.
 */
export const HOSPITALS: Hospital[] = [
  {
    id: "corewell-health",
    name: "Corewell Health",
    aliases: ["Beaumont", "Spectrum Health", "Corewell"],
    system: "Corewell Health",
    city: "Multiple (Southeast & West Michigan)",
    county: "Multiple",
    state: "MI",
    isNonprofit: true,
    fapUrl: "https://corewellhealth.org/billing/financial-assistance",
    freeCareThresholdPct: 250,
    discountTiers: [{ fplMaxPct: 400, discountPct: 50 }],
    applicationWindowDays: null,
    acceptsInsured: null,
    applicationUrl: "https://corewellhealth.org/billing/financial-assistance",
    financialAssistancePhone: "877-687-7309",
    coversPhysicianBilling: null,
    notes:
      "Secondary sources report free care at or below 250% FPL and discounted care to 400% FPL. Michigan's largest health system (Beaumont + Spectrum Health merger) — exact discount schedule between 250-400% not confirmed from a primary source in this pass.",
    dataConfidence: "secondary_source_reported",
    lastVerified: null,
  },
  {
    id: "um-health",
    name: "University of Michigan Health (Michigan Medicine)",
    aliases: ["Michigan Medicine", "U-M Health", "UMHS"],
    system: "University of Michigan Health",
    city: "Ann Arbor",
    county: "Washtenaw",
    state: "MI",
    isNonprofit: true,
    fapUrl: "https://www.uofmhealth.org/patients-visitors/billing-insurance/financial-assistance",
    freeCareThresholdPct: 200,
    discountTiers: [{ fplMaxPct: 400, discountPct: 50 }],
    applicationWindowDays: null,
    acceptsInsured: null,
    applicationUrl: "https://www.uofmhealth.org/patients-visitors/billing-insurance/financial-assistance",
    financialAssistancePhone: null,
    coversPhysicianBilling: null,
    notes:
      "Program is called MSupport. Sources disagreed on one detail: one summary states free care <=200% FPL with sliding-scale discounts 201-400%; another states an overall eligibility ceiling of 300% FPL plus a Michigan-residency requirement. Used the more granular 200%/400% figures here, but this discrepancy specifically needs primary-source resolution before this record is trusted.",
    dataConfidence: "secondary_source_reported",
    lastVerified: null,
  },
  {
    id: "henry-ford-health",
    name: "Henry Ford Health",
    aliases: ["Henry Ford Hospital", "HFH"],
    system: "Henry Ford Health",
    city: "Detroit",
    county: "Wayne",
    state: "MI",
    isNonprofit: true,
    fapUrl: "https://www.henryford.com/visitors/billing/financial-assistance",
    freeCareThresholdPct: 250,
    discountTiers: [{ fplMaxPct: 400, discountPct: 50 }],
    applicationWindowDays: null,
    acceptsInsured: null,
    applicationUrl: "https://www.henryford.com/visitors/billing/financial-assistance",
    financialAssistancePhone: null,
    coversPhysicianBilling: null,
    notes:
      "Free care <=250% FPL, partial discount 251-400% FPL. Sources also mention a separate 'Eligibility Method 2 (Catastrophic)' path that caps qualifying medical debt at 30% of household income regardless of the FPL tiers — not modeled in discountTiers yet, worth adding once primary-source confirmed. Eligibility tied to residency in Wayne, Macomb, Oakland, St. Clair, or Detroit specifically per one source.",
    dataConfidence: "secondary_source_reported",
    lastVerified: null,
  },
  {
    id: "trinity-health-michigan",
    name: "Trinity Health Michigan (St. Joseph Mercy)",
    aliases: ["St. Joseph Mercy", "Trinity Health Ann Arbor", "SJMHS"],
    system: "Trinity Health Michigan",
    city: "Ann Arbor",
    county: "Washtenaw",
    state: "MI",
    isNonprofit: true,
    fapUrl: "https://www.trinityhealthmichigan.org/tools-and-resources/billing-and-insurance/financial-assistance",
    freeCareThresholdPct: 200,
    discountTiers: [{ fplMaxPct: 400, discountPct: 50 }],
    applicationWindowDays: null,
    acceptsInsured: null,
    applicationUrl: "https://www.trinityhealthmichigan.org/tools-and-resources/billing-and-insurance/financial-assistance",
    financialAssistancePhone: "734-712-3456",
    coversPhysicianBilling: null,
    notes:
      "Free care <=200% FPL, partial discount 201-400% FPL, per secondary sources. Applies to medically necessary inpatient, emergency, and outpatient services within the service area.",
    dataConfidence: "secondary_source_reported",
    lastVerified: null,
  },
  {
    id: "mclaren-health-care",
    name: "McLaren Health Care",
    aliases: ["McLaren"],
    system: "McLaren Health Care",
    city: "Multiple (Michigan)",
    county: "Multiple",
    state: "MI",
    isNonprofit: true,
    fapUrl: "https://www.mclaren.org/main/financial-services",
    freeCareThresholdPct: 204,
    discountTiers: [{ fplMaxPct: 322, discountPct: 50 }],
    applicationWindowDays: null,
    acceptsInsured: null,
    applicationUrl: "https://www.mclaren.org/main/financial-services",
    financialAssistancePhone: null,
    coversPhysicianBilling: null,
    notes:
      "One secondary source describes these as system-wide 2025 averages ('households under 204% FPL... families under 322%'), which suggests McLaren's individual hospitals may each publish their own specific policy rather than one uniform figure — this record should be split per-facility once verified rather than treated as one McLaren-wide number. Also worth surfacing regardless of this hospital's own tiers: Michigan's Public Act 107 caps what any hospital can charge an uninsured patient at or below 250% FPL to no more than 115% of the Medicare rate for that service — a real, state-law backstop independent of a given hospital's own FAP.",
    dataConfidence: "secondary_source_reported",
    lastVerified: null,
  },
];

export function findHospital(id: string): Hospital | undefined {
  return HOSPITALS.find((h) => h.id === id);
}

export function searchHospitals(query: string): Hospital[] {
  const q = query.trim().toLowerCase();
  if (!q) return HOSPITALS;
  return HOSPITALS.filter(
    (h) =>
      h.name.toLowerCase().includes(q) ||
      h.system.toLowerCase().includes(q) ||
      h.aliases.some((a) => a.toLowerCase().includes(q))
  );
}

/**
 * Michigan-specific consumer protection independent of any single hospital's
 * own policy: MCL 400.105d requires a hospital that participates in the
 * Medicaid program to accept 115% of the Medicare rate as payment in full
 * from an uninsured patient at or below 250% FPL. Note this is keyed to
 * Medicaid participation, not nonprofit tax status — unlike the federal
 * 501(r) financial-assistance-policy requirement (nonprofit-only), this one
 * plausibly reaches for-profit hospitals too, since nearly all hospitals
 * participate in Medicaid. Surfaced as a secondary card regardless of
 * screening outcome.
 * Confidence: secondary_source_reported, needs primary-source (MI
 * legislature text) confirmation before being stated as settled fact to end
 * users.
 */
export const MICHIGAN_UNINSURED_RATE_CAP_NOTE =
  "Michigan law (MCL 400.105d) requires any hospital that participates in Medicaid to accept no more than 115% of the Medicare rate as full payment from an uninsured patient at or below 250% of the federal poverty level — regardless of what any single hospital's own financial assistance policy says, and regardless of whether that hospital is nonprofit or for-profit.";
