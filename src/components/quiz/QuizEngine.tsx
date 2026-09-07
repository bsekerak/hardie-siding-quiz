"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";
import { ProgressBar } from "@/components/quiz/ProgressBar";
import { QuestionRenderer } from "@/components/quiz/QuestionRenderer";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { useQuiz } from "@/context/QuizContext";
import { TOTAL_QUESTION_COUNT, isStepAnswered } from "@/lib/flow";

const AUTO_ADVANCE_MS = 260;

export function QuizEngine() {
  const router = useRouter();
  const {
    answers,
    stepIndex,
    hydrated,
    restored,
    questions,
    currentQuestion,
    totalSteps,
    progress,
    goNext,
    goBack,
    reset,
    dismissRestoreNotice,
  } = useQuiz();

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current);
    };
  }, []);

  const isLastStep = stepIndex >= totalSteps - 1;
  const canAdvance = currentQuestion ? isStepAnswered(currentQuestion, answers) : false;

  const handleAutoAdvance = useCallback(() => {
    if (isLastStep) return;
    if (timerRef.current !== null) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      goNext();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, AUTO_ADVANCE_MS);
  }, [goNext, isLastStep]);

  const handleNext = useCallback(() => {
    if (!canAdvance) return;
    if (timerRef.current !== null) clearTimeout(timerRef.current);
    if (isLastStep) {
      router.push("/results");
      return;
    }
    goNext();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [canAdvance, goNext, isLastStep, router]);

  const handleBack = useCallback(() => {
    if (timerRef.current !== null) clearTimeout(timerRef.current);
    goBack();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [goBack]);

  if (!hydrated) {
    return (
      <div className="container-page py-12">
        <div className="mx-auto max-w-3xl animate-pulse space-y-5">
          <div className="h-[3px] w-full bg-stone-300" />
          <div className="h-9 w-3/4 bg-stone-200" />
          <div className="h-4 w-1/2 bg-stone-200" />
          <div className="grid gap-3 sm:grid-cols-2">
            {[0, 1, 2, 3, 4, 5].map((key) => (
              <div key={key} className="h-24 bg-stone-200" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuestion) return null;

  return (
    <div className="container-page py-10 sm:py-12">
      <div className="mx-auto max-w-3xl">
        <ProgressBar
          progress={progress}
          stepIndex={stepIndex}
          totalSteps={totalSteps}
          question={currentQuestion}
        />

        {restored ? (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-l-[3px] border-hardie-700 bg-stone-200 px-5 py-3.5">
            <p className="text-[13px] font-medium text-slateCharcoal">
              We picked up where you left off. Your answers are saved on this device.
            </p>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={dismissRestoreNotice} className="px-3 py-1.5 text-xs">
                Got it
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  reset();
                  window.scrollTo({ top: 0 });
                }}
                className="px-3 py-1.5 text-xs"
              >
                Start over
              </Button>
            </div>
          </div>
        ) : null}

        <AnimatePresence mode="wait">
          <motion.section
            key={currentQuestion.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="mt-8"
            aria-labelledby="question-title"
          >
            <p className="eyebrow">Question {currentQuestion.number} of {TOTAL_QUESTION_COUNT}</p>
            <h1
              id="question-title"
              className="mt-2.5 text-28p font-black tracking-tight text-slateCharcoal sm:text-40p"
            >
              {currentQuestion.title}
            </h1>
            {currentQuestion.helper ? (
              <p className="mt-2.5 max-w-2xl text-[15px] leading-relaxed text-slateCharcoal-muted">
                {currentQuestion.helper}
              </p>
            ) : null}

            <div className="mt-7">
              <QuestionRenderer question={currentQuestion} onAutoAdvance={handleAutoAdvance} />
            </div>
          </motion.section>
        </AnimatePresence>

        <div className="mt-10 flex items-center justify-between gap-4 border-t border-stone-300 pt-6">
          <Button variant="ghost" onClick={handleBack} disabled={stepIndex === 0}>
            <Icon name="ArrowLeft" className="h-4 w-4" />
            Back
          </Button>

          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-slateCharcoal-muted sm:block">
              {canAdvance ? "Saved automatically" : "Choose an answer to continue"}
            </span>
            <Button size="lg" onClick={handleNext} disabled={!canAdvance}>
              {isLastStep ? "Build my siding plan" : "Continue"}
              <span aria-hidden="true">&rarr;</span>
            </Button>
          </div>
        </div>

        <ol className="mt-8 flex flex-wrap gap-1.5" aria-label="Quiz steps">
          {questions.map((question, index) => (
            <li
              key={question.id}
              aria-current={index === stepIndex ? "step" : undefined}
              className={
                index === stepIndex
                  ? "h-[3px] w-8 bg-hardie-700"
                  : isStepAnswered(question, answers)
                    ? "h-[3px] w-8 bg-hardie-300"
                    : "h-[3px] w-8 bg-stone-300"
              }
            />
          ))}
        </ol>
      </div>
    </div>
  );
}
