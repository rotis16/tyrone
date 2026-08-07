"use client";

import { useState } from "react";
import { EMPTY_ANSWERS, type Answers } from "@/lib/types";
import QuestionShell from "./QuestionShell";
import OptionList, { type Option } from "./OptionList";
import DrugStep from "./steps/DrugStep";
import StateStep from "./steps/StateStep";

type StepId =
  | "drug"
  | "insuranceType"
  | "planFunding"
  | "state"
  | "deductibleStatus"
  | "willHitDeductible"
  | "copayCard"
  | "coverageFriction";

const INSURANCE_OPTIONS: Option<NonNullable<Answers["insuranceType"]>>[] = [
  { value: "employer", label: "Employer plan", description: "Coverage through a job — yours or a family member's." },
  { value: "marketplace", label: "Marketplace (ACA) plan", description: "Bought individually, often through healthcare.gov or a state exchange." },
  { value: "medicare", label: "Medicare", description: "Including Medicare Advantage or a standalone Part D drug plan." },
  { value: "medicaid", label: "Medicaid", description: "State-administered coverage, sometimes called by a state-specific name." },
  { value: "none", label: "No insurance", description: "" },
  { value: "not_sure", label: "Not sure", description: "We'll help you find out." },
];

const PLAN_FUNDING_OPTIONS: Option<NonNullable<Answers["planFunding"]>>[] = [
  { value: "self_funded", label: "Self-funded", description: "Employer pays claims directly and rents the insurer's network." },
  { value: "fully_insured", label: "Fully insured", description: "The insurance company itself bears the financial risk." },
  { value: "not_sure", label: "Not sure", description: "Most large employers are self-funded — if in doubt, pick this." },
];

const DEDUCTIBLE_OPTIONS: Option<NonNullable<Answers["deductibleStatus"]>>[] = [
  { value: "met", label: "Already met it" },
  { value: "more_than_half", label: "More than half way" },
  { value: "barely_started", label: "Barely started" },
  { value: "no_deductible", label: "No deductible on my plan" },
  { value: "not_sure", label: "Not sure" },
];

const WILL_HIT_OPTIONS: Option<NonNullable<Answers["willHitDeductible"]>>[] = [
  { value: "yes_ongoing", label: "Yes, I have ongoing costs", description: "Other medical expenses expected this year." },
  { value: "probably_not", label: "Probably not", description: "This prescription is my main expense." },
  { value: "not_sure", label: "Not sure" },
];

const COPAY_CARD_OPTIONS: Option<NonNullable<Answers["copayCard"]>>[] = [
  { value: "using", label: "Yes, currently using one", description: "A manufacturer copay card or savings card." },
  { value: "not_using", label: "No, not using one" },
  { value: "didnt_know", label: "I didn't know that existed" },
];

const FRICTION_OPTIONS: Option<NonNullable<Answers["coverageFriction"]>>[] = [
  { value: "denied", label: "Denied", description: "Insurance refused to cover it." },
  { value: "prior_auth", label: "Told I need prior authorization" },
  { value: "step_therapy", label: "Told to try a different drug first", description: "Step therapy." },
  { value: "none", label: "None of these" },
  { value: "not_sure", label: "Not sure" },
];

function nextStepFor(step: StepId, answers: Answers): StepId | "results" {
  switch (step) {
    case "drug":
      return "insuranceType";
    case "insuranceType":
      return answers.insuranceType === "employer" ? "planFunding" : "state";
    case "planFunding":
      return "state";
    case "state":
      return "deductibleStatus";
    case "deductibleStatus":
      return "willHitDeductible";
    case "willHitDeductible":
      return "copayCard";
    case "copayCard":
      return "coverageFriction";
    case "coverageFriction":
      return "results";
  }
}

function totalSteps(answers: Answers) {
  return answers.insuranceType === "employer" ? 8 : 7;
}

