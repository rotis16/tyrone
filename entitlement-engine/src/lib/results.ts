import { findBillAmountRange } from "../data/billAmounts";
import { MICHIGAN_UNINSURED_RATE_CAP_NOTE } from "../data/hospitals";
import type { Answers } from "../data/answers";
import type { Hospital } from "../data/types";
import { itemizedBillScript, phoneScript, writtenRequestScript, type Script } from "./scripts";
import { screenHousehold, type ScreeningResult } from "./screening";
import { findIncomeRange } from "../data/incomeRanges";

export type ActionCard = {
  id: string;
  verdict: string;
  why: string;
  deadline: string | null;
  nextStep: string;
  /** If nextStep is an instruction to visit a URL, the URL to render as a real link. */
  nextStepUrl: string | null;
  sourceUrl: string | null;
  script?: Script;
};

function billImpactPhrase(discountPct: number | null, billRangeId: string | null): string {
  const range = billRangeId ? findBillAmountRange(billRangeId) : undefined;
  if (discountPct === null || !range) return "";
  const billDescription =
    range.max === null
      ? `your $${range.min.toLocaleString()}+ bill`
      : `your $${range.min.toLocaleString()}–$${range.max.toLocaleString()} bill`;
  if (discountPct >= 100) return ` That could wipe out ${billDescription} completely.`;
  if (discountPct >= 50) return ` That could cut ${billDescription} by about half or more.`;
  return ` That could meaningfully reduce ${billDescription}.`;
}

function primaryVerdictCard(
  answers: Answers,
  hospital: Hospital,
  result: ScreeningResult
): ActionCard {
  const notVerifiedNote =
    hospital.dataConfidence !== "primary_source_confirmed"
      ? " We haven't independently confirmed this hospital's numbers against their own published policy yet — bring this page with you and ask them to confirm before you rely on it."
      : "";

  if (result.status === "unknown") {
    return {
      id: "verdict",
      verdict: `We don't have ${hospital.name}'s financial assistance policy confirmed yet.`,
      why: "Every nonprofit hospital is required by federal law to have a written financial assistance policy, even when it's hard to find. That doesn't mean you don't qualify — it means we can't tell you yet.",
      deadline: null,
      nextStep: "Call and ask them directly for the policy and an application.",
      nextStepUrl: null,
      sourceUrl: hospital.fapUrl,
      script: phoneScript(hospital),
    };
  }

  if (result.status === "unlikely") {
    return {
      id: "verdict",
      verdict: `Based on what you told us, you likely don't qualify for financial assistance at ${hospital.name} under their current income limits.${notVerifiedNote}`,
      why: `Your household income puts you at roughly ${Math.round(result.percentOfFpl)}% of the federal poverty level for your household size, above this hospital's stated limits.`,
      deadline: null,
      nextStep: "See the options below — this isn't a dead end.",
      nextStepUrl: null,
      sourceUrl: hospital.fapUrl,
    };
  }

  const discountLine =
    result.discountPct === 100
      ? "You likely qualify for 100% free care at this hospital."
      : `You likely qualify for a ${result.discountPct}% discount at this hospital.`;

  const applyStep: Pick<ActionCard, "nextStep" | "nextStepUrl"> = hospital.applicationUrl
    ? { nextStep: "Apply online", nextStepUrl: hospital.applicationUrl }
    : { nextStep: "Call to request an application.", nextStepUrl: null };

  if (result.status === "possible") {
    return {
      id: "verdict",
      verdict: `You may qualify for a ${result.discountPct}% discount at ${hospital.name}.${notVerifiedNote}`,
      why: `Whether you qualify depends on exactly where your income falls in the range you gave us — at the lower end of that range you'd likely get this discount, at the higher end you may not.${billImpactPhrase(result.discountPct, answers.billAmountRangeId)} It's still worth applying either way, since applying is free.`,
      deadline: hospital.applicationWindowDays
        ? `Apply within ${hospital.applicationWindowDays} days of the bill for the best chance.`
        : null,
      ...applyStep,
      sourceUrl: hospital.fapUrl,
      script: writtenRequestScript(hospital),
    };
  }

  return {
    id: "verdict",
    verdict: `${discountLine}${notVerifiedNote}`,
    why: `Your household income is about ${Math.round(result.percentOfFpl)}% of the federal poverty level for your household size.${billImpactPhrase(result.discountPct, answers.billAmountRangeId)}`,
    deadline: hospital.applicationWindowDays
      ? `Apply within ${hospital.applicationWindowDays} days of the bill for the best chance.`
      : null,
    ...applyStep,
    sourceUrl: hospital.fapUrl,
    script: writtenRequestScript(hospital),
  };
}

