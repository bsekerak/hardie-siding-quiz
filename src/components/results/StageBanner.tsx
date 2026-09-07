import { Icon } from "@/components/ui/Icon";
import type { StageAction } from "@/types/quiz";

interface StageBannerProps {
  action: StageAction;
  personaNote: string;
  diagnosis: string | null;
}

export function StageBanner({ action, personaNote, diagnosis }: StageBannerProps) {
  return (
    <section className="bg-hardie-700 text-white">
      <div className="p-6 sm:p-9">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">
          Where you are right now
        </p>
        <h2 className="mt-3 text-28p font-black tracking-tight sm:text-40p">
          {action.headline}
        </h2>
        <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-stone-200">
          {action.summary}
        </p>

        <div className="mt-7 border-l-[3px] border-gold bg-black/20 p-5">
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
                className="border-t border-white/25 pt-4 text-[13px] leading-relaxed text-stone-200"
              >
                {point}
              </li>
            ))}
          </ul>
        ) : null}

        {diagnosis ? (
          <div className="mt-7 bg-white p-6 text-slateCharcoal">
            <p className="eyebrow">What your symptoms indicate</p>
            <p className="mt-1.5 text-sm leading-relaxed">{diagnosis}</p>
          </div>
        ) : null}

        <p className="mt-6 text-[13px] leading-relaxed text-stone-400">{personaNote}</p>
      </div>
    </section>
  );
}
