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

/**
 * Architectural tile selector: square edges, 1px structural border, and a 2px
 * navy border plus a corner checkmark badge when selected. No glow, no lift.
 */
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
              "group relative flex w-full items-start gap-3.5 rounded-none p-5 text-left transition-colors duration-150",
              selected
                ? "border-2 border-hardie-500 bg-hardie-50"
                : "border border-stone-300 bg-white hover:border-slateCharcoal",
            )}
          >
            {selected ? (
              <span
                aria-hidden="true"
                className="absolute right-0 top-0 flex h-6 w-6 items-center justify-center bg-hardie-500 text-white"
              >
                <Icon name="Check" className="h-3.5 w-3.5" strokeWidth={3} />
              </span>
            ) : null}

            {option.icon ? (
              <span
                className={cn(
                  "mt-0.5 shrink-0 transition-colors",
                  selected ? "text-hardie-700" : "text-slateCharcoal-muted",
                )}
              >
                <Icon name={option.icon} className="h-5 w-5" />
              </span>
            ) : null}

            <span className="flex-1 pr-4">
              <span
                className={cn(
                  "block text-[15px] font-bold leading-snug tracking-tight",
                  selected ? "text-hardie-700" : "text-slateCharcoal",
                )}
              >
                {option.label}
              </span>
              {option.description ? (
                <span className="mt-1.5 block text-[13px] leading-relaxed text-slateCharcoal-muted">
                  {option.description}
                </span>
              ) : null}
            </span>
          </button>
        );
      })}
    </div>
  );
}
