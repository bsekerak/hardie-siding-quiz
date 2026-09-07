"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { downloadPlan } from "@/lib/planExport";
import type { QuizAnswers, SidingPlan } from "@/types/quiz";

interface SavePlanModalProps {
  plan: SidingPlan;
  answers: QuizAnswers;
  paletteIndex: number;
  onClose: () => void;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function SavePlanModal({ plan, answers, paletteIndex, onClose }: SavePlanModalProps) {
  const [email, setEmail] = useState<string>("");
  const [touched, setTouched] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const valid = EMAIL_PATTERN.test(email);

  useEffect(() => {
    inputRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  const handleSave = (): void => {
    setTouched(true);
    if (!valid) return;
    try {
      window.localStorage.setItem("hardie-siding-plan-email", email);
    } catch {
      // Storage unavailable — the download below still works.
    }
    downloadPlan(plan, answers, paletteIndex);
    setSaved(true);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slateCharcoal/50 p-4 backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="save-plan-title"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="w-full max-w-lg border-t-4 border-hardie-500 bg-white p-6 shadow-lifted sm:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Save your plan</p>
            <h2
              id="save-plan-title"
              className="mt-1.5 text-24p font-black tracking-tight text-slateCharcoal"
            >
              {saved ? "Your plan is downloading" : "Keep a copy of your specification"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-2 text-slateCharcoal-muted transition-colors hover:bg-stone-100 hover:text-slateCharcoal"
          >
            <Icon name="X" className="h-5 w-5" />
          </button>
        </div>

        {saved ? (
          <div className="mt-5">
            <div className="flex gap-3 border-l-[3px] border-hardie-500 bg-stone-200 p-4">
              <Icon name="Check" className="mt-0.5 h-5 w-5 shrink-0 text-hardie-700" />
              <p className="text-[13px] leading-relaxed text-hardie-800">
                A plain-text copy of your full plan has been saved to your device. Forward it to
                every contractor you&apos;re getting bids from so they&apos;re all quoting the same
                scope.
              </p>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button variant="secondary" onClick={() => window.print()}>
                <Icon name="Receipt" className="h-4 w-4" />
                Print this page
              </Button>
              <Button onClick={onClose}>Done</Button>
            </div>
          </div>
        ) : (
          <div className="mt-5">
            <p className="text-[13px] leading-relaxed text-slateCharcoal-muted">
              This tool runs entirely in your browser — there is no server behind it, so nothing is
              transmitted anywhere. Your email is stored locally only, and your plan downloads
              directly to this device as a text file you can forward to contractors.
            </p>

            <label htmlFor="plan-email" className="mt-5 block text-sm font-semibold text-slateCharcoal">
              Email address
            </label>
            <input
              id="plan-email"
              ref={inputRef}
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              onBlur={() => setTouched(true)}
              onKeyDown={(event) => {
                if (event.key === "Enter") handleSave();
              }}
              placeholder="you@example.com"
              aria-invalid={touched && !valid}
              className="mt-2 w-full rounded-none border border-stone-400 bg-white px-4 py-3 text-[15px] text-slateCharcoal placeholder:text-stone-400 focus:border-hardie-500"
            />
            {touched && !valid ? (
              <p className="mt-2 text-[13px] font-medium text-red-700">
                Enter a valid email address, or close this and use the download button on the page.
              </p>
            ) : null}

            <div className="mt-5 flex flex-wrap gap-3">
              <Button size="lg" onClick={handleSave}>
                <Icon name="Download" className="h-4 w-4" />
                Save my plan
              </Button>
              <Button variant="ghost" size="lg" onClick={onClose}>
                Not now
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
