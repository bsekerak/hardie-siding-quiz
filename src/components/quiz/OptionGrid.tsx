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
              "group flex w-full items-start gap-3.5 rounded border p-4 text-left transition-colors duration-150",
              selected
                ? "border-hardie-500 bg-hardie-50"
                : "border-stone-300 bg-white hover:border-slateCharcoal",
            )}
          >
            {option.icon ? (
              <span
                className={cn(
                  "mt-0.5 shrink-0 transition-colors",
                  selected ? "text-hardie-500" : "text-slateCharcoal-light",
                )}
              >
                <Icon name={option.icon} className="h-5 w-5" />
              </span>
            ) : null}
            <span className="flex-1">
              <span
                className={cn(
                  "block text-16p font-bold",
                  selected ? "text-hardie-600" : "text-slateCharcoal",
                )}
              >
                {option.label}
              </span>
              {option.description ? (
                <span className="mt-1.5 block text-[13px] leading-relaxed text-slateCharcoal-light">
                  {option.description}
                </span>
              ) : null}
            </span>
            <span
              aria-hidden="true"
              className={cn(
                "mt-1 h-4 w-4 shrink-0 rounded-full border transition-colors",
                selected ? "border-hardie-500 bg-hardie-500 ring-2 ring-inset ring-white" : "border-stone-400",
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
