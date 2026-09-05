"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SavePlanModal } from "@/components/results/SavePlanModal";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { useQuiz } from "@/context/QuizContext";
import { downloadPlan } from "@/lib/planExport";
import type { QuizAnswers, SidingPlan } from "@/types/quiz";

interface PlanActionsProps {
  plan: SidingPlan;
  answers: QuizAnswers;
}

export function PlanActions({ plan, answers }: PlanActionsProps) {
  const router = useRouter();
  const { reset } = useQuiz();
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  const retake = (): void => {
    reset();
    router.push("/quiz");
  };

  return (
    <section
      data-print-hide
      className="rounded-2xl border border-hardie-200 bg-white p-6 shadow-card sm:p-8"
    >
      <p className="eyebrow">What to do next</p>
      <h2 className="mt-1 text-xl font-extrabold tracking-tight text-hardie-800 sm:text-2xl">
        Take your specification into the real world
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slateCharcoal-muted">
        The plan above is only worth what you do with it. Order samples before you commit to a
        color, and send the same written scope to every contractor you talk to.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <a
          href="https://www.jameshardie.com/order-samples"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-xl border border-stone-200 bg-stone-50 p-4 transition-colors hover:border-hardie-300"
        >
          <Icon name="Palette" className="h-5 w-5 shrink-0 text-hardie-700" />
          <span>
            <span className="block text-sm font-bold text-slateCharcoal">Order samples</span>
            <span className="block text-[12px] text-slateCharcoal-muted">jameshardie.com</span>
          </span>
        </a>
        <a
          href="https://www.jameshardie.com/find-a-contractor"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-xl border border-stone-200 bg-stone-50 p-4 transition-colors hover:border-hardie-300"
        >
          <Icon name="Hammer" className="h-5 w-5 shrink-0 text-hardie-700" />
          <span>
            <span className="block text-sm font-bold text-slateCharcoal">Find a preferred pro</span>
            <span className="block text-[12px] text-slateCharcoal-muted">Contractor locator</span>
          </span>
        </a>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-3 rounded-xl border border-stone-200 bg-stone-50 p-4 text-left transition-colors hover:border-hardie-300"
        >
          <Icon name="Mail" className="h-5 w-5 shrink-0 text-hardie-700" />
          <span>
            <span className="block text-sm font-bold text-slateCharcoal">Save / email my plan</span>
            <span className="block text-[12px] text-slateCharcoal-muted">Downloads to this device</span>
          </span>
        </button>
        <button
          type="button"
          onClick={retake}
          className="flex items-center gap-3 rounded-xl border border-stone-200 bg-stone-50 p-4 text-left transition-colors hover:border-hardie-300"
        >
          <Icon name="RotateCcw" className="h-5 w-5 shrink-0 text-hardie-700" />
          <span>
            <span className="block text-sm font-bold text-slateCharcoal">Retake the quiz</span>
            <span className="block text-[12px] text-slateCharcoal-muted">Clears saved answers</span>
          </span>
        </button>
      </div>

      <div className="mt-6 flex flex-wrap gap-3 border-t border-stone-200 pt-6">
        <Button variant="secondary" onClick={() => downloadPlan(plan, answers)}>
          <Icon name="Download" className="h-4 w-4" />
          Download as text
        </Button>
        <Button variant="ghost" onClick={() => window.print()}>
          <Icon name="Receipt" className="h-4 w-4" />
          Print
        </Button>
      </div>

      {modalOpen ? (
        <SavePlanModal plan={plan} answers={answers} onClose={() => setModalOpen(false)} />
      ) : null}
    </section>
  );
}
