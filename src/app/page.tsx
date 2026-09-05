import { ResumeBanner } from "@/components/landing/ResumeBanner";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

const STEPS: ReadonlyArray<{ title: string; body: string; icon: string }> = [
  {
    title: "Tell us about your home",
    body: "ZIP code, age, what's on the walls now and how the house is put together. Your climate silently decides which Hardie® board line is engineered for your wall.",
    icon: "House",
  },
  {
    title: "Define your priorities",
    body: "What matters most, how long you're staying, who's doing the work, and what's staying on the exterior. These constraints do more design work than any color wheel.",
    icon: "ClipboardCheck",
  },
  {
    title: "Get your engineered spec",
    body: "A named profile, texture, ColorPlus® palette and trim package — plus a transparent cost range and the exact questions to ask every contractor who bids it.",
    icon: "Ruler",
  },
];

const BADGES: ReadonlyArray<{ title: string; body: string; icon: string }> = [
  {
    title: "30-year non-prorated warranty",
    body: "On the substrate — transferable, and a line item on your listing sheet.",
    icon: "ShieldCheck",
  },
  {
    title: "Class A fire rating",
    body: "Non-combustible per ASTM E136, which matters increasingly to insurers.",
    icon: "Flame",
  },
  {
    title: "Engineered for Climate®",
    body: "HZ5® and HZ10® are different boards. Getting the wrong one is a warranty problem.",
    icon: "Snowflake",
  },
];

const ANSWERS: ReadonlyArray<{ question: string; body: string }> = [
  {
    question: "Is my house too old to re-side safely?",
    body: "If it was built before 1978, federal law requires an EPA Lead-Safe certified firm. We flag it, price it and give you the certification question to ask.",
  },
  {
    question: "Why do my three bids differ by $18,000?",
    body: "Almost always scope omissions — tear-off, disposal, rot contingency, flashing, permits — not labor rates. We give you the line structure to force an apples-to-apples comparison.",
  },
  {
    question: "Will my insurance cover the undamaged walls?",
    body: "Most states have a uniform-appearance rule that applies when siding can no longer be matched. We tell you how to raise it with your adjuster in writing.",
  },
  {
    question: "Which color actually works on my house?",
    body: "The one that doesn't fight your roof and masonry. Warm brick eliminates cool gray. Black windows demand contrast. We build the palettes around what you're keeping.",
  },
];

export default function HomePage() {
  return (
    <>
      <section className="border-b border-stone-200 bg-gradient-to-b from-white to-stone-100">
        <div className="container-page py-16 sm:py-24">
          <div className="max-w-3xl">
            <ResumeBanner />
            <p className="eyebrow">Siding Journey Guide & Product Selector</p>
            <h1 className="mt-3 text-4xl font-extrabold leading-[1.08] tracking-tight text-hardie-800 sm:text-[56px]">
              Stop guessing at siding. Get an engineered specification.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slateCharcoal-light">
              Fourteen questions. In return you get the James Hardie® product line your climate
              actually requires, a profile and texture matched to your architecture, three ColorPlus®
              palettes built around what you&apos;re keeping, a transparent cost range with the
              commonly-omitted line items exposed, and the exact questions to ask every contractor
              who bids it.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <ButtonLink href="/quiz" size="lg">
                Start your siding plan
                <Icon name="ArrowRight" className="h-4 w-4" />
              </ButtonLink>
              <span className="text-sm font-medium text-slateCharcoal-muted">
                About 4 minutes · No account · Nothing leaves your browser
              </span>
            </div>

            <dl className="mt-12 grid gap-4 sm:grid-cols-3">
              {BADGES.map((badge) => (
                <div key={badge.title} className="rounded-xl border border-stone-200 bg-white p-5">
                  <Icon name={badge.icon} className="h-5 w-5 text-hardie-700" />
                  <dt className="mt-3 text-sm font-bold leading-snug text-slateCharcoal">
                    {badge.title}
                  </dt>
                  <dd className="mt-1.5 text-[13px] leading-relaxed text-slateCharcoal-muted">
                    {badge.body}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section className="container-page py-16 sm:py-20">
        <p className="eyebrow">How it works</p>
        <h2 className="mt-2 max-w-2xl text-3xl font-extrabold tracking-tight text-hardie-800 sm:text-4xl">
          Three blocks of questions, one specification
        </h2>
        <ol className="mt-10 grid gap-5 lg:grid-cols-3">
          {STEPS.map((step, index) => (
            <li key={step.title} className="card p-6">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-hardie-700 text-white">
                  <Icon name={step.icon} className="h-[18px] w-[18px]" />
                </span>
                <span className="text-xs font-bold uppercase tracking-[0.14em] text-slateCharcoal-muted">
                  Step {index + 1}
                </span>
              </div>
              <h3 className="mt-4 text-lg font-extrabold leading-snug text-hardie-800">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slateCharcoal-muted">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-y border-stone-200 bg-white">
        <div className="container-page py-16 sm:py-20">
          <p className="eyebrow">The questions nobody asks until it&apos;s expensive</p>
          <h2 className="mt-2 max-w-2xl text-3xl font-extrabold tracking-tight text-hardie-800 sm:text-4xl">
            We answer these before you sign anything
          </h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {ANSWERS.map((item) => (
              <div key={item.question} className="rounded-xl bg-stone-100 p-6">
                <h3 className="text-[15px] font-extrabold leading-snug text-slateCharcoal">
                  &ldquo;{item.question}&rdquo;
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-slateCharcoal-muted">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-16 sm:py-20">
        <div className="rounded-2xl bg-hardie-700 p-8 text-white sm:p-12">
          <h2 className="max-w-2xl text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
            Your climate already chose half your specification. Let&apos;s find out what it picked.
          </h2>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-hardie-100">
            Whether you&apos;re dealing with rot, a hail claim, a confusing stack of bids, or just a
            house you want to look better — the plan starts the same way.
          </p>
          <div className="mt-8">
            <ButtonLink href="/quiz" size="lg" variant="gold">
              Start your siding plan
              <Icon name="ArrowRight" className="h-4 w-4" />
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
