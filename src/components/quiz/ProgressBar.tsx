"use client";

import { motion } from "framer-motion";
import type { QuestionMeta } from "@/types/quiz";

interface ProgressBarProps {
  progress: number;
  stepIndex: number;
  totalSteps: number;
  question: QuestionMeta | null;
}

export function ProgressBar({ progress, stepIndex, totalSteps, question }: ProgressBarProps) {
  return (
    <div>
      <div className="mb-2.5 flex items-baseline justify-between gap-4">
        <span className="eyebrow">
          {question ? `Block ${question.block} — ${question.blockLabel}` : "Getting started"}
        </span>
        <span className="text-xs font-semibold text-slateCharcoal-muted">
          Step {Math.min(stepIndex + 1, totalSteps)} of {totalSteps}
        </span>
      </div>
      <div
        className="h-1.5 w-full overflow-hidden rounded-full bg-stone-200"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress * 100)}
        aria-label="Quiz progress"
      >
        <motion.div
          className="h-full rounded-full bg-hardie-700"
          initial={false}
          animate={{ width: `${Math.max(progress * 100, 4)}%` }}
          transition={{ type: "spring", stiffness: 160, damping: 24 }}
        />
      </div>
    </div>
  );
}
