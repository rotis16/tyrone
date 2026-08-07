export type InsuranceType =
  | "employer"
  | "marketplace"
  | "medicare"
  | "medicaid"
  | "none"
  | "not_sure";

export type PlanFunding = "self_funded" | "fully_insured" | "not_sure";

export type DeductibleStatus =
  | "met"
  | "more_than_half"
  | "barely_started"
  | "no_deductible"
  | "not_sure";

export type WillHitDeductible = "yes_ongoing" | "probably_not" | "not_sure";

export type CopayCardStatus = "using" | "not_using" | "didnt_know";

export type CoverageFriction =
  | "denied"
  | "prior_auth"
  | "step_therapy"
  | "none"
  | "not_sure";

export type Answers = {
  drugQuery: string;
  drugId: string | null;
  drugUnknown: boolean;
  insuranceType: InsuranceType | null;
  planFunding: PlanFunding | null;
  state: string | null;
  deductibleStatus: DeductibleStatus | null;
  willHitDeductible: WillHitDeductible | null;
  copayCard: CopayCardStatus | null;
  coverageFriction: CoverageFriction | null;
};

export const EMPTY_ANSWERS: Answers = {
  drugQuery: "",
  drugId: null,
  drugUnknown: false,
  insuranceType: null,
  planFunding: null,
  state: null,
  deductibleStatus: null,
  willHitDeductible: null,
  copayCard: null,
  coverageFriction: null,
};

export type Effort = "today" | "this week" | "this month";
export type Impact = "high" | "medium" | "low";

export type ScriptChannel = "email" | "phone" | "in person" | "portal message";

export type Script = {
  channel: ScriptChannel;
  recipient: string;
  subject?: string;
  body: string;
  copyable: true;
};

export type Move = {
  rank: number;
  title: string;
  why: string;
  effort: Effort;
  potentialImpact: Impact;
  script?: Script;
  caveat?: string;
};
