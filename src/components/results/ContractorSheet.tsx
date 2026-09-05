"use client";

import { useState } from "react";
import { SectionHeading } from "@/components/results/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type { ContractorQuestion } from "@/types/quiz";

function questionsToText(questions: ContractorQuestion[]): string {
  return questions
    .map((item, index) => `${index + 1}. ${item.question}\n   (Looking for: ${item.goodAnswer})`)
    .join("\n\n");
}

export function ContractorSheet({ questions }: { questions: ContractorQuestion[] }) {
  const [copied, setCopied] = useState<boolean>(false);

  const copy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(questionsToText(questions));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      // Clipboard permission denied — the questions are on screen regardless.
    }
  };

  return (
    <section className="card p-6 sm:p-8">
      <SectionHeading
        eyebrow="Contractor conversation sheet"
        title="Ask these exact questions"
        icon="Hammer"
        description="These are the questions that separate a Hardie-experienced crew from a general remodeler who has watched a video."
      />

      <ol className="space-y-4">
        {questions.map((item, index) => (
          <li key={item.id} className="rounded-xl border border-stone-200 bg-stone-50 p-5">
            <div className="flex gap-3.5">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-hardie-700 text-[13px] font-bold text-white">
                {index + 1}
              </span>
              <div className="flex-1">
                <p className="text-[15px] font-bold leading-snug text-slateCharcoal">
                  &ldquo;{item.question}&rdquo;
                </p>
                <p className="mt-2.5 text-[13px] leading-relaxed text-slateCharcoal-muted">
                  <span className="font-semibold text-slateCharcoal-light">Why it matters: </span>
                  {item.whyItMatters}
                </p>
                <p className="mt-2 flex gap-2 text-[13px] leading-relaxed text-hardie-700">
                  <Icon name="Check" className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>
                    <span className="font-semibold">A good answer sounds like: </span>
                    {item.goodAnswer}
                  </span>
                </p>
              </div>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-6">
        <Button variant="secondary" onClick={copy}>
          <Icon name={copied ? "Check" : "ClipboardCheck"} className="h-4 w-4" />
          {copied ? "Copied to clipboard" : "Copy questions"}
        </Button>
      </div>
    </section>
  );
}
