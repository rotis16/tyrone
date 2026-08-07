import { DRUGS, type Drug } from "@/data/drugs";
import {
  ANTI_ACCUMULATOR_STATES,
  CHARITABLE_FOUNDATIONS,
  FREE_APPEAL_SERVICES,
  MARKETPLACE_ACCUMULATOR_RULE_STATUS,
  MEDICARE_COPAY_CARD_PROHIBITION,
  MEDICARE_PART_D_OOP_CAP,
  MEDICARE_PAYMENT_PLAN,
} from "@/data/policy";
import type { Answers, Move } from "./types";
import {
  clinicSlidingScaleOr340BScript,
  denialReasonRequestScript,
  directToConsumerScript,
  discountCardCashPriceScript,
  foundationInquiryScript,
  genericSwapScript,
  hrAccumulatorEmailScript,
  insurerCallScript,
  medicareCopayCardStopScript,
  papInquiryScript,
  pharmacistCashVsInsuranceScript,
  prescriberAlternativeScript,
  priorAuthExceptionScript,
  stepTherapyExceptionScript,
} from "./scripts";

type Candidate = { weight: number; move: Omit<Move, "rank"> };

const MAX_MOVES = 5;

function resolveDrug(answers: Answers): Drug | undefined {
  if (!answers.drugId) return undefined;
  return DRUGS.find((d) => d.id === answers.drugId);
}

function resolveDrugName(answers: Answers, drug: Drug | undefined): string | null {
  if (drug) return drug.brandName;
  return answers.drugQuery.trim() || null;
}

function unknownDrugCandidate(answers: Answers): Candidate | null {
  if (!answers.drugUnknown) return null;
  return {
    weight: 3,
    move: {
      title: "We don't have specific data on this drug yet",
      why: "This tool's drug-specific details (typical tier, prior-auth patterns, generic status) only cover one therapeutic class so far. The moves below are still based on your insurance situation, which applies regardless of the specific drug — but double-check generic availability and manufacturer programs yourself.",
      effort: "today",
      potentialImpact: "medium",
      caveat: "Ask your pharmacist directly whether a generic equivalent exists — that single question resolves most of the uncertainty.",
    },
  };
}

// ---- Gate 2: generic substitution ----
function genericSubstitutionCandidate(
  drug: Drug | undefined,
  drugName: string | null
): Candidate | null {
  if (!drug || !drug.genericAvailable) return null;
  return {
    weight: 12,
    move: {
      title: `Ask about switching to generic ${drug.genericName}`,
      why: `A generic version of ${drug.brandName} (${drug.genericName}) is available. Cash price on a mature generic frequently beats a branded copay outright, and it sidesteps prior authorization and copay-card complications entirely.`,
      effort: "today",
      potentialImpact: "high",
      script: genericSwapScript(drugName, drug.genericName),
      caveat: "Confirm the generic is actually stocked at your pharmacy and covers the same dose/indication you're prescribed for — generic approval doesn't always match every brand indication right away.",
    },
  };
}

// ---- Gate 3: cash vs. insurance ----
function cashVsInsuranceCandidate(answers: Answers, drugName: string | null): Candidate {
  const { deductibleStatus, willHitDeductible } = answers;

  if (deductibleStatus === "met" || deductibleStatus === "no_deductible") {
    return {
      weight: 22,
      move: {
        title: "Use your insurance for this fill",
        why:
          deductibleStatus === "met"
            ? "You've already met your deductible, so your copay is likely the floor — cash pricing almost never beats insurance once the deductible is behind you."
            : "Your plan doesn't have a deductible standing between you and your copay, so insurance pricing is very likely your best option here.",
        effort: "today",
        potentialImpact: "medium",
        script: pharmacistCashVsInsuranceScript(drugName),
        caveat: "It rarely happens, but it doesn't hurt to have your pharmacist double-check — occasionally a discount cash price still undercuts a small copay.",
      },
    };
  }

  if (willHitDeductible === "yes_ongoing") {
    return {
      weight: 20,
      move: {
        title: "Use your insurance, even if the sticker price looks higher",
        why: "You haven't met your deductible yet, but you expect ongoing costs this year. Every dollar you pay through insurance counts toward your deductible — paying cash instead doesn't advance it, even when cash looks cheaper today. It can feel wrong, but running it through insurance now usually pays off once you hit the deductible.",
        effort: "today",
        potentialImpact: "high",
      },
    };
  }

  if (willHitDeductible === "probably_not") {
    return {
      weight: 18,
      move: {
        title: "Compare the cash price against your copay directly",
        why: "You haven't met your deductible and don't expect to reach it this year. Paying cash won't advance a deductible you're not going to hit anyway, so the cash price may genuinely beat routing this through insurance. Have your pharmacist quote both and take the lower one.",
        effort: "today",
        potentialImpact: "high",
        script: pharmacistCashVsInsuranceScript(drugName),
      },
    };
  }

  return {
    weight: 20,
    move: {
      title: "Ask your pharmacist to run it both ways",
      why: "Whether insurance or cash is cheaper here depends on where you stand on your deductible and whether you'll hit it this year. Rather than guess, have the pharmacist quote both the insurance price and the cash price and take whichever is lower.",
      effort: "today",
      potentialImpact: "medium",
      script: pharmacistCashVsInsuranceScript(drugName),
    },
  };
}

