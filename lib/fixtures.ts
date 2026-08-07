import type { BiomarkerResult, LabReport } from "./types";

/**
 * DEMO DATA — not real extraction output. Standing in for the extraction
 * pipeline (build order step 3, not yet built — see README) so the UI that
 * IS built (steps 4-6: detail view, charting, overview) has something real
 * to render against. Deliberately covers three different honest states:
 *  - TSH: 4 draws, same lab throughout -> a real trend line
 *  - Free T4: 2 draws, DIFFERENT labs with different printed ranges ->
 *    two dots, no line, and a reference-band change to render
 *  - Hemoglobin: 1 draw -> no chart at all, nothing to compare yet
 */

export const FIXTURE_REPORTS: LabReport[] = [
  {
    id: "r1",
    sourceFilename: "quest_2023.pdf",
    collectionDate: "2023-03-10",
    labName: "Quest Diagnostics",
    orderingProvider: "Dr. Alvarez",
    extractionConfidence: 0.97,
    userConfirmed: true,
    createdAt: "2023-03-12T00:00:00Z",
  },
  {
    id: "r2",
    sourceFilename: "quest_2024.pdf",
    collectionDate: "2024-04-02",
    labName: "Quest Diagnostics",
    orderingProvider: "Dr. Alvarez",
    extractionConfidence: 0.95,
    userConfirmed: true,
    createdAt: "2024-04-05T00:00:00Z",
  },
  {
    id: "r3",
    sourceFilename: "labcorp_2025.pdf",
    collectionDate: "2025-05-20",
    labName: "LabCorp",
    orderingProvider: "Dr. Chen",
    extractionConfidence: 0.91,
    userConfirmed: true,
    createdAt: "2025-05-22T00:00:00Z",
  },
  {
    id: "r4",
    sourceFilename: "labcorp_2026.jpg",
    collectionDate: "2026-06-15",
    labName: "LabCorp",
    orderingProvider: "Dr. Chen",
    extractionConfidence: 0.88,
    userConfirmed: true,
    createdAt: "2026-06-16T00:00:00Z",
  },
];

export const FIXTURE_RESULTS: BiomarkerResult[] = [
  // TSH - 4 points, same lab, same printed range throughout -> real trend
  { id: "b1", reportId: "r1", biomarkerKey: "tsh", rawLabel: "TSH", value: 1.8, unit: "µIU/mL", normalizedValue: 1.8, normalizedUnit: "mIU/L", referenceLow: 0.4, referenceHigh: 4.0, flagAsPrinted: null, extractionConfidence: 0.98, userCorrected: false },
  { id: "b2", reportId: "r2", biomarkerKey: "tsh", rawLabel: "TSH", value: 2.4, unit: "µIU/mL", normalizedValue: 2.4, normalizedUnit: "mIU/L", referenceLow: 0.4, referenceHigh: 4.0, flagAsPrinted: null, extractionConfidence: 0.97, userCorrected: false },
  { id: "b3", reportId: "r3", biomarkerKey: "tsh", rawLabel: "TSH", value: 3.6, unit: "µIU/mL", normalizedValue: 3.6, normalizedUnit: "mIU/L", referenceLow: 0.4, referenceHigh: 4.0, flagAsPrinted: null, extractionConfidence: 0.93, userCorrected: false },
  { id: "b4", reportId: "r4", biomarkerKey: "tsh", rawLabel: "TSH", value: 4.6, unit: "µIU/mL", normalizedValue: 4.6, normalizedUnit: "mIU/L", referenceLow: 0.45, referenceHigh: 4.5, flagAsPrinted: "H", extractionConfidence: 0.9, userCorrected: false },

  // Free T4 - 2 points, different labs, different printed ranges -> two dots, band change, no line
  { id: "b5", reportId: "r1", biomarkerKey: "free_t4", rawLabel: "T4, Free", value: 1.2, unit: "ng/dL", normalizedValue: 15.44, normalizedUnit: "pmol/L", referenceLow: 0.8, referenceHigh: 1.8, flagAsPrinted: null, extractionConfidence: 0.96, userCorrected: false },
  { id: "b6", reportId: "r4", biomarkerKey: "free_t4", rawLabel: "Free Thyroxine", value: 1.1, unit: "ng/dL", normalizedValue: 14.16, normalizedUnit: "pmol/L", referenceLow: 0.9, referenceHigh: 1.7, flagAsPrinted: null, extractionConfidence: 0.89, userCorrected: false },

  // Hemoglobin - 1 point -> no chart, nothing to compare yet
  { id: "b7", reportId: "r4", biomarkerKey: "hemoglobin", rawLabel: "Hemoglobin", value: 13.9, unit: "g/dL", normalizedValue: 139, normalizedUnit: "g/L", referenceLow: 12.0, referenceHigh: 15.5, flagAsPrinted: null, extractionConfidence: 0.92, userCorrected: false },
];

export function resultsFor(biomarkerKey: string): BiomarkerResult[] {
  return FIXTURE_RESULTS.filter((r) => r.biomarkerKey === biomarkerKey);
}

export function reportFor(reportId: string): LabReport | undefined {
  return FIXTURE_REPORTS.find((r) => r.id === reportId);
}
