import { readableTextOn } from "@/data/colors";
import { formatRange } from "@/lib/finance";
import type { HardieColor, Palette, SidingPlan } from "@/types/quiz";

function PrintSwatch({ role, swatch }: { role: string; swatch: HardieColor }) {
  return (
    <div className="flex-1">
      <div
        className="print-exact flex h-20 items-end rounded border border-black/20 p-2"
        style={{ backgroundColor: swatch.hex }}
      >
        <span
          className="text-[10px] font-bold uppercase tracking-[0.1em]"
          style={{ color: readableTextOn(swatch.hex) }}
        >
          {role}
        </span>
      </div>
      <p className="mt-1.5 text-[12px] font-bold leading-tight text-slateCharcoal">{swatch.name}</p>
      <p className="text-[10px] font-medium uppercase tracking-wide text-slateCharcoal-muted">
        ColorPlus® · {swatch.hex}
      </p>
    </div>
  );
}

interface PrintSummaryProps {
  plan: SidingPlan;
  palette: Palette;
}

/**
 * Print-only cover sheet. A homeowner hands this to a contractor or a design
 * review board, so it leads with the color selection and the exact product
 * names rather than with narrative.
 */
export function PrintSummary({ plan, palette }: PrintSummaryProps) {
  return (
    <section className="print-only mb-6 border-b-2 border-hardie-700 pb-6">
      <div className="flex items-start justify-between gap-6">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-hardie-700">
            James Hardie · Siding Specification
          </p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slateCharcoal">
            {palette.body.color.name} on {plan.spec.primary.productLine}
          </h1>
          <p className="mt-1 text-[12px] font-medium text-slateCharcoal-muted">
            ZIP {plan.climate.zip} · {plan.climate.regionLabel} · {plan.climate.zone}® product line
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slateCharcoal-muted">
            Estimated investment
          </p>
          <p className="text-lg font-extrabold text-slateCharcoal">
            {formatRange(plan.cost.totalLow, plan.cost.totalHigh)}
          </p>
        </div>
      </div>

      <div className="mt-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slateCharcoal-muted">
          Selected palette — {palette.name}
        </p>
        <div className="mt-2 flex gap-3">
          <PrintSwatch role={`Body · ${palette.body.sharePercent}%`} swatch={palette.body.color} />
          <PrintSwatch role={`Trim · ${palette.trim.sharePercent}%`} swatch={palette.trim.color} />
          <PrintSwatch role={`Accent · ${palette.accent.sharePercent}%`} swatch={palette.accent.color} />
        </div>
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-x-8 gap-y-2">
        {[
          ["Profile", plan.spec.primary.name],
          ["Texture / exposure", `${plan.spec.primary.texture} — ${plan.spec.primary.exposure}`],
          ["Finish", "ColorPlus® Technology factory finish — not primed and field painted"],
          ["Trim", `${plan.spec.trim.brand} ${plan.spec.trim.product} — ${plan.spec.trim.thickness}`],
          ["Install method", plan.spec.install.method],
          ...(plan.spec.accent
            ? ([["Accent profile", `${plan.spec.accent.name} — ${plan.spec.accentPlacement ?? ""}`]] as const)
            : []),
        ].map(([label, value]) => (
          <div key={label} className="border-b border-stone-300 pb-1.5">
            <dt className="text-[9px] font-bold uppercase tracking-[0.1em] text-slateCharcoal-muted">
              {label}
            </dt>
            <dd className="text-[12px] font-semibold leading-snug text-slateCharcoal">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
