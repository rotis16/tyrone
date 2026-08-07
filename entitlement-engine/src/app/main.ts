import { EMPTY_ANSWERS, type Answers } from "../data/answers";
import { BILL_AMOUNT_RANGES } from "../data/billAmounts";
import { HOSPITALS, searchHospitals } from "../data/hospitals";
import { INCOME_RANGES } from "../data/incomeRanges";
import type { BillAge, Hospital, InsuranceStatus } from "../data/types";
import { buildActionPlan, type ActionCard } from "../lib/results";
import { clear, el } from "./dom";

type Screen = "landing" | "hospital" | "household" | "income" | "insurance" | "billAmount" | "billAge" | "results";

const QUESTION_SCREENS: Screen[] = ["hospital", "household", "income", "insurance", "billAmount", "billAge"];

type State = {
  screen: Screen;
  answers: Answers;
  history: Screen[];
};

const state: State = { screen: "landing", answers: { ...EMPTY_ANSWERS }, history: [] };

const app = document.getElementById("app")!;

function goTo(screen: Screen, patch: Partial<Answers> = {}) {
  state.answers = { ...state.answers, ...patch };
  state.history.push(state.screen);
  state.screen = screen;
  render();
  window.scrollTo(0, 0);
}

function back() {
  const prev = state.history.pop();
  if (prev) {
    state.screen = prev;
    render();
    window.scrollTo(0, 0);
  }
}

function progressBar(stepIndex: number): HTMLElement {
  const total = QUESTION_SCREENS.length;
  const pct = Math.round(((stepIndex + 1) / total) * 100);
  return el("div", { class: "progress", role: "progressbar", "aria-valuenow": String(pct), "aria-valuemin": "0", "aria-valuemax": "100" }, [
    el("div", { class: "progress-label" }, [`Question ${stepIndex + 1} of ${total}`]),
    el("div", { class: "progress-track" }, [el("div", { class: "progress-fill", style: `width:${pct}%` })]),
  ]);
}

function backButton(): HTMLElement {
  const btn = el("button", { type: "button", class: "link-button back-button" }, ["← Back"]);
  btn.addEventListener("click", back);
  return btn;
}

function optionButton(label: string, description: string | undefined, onSelect: () => void): HTMLElement {
  const children: (Node | string)[] = [el("span", { class: "option-label" }, [label])];
  if (description) children.push(el("span", { class: "option-description" }, [description]));
  const btn = el("button", { type: "button", class: "option-card" }, children);
  btn.addEventListener("click", onSelect);
  return btn;
}

function questionShell(stepIndex: number, title: string, subtitle: string | undefined, body: HTMLElement): HTMLElement {
  const children: (Node | string)[] = [progressBar(stepIndex), backButton(), el("h1", {}, [title])];
  if (subtitle) children.push(el("p", { class: "subtitle" }, [subtitle]));
  children.push(body);
  return el("div", { class: "screen" }, children);
}

function renderLanding() {
  const heading = el("h1", {}, ["Find out what help you're owed for a hospital bill."]);
  const sub = el("p", { class: "lede" }, [
    "Nonprofit hospitals are legally required to help patients who can't afford their bills. Most people are never told. Answer a few questions and find out what you likely qualify for.",
  ]);
  const cta = el("button", { type: "button", class: "primary-button" }, ["See what help you qualify for"]);
  cta.addEventListener("click", () => goTo("hospital"));
  app.append(el("div", { class: "screen landing" }, [heading, sub, cta]));
}

function renderHospital() {
  const wrap = el("div", {});
  const input = el("input", {
    type: "search",
    class: "text-input",
    placeholder: "Search hospital or health system name",
    "aria-label": "Search hospital or health system name",
  }) as HTMLInputElement;
  const list = el("div", { class: "option-list", role: "radiogroup", "aria-label": "Hospital" });
  wrap.append(input, list);

  function renderList(query: string) {
    clear(list);
    const results = query ? searchHospitals(query) : HOSPITALS;
    if (results.length === 0) {
      list.append(el("p", { class: "empty-note" }, ["No match yet — keep typing, or check the spelling."]));
      return;
    }
    for (const hospital of results) {
      list.append(
        optionButton(hospital.name, hospital.city, () => goTo("household", { hospitalId: hospital.id }))
      );
    }
  }

  input.addEventListener("input", () => renderList(input.value));
  renderList("");

  app.append(questionShell(0, "Which hospital or health system sent the bill?", undefined, wrap));
  input.focus();
}

function renderHousehold() {
  const list = el("div", { class: "option-list", role: "radiogroup", "aria-label": "Household size" });
  for (let size = 1; size <= 8; size++) {
    list.append(optionButton(String(size), undefined, () => goTo("income", { householdSize: size })));
  }
  list.append(optionButton("9 or more", undefined, () => goTo("income", { householdSize: 9 })));
  app.append(
    questionShell(1, "How many people are in your household?", "Count yourself and anyone you financially support.", list)
  );
}

function renderIncome() {
  const list = el("div", { class: "option-list", role: "radiogroup", "aria-label": "Household income" });
  for (const range of INCOME_RANGES) {
    list.append(optionButton(range.label, undefined, () => goTo("insurance", { incomeRangeId: range.id })));
  }
  app.append(
    questionShell(2, "What is your approximate annual household income?", "A range is fine — we don't need an exact number.", list)
  );
}

const INSURANCE_OPTIONS: { value: InsuranceStatus; label: string }[] = [
  { value: "insured", label: "Yes" },
  { value: "uninsured", label: "No" },
  { value: "insured_at_time_of_care", label: "I did at the time of care" },
  { value: "not_sure", label: "Not sure" },
];