// ---- Gate 4: accumulator detection ----
function accumulatorCandidate(
  answers: Answers,
  drugName: string | null
): Candidate | null {
  const commercial = answers.insuranceType === "employer" || answers.insuranceType === "marketplace";
  if (!commercial || answers.copayCard !== "using") return null;

  const planDocTip =
    'Search your plan\'s Summary Plan Description (SPD) for these terms — programs like this rarely use the word "accumulator" in plan documents: "Coupon Adjustment," "Benefit Plan Protection Program," "Out-of-Pocket Protection Program," or "Copay Leveling Program."';

  if (answers.insuranceType === "marketplace") {
    return {
      weight: 30,
      move: {
        title: "Find out if your marketplace plan counts your copay card assistance",
        why: `You're using manufacturer copay assistance on a brand drug through a marketplace plan. ${MARKETPLACE_ACCUMULATOR_RULE_STATUS.summary} Don't assume either way — confirm directly with your insurer. ${planDocTip}`,
        effort: "this week",
        potentialImpact: "high",
        script: {
          channel: "phone",
          recipient: "your marketplace insurer's member services line",
          body: `Hi, I use manufacturer copay assistance for a prescription. Does my plan count that assistance toward my deductible and out-of-pocket maximum, or does it use a copay accumulator or maximizer program that excludes it? Could you point me to where that's documented in my plan materials?`,
          copyable: true,
        },
        caveat: `Policy status verified as of ${MARKETPLACE_ACCUMULATOR_RULE_STATUS.lastVerified} — this is a genuinely unsettled area of federal rulemaking, not a stable rule. Re-check before relying on it.`,
      },
    };
  }

  // employer plan
  if (answers.planFunding === "self_funded") {
    return {
      weight: 28,
      move: {
        title: "Ask HR whether your plan uses a copay accumulator or maximizer",
        why: `Your plan is self-funded, which means state anti-accumulator laws can't reach it no matter what state you live or work in — self-funded plans are regulated federally under ERISA, not by the state. The fastest way to find out how your plan actually treats copay-card assistance is to ask HR directly. ${planDocTip}`,
        effort: "this week",
        potentialImpact: "high",
        script: hrAccumulatorEmailScript(drugName),
      },
    };
  }

  if (answers.planFunding === "fully_insured") {
    const stateInfo = answers.state ? ANTI_ACCUMULATOR_STATES[answers.state] : undefined;
    if (stateInfo) {
      return {
        weight: 26,
        move: {
          title: "Confirm your copay assistance counts toward your deductible",
          why: `Your plan is fully insured, and your state has an anti-accumulator law, so your copay card assistance is likely required to count toward your deductible and out-of-pocket max. ${stateInfo.alsoCoversMaximizers ? "Your state's law appears to also address copay maximizer programs, not just accumulators." : "Most of these state laws cover accumulator programs specifically but not maximizer programs — a related but distinct practice — so it's still worth confirming which one, if either, your plan uses."} Confirm directly with your insurer rather than assuming.`,
          effort: "this week",
          potentialImpact: "high",
          script: {
            channel: "phone",
            recipient: "your insurer's member services line",
            body: `Hi, I use manufacturer copay assistance for a prescription. My understanding is that state law requires plans like mine to count that assistance toward my deductible and out-of-pocket maximum. Can you confirm that's how my plan handles it, and point me to where that's documented?`,
            copyable: true,
          },
          caveat: "State accumulator-ban lists change often and this app's list is a conservative subset, not a guaranteed-complete legal reference. Verify with your state Department of Insurance.",
        },
      };
    }
    return {
      weight: 28,
      move: {
        title: "Find out if your state protects your copay assistance",
        why: `Your plan is fully insured, so whether your copay card assistance counts toward your deductible depends on whether your state has passed a law requiring it. This app doesn't have confirmed data for your state, so ask your insurer directly rather than assuming either way. ${planDocTip}`,
        effort: "this week",
        potentialImpact: "high",
        script: {
          channel: "phone",
          recipient: "your insurer's member services line",
          body: `Hi, I use manufacturer copay assistance for a prescription. Does my plan count that assistance toward my deductible and out-of-pocket maximum, or does it exclude it through a copay accumulator or maximizer program? Could you point me to where that's documented in my plan materials?`,
          copyable: true,
        },
      },
    };
  }

  // planFunding not_sure or missing
  return {
    weight: 28,
    move: {
      title: "Ask HR whether your plan is self-funded and uses a copay accumulator",
      why: `Whether your copay card assistance counts toward your deductible depends on two things you haven't confirmed yet: whether your plan is self-funded, and whether it runs an accumulator or maximizer program. Asking HR is the cheapest way to find out both at once — state law can't help you here if your plan turns out to be self-funded. ${planDocTip}`,
      effort: "this week",
      potentialImpact: "high",
      script: hrAccumulatorEmailScript(drugName),
    },
  };
}

