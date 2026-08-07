# Financial Help for Your Hospital Bill

A deterministic screener that tells patients what hospital financial assistance
they likely qualify for — and exactly what to do next. Michigan only, for now.

Every nonprofit hospital in the U.S. is required by federal law (IRC §501(r))
to have a written Financial Assistance Policy. Most patients are never told it
exists — research puts the share of eligible patients who actually receive
assistance at roughly 29%, largely because about half are never informed.
This closes that gap: answer a few questions, get a ranked, personalized
action plan with copy-ready scripts.

This is not a chatbot. It's a plain deterministic screener — the value is
precision and specificity, not conversation.

## Privacy by construction

No answer ever leaves the browser. There's no backend, no accounts, no
storage, no analytics beyond page views. Everything — the eligibility
calculation, the script generation — runs as pure client-side functions.

## Stack

Vanilla TypeScript, hand-written CSS, no framework — bundled with esbuild to
keep the whole app under a 100KB budget (currently ~28KB total), because the
person using this is assumed to be on an older phone on a slow connection.
[Vitest](https://vitest.dev) for the screening-logic test suite.

## Project structure

```
index.html              Page shell
src/styles.css           Hand-written CSS, WCAG AA, mobile-first
src/app/main.ts            Vanilla DOM app: intake flow + results rendering
src/app/dom.ts               Minimal element-building helper
src/data/fpl.ts              2026 HHS Federal Poverty Guidelines
src/data/hospitals.ts        Michigan hospital financial assistance data
src/data/types.ts            Shared types (Hospital, IncomeRange, etc.)
src/data/incomeRanges.ts     Income bands used in the intake
src/data/billAmounts.ts      Bill-amount bands used in the intake
src/data/answers.ts          Answers shape for the intake flow
src/lib/screening.ts         Pure eligibility screening logic (tested)
src/lib/results.ts           Builds the ranked action plan from a screening result
src/lib/scripts.ts           Phone / email script generators
scripts/build.mjs            esbuild bundler, warns if over the 100KB budget
```

## The screening logic

`screenHousehold()` in `src/lib/screening.ts` takes a household size, an
income *range* (not an exact figure — asking for an exact number adds
friction and shame with no real benefit here), and a hospital's published
discount tiers, and returns one of four verdicts:

- **likely** — qualifies even at the top of the stated income range
- **possible** — qualifies only at the bottom of the range; still worth
  applying, since applying is free
- **unlikely** — doesn't qualify under the hospital's stated tiers (never a
  dead end — routes to FQHCs, payment plans, and self-pay discounts instead)
- **unknown** — this hospital's policy isn't in the dataset yet

`buildActionPlan()` in `src/lib/results.ts` turns that verdict into a ranked
list of action cards: the primary verdict, always-on secondary moves
(request an itemized bill, don't pay until the application is decided, ask
about the Medicare-rate benchmark if uninsured), and the never-a-dead-end
fallback when the household doesn't qualify.

Run the tests:

```bash
npm install
npm test
```

## Data you should re-verify before relying on this

Every hospital record carries a `dataConfidence` field — `secondary_source_reported`
vs. `primary_source_confirmed` — because this sandbox has no external network
access to fetch and read a hospital's actual FAP PDF directly. Every number
currently in `src/data/hospitals.ts` was pulled through search-engine
summaries of secondary sources, not read off the primary document by this
tool. `lastVerified` is `null` on all of them until a human (or a tool with
real fetch access) confirms each figure against the hospital's own published
policy — the app is built to say so honestly rather than pretend otherwise.

Two things worth double-checking specifically:

- University of Michigan Health's tier numbers came from two sources that
  disagreed (200% vs. 300% FPL) — flagged in that record's `notes` field,
  not yet resolved.
- The federal 501(r) Financial Assistance Policy requirement applies to
  **nonprofit hospitals only**. Michigan's own rate cap (MCL 400.105d — 115%
  of the Medicare rate for uninsured patients at/below 250% FPL) is broader,
  since it's tied to Medicaid participation rather than tax status, but it's
  a weaker guarantee than a full financial assistance policy. The app's copy
  branches on a hospital's `isNonprofit` field to stay accurate about this.

Also worth verifying independently: the 2026 HHS Federal Poverty Guidelines
in `src/data/fpl.ts` (pulled the same way, via search rather than a direct
fetch of aspe.hhs.gov).

## Non-goals for v1

No user accounts or saved history, no insurance-claim appeals, no payments,
no native apps, no AI-generated eligibility determinations — this is a
deterministic screener on purpose.

## Getting started

```bash
npm install
npm run build   # bundles src/app/main.ts -> dist/app.js, warns if over 100KB
npm run dev      # serves the app locally at http://localhost:4300
npm test          # screening + results logic, vitest
```
