"use client";

import { SectionHeading } from "@/components/results/SectionHeading";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/components/ui/cn";
import { orderAs } from "@/data/palettes";
import { readableTextOn } from "@/data/colors";
import type { HardieColor, Palette } from "@/types/quiz";

function Swatch({ role, share, color: swatch }: { role: string; share: number; color: HardieColor }) {
  return (
    <div className="flex-1">
      <div
        className="print-exact flex h-20 items-end rounded-lg border border-black/10 p-2.5 sm:h-24"
        style={{ backgroundColor: swatch.hex }}
      >
        <span
          className="text-[11px] font-bold uppercase tracking-[0.1em]"
          style={{ color: readableTextOn(swatch.hex) }}
        >
          {role} · {share}%
        </span>
      </div>
      <p className="mt-2 text-[13px] font-semibold leading-tight text-slateCharcoal">
        {swatch.name}
      </p>
      <p className="text-[11px] font-medium uppercase tracking-wide text-slateCharcoal-muted">
        {swatch.collection} Collection
      </p>
    </div>
  );
}

interface PaletteGridProps {
  palettes: Palette[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

export function PaletteGrid({ palettes, selectedIndex, onSelect }: PaletteGridProps) {
  const activeId = palettes[selectedIndex]?.id ?? palettes[0]?.id ?? "";

  return (
    <section className="card p-6 sm:p-8">
      <SectionHeading
        eyebrow="Color strategy"
        title="Three curated ColorPlus® palettes"
        icon="Palette"
        description={`${palettes[0]?.familyLabel ?? "Your family"}, filtered against the roof, masonry and windows you\u2019re keeping.`}
      />

      <div className="grid gap-5 lg:grid-cols-3">
        {palettes.map((palette, index) => {
          const active = palette.id === activeId;
          return (
            <button
              key={palette.id}
              type="button"
              onClick={() => onSelect(index)}
              aria-pressed={active}
              className={cn(
                "rounded border p-4 text-left transition-all duration-150",
                active
                  ? "border-hardie-500 bg-hardie-50"
                  : "border-stone-300 bg-white hover:border-slateCharcoal",
              )}
            >
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-[15px] font-extrabold text-hardie-800">{palette.name}</p>
                {active ? (
                  <span className="rounded-full bg-hardie-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                    Selected
                  </span>
                ) : palette.hoaSafe ? (
                  <span className="rounded-full bg-hardie-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-hardie-700">
                    Board-friendly
                  </span>
                ) : null}
              </div>
              <p className="mt-1.5 text-[13px] leading-relaxed text-slateCharcoal-muted">
                {palette.tagline}
              </p>
              <div className="mt-4 flex h-3 overflow-hidden rounded-sm">
                <span className="block" style={{ width: "70%", backgroundColor: palette.body.color.hex }} />
                <span className="block" style={{ width: "20%", backgroundColor: palette.trim.color.hex }} />
                <span className="block" style={{ width: "10%", backgroundColor: palette.accent.color.hex }} />
              </div>
              <div className="mt-3 flex gap-2">
                <Swatch role={palette.body.roleLabel} share={palette.body.sharePercent} color={palette.body.color} />
                <Swatch role={palette.trim.roleLabel} share={palette.trim.sharePercent} color={palette.trim.color} />
                <Swatch role={palette.accent.roleLabel} share={palette.accent.sharePercent} color={palette.accent.color} />
              </div>
            </button>
          );
        })}
      </div>

      {palettes.map((palette) =>
        palette.id === activeId ? (
          <div key={palette.id} className="mt-6 border-l-2 border-hardie-500 bg-stone-100 p-6">
            <p className="flex items-center gap-2 text-sm font-bold text-hardie-800">
              <Icon name="CircleHelp" className="h-4 w-4" />
              Why {palette.name} works on your house
            </p>
            <p className="mt-2 text-[13px] leading-relaxed text-slateCharcoal-light">
              {palette.rationale}
            </p>
            <dl className="mt-4 space-y-2 border-t border-stone-300 pt-4">
              {[palette.body, palette.trim, palette.accent].map((entry) => (
                <div key={entry.roleLabel} className="grid gap-1 sm:grid-cols-[110px_1fr]">
                  <dt className="text-[11px] font-bold uppercase tracking-[0.1em] text-slateCharcoal-muted">
                    {entry.roleLabel} · {entry.sharePercent}%
                  </dt>
                  <dd>
                    <span className="block text-[13px] font-semibold text-slateCharcoal">
                      {orderAs(entry.color)}
                    </span>
                    <span className="block text-[12px] text-slateCharcoal-muted">
                      {entry.placement}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        ) : null,
      )}

      {palettes[0]?.undertoneWarning ? (
        <div className="mt-6 border-l-2 border-gold bg-stone-100 p-5">
          <p className="text-16p font-bold text-slateCharcoal">Check this one on the wall</p>
          <p className="mt-1.5 text-[13px] leading-relaxed text-slateCharcoal-light">
            {palettes[0].undertoneWarning}
          </p>
        </div>
      ) : null}

      <p className="mt-5 text-[12px] leading-relaxed text-slateCharcoal-muted">
        Color names are the official James Hardie Statement Collection names — that name is what you
        order by, so it is what belongs on your contract. Swatches shown here are screen
        approximations rather than published values. The selected palette is the one carried into your printout, your saved plan and any link you
        share. Swatches are screen approximations. Order physical samples and view them on the actual wall
        — north face and south face, morning and late afternoon — before you commit. Fiber cement
        finishes shift noticeably with sheen and daylight.
      </p>
    </section>
  );
}