// ---- Gate 5: coverage friction ----
function coverageFrictionCandidates(
  answers: Answers,
  drugName: string | null
): Candidate[] {
  const out: Candidate[] = [];
  const services = FREE_APPEAL_SERVICES.map((s) => `${s.name} (${s.url})`).join(" or ");

  if (answers.coverageFriction === "denied") {
    out.push({
      weight: 8,
      move: {
        title: "Request the denial reason in writing, then appeal",
        why: `Get the specific denial reason and the plan's coverage criteria in writing first — you can't build an effective appeal without knowing exactly what you're appealing. From there, ask your prescriber for a letter of medical necessity, and file an internal appeal with your insurer before an external one if it's denied again. You don't have to write the appeal yourself: free services like ${services} will draft it for you once you have the denial letter.`,
        effort: "this week",
        potentialImpact: "high",
        script: denialReasonRequestScript(drugName),
        caveat: "Note your appeal deadline as soon as you get the denial — internal appeal windows are often time-limited.",
      },
    });
  } else if (answers.coverageFriction === "prior_auth") {
    out.push({
      weight: 9,
      move: {
        title: "Get the prior authorization submitted",
        why: "A prior authorization requirement isn't a denial — it means your prescriber needs to submit paperwork showing why this specific drug is medically necessary for you before insurance will cover it.",
        effort: "this week",
        potentialImpact: "high",
        script: priorAuthExceptionScript(drugName),
        caveat: `If it does get denied, request the denial reason in writing and consider a free appeal service like ${services}.`,
      },
    });
  } else if (answers.coverageFriction === "step_therapy") {
    out.push({
      weight: 9,
      move: {
        title: "Request a step therapy exception",
        why: "Step therapy means your plan wants you to try a different (usually cheaper) drug first. A step therapy exception request is often faster than a general appeal, and is commonly granted if you've already tried the required drug, it's expected to be ineffective or unsafe for you, or you're already stable on the requested drug.",
        effort: "this week",
        potentialImpact: "high",
        script: stepTherapyExceptionScript(drugName),
      },
    });
  } else if (answers.coverageFriction === "not_sure") {
    out.push({
      weight: 15,
      move: {
        title: "Find out this drug's actual coverage status before assuming",
        why: "Before making a plan, it's worth confirming there isn't a prior authorization or step therapy requirement sitting between you and coverage. A short call settles it.",
        effort: "today",
        potentialImpact: "medium",
        script: insurerCallScript(drugName),
      },
    });
  }

  return out;
}

