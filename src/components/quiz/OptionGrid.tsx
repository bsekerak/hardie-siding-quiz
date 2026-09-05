"use client";

import { Icon } from "@/components/ui/Icon";
import { cn } from "@/components/ui/cn";
import type { ChoiceOption } from "@/types/quiz";

interface OptionGridProps<T extends string> {
  name: string;
  options: ReadonlyArray<ChoiceOption<T>>;
  value: T | null;
  onSelect: (value: T) => void;
  columns?: 1 | 2 | 3;
}

const COLUMN_CLASS: Record<1 | 2 | 3, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
};

export function OptionGrid<T extends string>({
  name,
  options,
  value,
  onSelect,
  columns = 2,
}: OptionGridProps<T>) {
  return (
    <div role="radiogroup" aria-label={name} className={cn("grid gap-3", COLUMN_CLASS[columns])}>
      {options.map((option) => {
        const selected = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onSelect(option.value)}
            className={cn(
              "group flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-all duration-150",
              selected
                ? "border-hardie-700 bg-hardie-50 shadow-card ring-1 ring-hardie-700"
                : "border-stone-200 bg-white hover:border-hardie-300 hover:shadow-card",
            )}
          >
            {option.icon ? (
              <span
                className={cn(
                  "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors",
                  selected ? "bg-hardie-700 text-white" : "bg-stone-100 text-hardie-600",
                )}
              >
                <Icon name={option.icon} className="h-[18px] w-[18px]" />
              </span>
            ) : null}
            <span className="flex-1">
              <span
                className={cn(
                  "block text-[15px] font-semibold leading-snug",
                  selected ? "text-hardie-800" : "text-slateCharcoal",
                )}
              >
                {option.label}
              </span>
              {option.description ? (
                <span className="mt-1 block text-[13px] leading-relaxed text-slateCharcoal-muted">
                  {option.description}
                </span>
              ) : null}
            </span>
            <span
              aria-hidden="true"
              className={cn(
                "mt-1 h-4 w-4 shrink-0 rounded-full border-2 transition-colors",
                selected ? "border-hardie-700 bg-hardie-700 ring-2 ring-inset ring-white" : "border-stone-300",
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
