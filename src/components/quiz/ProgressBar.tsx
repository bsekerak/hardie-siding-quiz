"use client";

import { motion } from "framer-motion";
import type { QuestionMeta } from "@/types/quiz";

interface ProgressBarProps {
  progress: number;
  stepIndex: number;
  totalSteps: number;
  question: QuestionMeta | null;
}

/** High-precision linear tracker — thin navy rule, tabular step count. */
export function ProgressBar({ progress, stepIndex, totalSteps, question }: ProgressBarProps) {
  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between gap-4 border-b border-stone-300 pb-3">
        <span className="eyebrow">
          {question ? `Section ${question.block} — ${question.blockLabel}` : "Getting started"}
        </span>
        <span className="spec-num text-[11px] font-bold uppercase tracking-[0.12em] text-slateCharcoal">
          Step {String(Math.min(stepIndex + 1, totalSteps)).padStart(2, "0")} / {String(totalSteps).padStart(2, "0")}
        </span>
      </div>
      <div
        className="h-[3px] w-full bg-stone-300"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress * 100)}
        aria-label="Quiz progress"
      >
        <motion.div
          className="h-full bg-hardie-700"
          initial={false}
          animate={{ width: `${Math.max(progress * 100, 2)}%` }}
          transition={{ type: "tween", ease: "easeOut", duration: 0.28 }}
        />
      </div>
    </div>
  );
}
