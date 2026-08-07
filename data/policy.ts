/**
 * Policy constants used by the decision engine.
 *
 * These are heuristics about how US drug benefit design generally works,
 * not guarantees about any individual's plan. Every fact here has a
 * `lastVerified` date and a source. Laws and program terms change —
 * re-verify before trusting this in production, and always tell users
 * to confirm against their own plan documents.
 */

export const POLICY_LAST_VERIFIED = "2026-08-07";

/**
 * States that have enacted "copay accumulator" bans for state-regulated
 * (fully insured) commercial plans, i.e. manufacturer copay assistance must
 * count toward the enrollee's deductible/out-of-pocket max.
 *
 * IMPORTANT NUANCE (frequently missed): almost none of these laws apply to
 * "copay maximizers" (programs that adjust the copay amount up to the full
 * value of the assistance, rather than excluding it) — accumulator bans and
 * maximizer bans are legally distinct, and most states have only banned the
 * former. `alsoCoversMaximizers` defaults to false unless a state is known
 * to address both. Verify current text before relying on this distinction.
 *
 * These laws only reach fully insured plans regulated by the state. They
 * cannot reach self-funded employer plans, which are governed by ERISA and
 * are federally, not state, regulated — this is true no matter which state
 * the employee lives or works in.
 *
 * Source snapshot (Jan–Feb 2026 reporting): ~26 states + DC + Puerto Rico
 * have some form of accumulator ban. The list below reflects the states
 * named with reasonable confidence across multiple 2026 trackers. Several
 * more states plus DC/PR likely belong here — this list is deliberately
 * conservative rather than guessed complete. Confirm with your state
 * Department of Insurance.
 * https://advisory.avalerehealth.com/insights/state-copay-accumulator-bans-now-affect-at-least-17-of-commercial-lives
 * https://www.hemob.org/resource-library/01-13-2026
 * https://www.the-rheumatologist.org/article/state-copay-accumulator-legislation-an-overview/
 */
export const ANTI_ACCUMULATOR_STATES: Record<
  string,
  { alsoCoversMaximizers: boolean }
> = {
  AZ: { alsoCoversMaximizers: false },
  AR: { alsoCoversMaximizers: false },
  CO: { alsoCoversMaximizers: false },
  CT: { alsoCoversMaximizers: false },
  DE: { alsoCoversMaximizers: false },
  GA: { alsoCoversMaximizers: false },
  IL: { alsoCoversMaximizers: false },
  IN: { alsoCoversMaximizers: false },
  KY: { alsoCoversMaximizers: false },
  LA: { alsoCoversMaximizers: false },
  ME: { alsoCoversMaximizers: false },
  NV: { alsoCoversMaximizers: false },
  NJ: { alsoCoversMaximizers: false },
  NM: { alsoCoversMaximizers: false },
  NY: { alsoCoversMaximizers: true },
  NC: { alsoCoversMaximizers: false },
  OK: { alsoCoversMaximizers: false },
  OR: { alsoCoversMaximizers: false },
  TN: { alsoCoversMaximizers: false },
  TX: { alsoCoversMaximizers: false },
  VT: { alsoCoversMaximizers: false },
  VA: { alsoCoversMaximizers: false },
  WA: { alsoCoversMaximizers: true },
  WV: { alsoCoversMaximizers: false },
};

export const ANTI_ACCUMULATOR_STATES_SOURCE_NOTE =
  "State accumulator-ban lists change frequently and enumerations vary across trackers. This list is a conservative subset verified against multiple 2026 sources, not a complete or current legal list. Always confirm with your state Department of Insurance or your plan's Summary Plan Description.";

/**
 * The federal-level "marketplace / all commercial plans must count copay
 * assistance toward the OOP max" rule has a genuinely unsettled legal
 * history — this is NOT a clean, scheduled 2027 rule. Do not assert it as
 * settled fact in the UI; present it as contested and in flux.
 *
 * Timeline as best verified:
 * - The 2021 NBPP rule let plans exclude manufacturer copay assistance from
 *   OOP max calculations whenever a generic equivalent existed.
 * - In HIV+Hepatitis Policy Institute v. HHS (Sept 2023), a federal court
 *   vacated that provision, effectively reinstating the more patient favorable
 *   2020 rule (assistance must generally count) for HHS-regulated plans.
 * - HHS did not appeal, but also did not clearly enforce the 2020 standard,
 *   and the 2026 NBPP final rule did not resolve the question. A future
 *   joint rule from HHS/DOL/Treasury has been promised but not issued as of
 *   this writing.
 * - Net effect: whether a marketplace (or other HHS-regulated) plan must
 *   count manufacturer copay assistance is legally contested and enforcement
 *   is inconsistent. Self-funded employer plans are governed separately
 *   (ERISA) and are not directly reached by this HHS rulemaking either way.
 * https://natlawreview.com/article/court-strikes-down-hhs-rule-copay-accumulators-implications-health-plans-and-pbms
 * https://hivhep.org/press-releases/biden-harris-administration-urged-to-comply-with-court-decision-require-insurers-to-count-copay-assistance/
 */