// ---- Gate 6: assistance layering (always evaluated, ranked last) ----
function assistanceCandidates(
  drug: Drug | undefined,
  drugName: string | null,
  opts: { medicare?: boolean } = {}
): Candidate[] {
  const out: Candidate[] = [];

  out.push({
    weight: opts.medicare ? 45 : 50,
    move: {
      title: "Check the manufacturer patient assistance program (PAP)",
      why: "Manufacturer PAPs give the drug free or steeply discounted based on income, separate from copay cards. They're slower — expect paperwork and a wait — but can be the biggest single discount available.",
      effort: "this month",
      potentialImpact: "high",
      script: papInquiryScript(drugName, drug?.manufacturerPapUrl ?? null),
      caveat: opts.medicare
        ? "Many manufacturer PAPs exclude anyone with any prescription drug coverage, including Medicare — confirm eligibility before investing time in the application."
        : "Income thresholds vary by manufacturer and usually target people who are uninsured or underinsured — confirm eligibility before applying.",
    },
  });

  const foundationList = CHARITABLE_FOUNDATIONS.map((f) => `${f.name} (${f.url})`).join(", ");
  out.push({
    weight: opts.medicare ? 45 : 52,
    move: {
      title: "Apply to independent charitable foundations in parallel",
      why: `Foundations like ${foundationList} run disease-state funds that can cover cost-sharing. You can apply to more than one at the same time, since funds open and close unpredictably and being approved by one doesn't disqualify you from another.`,
      effort: "this month",
      potentialImpact: "high",
      script: foundationInquiryScript(drugName),
      caveat: "Fund availability changes without much notice — check open/closed status before spending time on an application.",
    },
  });

  out.push({
    weight: 55,
    move: {
      title: "Ask if your clinic can fill this through the 340B program",
      why: "Some clinics (often community health centers, hospital-affiliated clinics, or Ryan White clinics) participate in the federal 340B drug pricing program, which can significantly lower the price of a prescription filled through their own pharmacy.",
      effort: "this week",
      potentialImpact: "medium",
      script: clinicSlidingScaleOr340BScript(drugName),
    },
  });

  return out;
}

function prescriberAlternativeCandidate(
  drug: Drug | undefined,
  drugName: string | null,
  weight: number
): Candidate {
  return {
    weight,
    move: {
      title: "Ask your prescriber about a lower-tier alternative",
      why: "A therapeutically similar drug on a lower formulary tier can cost meaningfully less without changing your treatment goals. Your prescriber is the only one who can say whether that's medically reasonable for you.",
      effort: "this week",
      potentialImpact: "medium",
      script: prescriberAlternativeScript(drugName, drug?.therapeuticAlternatives ?? []),
    },
  };
}

function fallbackFindOutInsuranceType(): Candidate {
  return {
    weight: 5,
    move: {
      title: "Find out your insurance type first",
      why: "Which moves make sense here depends heavily on whether you have employer coverage, a marketplace plan, Medicare, or Medicaid — they follow different rules. The type is usually printed on your insurance card, or you can call the number on the card and ask directly.",
      effort: "today",
      potentialImpact: "high",
      script: {
        channel: "phone",
        recipient: "the member services number on your insurance card",
        body: `Hi, could you tell me what type of health plan I have — is it an employer group plan, a marketplace/ACA plan, Medicare, or Medicaid? I also want to know if it's self-funded or fully insured, if you're able to tell me that.`,
        copyable: true,
      },
    },
  };
}

// ---- Lane builders ----

function noInsuranceMoves(drug: Drug | undefined, drugName: string | null): Candidate[] {
  const out: Candidate[] = [];
  const generic = genericSubstitutionCandidate(drug, drugName);
  if (generic) out.push(generic);

  out.push({
    weight: 18,
    move: {
      title: "Get the cash price with a discount card",
      why: "Discount card programs negotiate cash prices that are frequently far below a pharmacy's undiscounted list price, and anyone can use them regardless of insurance status. Ask your pharmacist to check rather than assuming the sticker price is final.",
      effort: "today",
      potentialImpact: "high",
      script: discountCardCashPriceScript(drugName),
    },
  });

  out.push({
    weight: 24,
    move: {
      title: "Check the manufacturer's direct-to-consumer channel",
      why: "Some manufacturers now sell certain brand drugs directly to self-pay patients at a set price outside the traditional pharmacy/insurance system, which can beat the pharmacy cash price.",
      effort: "this week",
      potentialImpact: "medium",
      script: directToConsumerScript(drugName),
    },
  });

  out.push(...assistanceCandidates(drug, drugName));
  return out;
}

