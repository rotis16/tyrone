# Prescription Cost Triage

A single-page tool that helps someone figure out the cheapest legal way to pay for a
specific prescription, given their insurance situation — and tells them exactly what
to say to whom to make it happen.

It is not a price lookup tool. It doesn't fetch live prices. It's a decision engine
over benefit-design rules (deductibles, copay accumulators, prior authorization,
patient assistance programs) that produces a ranked, script-backed action plan.

## Privacy by construction

No health information ever leaves the browser. There is no backend, no database, no
accounts, and no analytics. All answers live in React state only, for the duration of
the page load — nothing is written to `localStorage`, cookies, or any network request.
This is enforced by the architecture, not a promise: the app has no server-side code
that could receive or store an answer, and the intake/rules/results pipeline
(`lib/rules.ts`) is pure client-side computation.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- No backend — deploy target is Vercel as a static/client app
- Rules and drug data live in typed files under `/data` and `/lib`
- [Vitest](https://vitest.dev) for the rules engine test suite

## Project structure

```
app/                Root layout + the single page (Intake ⇄ Results)
components/          Intake flow, move cards, script blocks, footer/disclaimer
lib/types.ts         Answers / Move / Script types
lib/rules.ts          Pure decision engine — the six gates, fully unit-tested
lib/scripts.ts        Copy-paste script templates (email/phone/portal message bodies)
data/drugs.ts          Seeded GLP-1 receptor agonist class drug data
data/policy.ts          Verified policy constants (state laws, Medicare figures, etc.)
data/states.ts           US state list
```

## The decision engine

`lib/rules.ts` exports a single pure function, `getMoves(answers: Answers): Move[]`,
that takes the 8-question answer set and returns a ranked list of 2–5 `Move` objects.
It implements six gates, in this order of evaluation (not necessarily final rank):

1. **Insurance type routing** — no insurance, Medicare, Medicaid, and
   employer/marketplace each follow materially different logic.
2. **Generic availability** — if a generic exists, that's almost always the
   top-ranked move.
3. **Cash vs. insurance** — the deductible math most people are never told:
   whether paying cash or running it through insurance actually saves more,
   based on deductible status and whether the user expects to hit it this year.
4. **Copay accumulator detection** — triggers on commercial insurance + copay
   card + brand drug, then branches on self-funded vs. fully insured vs.
   marketplace to give the right script (HR email vs. state-law citation vs.
   "this is contested," respectively).
5. **Coverage friction** — denials, prior authorization, and step therapy each
   get a distinct script, since step-therapy exceptions are a materially
   different (and often faster) path than a general appeal.
6. **Assistance layering** — manufacturer PAPs, charitable foundations, and
   340B, always evaluated, always ranked last since they're slow but high-value.

Run the test suite with:

```bash
npm test
```

## Data you should re-verify before relying on this

Every fact in `/data/policy.ts` and `/data/drugs.ts` carries a `lastVerified` date
and, where possible, a source comment — but this is exactly the kind of data that
goes stale:

- The list of states with anti-accumulator laws (`ANTI_ACCUMULATOR_STATES`) is a
  **conservative, non-exhaustive subset** verified against several 2026 trackers,
  not a complete legal reference. It also flags which states are confirmed to
  extend the ban to copay *maximizers* (most don't — this is a commonly missed
  distinction).
- Whether marketplace plans must count manufacturer copay assistance toward the
  out-of-pocket max is **not a settled 2027 rule** — a 2023 court ruling favored
  counting it, but federal enforcement since then has been inconsistent and a
  follow-up rule is still pending. `MARKETPLACE_ACCUMULATOR_RULE_STATUS` reflects
  this as contested, deliberately, rather than asserting a clean effective date.
- The Medicare Part D out-of-pocket cap (`MEDICARE_PART_D_OOP_CAP`) is adjusted
  annually — confirm the current plan year's figure before shipping.
- Manufacturer PAP income thresholds, copay card annual limits, and which
  charitable foundation funds are currently open all change frequently and are
  intentionally *not* hardcoded as numbers — the app tells users to ask, rather
  than asserting a number that may already be wrong.

The footer renders the `lastVerified` dates for both policy and drug data so this
staleness is visible to users, not just to developers.

## Non-goals (v1)

No live pricing/price APIs, no real-time benefit checks, no accounts or saved
history, no appeal-letter generation (routes to Counterforce Health / Fight Health
Insurance instead), no pharmacy locator, no backend of any kind. The app also never
states a specific dollar amount the user will pay, and never suggests skipping,
splitting, or stopping a medication for cost reasons.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm test    # rules engine unit tests (vitest)
npm run build
npm run lint
```