function alwaysOnCards(answers: Answers, hospital: Hospital): ActionCard[] {
  const cards: ActionCard[] = [
    {
      id: "itemized-bill",
      verdict: "Request an itemized bill.",
      why: "A large share of medical bills contain errors — duplicate charges, wrong codes, services you didn't get. This is free to ask for and always worth doing.",
      deadline: null,
      nextStep: "Send the request below.",
      nextStepUrl: null,
      sourceUrl: null,
      script: itemizedBillScript(hospital),
    },
    {
      id: "dont-pay-yet",
      verdict: "Don't pay anything until your financial assistance application is decided.",
      why: "Paying first can make it harder to get money back later, and hospitals are generally required to pause collection efforts while a complete application is under review.",
      deadline: null,
      nextStep: "Ask the billing department to confirm in writing that your account is on hold.",
      nextStepUrl: null,
      sourceUrl: null,
    },
  ];

  if (answers.insuranceStatus === "uninsured" || answers.insuranceStatus === "insured_at_time_of_care") {
    cards.push({
      id: "medicare-benchmark",
      verdict: "Ask what the Medicare rate would be for this care, as a benchmark.",
      why: `Hospitals often charge uninsured patients far more than Medicare would pay for the same service. ${MICHIGAN_UNINSURED_RATE_CAP_NOTE}`,
      deadline: null,
      nextStep: "Ask the billing department directly what the Medicare rate is for each line item.",
      nextStepUrl: null,
      sourceUrl: null,
    });
  }

  if (answers.billAge === "in_collections") {
    cards.push({
      id: "in-collections-note",
      verdict: "Already in collections? You can still apply.",
      why: "It's harder once a bill has moved to collections, but hospitals are still required to consider you for financial assistance, and a successful application can reverse the account.",
      deadline: null,
      nextStep: "Mention in your application that the account is in collections and ask that it be recalled.",
      nextStepUrl: null,
      sourceUrl: null,
    });
  }

  return cards;
}

const FQHC_LOCATOR_URL = "https://findahealthcenter.hrsa.gov/";

function neverADeadEndCards(hospital: Hospital): ActionCard[] {
  return [
    {
      id: "fqhc",
      verdict: "Look for a sliding-scale community health center nearby.",
      why: "Federally Qualified Health Centers charge based on your income, no matter your insurance status, for many kinds of care.",
      deadline: null,
      nextStep: "Search the official HRSA locator",
      nextStepUrl: FQHC_LOCATOR_URL,
      sourceUrl: null,
    },
    {
      id: "payment-plan",
      verdict: `Ask ${hospital.name} about an interest-free payment plan.`,
      why: "Most hospitals offer monthly payment plans with no interest, which can make a bill manageable even without full financial assistance.",
      deadline: null,
      nextStep: "Ask the billing department for their payment plan options in writing.",
      nextStepUrl: null,
      sourceUrl: null,
    },
    {
      id: "self-pay-discount",
      verdict: "Ask for a self-pay discount, separate from financial assistance.",
      why: "Many hospitals automatically discount bills for patients who pay without going through insurance or a full assistance application — it's a different program worth asking about by name.",
      deadline: null,
      nextStep: 'Ask: "Do you offer a prompt-pay or self-pay discount?"',
      nextStepUrl: null,
      sourceUrl: null,
    },
  ];
}

/** Full ranked action plan for one household + hospital pair. Pure function. */
export function buildActionPlan(answers: Answers, hospital: Hospital): ActionCard[] {
  const incomeRange = answers.incomeRangeId ? findIncomeRange(answers.incomeRangeId) : undefined;
  if (!incomeRange || !answers.householdSize) {
    throw new Error("buildActionPlan requires incomeRangeId and householdSize to be set");
  }

  const result = screenHousehold({
    householdSize: answers.householdSize,
    incomeRange,
    hospital,
  });

  const cards: ActionCard[] = [primaryVerdictCard(answers, hospital, result)];
  cards.push(...alwaysOnCards(answers, hospital));
  if (result.status === "unlikely") {
    cards.push(...neverADeadEndCards(hospital));
  }
  return cards;
}
