"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useRef } from "react";
import { AuditChecklist } from "@/components/results/AuditChecklist";
import { ClimateBadge } from "@/components/results/ClimateBadge";
import { ContractorSheet } from "@/components/results/ContractorSheet";
import { CostPanel } from "@/components/results/CostPanel";
import { PaletteGrid } from "@/components/results/PaletteGrid";
import { PlanActions } from "@/components/results/PlanActions";
import { SpecCard } from "@/components/results/SpecCard";
import { StageBanner } from "@/components/results/StageBanner";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { useQuiz } from "@/context/QuizContext";
import { celebratePlan } from "@/lib/celebrate";
import { buildPlan } from "@/lib/engine";

function LoadingState() {
  return (
    <div className="container-page py-12">
      <div className="mx-auto max-w-5xl animate-pulse space-y-6">
        <div className="h-48 rounded-2xl bg-stone-200" />
        <div className="h-40 rounded-2xl bg-stone-200" />
        <div className="h-64 rounded-2xl bg-stone-200" />
      </div>
    </div>
  );
}

function IncompleteState() {
  return (
    <div className="container-page py-20">
      <div className="mx-auto max-w-xl text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-hardie-700 text-white">
          <Icon name="ClipboardCheck" className="h-7 w-7" />
        </span>
        <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-hardie-800">
          Your plan isn&apos;t built yet
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-slateCharcoal-muted">
          The specification is generated entirely from your answers — climate, house, priorities and
          color constraints. Finish the questions and we&apos;ll build it.
        </p>
        <div className="mt-7 flex justify-center gap-3">
          <ButtonLink href="/quiz" size="lg">
            Continue the quiz
            <Icon name="ArrowRight" className="h-4 w-4" />
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}

const CELEBRATED_KEY = "hardie-siding-plan-celebrated";

export function ResultsDashboard() {
  const { answers, hydrated, complete } = useQuiz();
  const celebrated = useRef<boolean>(false);

  const plan = useMemo(() => (complete ? buildPlan(answers) : null), [answers, complete]);

  // Fire once when the finished plan first appears. sessionStorage keeps a
  // reload or a return trip from feeling like a party the reader didn't earn.
  useEffect(() => {
    if (!hydrated || !complete || celebrated.current) return;
    celebrated.current = true;

    let alreadySeen = false;
    try {
      alreadySeen = window.sessionStorage.getItem(CELEBRATED_KEY) === "1";
      window.sessionStorage.setItem(CELEBRATED_KEY, "1");
    } catch {
      // Storage blocked — fall through and celebrate anyway.
    }
    if (alreadySeen) return;

    void celebratePlan();
  }, [hydrated, complete]);

  if (!hydrated) return <LoadingState />;
  if (!plan) return <IncompleteState />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="container-page py-10 sm:py-12"
    >
      <div className="mx-auto max-w-5xl space-y-6">
        <header>
          <p className="eyebrow">Your Hardie siding plan</p>
          <h1 className="mt-1.5 text-3xl font-extrabold leading-tight tracking-tight text-hardie-800 sm:text-[40px]">
            Built from your 14 answers
          </h1>
          <p className="mt-2.5 max-w-2xl text-[15px] leading-relaxed text-slateCharcoal-muted">
            Everything below is derived from your ZIP, your house and your priorities. Nothing here
            is generic — and nothing here has been sent anywhere.
          </p>
        </header>

        <StageBanner
          action={plan.stageAction}
          personaNote={plan.personaNote}
          diagnosis={plan.diagnosis}
        />
        <ClimateBadge climate={plan.climate} />
        <SpecCard spec={plan.spec} />
        <PaletteGrid palettes={plan.palettes} />
        <CostPanel cost={plan.cost} costPreference={answers.costPreference} />
        <AuditChecklist items={plan.audit} />
        <ContractorSheet questions={plan.contractorQuestions} />
        <PlanActions plan={plan} answers={answers} />
      </div>
    </motion.div>
  );
}
