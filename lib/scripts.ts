import type { Script } from "./types";

const drugOrPlaceholder = (drugName: string | null) =>
  drugName ?? "[DRUG NAME]";

export function hrAccumulatorEmailScript(drugName: string | null): Script {
  const d = drugOrPlaceholder(drugName);
  return {
    channel: "email",
    recipient: "your HR benefits contact",
    subject: `Question about how our plan handles copay assistance for ${d}`,
    body: `Hi [HR CONTACT NAME],

I take ${d} and use manufacturer copay assistance to help cover the cost. I want to understand how our health plan treats that assistance before I budget for the rest of the year.

Two quick questions:
1. Is our medical/pharmacy plan self-funded or fully insured?
2. Does our plan use a "copay accumulator" or "copay maximizer" program — sometimes called a "Coupon Adjustment," "Benefit Plan Protection Program," "Out-of-Pocket Protection Program," or "Copay Leveling Program" in plan documents? These programs stop manufacturer copay assistance from counting toward my deductible or out-of-pocket maximum.

If you're not sure, could you point me to the Summary Plan Description (SPD) or check with the plan administrator? I'd also be glad to look at the SPD myself if you can send it over — I'd search for the terms above.

Thank you,
[YOUR NAME]`,
    copyable: true,
  };
}

export function pharmacistCashVsInsuranceScript(drugName: string | null): Script {
  const d = drugOrPlaceholder(drugName);
  return {
    channel: "in person",
    recipient: "your pharmacist",
    body: `Hi, could you run ${d} both ways for me — once through my insurance, and once as a cash price using any discount card you have on file — and tell me which one is lower today? I want to pay whichever is actually cheaper, and I know that's not always the insurance price.`,
    copyable: true,
  };
}

export function prescriberAlternativeScript(
  drugName: string | null,
  alternatives: string[]
): Script {
  const d = drugOrPlaceholder(drugName);
  const altLine =
    alternatives.length > 0
      ? ` Options I've seen mentioned for this class include ${alternatives.join(", ")}, but I trust your judgment on what's appropriate for me.`
      : "";
  return {
    channel: "portal message",
    recipient: "your prescriber's office",
    subject: `Formulary question about ${d}`,
    body: `Hi [PRESCRIBER NAME],

My insurance is placing ${d} on a high cost-sharing tier, and I wanted to ask: is there a therapeutically similar option on a lower formulary tier of my plan that you'd be comfortable prescribing instead?${altLine}

I'm not asking to change treatment for cost reasons alone without your input — I just want to know if a lower-tier alternative is medically reasonable before I go back to my insurer. Could you or your office let me know?

Thank you,
[YOUR NAME]`,
    copyable: true,
  };
}

export function insurerCallScript(drugName: string | null): Script {
  const d = drugOrPlaceholder(drugName);
  return {
    channel: "phone",
    recipient: "your insurer's member services line (number on your insurance card)",
    body: `Hi, I'd like some information about my pharmacy benefit for ${d}. Could you tell me:
1. What formulary tier is this drug on under my plan?
2. What are the plan's coverage criteria for this drug — is a prior authorization required, and if so, what does it take to approve one?
3. Is there a prior authorization already on file for me for this drug?
4. Is this specific drug covered under my plan at all, or is it excluded?

Could you also send me this information in writing, or point me to where it's documented?`,
    copyable: true,
  };
}

export function priorAuthExceptionScript(drugName: string | null): Script {
  const d = drugOrPlaceholder(drugName);
  return {
    channel: "portal message",
    recipient: "your prescriber's office",
    subject: `Prior authorization request for ${d}`,
    body: `Hi [PRESCRIBER NAME],

My insurer requires prior authorization before covering ${d}. Would your office be able to submit the prior authorization request, including a letter of medical necessity explaining why this specific drug is appropriate for me (for example, other treatments already tried, relevant diagnoses, or contraindications to alternatives)?

Could you also let me know once it's submitted so I can follow up with my insurer on the timeline?

Thank you,
[YOUR NAME]`,
    copyable: true,
  };
}

export function stepTherapyExceptionScript(drugName: string | null): Script {
  const d = drugOrPlaceholder(drugName);
  return {
    channel: "portal message",
    recipient: "your prescriber's office",
    subject: `Step therapy exception request for ${d}`,
    body: `Hi [PRESCRIBER NAME],

My insurer is requiring step therapy — trying a different drug first — before they'll cover ${d}. I'd like to ask about requesting a step therapy exception, which is usually faster than a full appeal.

Exceptions are often granted when one or more of these apply, so could you let me know if any fit my situation:
- I've already tried the required step drug(s) and they didn't work or caused side effects
- The required step drug is expected to be ineffective or unsafe for me based on my history
- I'm currently stable on ${d} and switching could cause harm

If any apply, could your office submit a step therapy exception request with the supporting details to my insurer?

Thank you,
[YOUR NAME]`,
    copyable: true,
  };
}

