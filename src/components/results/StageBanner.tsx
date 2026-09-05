import { Icon } from "@/components/ui/Icon";
import type { StageAction } from "@/types/quiz";

interface StageBannerProps {
  action: StageAction;
  personaNote: string;
  diagnosis: string | null;
}

export function StageBanner({ action, personaNote, diagnosis }: StageBannerProps) {
  return (
    <section className="overflow-hidden rounded-2xl bg-hardie-700 text-white shadow-lifted">
      <div className="p-6 sm:p-9">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">
          Where you are right now
        </p>
        <h2 className="mt-3 text-2xl font-extrabold leading-tight tracking-tight sm:text-[32px]">
          {action.headline}
        </h2>
        <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-hardie-100">
          {action.summary}
        </p>

        <div className="mt-6 rounded-xl border border-gold/40 bg-hardie-800/60 p-5">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-gold">
            <Icon name="ArrowRight" className="h-4 w-4" />
            Your single next step
          </p>
          <p className="mt-2 text-[15px] font-semibold leading-relaxed text-white">
            {action.nextMilestone}
          </p>
        </div>

        {action.supportingPoints.length > 0 ? (
          <ul className="mt-6 grid gap-3 sm:grid-cols-3">
            {action.supportingPoints.map((point) => (
              <li
                key={point}
                className="rounded-xl bg-hardie-800/50 p-4 text-[13px] leading-relaxed text-hardie-100"
              >
                {point}
              </li>
            ))}
          </ul>
        ) : null}

        {diagnosis ? (
          <div className="mt-6 rounded-xl bg-white/95 p-5 text-slateCharcoal">
            <p className="eyebrow">What your symptoms indicate</p>
            <p className="mt-1.5 text-sm leading-relaxed">{diagnosis}</p>
          </div>
        ) : null}

        <p className="mt-6 text-[13px] leading-relaxed text-hardie-200">{personaNote}</p>
      </div>
    </section>
  );
}
