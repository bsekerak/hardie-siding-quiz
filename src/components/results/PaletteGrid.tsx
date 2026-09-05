"use client";

import { useState } from "react";
import { SectionHeading } from "@/components/results/SectionHeading";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/components/ui/cn";
import { readableTextOn } from "@/data/colors";
import type { HardieColor, Palette } from "@/types/quiz";

function Swatch({ role, color: swatch }: { role: string; color: HardieColor }) {
  return (
    <div className="flex-1">
      <div
        className="flex h-20 items-end rounded-lg border border-black/10 p-2.5 sm:h-24"
        style={{ backgroundColor: swatch.hex }}
      >
        <span
          className="text-[11px] font-bold uppercase tracking-[0.1em]"
          style={{ color: readableTextOn(swatch.hex) }}
        >
          {role}
        </span>
      </div>
      <p className="mt-2 text-[13px] font-semibold leading-tight text-slateCharcoal">
        {swatch.name}
      </p>
      <p className="text-[11px] font-medium uppercase tracking-wide text-slateCharcoal-muted">
        {swatch.collection} · {swatch.hex}
      </p>
    </div>
  );
}

export function PaletteGrid({ palettes }: { palettes: Palette[] }) {
  const [activeId, setActiveId] = useState<string>(palettes[0]?.id ?? "");

  return (
    <section className="card p-6 sm:p-8">
      <SectionHeading
        eyebrow="Color strategy"
        title="Three curated ColorPlus® palettes"
        icon="Palette"
        description="Built against your roof, masonry, window trim and approval constraints — not from a color wheel."
      />

      <div className="grid gap-5 lg:grid-cols-3">
        {palettes.map((palette) => {
          const active = palette.id === activeId;
          return (
            <button
              key={palette.id}
              type="button"
              onClick={() => setActiveId(palette.id)}
              aria-pressed={active}
              className={cn(
                "rounded-xl border p-4 text-left transition-all duration-150",
                active
                  ? "border-hardie-700 bg-hardie-50 ring-1 ring-hardie-700"
                  : "border-stone-200 bg-white hover:border-hardie-300",
              )}
            >
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-[15px] font-extrabold text-hardie-800">{palette.name}</p>
                {palette.hoaSafe ? (
                  <span className="rounded-full bg-hardie-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-hardie-700">
                    Board-friendly
                  </span>
                ) : null}
              </div>
              <p className="mt-1.5 text-[13px] leading-relaxed text-slateCharcoal-muted">
                {palette.tagline}
              </p>
              <div className="mt-4 flex gap-2">
                <Swatch role="Body" color={palette.body} />
                <Swatch role="Trim" color={palette.trim} />
                <Swatch role="Accent" color={palette.accent} />
              </div>
            </button>
          );
        })}
      </div>

      {palettes.map((palette) =>
        palette.id === activeId ? (
          <div key={palette.id} className="mt-6 rounded-xl bg-stone-100 p-5">
            <p className="flex items-center gap-2 text-sm font-bold text-hardie-800">
              <Icon name="CircleHelp" className="h-4 w-4" />
              Why {palette.name} works on your house
            </p>
            <p className="mt-2 text-[13px] leading-relaxed text-slateCharcoal-light">
              {palette.rationale}
            </p>
            <p className="mt-3 text-[13px] leading-relaxed text-slateCharcoal-light">
              <span className="font-semibold">Accent use:</span> {palette.accent.name} belongs on the
              front door, shutters or a single gable — not on more than roughly 15% of the visible
              elevation.
            </p>
          </div>
        ) : null,
      )}

      <p className="mt-5 text-[12px] leading-relaxed text-slateCharcoal-muted">
        Swatches are screen approximations. Order physical samples and view them on the actual wall
        — north face and south face, morning and late afternoon — before you commit. Fiber cement
        finishes shift noticeably with sheen and daylight.
      </p>
    </section>
  );
}