export default function Intake({ onComplete }: { onComplete: (answers: Answers) => void }) {
  const [answers, setAnswers] = useState<Answers>(EMPTY_ANSWERS);
  const [step, setStep] = useState<StepId>("drug");
  const [history, setHistory] = useState<StepId[]>([]);

  function advance(patch: Partial<Answers>) {
    const merged = { ...answers, ...patch };
    setAnswers(merged);
    const next = nextStepFor(step, merged);
    if (next === "results") {
      onComplete(merged);
      return;
    }
    setHistory((h) => [...h, step]);
    setStep(next);
  }

  function back() {
    setHistory((h) => {
      if (h.length === 0) return h;
      setStep(h[h.length - 1]);
      return h.slice(0, -1);
    });
  }

  const stepNumber = history.length + 1;
  const total = totalSteps(answers);
  const showBack = history.length > 0;

  if (step === "drug") {
    return (
      <QuestionShell step={stepNumber} total={total} title="What prescription are you trying to afford?">
        <DrugStep
          initialQuery={answers.drugQuery}
          onContinue={({ drugId, drugQuery, drugUnknown }) =>
            advance({ drugId, drugQuery, drugUnknown })
          }
        />
      </QuestionShell>
    );
  }

  if (step === "insuranceType") {
    return (
      <QuestionShell
        step={stepNumber}
        total={total}
        title="What kind of insurance do you have?"
        onBack={showBack ? back : undefined}
      >
        <OptionList
          options={INSURANCE_OPTIONS}
          selected={answers.insuranceType}
          onSelect={(v) => advance({ insuranceType: v, planFunding: v === "employer" ? answers.planFunding : null })}
        />
      </QuestionShell>
    );
  }

  if (step === "planFunding") {
    return (
      <QuestionShell
        step={stepNumber}
        total={total}
        title="Is your employer's plan self-funded or fully insured?"
        subtitle="Self-funded means your employer pays claims directly and just rents the insurer's network. Most large employers are self-funded. If you don't know, pick Not sure."
        onBack={showBack ? back : undefined}
      >
        <OptionList
          options={PLAN_FUNDING_OPTIONS}
          selected={answers.planFunding}
          onSelect={(v) => advance({ planFunding: v })}
        />
      </QuestionShell>
    );
  }

  if (step === "state") {
    return (
      <QuestionShell step={stepNumber} total={total} title="What state are you in?" onBack={showBack ? back : undefined}>
        <StateStep value={answers.state} onSelect={(code) => advance({ state: code })} />
      </QuestionShell>
    );
  }

  if (step === "deductibleStatus") {
    return (
      <QuestionShell
        step={stepNumber}
        total={total}
        title="Where do you stand on your deductible?"
        onBack={showBack ? back : undefined}
      >
        <OptionList
          options={DEDUCTIBLE_OPTIONS}
          selected={answers.deductibleStatus}
          onSelect={(v) => advance({ deductibleStatus: v })}
        />
      </QuestionShell>
    );
  }

  if (step === "willHitDeductible") {
    return (
      <QuestionShell
        step={stepNumber}
        total={total}
        title="Will you likely hit your deductible this year?"
        onBack={showBack ? back : undefined}
      >
        <OptionList
          options={WILL_HIT_OPTIONS}
          selected={answers.willHitDeductible}
          onSelect={(v) => advance({ willHitDeductible: v })}
        />
      </QuestionShell>
    );
  }

  if (step === "copayCard") {
    return (
      <QuestionShell
        step={stepNumber}
        total={total}
        title="Are you using a manufacturer copay card?"
        subtitle="Sometimes called a savings card or coupon, offered directly by the drug's manufacturer."
        onBack={showBack ? back : undefined}
      >
        <OptionList
          options={COPAY_CARD_OPTIONS}
          selected={answers.copayCard}
          onSelect={(v) => advance({ copayCard: v })}
        />
      </QuestionShell>
    );
  }

  // coverageFriction
  return (
    <QuestionShell
      step={stepNumber}
      total={total}
      title="Have you run into any coverage friction?"
      onBack={showBack ? back : undefined}
    >
      <OptionList
        options={FRICTION_OPTIONS}
        selected={answers.coverageFriction}
        onSelect={(v) => advance({ coverageFriction: v })}
      />
    </QuestionShell>
  );
}
