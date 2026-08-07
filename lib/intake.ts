import { findBiomarkerContent } from "@/data/biomarkerContent";
import { isKnownUnit, matchBiomarkerKey, normalizeUnit } from "./aliases";
import type { ExtractedResult, ExtractionResponse } from "./extractionSchema";
import { toSI } from "./units";

/**
 * A row on the confirmation screen: what was extracted, what we matched it to,
 * and every reason the user might need to look closely at it.
 *
 * Nothing here is saved until the user confirms. That step is not optional —
 * a misread decimal point is the worst failure this app can produce.
 */
export type DraftRow = {
  id: string;
  rawLabel: string;
  /** Null when the label didn't match the alias table — value is still kept and charted, just unexplained. */
  biomarkerKey: string | null;
  value: number;
  unit: string | null;
  referenceLow: number | null;
  referenceHigh: number | null;
  flagAsPrinted: string | null;
  extractionConfidence: number;
  /** Reasons this row is highlighted for review. Empty means nothing flagged. */
  warnings: DraftWarning[];
  /** True once the user edits the row. */
  userCorrected: boolean;
  /** Rows the user unchecks are dropped rather than saved. */
  include: boolean;
};

export type DraftWarning =
  | "low_confidence"
  | "unmatched_label"
  | "ambiguous_unit"
  | "missing_unit"
  | "no_reference_range"
  | "implausible_value";

export const LOW_CONFIDENCE_THRESHOLD = 0.85;

export const WARNING_TEXT: Record<DraftWarning, string> = {
  low_confidence: "This row was hard to read — check it against your report.",
  unmatched_label: "We don't recognize this test name yet. It'll still be saved and charted, just without an explanation.",
  ambiguous_unit: "This unit isn't one we recognize for this test, so we won't convert it. Check it's right.",
  missing_unit: "No unit was printed or read for this row.",
  no_reference_range: "No reference range was printed for this row, so none will be shown.",
  implausible_value: "This value looks unusual for this test — a misplaced decimal point is worth ruling out.",
};

/**
 * Sanity bounds used ONLY to flag a possible transcription error (a slipped
 * decimal point). These are deliberately extremely wide — far wider than any
 * clinical range — because this is a data-entry check, not a medical one.
 * Being outside a clinical range is normal and must never be flagged here.
 */
const PLAUSIBILITY_BOUNDS: Record<string, { min: number; max: number }> = {
  tsh: { min: 0, max: 1000 },
  free_t4: { min: 0, max: 100 },
  free_t3: { min: 0, max: 100 },
  hemoglobin: { min: 1, max: 30 },
  hematocrit: { min: 3, max: 90 },
  wbc: { min: 0, max: 500 },
  rbc: { min: 0.5, max: 15 },
  platelets: { min: 1, max: 3000 },
  mcv: { min: 30, max: 200 },
  glucose_fasting: { min: 5, max: 2000 },
  creatinine: { min: 0.05, max: 30 },
  sodium: { min: 80, max: 200 },
  potassium: { min: 1, max: 15 },
  hba1c: { min: 2, max: 25 },
  total_cholesterol: { min: 20, max: 1500 },
  ldl: { min: 0, max: 1000 },
  hdl: { min: 1, max: 300 },
  triglycerides: { min: 5, max: 10000 },
  vitamin_d: { min: 0, max: 500 },
  vitamin_b12: { min: 10, max: 20000 },
  ferritin: { min: 0, max: 20000 },
};

export function computeWarnings(row: {
  biomarkerKey: string | null;
  value: number;
  unit: string | null;
  referenceLow: number | null;
  referenceHigh: number | null;
  extractionConfidence: number;
}): DraftWarning[] {
  const warnings: DraftWarning[] = [];

  if (row.extractionConfidence < LOW_CONFIDENCE_THRESHOLD) warnings.push("low_confidence");
  if (row.biomarkerKey === null) warnings.push("unmatched_label");

  if (!row.unit) {
    warnings.push("missing_unit");
  } else if (row.biomarkerKey && !isKnownUnit(row.biomarkerKey, row.unit)) {
    warnings.push("ambiguous_unit");
  }

  if (row.referenceLow === null || row.referenceHigh === null) warnings.push("no_reference_range");

  if (row.biomarkerKey) {
    const bounds = PLAUSIBILITY_BOUNDS[row.biomarkerKey];
    if (bounds && (row.value < bounds.min || row.value > bounds.max)) {
      warnings.push("implausible_value");
    }
  }

  return warnings;
}

/**
 * Converts a value to its canonical unit — but ONLY when the unit is one we
 * recognize for that biomarker. An unrecognized unit returns null rather than
 * a converted number: silently converting an ambiguous unit is exactly the
 * failure mode the spec forbids.
 */
export function normalizeValue(
  biomarkerKey: string | null,
  value: number,
  unit: string | null
): { normalizedValue: number | null; normalizedUnit: string | null } {
  if (!biomarkerKey || !unit) return { normalizedValue: null, normalizedUnit: null };
  const content = findBiomarkerContent(biomarkerKey);
  if (!content) return { normalizedValue: null, normalizedUnit: null };
  if (!isKnownUnit(biomarkerKey, unit)) return { normalizedValue: null, normalizedUnit: null };

  // Already in the SI/canonical unit — nothing to convert.
  if (normalizeUnit(unit) === normalizeUnit(content.siUnit)) {
    return { normalizedValue: value, normalizedUnit: content.siUnit };
  }
  return { normalizedValue: toSI(value, content.unitConversion), normalizedUnit: content.siUnit };
}

let draftCounter = 0;
function draftId(): string {
  draftCounter += 1;
  return `draft_${draftCounter}_${Math.random().toString(36).slice(2, 8)}`;
}

export function toDraftRow(extracted: ExtractedResult): DraftRow {
  const biomarkerKey = matchBiomarkerKey(extracted.rawLabel);
  const base = {
    biomarkerKey,
    value: extracted.value,
    unit: extracted.unit,
    referenceLow: extracted.referenceLow,
    referenceHigh: extracted.referenceHigh,
    extractionConfidence: extracted.confidence,
  };
  return {
    id: draftId(),
    rawLabel: extracted.rawLabel,
    flagAsPrinted: extracted.flagAsPrinted,
    userCorrected: false,
    include: true,
    warnings: computeWarnings(base),
    ...base,
  };
}

export function toDraftRows(response: ExtractionResponse): DraftRow[] {
  return response.results.map(toDraftRow);
}

export function emptyDraftRow(): DraftRow {
  return {
    id: draftId(),
    rawLabel: "",
    biomarkerKey: null,
    value: 0,
    unit: null,
    referenceLow: null,
    referenceHigh: null,
    flagAsPrinted: null,
    extractionConfidence: 1, // hand-entered: no OCR uncertainty to represent
    warnings: [],
    userCorrected: true,
    include: true,
  };
}

/** Re-derives matching and warnings after a user edit. */
export function refreshDraftRow(row: DraftRow): DraftRow {
  const biomarkerKey = matchBiomarkerKey(row.rawLabel);
  const next = { ...row, biomarkerKey, userCorrected: true };
  return { ...next, warnings: computeWarnings(next) };
}

export function aggregateConfidence(rows: DraftRow[]): number {
  const included = rows.filter((r) => r.include);
  if (included.length === 0) return 1;
  return included.reduce((sum, r) => sum + r.extractionConfidence, 0) / included.length;
}
