export type BillAmountRange = {
  id: string;
  label: string;
  min: number;
  max: number | null;
};

export const BILL_AMOUNT_RANGES: BillAmountRange[] = [
  { id: "under_500", label: "Under $500", min: 0, max: 499 },
  { id: "500_2000", label: "$500 – $1,999", min: 500, max: 1999 },
  { id: "2000_5000", label: "$2,000 – $4,999", min: 2000, max: 4999 },
  { id: "5000_15000", label: "$5,000 – $14,999", min: 5000, max: 14999 },
  { id: "15000_50000", label: "$15,000 – $49,999", min: 15000, max: 49999 },
  { id: "over_50000", label: "$50,000 or more", min: 50000, max: null },
];

export function findBillAmountRange(id: string): BillAmountRange | undefined {
  return BILL_AMOUNT_RANGES.find((r) => r.id === id);
}
