import type { BillAge, InsuranceStatus } from "./types";

export type Answers = {
  hospitalId: string | null;
  householdSize: number | null;
  incomeRangeId: string | null;
  insuranceStatus: InsuranceStatus | null;
  billAmountRangeId: string | null;
  billAge: BillAge | null;
};

export const EMPTY_ANSWERS: Answers = {
  hospitalId: null,
  householdSize: null,
  incomeRangeId: null,
  insuranceStatus: null,
  billAmountRangeId: null,
  billAge: null,
};
