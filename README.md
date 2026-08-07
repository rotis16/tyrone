# Lab Intelligence

Turns a lab report (PDF or phone photo) into plain-English explanations of
each biomarker, and tracks values over time so trends are visible instead of
isolated snapshots. That longitudinal view is the entire product — most
people get a lab report, see a wall of acronyms, and never see what their
own numbers have done over five years.

No clinicians, no diagnosis, no treatment advice, no urgency detection.
These are hard architectural requirements, not preferences — they're what
keeps this out of FDA medical device territory.

## The core architectural decision: the AI extracts, it does not interpret

A language model is never allowed to freely generate a medical explanation
from a lab value. The system is split into three layers:

1. **Extraction (AI):** OCR + structured parsing turns a document into typed
   records — biomarker name, value, unit, reference range, collection date.
   A data problem, not a medical one.
2. **Content (human/AI-drafted, must eventually be clinician-reviewed):** a
   curated library of explanations, one per biomarker — what it measures,
   why it's ordered, what's known to move it, questions to ask a doctor.
   Static, versioned, cited.
3. **Assembly (AI, tightly constrained):** composes the user-facing text
   using *only* the content library entry plus the user's own numbers. It
   may not introduce a medical claim that isn't already in the library. A
   biomarker with no library entry displays its value and trend with no
   explanation, rather than the model improvising one.

If the model can generate a sentence about a person's health that no human
wrote and reviewed, the architecture is wrong.

## What's built so far

- **`lib/types.ts`** — `LabReport`, `BiomarkerResult`, `BiomarkerContent`,
  and `UnitConversion` (supports both pure-multiplicative conversions and
  affine ones — HbA1c's NGSP-to-IFCC conversion is `% × 10.929 − 23.5`, not
  a pure scale, and modeling only linear conversions would silently get it
  wrong).
- **`lib/units.ts`** — `toSI` / `fromSI`, tested against real reference
  points (100 mg/dL glucose ≈ 5.55 mmol/L, 7.0% NGSP HbA1c ≈ 53 mmol/mol
  IFCC).
- **`data/biomarkerContent.ts`** — content library for the 10 starter
  biomarkers (TSH, Free T4, Free T3, TPO antibodies, WBC, RBC, hemoglobin,
  hematocrit, platelets, MCV), each with a plain-language explanation, why
  it's typically ordered, non-prescriptive factors known to move it,
  questions to bring to a doctor, and cited sources.
- **`data/biomarkerContent.test.ts`** — an adversarial scan across every
  content field for six categories of forbidden output (diagnosis/condition
  naming, treatment or dosage advice, urgency language, risk scoring,
  "normal"/"abnormal" verdicts, reassurance). It already caught and fixed
  two real violations while this was being written — this is the backstop
  the assembly layer will also need once it exists.

## Read this before trusting the content library

Every entry's `reviewStatus` is `"ai_drafted_sourced"`, not
`"clinician_reviewed"`. That's an honest distinction, not a formality: these
were researched against the cited sources (mostly MedlinePlus and Mayo
Clinic) and written to the same content rules the spec requires, but a
human clinician has not reviewed them the way the architecture calls for.
Don't flip that field until that's actually happened.

## What isn't built yet, and why

Steps 1–2 of the build order (data model, unit normalization, the first 10
biomarkers) don't need any external infrastructure — they're pure,
testable TypeScript, which is why they're what's here. Step 3 (the
extraction pipeline) is a different kind of problem: the spec requires
`"Extraction runs server-side; the client never holds API keys,"` which
means a real backend, a real OCR/LLM API with its own billing, and — for
the longitudinal tracking to survive across sessions — real accounts and a
real database. That's an infrastructure decision, not a coding one, and
it's not been made yet.

## Getting started

```bash
npm install
npm test          # unit conversion + content library adversarial suite
npm run build
npm run dev
```
