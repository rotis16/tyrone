"use client";

import Link from "next/link";
import { use } from "react";
import BiomarkerDetail from "@/components/BiomarkerDetail";

/**
 * Client-rendered: the data lives in this browser's IndexedDB, so there is
 * nothing for the server to prerender and no fixed set of routes to generate.
 */
export default function BiomarkerPage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = use(params);

  return (
    <main className="mx-auto min-h-screen max-w-lg px-4 py-8">
      <Link href="/" className="text-sm text-blue-700 hover:underline dark:text-blue-400">
        ← Back to overview
      </Link>
      <div className="mt-4">
        <BiomarkerDetail biomarkerKey={key} />
      </div>
    </main>
  );
}
