"use client";

import { Icon } from "@/components/ui/Icon";
import { cn } from "@/components/ui/cn";
import type { ChoiceOption } from "@/types/quiz";

interface ChipGroupProps<T extends string> {
  name: string;
  options: ReadonlyArray<ChoiceOption<T>>;
  values: readonly T[];
  onToggle: (value: T) => void;
  max?: number;
}

export function ChipGroup<T extends string>({
  name,
  options,
  values,
  onToggle,
  max,
}: ChipGroupProps<T>) {
  const atCap = typeof max === "number" && values.length >= max;

  return (
    <div>
      <div role="group" aria-label={name} className="flex flex-wrap gap-2.5">
        {options.map((option) => {
          const selected = values.includes(option.value);
          return (
            <button
              key={option.value}
              type="button"
              role="checkbox"
              aria-checked={selected}
              onClick={() => onToggle(option.value)}
              className={cn(
                "inline-flex items-center gap-2 rounded border px-4 py-2.5 text-sm font-semibold transition-colors duration-150",
                selected
                  ? "border-hardie-500 bg-hardie-500 text-white"
                  : "border-stone-300 bg-white text-slateCharcoal hover:border-slateCharcoal",
                !selected && atCap ? "opacity-60" : "",
              )}
            >
              {option.icon ? <Icon name={option.icon} className="h-4 w-4" /> : null}
              {option.label}
              {selected ? <Icon name="Check" className="h-3.5 w-3.5" /> : null}
            </button>
          );
        })}
      </div>
      {typeof max === "number" ? (
        <p className="mt-3 text-[13px] text-slateCharcoal-muted">
          {values.length} of {max} selected
          {atCap ? " — choosing another will replace your earliest pick." : "."}
        </p>
      ) : null}
    </div>
  );
}
