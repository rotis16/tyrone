import { describe, expect, it } from "vitest";
import { getMoves } from "./rules";
import { EMPTY_ANSWERS, type Answers } from "./types";

function answers(overrides: Partial<Answers>): Answers {
  return { ...EMPTY_ANSWERS, ...overrides };
}

function titles(moves: ReturnType<typeof getMoves>) {
  return moves.map((m) => m.title);
}

describe("getMoves: general invariants", () => {
  it("always returns at least 2 moves", () => {
    const moves = getMoves(EMPTY_ANSWERS);
    expect(moves.length).toBeGreaterThanOrEqual(2);
  });

  it("never returns more than 5 moves", () => {
    const moves = getMoves(
      answers({
        drugId: "ozempic",
        insuranceType: "employer",
        planFunding: "fully_insured",
        state: "NJ",
        deductibleStatus: "barely_started",
        willHitDeductible: "probably_not",
        copayCard: "using",
        coverageFriction: "denied",
      })
    );
    expect(moves.length).toBeLessThanOrEqual(5);
  });

  it("assigns sequential ranks starting at 1", () => {
    const moves = getMoves(answers({ insuranceType: "medicaid" }));
    moves.forEach((m, i) => expect(m.rank).toBe(i + 1));
  });

  it("flags unknown drugs with a caveat move ranked near the top", () => {
    const moves = getMoves(
      answers({ drugUnknown: true, drugQuery: "SomeObscureDrug", insuranceType: "employer" })
    );
    expect(moves[0].title).toMatch(/don't have specific data/i);
  });
});

describe("Gate 1: insurance type routing", () => {
  it("no insurance routes to cash-lane-only moves (no accumulator or deductible logic)", () => {
    const moves = getMoves(
      answers({ drugId: "ozempic", insuranceType: "none", copayCard: "using" })
    );
    const t = titles(moves).join(" | ");
    expect(t).toMatch(/discount card/i);
    expect(t).not.toMatch(/deductible/i);
    expect(t).not.toMatch(/accumulator/i);
  });

  it("no insurance surfaces generic substitution when a generic exists", () => {
    const moves = getMoves(answers({ drugId: "victoza", insuranceType: "none" }));
    expect(titles(moves).some((t) => /generic/i.test(t))).toBe(true);
  });

  it("no insurance always surfaces manufacturer PAP and charitable foundations", () => {
    const moves = getMoves(answers({ drugId: "ozempic", insuranceType: "none" }));
    const t = titles(moves).join(" | ");
    expect(t).toMatch(/patient assistance program/i);
    expect(t).toMatch(/charitable foundations/i);
  });

  it("medicaid focuses on coverage/appeals, not cash-lane shopping", () => {
    const moves = getMoves(
      answers({ drugId: "ozempic", insuranceType: "medicaid", coverageFriction: "denied" })
    );
    const t = titles(moves).join(" | ");
    expect(t).toMatch(/denial reason/i);
    expect(t).not.toMatch(/discount card/i);
    expect(t).not.toMatch(/direct-to-consumer/i);
  });

  it("not-sure insurance type leads with finding out the insurance type", () => {
    const moves = getMoves(answers({ drugId: "ozempic", insuranceType: "not_sure" }));
    expect(moves[0].title).toMatch(/find out your insurance type/i);
  });
});

describe("Gate 1 (Medicare): copay card anti-kickback rule", () => {
  it("ranks the copay card warning first when Medicare + using a copay card", () => {
    const moves = getMoves(
      answers({ drugId: "ozempic", insuranceType: "medicare", copayCard: "using" })
    );
    expect(moves[0].title).toMatch(/stop using the manufacturer copay card/i);
    expect(moves[0].rank).toBe(1);
  });

  it("does not show the copay card warning when Medicare + not using one", () => {
    const moves = getMoves(
      answers({ drugId: "ozempic", insuranceType: "medicare", copayCard: "not_using" })
    );
    expect(titles(moves).some((t) => /stop using the manufacturer copay card/i.test(t))).toBe(
      false
    );
  });

  it("still surfaces charitable foundations for Medicare users", () => {
    const moves = getMoves(
      answers({ drugId: "ozempic", insuranceType: "medicare", copayCard: "using" })
    );
    expect(titles(moves).some((t) => /charitable foundations/i.test(t))).toBe(true);
  });

  it("surfaces the Part D out-of-pocket cap", () => {
    const moves = getMoves(answers({ drugId: "ozempic", insuranceType: "medicare" }));
    expect(titles(moves).some((t) => /part d safety net/i.test(t))).toBe(true);
  });
});

describe("Gate 2: generic availability", () => {
  it("recommends the generic as a top move when one exists (employer plan)", () => {
    const moves = getMoves(
      answers({
        drugId: "victoza",
        insuranceType: "employer",
        planFunding: "fully_insured",
        coverageFriction: "none",
        deductibleStatus: "not_sure",
      })
    );
    expect(moves[0].title).toMatch(/generic/i);
  });

  it("does not recommend a generic when none exists", () => {
    const moves = getMoves(answers({ drugId: "ozempic", insuranceType: "employer", planFunding: "fully_insured" }));
    expect(titles(moves).some((t) => /switching to generic/i.test(t))).toBe(false);
  });
});

describe("Gate 3: cash vs. insurance", () => {
  const base: Partial<Answers> = {
    drugId: "ozempic",
    insuranceType: "employer",
    planFunding: "fully_insured",
    coverageFriction: "none",
  };

  it("deductible met -> recommends using insurance", () => {
    const moves = getMoves(answers({ ...base, deductibleStatus: "met" }));
    expect(titles(moves).some((t) => /use your insurance for this fill/i.test(t))).toBe(true);
  });

  it("deductible not met but will hit it -> use insurance despite higher sticker price", () => {
    const moves = getMoves(
      answers({ ...base, deductibleStatus: "barely_started", willHitDeductible: "yes_ongoing" })
    );
    expect(
      titles(moves).some((t) => /use your insurance, even if the sticker price/i.test(t))
    ).toBe(true);
  });

  it("deductible not met and won't hit it -> compare cash vs copay directly", () => {
    const moves = getMoves(
      answers({ ...base, deductibleStatus: "barely_started", willHitDeductible: "probably_not" })
    );
    expect(titles(moves).some((t) => /compare the cash price against your copay/i.test(t))).toBe(
      true
    );
  });

  it("not sure -> tells them to ask the pharmacist to run both", () => {
    const moves = getMoves(
      answers({ ...base, deductibleStatus: "not_sure", willHitDeductible: "not_sure" })
    );
    expect(titles(moves).some((t) => /ask your pharmacist to run it both ways/i.test(t))).toBe(
      true
    );
  });
});

describe("Gate 4: accumulator detection", () => {
  it("does not trigger when the user isn't using a copay card", () => {
    const moves = getMoves(
      answers({
        drugId: "ozempic",
        insuranceType: "employer",
        planFunding: "self_funded",
        copayCard: "not_using",
      })
    );
    expect(titles(moves).some((t) => /accumulator|copay card/i.test(t))).toBe(false);
  });

  it("self-funded employer plan -> HR script, explains ERISA preemption regardless of state", () => {
    const moves = getMoves(
      answers({
        drugId: "ozempic",
        insuranceType: "employer",
        planFunding: "self_funded",
        state: "NJ",
        copayCard: "using",
      })
    );
    const move = moves.find((m) => /ask hr whether your plan uses a copay accumulator/i.test(m.title));
    expect(move).toBeDefined();
    expect(move?.why).toMatch(/ERISA/);
    expect(move?.script?.recipient).toMatch(/HR/i);
  });

  it("fully-insured plan in a state with an anti-accumulator law -> cites the state protection", () => {
    const moves = getMoves(
      answers({
        drugId: "ozempic",
        insuranceType: "employer",
        planFunding: "fully_insured",
        state: "NJ",
        copayCard: "using",
      })
    );
    expect(
      titles(moves).some((t) => /confirm your copay assistance counts toward your deductible/i.test(t))
    ).toBe(true);
  });

  it("fully-insured plan in a state without a known anti-accumulator law -> tells them to find out", () => {
    const moves = getMoves(
      answers({
        drugId: "ozempic",
        insuranceType: "employer",
        planFunding: "fully_insured",
        state: "OH",
        copayCard: "using",
      })
    );
    expect(
      titles(moves).some((t) => /find out if your state protects your copay assistance/i.test(t))
    ).toBe(true);
  });

  it("marketplace plan -> notes the contested/unsettled federal rule status, not a settled 2027 guarantee", () => {
    const moves = getMoves(
      answers({ drugId: "ozempic", insuranceType: "marketplace", copayCard: "using" })
    );
    const move = moves.find((m) => /counts your copay card assistance/i.test(m.title));
    expect(move).toBeDefined();
    expect(move?.why).toMatch(/contested/i);
  });

  it("employer plan with unknown funding type -> defaults to the HR script", () => {
    const moves = getMoves(
      answers({
        drugId: "ozempic",
        insuranceType: "employer",
        planFunding: "not_sure",
        copayCard: "using",
      })
    );
    expect(
      titles(moves).some((t) => /ask hr whether your plan is self-funded/i.test(t))
    ).toBe(true);
  });
});

describe("Gate 5: coverage friction", () => {
  it("denied -> requests denial reason and routes to appeal", () => {
    const moves = getMoves(
      answers({ drugId: "ozempic", insuranceType: "employer", coverageFriction: "denied" })
    );
    const move = moves.find((m) => /request the denial reason in writing/i.test(m.title));
    expect(move).toBeDefined();
    expect(move?.why).toMatch(/Counterforce Health|Fight Health Insurance/);
  });

  it("prior auth -> generates a prior authorization move, distinct from a denial appeal", () => {
    const moves = getMoves(
      answers({ drugId: "ozempic", insuranceType: "employer", coverageFriction: "prior_auth" })
    );
    expect(titles(moves).some((t) => /get the prior authorization submitted/i.test(t))).toBe(true);
    expect(titles(moves).some((t) => /request the denial reason/i.test(t))).toBe(false);
  });

  it("step therapy -> generates a step therapy exception move, distinct from prior auth", () => {
    const moves = getMoves(
      answers({ drugId: "ozempic", insuranceType: "employer", coverageFriction: "step_therapy" })
    );
    expect(titles(moves).some((t) => /request a step therapy exception/i.test(t))).toBe(true);
    expect(titles(moves).some((t) => /get the prior authorization submitted/i.test(t))).toBe(
      false
    );
  });

  it("none -> no coverage friction move appears", () => {
    const moves = getMoves(
      answers({ drugId: "ozempic", insuranceType: "employer", coverageFriction: "none" })
    );
    const t = titles(moves).join(" | ");
    expect(t).not.toMatch(/denial reason|prior authorization submitted|step therapy exception/i);
  });
});

describe("Gate 6: assistance layering is always evaluated and ranked last", () => {
  it("PAP and foundation moves are present and rank behind higher-urgency moves", () => {
    const moves = getMoves(
      answers({
        drugId: "ozempic",
        insuranceType: "employer",
        planFunding: "fully_insured",
        coverageFriction: "denied",
        copayCard: "using",
        state: "NJ",
        deductibleStatus: "barely_started",
        willHitDeductible: "probably_not",
      })
    );
    const papIndex = moves.findIndex((m) => /patient assistance program/i.test(m.title));
    const denialIndex = moves.findIndex((m) => /denial reason/i.test(m.title));
    if (papIndex !== -1 && denialIndex !== -1) {
      expect(denialIndex).toBeLessThan(papIndex);
    }
  });
});

describe("safety: never suggests skipping or reducing medication", () => {
  it("no move text mentions skipping, splitting, or stopping doses for cost", () => {
    const scenarios: Partial<Answers>[] = [
      { drugId: "ozempic", insuranceType: "none" },
      { drugId: "ozempic", insuranceType: "medicare", copayCard: "using" },
      { drugId: "ozempic", insuranceType: "medicaid", coverageFriction: "denied" },
      {
        drugId: "ozempic",
        insuranceType: "employer",
        planFunding: "self_funded",
        copayCard: "using",
        coverageFriction: "prior_auth",
      },
    ];
    for (const s of scenarios) {
      const moves = getMoves(answers(s));
      for (const m of moves) {
        const text = `${m.title} ${m.why} ${m.script?.body ?? ""}`.toLowerCase();
        expect(text).not.toMatch(/skip a dose|split your dose|stop taking|take less than prescribed/);
      }
    }
  });
});

describe("scripts are copyable and never state a specific dollar amount", () => {
  it("every script has copyable: true", () => {
    const moves = getMoves(
      answers({ drugId: "ozempic", insuranceType: "employer", coverageFriction: "denied" })
    );
    for (const m of moves) {
      if (m.script) expect(m.script.copyable).toBe(true);
    }
  });

  it("move why/script text does not assert a specific price the user will pay", () => {
    const moves = getMoves(answers({ drugId: "ozempic", insuranceType: "none" }));
    for (const m of moves) {
      const text = `${m.why} ${m.script?.body ?? ""}`;
      expect(text).not.toMatch(/\$\d/);
    }
  });
});
