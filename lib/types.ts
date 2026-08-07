/**
 * Core data model. Follows the schema in the build spec closely, typed for
 * TypeScript. See lib/units.ts for the conversion machinery and
 * data/biomarkers.ts for the canonical biomarker keys.
 */

export type LabReport = {
  id: string;
  sourceFilename: string;
  /** Date of the blood draw, NOT the upload date. */
  collectionDate: string; // ISO date
  labName: string | null;
  orderingProvider: string | null;
  /** Aggregate extraction confidence for the whole report, 0-1. */
  extractionConfidence: number;
  /** False until the user has reviewed and confirmed every extracted value. */
  userConfirmed: boolean;
  createdAt: string; // ISO datetime
};

export type BiomarkerResult = {
  id: string;
  reportId: string;
  /** Canonical internal key, e.g. "tsh". Null if unmatched against the alias table. */
  biomarkerKey: string | null;
  /** Exactly as printed on the report. */
  rawLabel: string;
  value: number;
  /** As printed on the report. */
  unit: string;
  /** Converted to canonical unit. Null if the unit was ambiguous and not yet confirmed. */
  normalizedValue: number | null;
  normalizedUnit: string | null;
  /** As printed by this specific lab. Never a universal/substituted range. */
  referenceLow: number | null;
  referenceHigh: number | null;
  /** H / L / etc., only if the lab itself printed a flag. Never inferred. */
  flagAsPrinted: string | null;
  extractionConfidence: number;
  userCorrected: boolean;
};

export type UnitConversion =
  | { kind: "linear"; scale: number } // siValue = conventionalValue * scale
  | { kind: "affine"; scale: number; offset: number }; // siValue = conventionalValue * scale + offset
  // affine exists because at least one real biomarker (HbA1c, NGSP % -> IFCC mmol/mol)
  // is NOT a pure multiplicative conversion. Modeling only "linear" would be wrong for it.

export type BiomarkerContent = {
  biomarkerKey: string;
  displayName: string;
  /** Every label variant seen in the wild, for alias matching during extraction. */
  aliases: string[];
  /** The unit conventionally reported in the US (what most American lab printouts use). */
  conventionalUnit: string;
  /** The SI/international unit. */
  siUnit: string;
  /** Conversion from conventionalUnit to siUnit. */
  unitConversion: UnitConversion;
  /** Plain English, 6th-grade reading level. What the test measures. */
  whatItMeasures: string;
  /** Why a clinician typically orders this test. */
  whyOrdered: string;
  /** Non-prescriptive: things known to affect the value. Never advice to change them. */
  whatMovesIt: string[];
  questionsForDoctor: string[];
  sources: { label: string; url: string }[];
  lastReviewed: string; // ISO date
  /**
   * Honesty field beyond the original spec: this content was researched and
   * drafted by an AI assistant against cited sources, not written and
   * reviewed by a clinician the way the spec calls for. Must stay
   * "ai_drafted_sourced" until an actual clinician reviews it.
   */
  reviewStatus: "ai_drafted_sourced" | "clinician_reviewed";
};
