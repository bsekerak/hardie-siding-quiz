"use client";

import { useState } from "react";
import { SectionHeading } from "@/components/results/SectionHeading";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/components/ui/cn";
import type { AuditItem } from "@/types/quiz";

const SEVERITY_STYLES: Record<AuditItem["severity"], { label: string; className: string }> = {
  required: { label: "Required", className: "bg-red-100 text-red-800" },
  recommended: { label: "Recommended", className: "bg-gold/20 text-gold-dark" },
  watch: { label: "Watch for it", className: "bg-stone-200 text-slateCharcoal-light" },
};

export function AuditChecklist({ items }: { items: AuditItem[] }) {
  const [checked, setChecked] = useState<ReadonlySet<string>>(new Set());

  const toggle = (id: string): void => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <section className="card p-6 sm:p-8">
      <SectionHeading
        eyebrow="Hidden costs audit"
        title="Confirm every one of these in writing"
        icon="ClipboardCheck"
        description="Tick them off as each bidder answers. An unanswered line is a line that becomes a change order later."
      />

      <ul className="space-y-2.5">
        {items.map((item) => {
          const isChecked = checked.has(item.id);
          const severity = SEVERITY_STYLES[item.severity];
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => toggle(item.id)}
                aria-pressed={isChecked}
                className={cn(
                  "flex w-full gap-3.5 rounded-xl border p-4 text-left transition-colors duration-150",
                  isChecked
                    ? "border-hardie-300 bg-hardie-50"
                    : "border-stone-200 bg-white hover:border-hardie-300",
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors",
                    isChecked ? "border-hardie-700 bg-hardie-700 text-white" : "border-stone-300",
                  )}
                >
                  {isChecked ? <Icon name="Check" className="h-3.5 w-3.5" strokeWidth={3} /> : null}
                </span>
                <span className="flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span
                      className={cn(
                        "text-[15px] font-semibold leading-snug",
                        isChecked ? "text-hardie-800 line-through decoration-hardie-400" : "text-slateCharcoal",
                      )}
                    >
                      {item.label}
                    </span>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                        severity.className,
                      )}
                    >
                      {severity.label}
                    </span>
                  </span>
                  <span className="mt-1.5 block text-[13px] leading-relaxed text-slateCharcoal-muted">
                    {item.detail}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <p className="mt-5 text-[13px] font-medium text-slateCharcoal-muted">
        {checked.size} of {items.length} confirmed
      </p>
    </section>
  );
}
