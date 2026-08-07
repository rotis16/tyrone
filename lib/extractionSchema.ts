/**
 * The contract between the extraction model and the app.
 *
 * This is the *extraction* layer of the three-layer architecture: it turns a
 * document into typed records. It is a data problem. The model is never asked
 * what a value means, whether it's concerning, or what to do about it — only
 * what is printed on the page.
 */

export type ExtractedResult = {
  /** Exactly as printed on the report, before any alias matching. */
  rawLabel: string;
  value: number;
  /** As printed. Never normalized by the model. */
  unit: string | null;
  /** As printed by this lab. Never a universal or substituted range. */
  referenceLow: number | null;
  referenceHigh: number | null;
  /** Only if the lab itself printed one (H, L, etc.). Never inferred by the model. */
  flagAsPrinted: string | null;
  /** 0-1. Low values drive the highlight on the confirmation screen. */
  confidence: number;
};

export type ExtractionResponse = {
  collectionDate: string | null;
  labName: string | null;
  orderingProvider: string | null;
  results: ExtractedResult[];
};

const nullableString = { anyOf: [{ type: "string" }, { type: "null" }] };
const nullableNumber = { anyOf: [{ type: "number" }, { type: "null" }] };

/**
 * Strict JSON schema. Structured outputs reject unsupported keywords, so:
 * no minLength/maxLength, no numeric bounds, additionalProperties: false on
 * every object, and every property listed in `required` (nullability is
 * expressed via anyOf, not by omitting the key).
 */
export const EXTRACTION_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["collectionDate", "labName", "orderingProvider", "results"],
  properties: {
    collectionDate: {
      ...nullableString,
      description:
        "The date the blood was drawn (the collection or specimen date), as YYYY-MM-DD. NOT the report/print date if they differ and both are shown. Null if not legible.",
    },
    labName: {
      ...nullableString,
      description: "The laboratory that ran the test, e.g. Quest Diagnostics, LabCorp. Null if not legible.",
    },
    orderingProvider: {
      ...nullableString,
      description: "The ordering clinician's name if printed. Null if absent or not legible.",
    },
    results: {
      type: "array",
      description: "One entry per biomarker row printed on the report.",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["rawLabel", "value", "unit", "referenceLow", "referenceHigh", "flagAsPrinted", "confidence"],
        properties: {
          rawLabel: {
            type: "string",
            description: "The test name exactly as printed on the report. Do not expand abbreviations or rename.",
          },
          value: { type: "number", description: "The numeric result exactly as printed." },
          unit: { ...nullableString, description: "The unit exactly as printed. Do not convert. Null if none printed." },
          referenceLow: {
            ...nullableNumber,
            description:
              "The lower bound of the reference range THIS LAB printed for this row. Null if no range is printed, or if the range is one-sided.",
          },
          referenceHigh: {
            ...nullableNumber,
            description:
              "The upper bound of the reference range THIS LAB printed for this row. Null if no range is printed, or if the range is one-sided.",
          },
          flagAsPrinted: {
            ...nullableString,
            description:
              "The flag the lab itself printed next to this row (e.g. H, L, HIGH, LOW, A). Null if the lab printed no flag. Never infer a flag by comparing the value to the range.",
          },
          confidence: {
            type: "number",
            description:
              "Your confidence that every field in this row was read correctly, from 0 to 1. Use a low value for blurry, cut-off, or ambiguous rows so the person is prompted to check them.",
          },
        },
      },
    },
  },
} as const;

export const EXTRACTION_SYSTEM_PROMPT = `You transcribe laboratory reports into structured data. You are an extraction tool, not a medical interpreter.

Transcribe only what is printed on the document. Specifically:

- Copy each test name exactly as printed. Do not expand abbreviations, rename tests, or map them to standard names — a separate system does that.
- Copy values and units exactly as printed. Never convert units.
- Copy each row's reference range exactly as that lab printed it. Never substitute a range you know from elsewhere; if no range is printed for a row, use null.
- Copy a high/low flag only if the lab printed one. Never derive a flag by comparing a value to a range.
- Use the collection or specimen date (when the blood was drawn), not the report print date, when the document shows both.
- Return null for any field you cannot read with confidence. Never guess a digit, a decimal point, or a date.
- Set a low confidence score on any row that is blurry, cut off, handwritten, or otherwise uncertain, so the person is prompted to verify it.

Do not comment on, interpret, summarize, or assess any result. Do not note whether a value is inside or outside its range. Return the structured data only.`;
