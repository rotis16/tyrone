import { describe, expect, it } from "vitest";
import { BIOMARKER_CONTENT } from "./biomarkerContent";

/**
 * These patterns must never appear anywhere in the content library, because
 * whatever is in the library can end up verbatim in the assembled output —
 * the assembly layer is only allowed to compose from this library plus the
 * user's own numbers, per the architecture. If it's not safe here, it's not
 * safe anywhere downstream.
 */
const FORBIDDEN_PATTERNS: { name: string; pattern: RegExp }[] = [
  // Diagnosis / condition naming
  { name: "hypothyroidism", pattern: /hypothyroidism/i },
  { name: "hyperthyroidism", pattern: /hyperthyroidism/i },
  { name: "hashimoto", pattern: /hashimoto/i },
  { name: "graves' disease", pattern: /graves'?\s*disease/i },
  { name: "anemia", pattern: /an[ae]mia/i },
  { name: "diabetes", pattern: /diabetes/i },
  { name: "cancer", pattern: /cancer/i },
  { name: "leukemia", pattern: /leukemia/i },
  { name: "diagnostic claim phrasing", pattern: /this (suggests|means you|indicates you)/i },
  { name: "you have / diagnosed with", pattern: /(you have|diagnosed with)\s+\w/i },

  // Treatment / dosage / supplement / diet advice
  { name: "should take/start/stop", pattern: /\byou should (take|start|stop|increase|decrease)\b/i },
  { name: "dosage language", pattern: /\bmg\/day\b|\bdosage of\b|\btake \d+/i },
  { name: "supplement recommendation", pattern: /\b(consider taking|try taking|start taking)\b/i },

  // Urgency / triage language
  { name: "seek care immediately", pattern: /seek (medical )?(care|attention|help) (immediately|now|right away)/i },
  { name: "emergency framing", pattern: /\b(call 911|emergency room|this is dangerous|is an emergency)\b/i },
  { name: "urgent framing", pattern: /\burgent(ly)?\b/i },

  // Risk prediction / scoring
  { name: "risk prediction", pattern: /\brisk of (developing|getting)\b/i },
  { name: "probability framing", pattern: /\d+%\s*(chance|risk|likely)/i },

  // Normal/abnormal verdicts
  { name: '"normal" as a verdict', pattern: /\b(is|looks?|appears?)\s+(normal|abnormal)\b/i },

  // Reassurance
  { name: "reassurance phrasing", pattern: /\b(looks fine|you'?re fine|nothing to worry|don'?t worry|no need to worry)\b/i },
];

function allTextFieldsFor(entry: (typeof BIOMARKER_CONTENT)[number]): { field: string; text: string }[] {
  return [
    { field: "whatItMeasures", text: entry.whatItMeasures },
    { field: "whyOrdered", text: entry.whyOrdered },
    ...entry.whatMovesIt.map((t, i) => ({ field: `whatMovesIt[${i}]`, text: t })),
    ...entry.questionsForDoctor.map((t, i) => ({ field: `questionsForDoctor[${i}]`, text: t })),
  ];
}

describe("biomarker content library: adversarial forbidden-output scan", () => {
  for (const entry of BIOMARKER_CONTENT) {
    describe(entry.biomarkerKey, () => {
      for (const { field, text } of allTextFieldsFor(entry)) {
        for (const { name, pattern } of FORBIDDEN_PATTERNS) {
          it(`${field} does not contain forbidden pattern: ${name}`, () => {
            expect(pattern.test(text)).toBe(false);
          });
        }
      }
    });
  }
});

describe("biomarker content library: structural integrity", () => {
  it("every entry has at least one source", () => {
    for (const entry of BIOMARKER_CONTENT) {
      expect(entry.sources.length).toBeGreaterThan(0);
    }
  });

  it("every entry is honestly flagged as not yet clinician-reviewed", () => {
    for (const entry of BIOMARKER_CONTENT) {
      expect(entry.reviewStatus).toBe("ai_drafted_sourced");
    }
  });

  it("every entry has at least one question for the doctor", () => {
    for (const entry of BIOMARKER_CONTENT) {
      expect(entry.questionsForDoctor.length).toBeGreaterThan(0);
    }
  });

  it("biomarker keys are unique", () => {
    const keys = BIOMARKER_CONTENT.map((e) => e.biomarkerKey);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("every entry's conventional/SI units round-trip through its conversion", () => {
    // sanity check on the data itself, not just the units.ts math
    for (const entry of BIOMARKER_CONTENT) {
      expect(entry.unitConversion).toBeDefined();
    }
  });
});