export function denialReasonRequestScript(drugName: string | null): Script {
  const d = drugOrPlaceholder(drugName);
  return {
    channel: "phone",
    recipient: "your insurer's member services line (number on your insurance card)",
    body: `Hi, I received a denial for ${d} and I'd like to request, in writing:
1. The specific reason my claim or prior authorization was denied
2. The plan's coverage criteria for this drug, so I know what would need to be true for it to be approved
3. Instructions for how to file an internal appeal, including the deadline

Could you send this to me by mail or through the member portal?`,
    copyable: true,
  };
}

export function hrSelfFundedQuestionScript(drugName: string | null): Script {
  const d = drugOrPlaceholder(drugName);
  return {
    channel: "email",
    recipient: "your HR benefits contact",
    subject: "Question about our plan's funding type",
    body: `Hi [HR CONTACT NAME],

Quick question about our health plan: is it self-funded (the company pays claims directly and uses an insurer just to administer the plan) or fully insured (the insurance company bears the financial risk)? This affects some cost-assistance options available to me for ${d}, and I want to make sure I'm looking at the right rules.

Thank you,
[YOUR NAME]`,
    copyable: true,
  };
}

export function clinicSlidingScaleOr340BScript(drugName: string | null): Script {
  const d = drugOrPlaceholder(drugName);
  return {
    channel: "phone",
    recipient: "your clinic's billing or pharmacy office",
    body: `Hi, I wanted to ask: does this clinic participate in the 340B drug pricing program, and if so, can my prescription for ${d} be filled through it? I'd also like to know if the clinic offers a sliding-scale discount program based on income.`,
    copyable: true,
  };
}

export function papInquiryScript(
  drugName: string | null,
  papUrl: string | null
): Script {
  const d = drugOrPlaceholder(drugName);
  const urlLine = papUrl
    ? ` I found what looks like the program page here: ${papUrl} — could you confirm this is current and walk me through what documentation you need?`
    : "";
  return {
    channel: "phone",
    recipient: "the manufacturer's patient assistance program line",
    body: `Hi, I'm trying to find out if I qualify for your patient assistance program for ${d}. Could you tell me the income eligibility guidelines and what paperwork you need from me and my prescriber?${urlLine}`,
    copyable: true,
  };
}

export function foundationInquiryScript(drugName: string | null): Script {
  const d = drugOrPlaceholder(drugName);
  return {
    channel: "phone",
    recipient: "the foundation's application line",
    body: `Hi, I'm trying to find out if your disease fund related to ${d} is currently open for applications, what the income and insurance eligibility rules are, and what documentation you need from me and my prescriber. I understand funds open and close without much notice, so I wanted to check directly before applying.`,
    copyable: true,
  };
}

export function genericSwapScript(
  drugName: string | null,
  genericName: string | null
): Script {
  const d = drugOrPlaceholder(drugName);
  const g = genericName ?? "[GENERIC NAME]";
  return {
    channel: "in person",
    recipient: "your pharmacist",
    body: `Hi, I take ${d}, and I understand a generic version (${g}) is available now. Can you fill this prescription with the generic instead, and tell me what it costs in cash compared to my branded copay?`,
    copyable: true,
  };
}

export function discountCardCashPriceScript(drugName: string | null): Script {
  const d = drugOrPlaceholder(drugName);
  return {
    channel: "in person",
    recipient: "your pharmacist",
    body: `Hi, I don't have insurance covering this. Could you check the cash price for ${d} using any discount card programs you have access to (for example GoodRx, SingleCare, or similar), and tell me the lowest price you can offer?`,
    copyable: true,
  };
}

export function directToConsumerScript(drugName: string | null): Script {
  const d = drugOrPlaceholder(drugName);
  return {
    channel: "portal message",
    recipient: "the manufacturer's direct-to-consumer pharmacy channel",
    body: `Hi, I don't have insurance coverage for ${d}. Do you offer a self-pay or direct-to-consumer purchase option, and what is the current self-pay price? Please also let me know what's required to get a valid prescription into that channel.`,
    copyable: true,
  };
}

export function medicareCopayCardStopScript(drugName: string | null): Script {
  const d = drugOrPlaceholder(drugName);
  return {
    channel: "phone",
    recipient: "the manufacturer's patient support line",
    body: `Hi, I have Medicare drug coverage and I've been using a manufacturer copay card for ${d}. I recently learned that these cards are generally not usable once you have Medicare coverage, due to federal anti-kickback rules. Could you confirm whether I'm still eligible, and if not, whether you can point me toward any Medicare-compatible assistance you offer?`,
    copyable: true,
  };
}
