import { SectionHeading } from "@/components/results/SectionHeading";
import { ArrowOut } from "@/components/ui/ArrowOut";
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
      className="group flex flex-col bg-stone-100 px-6 pb-6 pt-6"
    >
      <span className="flex items-start justify-between gap-4">
        <span className="jh-link-title text-16p font-bold md:text-20p">{link.title}</span>
        <ArrowOut className="mt-0.5 h-5 w-5 shrink-0 text-slateCharcoal transition-colors group-hover:text-hardie-500" />
      </span>
      <span className="mt-3 block text-[13px] leading-relaxed text-slateCharcoal-light">
        {link.body}
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
          className="group mb-3 block bg-hardie-800 px-6 py-8 text-white sm:px-8"
        >
          <span className="flex items-start justify-between gap-6">
            <span className="max-w-2xl">
              <span className="block text-24p font-bold group-hover:underline sm:text-28p">
                {featured.title}
              </span>
              <span className="mt-3 block text-[14px] leading-relaxed text-stone-200">
                {featured.body}
              </span>
              <span className="mt-5 inline-block border-b-2 border-gold pb-1 text-[13px] font-bold uppercase tracking-[0.1em] text-gold">
                Start with {plan.palettes[0]?.body.color.name ?? "your palette"}
              </span>
            </span>
            <ArrowOut className="h-6 w-6 shrink-0 text-white" />
          </span>
        </a>
      ) : null}

      <div className="grid gap-px bg-stone-300 sm:grid-cols-2">
        {[...rest, ...conditional].map((link) => (
          <ResourceCard key={link.href} link={link} />
        ))}
      </div>

      <div className="mt-8 border-t border-stone-200 pt-6">
        <p className="eyebrow">Before the contractor visit</p>
        <div className="mt-4 grid gap-px bg-stone-300 sm:grid-cols-2">
          {PREP_LINKS.map((link) => (
            <ResourceCard key={link.href} link={link} />
          ))}
        </div>
      </div>

      <div className="mt-8 border-l-2 border-hardie-500 bg-stone-100 p-6">
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
