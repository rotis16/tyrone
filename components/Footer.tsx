import { POLICY_LAST_VERIFIED } from "@/data/policy";
import { DRUGS_LAST_VERIFIED } from "@/data/drugs";

export default function Footer() {
  return (
    <footer className="w-full border-t border-neutral-200 dark:border-neutral-800 mt-auto">
      <div className="max-w-2xl mx-auto px-4 py-6 text-xs text-neutral-500 dark:text-neutral-500 flex flex-col gap-1.5">
        <p className="font-medium text-neutral-700 dark:text-neutral-400">
          Your answers never leave this device. Nothing you enter is sent anywhere, stored, or
          tracked — there&apos;s no backend, no account, and no saved history.
        </p>
        <p>
          Policy data last checked: {POLICY_LAST_VERIFIED} · Drug data last checked:{" "}
          {DRUGS_LAST_VERIFIED}. Laws, program terms, and formularies change — treat every fact
          here as a starting point to verify, not a guarantee.
        </p>
      </div>
    </footer>
  );
}
