"use client";

import { useState } from "react";
import type { Script } from "@/lib/types";

const CHANNEL_LABEL: Record<Script["channel"], string> = {
  email: "Email",
  phone: "Phone call",
  "in person": "In person",
  "portal message": "Portal message",
};

export default function ScriptBlock({ script }: { script: Script }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const text = script.subject ? `Subject: ${script.subject}\n\n${script.body}` : script.body;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API unavailable; the text is still selectable/visible
    }
  }

  return (
    <div className="mt-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-100/70 dark:bg-neutral-900">
        <div className="text-xs text-neutral-600 dark:text-neutral-400">
          <span className="font-medium text-neutral-800 dark:text-neutral-200">
            {CHANNEL_LABEL[script.channel]}
          </span>
          {" · to "}
          {script.recipient}
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="text-xs font-medium rounded-md border border-neutral-300 dark:border-neutral-700 px-2.5 py-1 hover:bg-white dark:hover:bg-neutral-800 cursor-pointer whitespace-nowrap"
        >
          {copied ? "Copied ✓" : "Copy"}
        </button>
      </div>
      <div className="px-4 py-3 text-sm text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap font-mono">
        {script.subject && (
          <div className="mb-2 font-sans font-medium text-neutral-900 dark:text-neutral-100">
            Subject: {script.subject}
          </div>
        )}
        {script.body}
      </div>
    </div>
  );
}
