import { Icon } from "@/components/ui/Icon";
import type { ClimateProfile } from "@/types/quiz";

interface ClimateBadgeProps {
  climate: ClimateProfile;
}

export function ClimateBadge({ climate }: ClimateBadgeProps) {
  const flags: Array<{ label: string; icon: string; active: boolean }> = [
    { label: "Hail corridor", icon: "CloudHail", active: climate.hailCorridor },
    { label: "Wildfire / WUI", icon: "Flame", active: climate.wildfireWui },
    { label: "Freeze / thaw", icon: "Snowflake", active: climate.freezeThaw },
    { label: "Coastal salt air", icon: "MapPin", active: climate.coastalSalt },
    { label: "Continuous insulation", icon: "Layers", active: climate.coldIecc },
  ].filter((flag) => flag.active);

  return (
    <section className="card p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <p className="eyebrow">Engineered for Climate®</p>
          <p className="spec-num mt-1 text-3xl font-black tracking-tight text-hardie-700">
            {climate.zone}
            <span className="align-super text-base">®</span>
          </p>
          <p className="mt-1 text-sm font-medium text-slateCharcoal-muted">
            ZIP {climate.zip} · {climate.regionLabel}
          </p>
        </div>
        <span className="inline-flex items-center gap-2 border border-stone-400 px-4 py-2 text-[12px] font-bold uppercase tracking-[0.08em] text-slateCharcoal">
          <Icon name="ShieldCheck" className="h-4 w-4" />
          Class A fire rating · ASTM E136 non-combustible
        </span>
      </div>

      <p className="mt-5 text-[15px] font-semibold text-slateCharcoal">{climate.zoneHeadline}</p>

      {flags.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {flags.map((flag) => (
            <span
              key={flag.label}
              className="inline-flex items-center gap-1.5 border border-gold-dark px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-gold-dark"
            >
              <Icon name={flag.icon} className="h-3.5 w-3.5" />
              {flag.label}
            </span>
          ))}
        </div>
      ) : null}

      <ul className="mt-5 space-y-3 border-t border-stone-300 pt-5">
        {climate.drivers.map((driver) => (
          <li key={driver} className="flex gap-3 text-sm leading-relaxed text-slateCharcoal-light">
            <Icon name="Check" className="mt-0.5 h-4 w-4 shrink-0 text-hardie-600" />
            <span>{driver}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
