import { SectionHeading } from "@/components/results/SectionHeading";
import { Icon } from "@/components/ui/Icon";
import type { QuizAnswers, SidingPlan } from "@/types/quiz";

/**
 * Every URL here was verified against jameshardie.com's live sitemap. Two of
 * them (/hardie-designer/ and /request-siding-quote/) sit behind bot protection
 * and return 403 to automated requests while loading normally in a browser.
 */
interface ResourceLink {
  href: string;
  title: string;
  body: string;
  icon: string;
  featured?: boolean;
}

const CORE_LINKS: readonly ResourceLink[] = [
  {
    href: "https://www.jameshardie.com/hardie-designer/",
    title: "See it on your own house",
    body: "Hardie™ Designer lets you upload a photo of your home and apply your actual siding profile and ColorPlus® color to it. Do this before you order samples — it eliminates the colors you thought you wanted in about five minutes.",
    icon: "Palette",
    featured: true,
  },
  {
    href: "https://www.jameshardie.com/statement-collection-colors/",
    title: "Order your color samples",
    body: "Order the body and trim colors from your selected palette. Screen color is not real color — hold physical samples on the wall, north face and south face, morning and late afternoon.",
    icon: "Layers",
  },
  {
    href: "https://www.jameshardie.com/find-a-contractor/",
    title: "Find a James Hardie contractor",
    body: "Contractors trained on Hardie installation specifics — the clearances, the joint flashing and the Trim-Over sequence that decide whether your warranty holds.",
    icon: "Hammer",
  },
  {
    href: "https://www.jameshardie.com/request-siding-quote/",
    title: "Request a siding quote",
    body: "Bring your specification with you. A quote written against a named profile, zone and color is a quote you can actually compare against another one.",
    icon: "Receipt",
  },
];

const PREP_LINKS: readonly ResourceLink[] = [
  {
    href: "https://www.jameshardie.com/blog/siding-project-planning/tips-for-choosing-a-contractor/",
    title: "Tips for choosing a contractor",
    body: "James Hardie's own guidance on vetting a crew — licensing, insurance and references. Pair it with the five questions above and you'll out-prepare most homeowners a contractor meets.",
    icon: "ClipboardCheck",
  },
  {
    href: "https://www.jameshardie.com/blog/siding-project-planning/plan-a-siding-project/",
    title: "How to plan a siding project",
    body: "What the sequence actually looks like end to end — timeline, permits, what happens to your landscaping, and how long your house is open.",
    icon: "Ruler",
  },
  {
    href: "https://www.jameshardie.com/request-re-side-guide/",
    title: "Request the re-siding guide",
    body: "A homeowner-facing walkthrough of the re-side process from James Hardie, mailed or delivered digitally.",
    icon: "Download",
  },
  {
    href: "https://www.jameshardie.com/color-design-guidance/",
    title: "Color & design guidance",
    body: "Deeper color theory if you want to pressure-test the palettes above against your own instincts.",
    icon: "Sparkles",
  },
];

function ResourceCard({ link }: { link: ResourceLink }) {
  return (
    <a
      href={link.href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex gap-3.5 rounded-xl border border-stone-200 bg-white p-5 transition-colors hover:border-hardie-400"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-hardie-50 text-hardie-700 transition-colors group-hover:bg-hardie-600 group-hover:text-white">
        <Icon name={link.icon} className="h-[18px] w-[18px]" />
      </span>
      <span className="flex-1">
        <span className="flex items-center gap-1.5 text-[15px] font-bold leading-snug text-slateCharcoal">
          {link.title}
          <Icon
            name="ArrowRight"
            className="h-3.5 w-3.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
          />
        </span>
        <span className="mt-1.5 block text-[13px] leading-relaxed text-slateCharcoal-muted">
          {link.body}
        </span>
      </span>
    </a>
  );
}

interface PlanResourcesProps {
  plan: SidingPlan;
  answers: QuizAnswers;
}

export function PlanResources({ plan, answers }: PlanResourcesProps) {
  const featured = CORE_LINKS.find((link) => link.featured);
  const rest = CORE_LINKS.filter((link) => !link.featured);

  const conditional: ResourceLink[] = [];
  if (answers.installer === "diy") {
    conditional.push({
      href: "https://www.jameshardie.com/build-with-hardie/safety-resources/silica-safety-resources/",
      title: "Silica safety — read this before you cut",
      body: "You told us you're doing some of the work. Cutting fiber cement releases respirable crystalline silica; this is James Hardie's own guidance on blades, shrouds, vacuums and respirators.",
      icon: "ShieldAlert",
    });
  }

  return (
    <section data-print-hide className="card p-6 sm:p-8">
      <SectionHeading
        eyebrow="Take it further"
        title="See it, sample it, then talk to a pro"
        icon="Sparkles"
        description="In that order. Homeowners who visualize and sample before they call a contractor make faster decisions and change their minds less often mid-project."
      />

      {featured ? (
        <a
          href={featured.href}
          target="_blank"
          rel="noopener noreferrer"
          className="group mb-4 flex flex-col gap-4 rounded-xl bg-hardie-700 p-6 text-white transition-colors hover:bg-hardie-800 sm:flex-row sm:items-center"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15">
            <Icon name={featured.icon} className="h-6 w-6" />
          </span>
          <span className="flex-1">
            <span className="flex items-center gap-2 text-lg font-extrabold leading-snug">
              {featured.title}
              <Icon name="ArrowRight" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
            <span className="mt-1.5 block text-[13px] leading-relaxed text-hardie-100">
              {featured.body}
            </span>
            <span className="mt-3 inline-block rounded-full bg-gold px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-hardie-900">
              Try {plan.palettes[0]?.body.name ?? "your palette"} first
            </span>
          </span>
        </a>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        {[...rest, ...conditional].map((link) => (
          <ResourceCard key={link.href} link={link} />
        ))}
      </div>

      <div className="mt-8 border-t border-stone-200 pt-6">
        <p className="eyebrow">Before the contractor visit</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {PREP_LINKS.map((link) => (
            <ResourceCard key={link.href} link={link} />
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-xl bg-stone-100 p-5">
        <p className="flex items-center gap-2 text-sm font-bold text-hardie-800">
          <Icon name="ClipboardCheck" className="h-4 w-4" />
          Walk into that visit with three things
        </p>
        <ol className="mt-3 space-y-2 text-[13px] leading-relaxed text-slateCharcoal-light">
          <li className="flex gap-3">
            <span className="font-bold text-hardie-700">1.</span>
            <span>
              Your printed plan — the spec sheet names the profile, {plan.spec.zone}® zone, ColorPlus®
              color and gutter size, so nothing gets substituted quietly.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="font-bold text-hardie-700">2.</span>
            <span>
              The {plan.contractorQuestions.length} questions above. Ask them in order, and write down
              what you hear rather than trusting your memory of three different visits.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="font-bold text-hardie-700">3.</span>
            <span>
              The hidden-costs checklist. Every unchecked line is a line that becomes a change order
              once the walls are open.
            </span>
          </li>
        </ol>
      </div>
    </section>
  );
}
