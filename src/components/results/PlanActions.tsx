"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SavePlanModal } from "@/components/results/SavePlanModal";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { useQuiz } from "@/context/QuizContext";
import { downloadPlan } from "@/lib/planExport";
import { buildShareUrl } from "@/lib/share";
import type { QuizAnswers, SidingPlan } from "@/types/quiz";

interface PlanActionsProps {
  plan: SidingPlan;
  answers: QuizAnswers;
  paletteIndex: number;
}

export function PlanActions({ plan, answers, paletteIndex }: PlanActionsProps) {
  const router = useRouter();
  const { reset } = useQuiz();
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [shareState, setShareState] = useState<"idle" | "copied" | "failed">("idle");

  // The whole plan travels in the URL, so a share works with no account and no
  // backend — the recipient opens the identical specification and palette.
  const share = async (): Promise<void> => {
    const url = buildShareUrl(answers, paletteIndex);
    const palette = plan.palettes[paletteIndex];
    const title = palette
      ? `My James Hardie siding plan — ${palette.body.color.name} on ${plan.spec.primary.productLine}`
      : "My James Hardie siding plan";

    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title, text: title, url });
        return;
      } catch {
        // User dismissed the sheet, or the browser refused — fall through to copy.
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setShareState("copied");
      window.setTimeout(() => setShareState("idle"), 2400);
    } catch {
      setShareState("failed");
      window.setTimeout(() => setShareState("idle"), 4000);
    }
  };

  const retake = (): void => {
    reset();
    router.push("/quiz");
  };

  return (
    <section
      data-print-hide
      className="card p-6  sm:p-8"
    >
      <p className="eyebrow">What to do next</p>
      <h2 className="mt-1.5 text-24p font-black tracking-tight text-slateCharcoal sm:text-28p">
        Take your specification into the real world
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slateCharcoal-muted">
        The plan above is only worth what you do with it. Order samples before you commit to a
        color, and send the same written scope to every contractor you talk to.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <button
          type="button"
          onClick={() => void share()}
          className="flex items-center gap-3 border border-stone-300 bg-white p-5 text-left transition-colors hover:border-slateCharcoal"
        >
          <Icon name={shareState === "copied" ? "Check" : "Share2"} className="h-5 w-5 shrink-0 text-hardie-700" />
          <span>
            <span className="block text-sm font-bold text-slateCharcoal">
              {shareState === "copied" ? "Link copied" : "Share my plan"}
            </span>
            <span className="block text-[12px] text-slateCharcoal-muted">
              {shareState === "failed" ? "Copy failed — try again" : "Sends the full spec + colors"}
            </span>
          </span>
        </button>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-3 border border-stone-300 bg-white p-5 text-left transition-colors hover:border-slateCharcoal"
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
          className="flex items-center gap-3 border border-stone-300 bg-white p-5 text-left transition-colors hover:border-slateCharcoal"
        >
          <Icon name="RotateCcw" className="h-5 w-5 shrink-0 text-hardie-700" />
          <span>
            <span className="block text-sm font-bold text-slateCharcoal">Retake the quiz</span>
            <span className="block text-[12px] text-slateCharcoal-muted">Clears saved answers</span>
          </span>
        </button>
      </div>

      <div className="mt-6 flex flex-wrap gap-3 border-t border-stone-300 pt-6">
        <Button variant="secondary" onClick={() => downloadPlan(plan, answers, paletteIndex)}>
          <Icon name="Download" className="h-4 w-4" />
          Download as text
        </Button>
        <Button variant="ghost" onClick={() => window.print()}>
          <Icon name="Receipt" className="h-4 w-4" />
          Print with colors
        </Button>
      </div>

      {modalOpen ? (
        <SavePlanModal
          plan={plan}
          answers={answers}
          paletteIndex={paletteIndex}
          onClose={() => setModalOpen(false)}
        />
      ) : null}
    </section>
  );
}
