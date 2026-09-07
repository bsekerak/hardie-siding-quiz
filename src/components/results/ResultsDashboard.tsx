"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { AuditChecklist } from "@/components/results/AuditChecklist";
import { ClimateBadge } from "@/components/results/ClimateBadge";
import { ContractorSheet } from "@/components/results/ContractorSheet";
import { EngineeringSummaryBar } from "@/components/results/EngineeringSummaryBar";
import { CostPanel } from "@/components/results/CostPanel";
import { PaletteGrid } from "@/components/results/PaletteGrid";
import { PlanActions } from "@/components/results/PlanActions";
import { PlanResources } from "@/components/results/PlanResources";
import { PrintSummary } from "@/components/results/PrintSummary";
import { SpecCard } from "@/components/results/SpecCard";
import { StageBanner } from "@/components/results/StageBanner";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { useQuiz } from "@/context/QuizContext";
import { celebratePlan } from "@/lib/celebrate";
import { buildPlan } from "@/lib/engine";
import { decodePlan } from "@/lib/share";

function LoadingState() {
  return (
    <div className="container-page py-12">
      <div className="mx-auto max-w-5xl animate-pulse space-y-6">
        <div className="h-48 bg-stone-200" />
        <div className="h-40 bg-stone-200" />
        <div className="h-64 bg-stone-200" />
      </div>
    </div>
  );
}

function IncompleteState() {
  return (
    <div className="container-page py-20">
      <div className="mx-auto max-w-xl text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center bg-hardie-700 text-white">
          <Icon name="ClipboardCheck" className="h-7 w-7" />
        </span>
        <h1 className="mt-6 text-32p font-black tracking-tight text-slateCharcoal">
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
  const { answers: ownAnswers, hydrated, complete: ownComplete } = useQuiz();
  const searchParams = useSearchParams();
  const celebrated = useRef<boolean>(false);
  const [paletteIndex, setPaletteIndex] = useState<number>(0);

  // A ?plan= link carries a complete answer set, so a recipient sees the sender's
  // plan without having taken the quiz — and without overwriting their own saved
  // session, which stays untouched in localStorage.
  const shared = useMemo(() => {
    const code = searchParams.get("plan");
    return code ? decodePlan(code) : null;
  }, [searchParams]);

  const answers = shared ? shared.answers : ownAnswers;
  const complete = shared ? true : ownComplete;

  useEffect(() => {
    if (shared) setPaletteIndex(shared.paletteIndex);
  }, [shared]);

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

  const selectedPalette = plan.palettes[paletteIndex] ?? plan.palettes[0];
  if (!selectedPalette) return <IncompleteState />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="container-page py-10 sm:py-12"
    >
      <div className="mx-auto max-w-5xl space-y-5">
        <PrintSummary plan={plan} palette={selectedPalette} />

        {shared ? (
          <div data-print-hide className="border-l-[3px] border-hardie-700 bg-stone-200 p-5">
            <p className="text-sm font-bold text-hardie-800">You&apos;re viewing a shared plan</p>
            <p className="mt-1.5 text-[13px] leading-relaxed text-hardie-700">
              This specification was built from someone else&apos;s answers. Your own saved session
              is untouched — <ButtonLinkInline href="/quiz">build your own plan</ButtonLinkInline> to
              get a spec for your house and climate.
            </p>
          </div>
        ) : null}

        <header>
          <p className="eyebrow">Your Hardie siding plan</p>
          <h1 className="mt-1.5 text-32p font-black tracking-tight text-slateCharcoal sm:text-48p">
            Built from your 14 answers
          </h1>
          <p className="mt-2.5 max-w-2xl text-[15px] leading-relaxed text-slateCharcoal-muted">
            Everything below is derived from your ZIP, your house and your priorities. Nothing here
            is generic — and nothing here has been sent anywhere.
          </p>
        </header>

        <EngineeringSummaryBar climate={plan.climate} spec={plan.spec} />
        <StageBanner
          action={plan.stageAction}
          personaNote={plan.personaNote}
          diagnosis={plan.diagnosis}
        />
        <ClimateBadge climate={plan.climate} />
        <SpecCard spec={plan.spec} />
        <PaletteGrid
          palettes={plan.palettes}
          selectedIndex={paletteIndex}
          onSelect={setPaletteIndex}
        />
        <CostPanel cost={plan.cost} costPreference={answers.costPreference} />
        <AuditChecklist items={plan.audit} />
        <ContractorSheet questions={plan.contractorQuestions} />
        <PlanResources plan={plan} answers={answers} />
        <PlanActions plan={plan} answers={answers} paletteIndex={paletteIndex} />
      </div>
    </motion.div>
  );
}

function ButtonLinkInline({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="font-semibold underline decoration-hardie-400 underline-offset-2">
      {children}
    </Link>
  );
}
