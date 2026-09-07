"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { useQuiz } from "@/context/QuizContext";

/**
 * Renders nothing until hydration completes, so the server and first client
 * render match exactly and no localStorage-driven mismatch can occur.
 */
export function ResumeBanner() {
  const { hydrated, answers, stepIndex, totalSteps, complete } = useQuiz();

  if (!hydrated || answers.stage === null) return null;

  const href = complete ? "/results" : "/quiz";
  const label = complete
    ? "Your siding plan is ready — view it"
    : `Pick up where you left off — question ${Math.min(stepIndex + 1, totalSteps)} of ${totalSteps}`;

  return (
    <Link
      href={href}
      className="mb-7 inline-flex items-center gap-2.5 border-2 border-hardie-700 bg-white px-5 py-2.5 text-[12px] font-bold uppercase tracking-[0.08em] text-hardie-700 transition-colors hover:bg-hardie-700 hover:text-white"
    >
      <Icon name="RotateCcw" className="h-4 w-4" />
      {label}
      <Icon name="ArrowRight" className="h-4 w-4" />
    </Link>
  );
}
