import { SectionHeading } from "@/components/results/SectionHeading";
import { Icon } from "@/components/ui/Icon";
import type { ProductSpec } from "@/types/quiz";

interface SpecRowProps {
  label: string;
  value: string;
  note?: string;
}

function SpecRow({ label, value, note }: SpecRowProps) {
  return (
    <div className="grid gap-1 border-b border-stone-300 py-4 last:border-0 sm:grid-cols-[180px_1fr] sm:gap-6">
      <dt className="text-[13px] font-bold uppercase tracking-[0.08em] text-slateCharcoal-muted">
        {label}
      </dt>
      <dd>
        <p className="text-[15px] font-semibold leading-snug text-slateCharcoal">{value}</p>
        {note ? (
          <p className="mt-1.5 text-[13px] leading-relaxed text-slateCharcoal-muted">{note}</p>
        ) : null}
      </dd>
    </div>
  );
}

export function SpecCard({ spec }: { spec: ProductSpec }) {
  return (
    <section className="card p-6 sm:p-8">
      <SectionHeading
        eyebrow="Your specification"
        title="Engineered product spec"
        icon="Ruler"
        description="Put this in your contract by name. Every line below is something a bid can quietly substitute."
      />

      <dl className="mt-2">
        <SpecRow
          label="Primary profile"
          value={spec.primary.name}
          note={spec.primary.summary}
        />
        <SpecRow
          label="Texture & exposure"
          value={`${spec.primary.texture} texture — ${spec.primary.exposure}`}
        />
        {spec.accent ? (
          <SpecRow
            label="Accent profile"
            value={spec.accent.name}
            note={`Placement: ${spec.accentPlacement ?? "per elevation"}. ${spec.accent.summary}`}
          />
        ) : null}
        <SpecRow
          label="Product line"
          value={`${spec.zone}® — climate-engineered board`}
          note="Confirm the zone designation on the delivery packing slip, not in conversation."
        />
        <SpecRow
          label="Finish"
          value="ColorPlus® Technology factory finish"
          note={spec.finishRationale}
        />
        <SpecRow
          label="Trim"
          value={`${spec.trim.product} — ${spec.trim.material}, ${spec.trim.thickness}`}
          note={`${spec.trim.reason} ${spec.trimColorNote}`}
        />
        <SpecRow
          label="Gutters"
          value={spec.gutters.label}
          note={`${spec.gutters.detail} ${spec.gutters.rationale}`}
        />
        <SpecRow
          label="Install method"
          value={spec.install.method}
          note={spec.install.reason}
        />
      </dl>

      {spec.trim.exclusionNote ? (
        <div className="mt-6 border-l-2 border-gold bg-stone-100 p-5">
          <p className="text-16p font-bold text-slateCharcoal">
            Why not the other trim material?
          </p>
          <p className="mt-1.5 text-[13px] leading-relaxed text-slateCharcoal-light">
            {spec.trim.exclusionNote}
          </p>
        </div>
      ) : null}

      <div className="mt-8 border-l-2 border-hardie-500 bg-stone-100 p-6">
        <p className="flex items-center gap-2 text-sm font-bold text-hardie-800">
          <Icon name="Wrench" className="h-4 w-4" />
          Water management — the part that decides whether this lasts 30 years
        </p>
        <ul className="mt-3 space-y-2.5">
          {spec.waterManagement.map((item) => (
            <li key={item} className="flex gap-3 text-[13px] leading-relaxed text-slateCharcoal-light">
              <span aria-hidden="true" className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