export const MARKETPLACE_ACCUMULATOR_RULE_STATUS = {
  settled: false,
  summary:
    "Whether marketplace plans must count manufacturer copay assistance toward your out-of-pocket max is legally contested, not a settled 2027 rule. A 2023 court ruling favored counting it, but federal agencies haven't clearly enforced that since, and a follow-up rule is still pending.",
  lastVerified: POLICY_LAST_VERIFIED,
};

/**
 * Medicare Part D out-of-pocket cap, set by the Inflation Reduction Act and
 * adjusted annually. This is a hard ceiling on what a Part D enrollee pays
 * out of pocket for covered Part D drugs in the plan year (excludes premiums
 * and Part B-administered drugs).
 * https://www.panfoundation.org/understanding-the-medicare-part-d-cap/
 * https://health.usnews.com/medicare/articles/what-is-medicare-part-d
 */
export const MEDICARE_PART_D_OOP_CAP = {
  planYear: 2026,
  amount: 2100,
  lastVerified: POLICY_LAST_VERIFIED,
  note: "Once your true out-of-pocket Part D drug spending hits this amount in the plan year, covered Part D drugs are $0 for the rest of the year. This does not apply to Part B-administered drugs or to your premium.",
};

/**
 * The Medicare Prescription Payment Plan (M3P), created by the Inflation
 * Reduction Act, lets any Part D enrollee opt in to spread their
 * out-of-pocket drug costs into interest-free monthly installments across
 * the plan year instead of paying it all at the pharmacy counter.
 */
export const MEDICARE_PAYMENT_PLAN = {
  name: "Medicare Prescription Payment Plan",
  lastVerified: POLICY_LAST_VERIFIED,
  note: "Available to any Part D enrollee regardless of income. It doesn't lower the total you owe — it spreads it into monthly payments instead of one large pharmacy charge. Ask your plan how to opt in.",
};

/**
 * Manufacturer copay cards ("savings cards") for commercially insured
 * patients are generally prohibited for anyone with Medicare, Medicaid, or
 * other federal health program coverage, under the federal Anti-Kickback
 * Statute — this is federal law, not a manufacturer policy choice, and it
 * applies even if the person also has separate commercial coverage.
 * Independent charitable/disease-state foundations are structured
 * differently (they can't steer to a specific brand) and are permitted.
 */
export const MEDICARE_COPAY_CARD_PROHIBITION = {
  lastVerified: POLICY_LAST_VERIFIED,
  note: "Manufacturer copay cards are generally off-limits once you have Medicare drug coverage, because of a federal anti-kickback law aimed at preventing manufacturers from steering federal program spending. This isn't a judgment on you — it's a structural rule. Independent nonprofit foundations are allowed to help instead, because they can't be steered toward one company's drug.",
};

export const CHARITABLE_FOUNDATIONS = [
  {
    name: "PAN Foundation",
    url: "https://www.panfoundation.org/",
    note: "Disease-specific funds; open/closed status changes without much notice. Check the fund list before applying.",
  },
  {
    name: "HealthWell Foundation",
    url: "https://www.healthwellfoundation.org/",
    note: "Disease-specific funds; can be applied to alongside other foundations if funds are open.",
  },
  {
    name: "Patient Advocate Foundation",
    url: "https://www.patientadvocate.org/",
    note: "Also offers case management help for appeals and denials, not just financial assistance.",
  },
] as const;

export const FREE_APPEAL_SERVICES = [
  {
    name: "Counterforce Health",
    url: "https://www.counterforcehealth.org/",
    note: "Free service that drafts insurance appeal letters for you based on your denial.",
  },
  {
    name: "Fight Health Insurance",
    url: "https://fighthealthinsurance.com/",
    note: "Free/low-cost tool that generates appeal letters and tracks the process.",
  },
] as const;
