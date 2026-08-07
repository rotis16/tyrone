# Lab Intelligence

Turns a lab report (PDF or phone photo) into plain-English explanations of
each biomarker, and tracks every value over time so trends are visible
instead of isolated snapshots. That longitudinal view is the entire product —
most people get a lab report, see a wall of acronyms, and never see what
their own numbers have done over five years.

No clinicians, no diagnosis, no treatment advice, no urgency detection.
These are hard architectural requirements, not preferences.

## The core architectural decision: the AI extracts, it does not interpret

A language model is never allowed to freely generate a medical explanation
from a lab value. Three layers:

1. **Extraction (AI)** — `app/api/extract/route.ts` sends the document to the
   Anthropic API under a strict JSON schema and a system prompt that forbids
   interpreting, flagging, or commenting on anything. It transcribes what is
   printed. That's a data problem, not a medical one.
2. **Content (curated)** — `data/biomarkerContent.ts` is a static, versioned,
   cited library: what each marker measures, why it's ordered, what's known
   to move it, questions to ask a doctor.
3. **Assembly (constrained)** — the UI composes only from that library plus
   the user's own numbers. A biomarker with no library entry shows its value
   and trend with **no explanation** rather than improvising one.

If the model can generate a sentence about a person's health that no human
wrote and reviewed, the architecture is wrong.

## Privacy: local-first, by construction

Saved results live in this browser's IndexedDB (`lib/db.ts`). There is no
server database, no account, and no sync — health data can't leak from a
server that was never given it.

The one thing that does leave the device is an uploaded file, at the moment
you upload it: it goes to the extraction API and is discarded. The route
stores nothing — no disk write, no logging of document content. Uploading is
also optional; manual entry works fully without it, and without an API key.
Retaining the original file on-device is opt-in and defaults to off.

Trade-off, stated plainly: no cross-device sync, and clearing browser storage
deletes everything. Settings has a JSON export for backup, plus per-report
and delete-everything controls that really delete.

## What's built

| Area | Where |
|---|---|
| Data model, unit conversion (linear + affine) | `lib/types.ts`, `lib/units.ts` |
| Content library, 37 markers (thyroid, CBC, CMP, lipids, HbA1c, vitamins, iron) | `data/biomarkerContent.ts` |
| Label → biomarker alias matching | `lib/aliases.ts` |
| Extraction schema + prompt | `lib/extractionSchema.ts` |
| Extraction endpoint (holds the API key; stores nothing) | `app/api/extract/route.ts` |
| Draft rows, warnings, unit-safety rules | `lib/intake.ts` |
| Local-first storage, export, deletion | `lib/db.ts` |
| Upload → extract → confirm → save | `app/add/page.tsx` |
| Overview, biomarker detail, chart | `components/` |
| Export / delete / report management | `app/settings/page.tsx` |

Roughly 6,200 tests, most of them an adversarial scan of every content field
against six categories of forbidden output (diagnosis naming, treatment or
dosage advice, urgency language, risk scoring, normal/abnormal verdicts,
reassurance). It has caught real violations during authoring, not just
passed.

## Design rules that are enforced in code, not just prose

- **Two data points is not a trend.** `shouldDrawTrendLine()` requires 3+
  results; below that the chart plots unconnected dots and says why.
- **Never substitute a reference range.** Only the range that user's own lab
  printed is ever shown. If none was printed, none is shown.
- **Never silently convert an ambiguous unit.** `normalizeValue()` returns
  null rather than guessing when a unit isn't one this app recognizes for
  that biomarker.
- **Never fuzzy-match a label.** `matchBiomarkerKey()` is exact-after-
  normalization only — mapping "Free T3" onto free_t4 would chart a value
  against the wrong history.
- **No "normal"/"abnormal" verdict.** The phrasing is "within/outside the
  range this lab used."
- **Nothing saves without human confirmation.** The confirmation screen is
  not skippable; a misread decimal point is the worst failure this app can
  produce.

## Read this before trusting the content library

Every entry's `reviewStatus` is `"ai_drafted_sourced"`, not
`"clinician_reviewed"`. These were researched against the cited sources
(mostly MedlinePlus and Mayo Clinic) and written to the content rules above,
but **no clinician has reviewed them.** Don't flip that field until that has
actually happened.

## Configuration

Automatic extraction needs `ANTHROPIC_API_KEY` set on the server. Without it,
the app stays fully usable — the upload path returns a clear message and
routes you to manual entry.

```bash
npm install
npm test          # units, aliases, intake rules, adversarial content scan
npm run dev
npm run build
```