function medicareMoves(answers: Answers, drug: Drug | undefined, drugName: string | null): Candidate[] {
  const out: Candidate[] = [];
  const usingCopayCard = answers.copayCard === "using";

  if (usingCopayCard) {
    out.push({
      weight: 5,
      move: {
        title: "Stop using the manufacturer copay card",
        why: `${MEDICARE_COPAY_CARD_PROHIBITION.note}`,
        effort: "today",
        potentialImpact: "high",
        script: medicareCopayCardStopScript(drugName),
        caveat: "This is about federal program rules, not something you did wrong — the fix is switching to a permitted assistance channel, not going without help.",
      },
    });
  }

  const generic = genericSubstitutionCandidate(drug, drugName);
  if (generic) out.push(generic);

  out.push({
    weight: 14,
    move: {
      title: "Know your Part D safety net",
      why: `Your Part D out-of-pocket cost for covered drugs is capped at $${MEDICARE_PART_D_OOP_CAP.amount} for the ${MEDICARE_PART_D_OOP_CAP.planYear} plan year — after that, covered Part D drugs are $0 for the rest of the year. ${MEDICARE_PAYMENT_PLAN.note}`,
      effort: "today",
      potentialImpact: "medium",
      caveat: `Figures verified as of ${MEDICARE_PART_D_OOP_CAP.lastVerified} for plan year ${MEDICARE_PART_D_OOP_CAP.planYear} — confirm the current year's cap, since it's adjusted annually. Doesn't apply to Part B-administered drugs.`,
    },
  });

  out.push(...coverageFrictionCandidates(answers, drugName));
  out.push(...assistanceCandidates(drug, drugName, { medicare: true }));

  return out;
}

function medicaidMoves(answers: Answers, drug: Drug | undefined, drugName: string | null): Candidate[] {
  const out: Candidate[] = [];

  out.push(...coverageFrictionCandidates(answers, drugName));

  const generic = genericSubstitutionCandidate(drug, drugName);
  if (generic) out.push(generic);

  out.push(prescriberAlternativeCandidate(drug, drugName, 20));

  out.push({
    weight: 25,
    move: {
      title: "Confirm this drug's coverage and tier with your Medicaid plan",
      why: "Medicaid cost-sharing is typically minimal or zero, so the real question here is usually coverage and formulary placement, not price. Confirming directly avoids surprises at the pharmacy counter.",
      effort: "today",
      potentialImpact: "medium",
      script: {
        channel: "phone",
        recipient: "your Medicaid plan's member services line",
        body: `Hi, I'd like to confirm coverage for ${drugName ?? "[DRUG NAME]"} under my plan: is it on the formulary, is a prior authorization required, and what would my cost-sharing be, if any?`,
        copyable: true,
      },
    },
  });

  return out;
}

function commercialMoves(answers: Answers, drug: Drug | undefined, drugName: string | null): Candidate[] {
  const out: Candidate[] = [];

  const generic = genericSubstitutionCandidate(drug, drugName);
  if (generic) out.push(generic);

  out.push(...coverageFrictionCandidates(answers, drugName));
  out.push(cashVsInsuranceCandidate(answers, drugName));

  const accumulator = accumulatorCandidate(answers, drugName);
  if (accumulator) out.push(accumulator);

  out.push(...assistanceCandidates(drug, drugName));

  return out;
}

function notSureInsuranceMoves(answers: Answers, drug: Drug | undefined, drugName: string | null): Candidate[] {
  const out: Candidate[] = [fallbackFindOutInsuranceType()];

  const generic = genericSubstitutionCandidate(drug, drugName);
  if (generic) out.push(generic);

  out.push(...coverageFrictionCandidates(answers, drugName));
  out.push(cashVsInsuranceCandidate(answers, drugName));
  out.push(...assistanceCandidates(drug, drugName));

  return out;
}

export function getMoves(answers: Answers): Move[] {
  const drug = resolveDrug(answers);
  const drugName = resolveDrugName(answers, drug);

  const candidates: Candidate[] = [];

  const unknown = unknownDrugCandidate(answers);
  if (unknown) candidates.push(unknown);

  switch (answers.insuranceType) {
    case "none":
      candidates.push(...noInsuranceMoves(drug, drugName));
      break;
    case "medicare":
      candidates.push(...medicareMoves(answers, drug, drugName));
      break;
    case "medicaid":
      candidates.push(...medicaidMoves(answers, drug, drugName));
      break;
    case "employer":
    case "marketplace":
      candidates.push(...commercialMoves(answers, drug, drugName));
      break;
    case "not_sure":
    case null:
    default:
      candidates.push(...notSureInsuranceMoves(answers, drug, drugName));
      break;
  }

  candidates.sort((a, b) => a.weight - b.weight);

  const trimmed = candidates.slice(0, MAX_MOVES);

  if (trimmed.length < 2) {
    trimmed.push(fallbackFindOutInsuranceType());
  }

  return trimmed.map((c, i) => ({ ...c.move, rank: i + 1 }));
}
