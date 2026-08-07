export type DrugTier =
  | "specialty"
  | "non-preferred brand"
  | "preferred brand"
  | "generic";

export type Drug = {
  id: string;
  brandName: string;
  genericName: string;
  genericAvailable: boolean;
  typicalTier: DrugTier;
  commonlyRequiresPriorAuth: boolean;
  commonlySubjectToStepTherapy: boolean;
  manufacturerPapUrl: string;
  copayCardUrl: string | null;
  therapeuticAlternatives: string[];
  foundationFunds: string[];
  notes?: string;
};

/**
 * Seed data: GLP-1 receptor agonist class (diabetes + weight management).
 * High cost, high denial rate, active patient communities — good v1 target.
 *
 * Every field here is a general heuristic about how this class is typically
 * handled by US commercial/Medicare plans as of the lastVerified date below,
 * not a guarantee about any specific plan's formulary. Tier placement,
 * prior-auth rules, and step-therapy requirements vary by plan and change
 * often — always check the individual formulary.
 */
export const DRUGS_LAST_VERIFIED = "2026-08-07";

export const DRUGS: Drug[] = [
  {
    id: "ozempic",
    brandName: "Ozempic",
    genericName: "semaglutide",
    genericAvailable: false,
    typicalTier: "specialty",
    commonlyRequiresPriorAuth: true,
    commonlySubjectToStepTherapy: true,
    manufacturerPapUrl: "https://www.novocare.com/diabetes/help-with-costs/pap.html",
    copayCardUrl: "https://www.novocare.com/ozempic/save.html",
    therapeuticAlternatives: ["Trulicity", "Mounjaro", "Rybelsus", "Victoza"],
    foundationFunds: ["Diabetes", "Type 2 Diabetes Mellitus"],
    notes:
      "Typically Tier 4/specialty on commercial plans when prescribed for weight management rather than diabetes; coverage and prior-auth criteria vary widely by plan. Check your own formulary.",
  },
  {
    id: "wegovy",
    brandName: "Wegovy",
    genericName: "semaglutide",
    genericAvailable: false,
    typicalTier: "specialty",
    commonlyRequiresPriorAuth: true,
    commonlySubjectToStepTherapy: true,
    manufacturerPapUrl: "https://www.novocare.com/obesity/help-with-costs/pap.html",
    copayCardUrl: "https://www.novocare.com/wegovy/save.html",
    therapeuticAlternatives: ["Zepbound", "Saxenda"],
    foundationFunds: ["Obesity", "Weight Management"],
    notes:
      "Many plans, including many employer plans, exclude anti-obesity medications from coverage entirely regardless of tier — confirm your plan covers this drug class at all before assuming a tier/PA question.",
  },
  {
    id: "mounjaro",
    brandName: "Mounjaro",
    genericName: "tirzepatide",
    genericAvailable: false,
    typicalTier: "specialty",
    commonlyRequiresPriorAuth: true,
    commonlySubjectToStepTherapy: true,
    manufacturerPapUrl: "https://www.lillydirect.lilly.com/savings-card",
    copayCardUrl: "https://mounjaro.lilly.com/savings-card",
    therapeuticAlternatives: ["Ozempic", "Trulicity", "Rybelsus"],
    foundationFunds: ["Diabetes", "Type 2 Diabetes Mellitus"],
    notes:
      "Typically specialty/Tier 4 on commercial plans; check whether your plan requires a step of metformin or a sulfonylurea first.",
  },
  {
    id: "zepbound",
    brandName: "Zepbound",
    genericName: "tirzepatide",
    genericAvailable: false,
    typicalTier: "specialty",
    commonlyRequiresPriorAuth: true,
    commonlySubjectToStepTherapy: true,
    manufacturerPapUrl: "https://www.lillydirect.lilly.com/savings-card",
    copayCardUrl: "https://zepbound.lilly.com/savings-card",
    therapeuticAlternatives: ["Wegovy", "Saxenda"],
    foundationFunds: ["Obesity", "Weight Management"],
    notes:
      "Anti-obesity indication is commonly excluded outright by employer plans regardless of medical necessity — confirm coverage of the drug class first.",
  },
  {
    id: "trulicity",
    brandName: "Trulicity",
    genericName: "dulaglutide",
    genericAvailable: false,
    typicalTier: "non-preferred brand",
    commonlyRequiresPriorAuth: false,
    commonlySubjectToStepTherapy: false,
    manufacturerPapUrl: "https://www.lillydirect.lilly.com/savings-card",
    copayCardUrl: "https://trulicity.lilly.com/savings-card",
    therapeuticAlternatives: ["Ozempic", "Mounjaro", "Rybelsus"],
    foundationFunds: ["Diabetes", "Type 2 Diabetes Mellitus"],
    notes:
      "Often placed a tier lower than newer GLP-1s on commercial formularies since it's been on the market longer, but this varies by plan.",
  },
  {
    id: "rybelsus",
    brandName: "Rybelsus",
    genericName: "oral semaglutide",
    genericAvailable: false,
    typicalTier: "specialty",
    commonlyRequiresPriorAuth: true,
    commonlySubjectToStepTherapy: true,
    manufacturerPapUrl: "https://www.novocare.com/diabetes/help-with-costs/pap.html",
    copayCardUrl: "https://www.novocare.com/rybelsus/save.html",
    therapeuticAlternatives: ["Ozempic", "Trulicity", "Mounjaro"],
    foundationFunds: ["Diabetes", "Type 2 Diabetes Mellitus"],
  },
  {
    id: "victoza",
    brandName: "Victoza",
    genericName: "liraglutide",
    genericAvailable: true,
    typicalTier: "preferred brand",
    commonlyRequiresPriorAuth: false,
    commonlySubjectToStepTherapy: false,
    manufacturerPapUrl: "https://www.novocare.com/diabetes/help-with-costs/pap.html",
    copayCardUrl: "https://www.novocare.com/victoza/save.html",
    therapeuticAlternatives: ["Ozempic", "Trulicity"],
    foundationFunds: ["Diabetes", "Type 2 Diabetes Mellitus"],
    notes:
      "An FDA-approved generic (liraglutide injection) reached the market in 2025. Availability at your specific pharmacy can lag approval — ask your pharmacist whether the generic is stocked.",
  },
  {
    id: "saxenda",
    brandName: "Saxenda",
    genericName: "liraglutide",
    genericAvailable: false,
    typicalTier: "specialty",
    commonlyRequiresPriorAuth: true,
    commonlySubjectToStepTherapy: true,
    manufacturerPapUrl: "https://www.novocare.com/obesity/help-with-costs/pap.html",
    copayCardUrl: "https://www.novocare.com/saxenda/save.html",
    therapeuticAlternatives: ["Wegovy", "Zepbound"],
    foundationFunds: ["Obesity", "Weight Management"],
    notes:
      "The liraglutide generic approved in 2025 covers the Victoza (diabetes) dose/indication, not confirmed to cover the Saxenda (weight-management) dose — don't assume the generic substitutes here without asking your pharmacist.",
  },
];

export function findDrugByName(query: string): Drug | undefined {
  const q = query.trim().toLowerCase();
  if (!q) return undefined;
  return DRUGS.find(
    (d) =>
      d.brandName.toLowerCase() === q || d.genericName.toLowerCase() === q
  );
}

export function searchDrugs(query: string): Drug[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return DRUGS.filter(
    (d) =>
      d.brandName.toLowerCase().includes(q) ||
      d.genericName.toLowerCase().includes(q)
  );
}
