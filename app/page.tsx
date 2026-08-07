"use client";

import { useState } from "react";
import type { Answers } from "@/lib/types";
import Intake from "@/components/Intake";
import ResultsView from "@/components/ResultsView";
import Disclaimer from "@/components/Disclaimer";
import Footer from "@/components/Footer";

export default function Home() {
  const [finalAnswers, setFinalAnswers] = useState<Answers | null>(null);

  return (
    <div className="flex min-h-full flex-col">
      <Disclaimer />
      <main className="flex-1 w-full px-4 py-10 sm:py-14">
        {finalAnswers ? (
          <ResultsView answers={finalAnswers} onStartOver={() => setFinalAnswers(null)} />
        ) : (
          <Intake onComplete={setFinalAnswers} />
        )}
      </main>
      <Footer />
    </div>
  );
}
