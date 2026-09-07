import { Icon } from "@/components/ui/Icon";
import type { ProductSpec } from "@/types/quiz";

function SpecRow({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="spec-row">
      <dt className="spec-label">{label}</dt>
      <dd>
        <p className="text-[15px] font-bold leading-snug tracking-tight text-slateCharcoal">
          {value}
        </p>
        {note ? (
          <p className="mt-1.5 text-[13px] leading-relaxed text-slateCharcoal-muted">{note}</p>
        ) : null}
      </dd>
    </div>
  );
}

/** Formatted as an architectural submittal: header block, then spec rows. */
export function SpecCard({ spec }: { spec: ProductSpec }) {
  return (
    <section className="card">
      <header className="flex flex-wrap items-baseline justify-between gap-3 border-b-2 border-hardie-500 bg-stone-100 px-6 py-5 sm:px-8">
        <div>
          <p className="eyebrow">Section 07 46 46 — Fiber Cement Siding</p>
          <h2 className="mt-1.5 text-24p font-black tracking-tight text-slateCharcoal sm:text-28p">
            System Specification
          </h2>
        </div>
        <span className="spec-num border border-stone-400 bg-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-slateCharcoal">
          {spec.zone}® · ColorPlus®
        </span>
      </header>

      <div className="px-6 py-2 sm:px-8">
        <dl>
          <SpecRow label="Siding Profile" value={spec.primary.name} note={spec.primary.summary} />
          <SpecRow
            label="Texture / Exposure"
            value={`${spec.primary.texture} — ${spec.primary.exposure}`}
          />
          {spec.accent ? (
            <SpecRow
              label="Accent Profile"
              value={spec.accent.name}
              note={`Placement: ${spec.accentPlacement ?? "per elevation"}.`}
            />
          ) : null}
          <SpecRow
            label="Product Line"
            value={`${spec.zone}® climate-engineered board`}
            note="Confirm the zone designation on the delivery packing slip, not in conversation."
          />
          <SpecRow
            label="Finish"
            value="ColorPlus® Technology factory finish"
            note={spec.finishRationale}
          />
          <SpecRow
            label="Trim System"
            value={`${spec.trim.brand} ${spec.trim.product} — ${spec.trim.material}, ${spec.trim.thickness}`}
            note={`${spec.trim.reason} ${spec.trimColorNote}`}
          />
          <SpecRow label="Install Method" value={spec.install.method} note={spec.install.reason} />
          <SpecRow
            label="Gutters"
            value={spec.gutters.label}
            note={`${spec.gutters.detail} ${spec.gutters.rationale}`}
          />
        </dl>
      </div>

      {spec.trim.exclusionNote ? (
        <div className="mx-6 mb-6 border-l-[3px] border-gold bg-stone-200 p-5 sm:mx-8">
          <p className="text-[15px] font-bold tracking-tight text-slateCharcoal">
            Why not the other trim material?
          </p>
          <p className="mt-1.5 text-[13px] leading-relaxed text-slateCharcoal-muted">
            {spec.trim.exclusionNote}
          </p>
        </div>
      ) : null}

      <div className="border-t border-stone-300 bg-stone-100 px-6 py-6 sm:px-8">
        <p className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-[0.1em] text-slateCharcoal">
          <Icon name="Wrench" className="h-4 w-4" />
          Water Management Requirements
        </p>
        <ol className="mt-4 space-y-3">
          {spec.waterManagement.map((item, index) => (
            <li key={item} className="flex gap-4 text-[13px] leading-relaxed text-slateCharcoal-light">
              <span className="spec-num shrink-0 font-bold text-hardie-700">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
