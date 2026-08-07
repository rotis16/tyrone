import type { Hospital } from "../data/types";

export type Script = {
  channel: "phone" | "email";
  recipient: string;
  subject?: string;
  body: string;
};

const nameOrPlaceholder = (hospital: Hospital) => hospital.name;

/**
 * What to say when calling the billing department. Includes the exact
 * phrase to use if the rep says no such program exists, and a line asking
 * for the rep's name and a reference number, per spec.
 */
export function phoneScript(hospital: Hospital): Script {
  const name = nameOrPlaceholder(hospital);
  return {
    channel: "phone",
    recipient: hospital.financialAssistancePhone
      ? `${name} billing department (${hospital.financialAssistancePhone})`
      : `${name} billing department`,
    body: `Hi, I got a bill from you and I can't pay it right now. I'd like to apply for your financial assistance program. Can you send me the application, or tell me how to apply online?

If they say there's no such program: "Federal law requires nonprofit hospitals to have a financial assistance policy. Can you check with a supervisor or point me to where it's posted on your website?"

Before you hang up, get: the person's name, today's date, and a reference number for the call. Write them down.`,
  };
}

/**
 * Short, formal written request. Also asks that collections be paused
 * while the application is under review.
 */
export function writtenRequestScript(hospital: Hospital): Script {
  const name = nameOrPlaceholder(hospital);
  return {
    channel: "email",
    recipient: `${name} billing department`,
    subject: `Financial assistance application request — [YOUR NAME], account [ACCOUNT NUMBER]`,
    body: `Hello,

I'm writing to request an application for your financial assistance program for my bill (account [ACCOUNT NUMBER]).

Please also pause any collection activity on this account while my application is being reviewed.

Please send the application and let me know what documents you need from me.

Thank you,
[YOUR NAME]
[PHONE NUMBER]`,
  };
}

/** One-paragraph itemized bill request. Always worth doing, regardless of screening outcome. */
export function itemizedBillScript(hospital: Hospital): Script {
  const name = nameOrPlaceholder(hospital);
  return {
    channel: "email",
    recipient: `${name} billing department`,
    subject: `Request for itemized bill — [YOUR NAME], account [ACCOUNT NUMBER]`,
    body: `Hello, could you send me an itemized bill for account [ACCOUNT NUMBER]? I'd like to see each charge listed separately before I pay anything. Please mail or email it to [YOUR CONTACT INFO]. Thank you.`,
  };
}
