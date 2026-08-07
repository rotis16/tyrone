import Link from "next/link";
import { notFound } from "next/navigation";
import BiomarkerDetail from "@/components/BiomarkerDetail";
import { FIXTURE_RESULTS } from "@/lib/fixtures";

export function generateStaticParams() {
  const keys = Array.from(new Set(FIXTURE_RESULTS.map((r) => r.biomarkerKey).filter(Boolean))) as string[];
  return keys.map((key) => ({ key }));
}

export default async function BiomarkerPage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const exists = FIXTURE_RESULTS.some((r) => r.biomarkerKey === key);
  if (!exists) notFound();

  return (
    <main className="min-h-screen max-w-lg mx-auto px-4 py-8">
      <Link href="/" className="text-sm text-blue-700 dark:text-blue-400 hover:underline">
        ← Back to overview
      </Link>
      <div className="mt-4">
        <BiomarkerDetail biomarkerKey={key} />
      </div>
    </main>
  );
}