function renderInsurance() {
  const list = el("div", { class: "option-list", role: "radiogroup", "aria-label": "Insurance status" });
  for (const opt of INSURANCE_OPTIONS) {
    list.append(optionButton(opt.label, undefined, () => goTo("billAmount", { insuranceStatus: opt.value })));
  }
  app.append(questionShell(3, "Do you have health insurance?", undefined, list));
}

function renderBillAmount() {
  const list = el("div", { class: "option-list", role: "radiogroup", "aria-label": "Bill amount" });
  for (const range of BILL_AMOUNT_RANGES) {
    list.append(optionButton(range.label, undefined, () => goTo("billAge", { billAmountRangeId: range.id })));
  }
  app.append(questionShell(4, "Roughly how much is the bill?", undefined, list));
}

const BILL_AGE_OPTIONS: { value: BillAge; label: string }[] = [
  { value: "under_30_days", label: "Under 30 days" },
  { value: "1_to_3_months", label: "1–3 months" },
  { value: "3_to_8_months", label: "3–8 months" },
  { value: "over_8_months", label: "Over 8 months" },
  { value: "in_collections", label: "It's in collections" },
];

function renderBillAge() {
  const list = el("div", { class: "option-list", role: "radiogroup", "aria-label": "How long ago you received the bill" });
  for (const opt of BILL_AGE_OPTIONS) {
    list.append(optionButton(opt.label, undefined, () => showResults({ billAge: opt.value })));
  }
  app.append(questionShell(5, "How long ago did you receive the bill?", undefined, list));
}

function showResults(patch: Partial<Answers>) {
  state.answers = { ...state.answers, ...patch };
  state.history.push(state.screen);
  state.screen = "results";
  render();
  window.scrollTo(0, 0);
}

function findHospitalById(id: string | null): Hospital | undefined {
  return HOSPITALS.find((h) => h.id === id);
}

function scriptBlock(card: ActionCard): HTMLElement | null {
  if (!card.script) return null;
  const { script } = card;
  const bodyText = script.subject ? `Subject: ${script.subject}\n\n${script.body}` : script.body;
  const pre = el("pre", { class: "script-body" }, [bodyText]);
  const copyBtn = el("button", { type: "button", class: "copy-button" }, ["Copy"]);
  copyBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(bodyText);
      copyBtn.textContent = "Copied ✓";
      setTimeout(() => (copyBtn.textContent = "Copy"), 2000);
    } catch {
      /* clipboard unavailable — text is still visible and selectable */
    }
  });
  const header = el("div", { class: "script-header" }, [
    el("span", {}, [`${script.channel === "phone" ? "Phone" : "Email"} · to ${script.recipient}`]),
    copyBtn,
  ]);
  return el("div", { class: "script-block" }, [header, pre]);
}

function actionCardEl(card: ActionCard): HTMLElement {
  const children: (Node | string)[] = [el("h2", {}, [card.verdict]), el("p", { class: "why" }, [card.why])];
  if (card.deadline) children.push(el("p", { class: "deadline" }, [card.deadline]));
  if (card.nextStepUrl) {
    children.push(
      el("p", { class: "next-step" }, [
        el("a", { href: card.nextStepUrl, target: "_blank", rel: "noopener noreferrer" }, [card.nextStep]),
      ])
    );
  } else {
    children.push(el("p", { class: "next-step" }, [card.nextStep]));
  }
  if (card.sourceUrl) {
    children.push(
      el("a", { class: "source-link", href: card.sourceUrl, target: "_blank", rel: "noopener noreferrer" }, [
        "View the hospital's published policy ↗",
      ])
    );
  }
  const script = scriptBlock(card);
  if (script) children.push(script);
  return el("div", { class: "action-card" }, children);
}

function renderResults() {
  const hospital = findHospitalById(state.answers.hospitalId);
  if (!hospital) {
    app.append(el("div", { class: "screen" }, ["Something went wrong — please start over."]));
    return;
  }
  const cards = buildActionPlan(state.answers, hospital);

  const printBtn = el("button", { type: "button", class: "link-button" }, ["Print this page"]);
  printBtn.addEventListener("click", () => window.print());

  const textBtn = el("a", { class: "link-button", href: buildShareLink(hospital, cards) }, ["Text this to myself"]);

  const startOver = el("button", { type: "button", class: "link-button" }, ["Start over"]);
  startOver.addEventListener("click", () => {
    state.answers = { ...EMPTY_ANSWERS };
    state.history = [];
    state.screen = "landing";
    render();
  });

  const privacyNote = el("p", { class: "privacy-note" }, [
    "Nothing you entered was sent anywhere. This was all calculated on your device.",
  ]);

  app.append(
    el("div", { class: "screen results" }, [
      el("h1", {}, [`Your plan for ${hospital.name}`]),
      el("div", { class: "results-actions" }, [printBtn, textBtn]),
      el("div", { class: "action-cards" }, cards.map(actionCardEl)),
      privacyNote,
      startOver,
    ])
  );
}

function buildShareLink(hospital: Hospital, cards: ActionCard[]): string {
  const summary = cards
    .map((c) => `${c.verdict}\n${c.nextStep}`)
    .join("\n\n");
  const body = `My plan for ${hospital.name}:\n\n${summary}`;
  return `sms:?&body=${encodeURIComponent(body)}`;
}

function render() {
  clear(app);
  switch (state.screen) {
    case "landing":
      return renderLanding();
    case "hospital":
      return renderHospital();
    case "household":
      return renderHousehold();
    case "income":
      return renderIncome();
    case "insurance":
      return renderInsurance();
    case "billAmount":
      return renderBillAmount();
    case "billAge":
      return renderBillAge();
    case "results":
      return renderResults();
  }
}

render();
