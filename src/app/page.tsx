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
      <section className="border-b border-stone-300 bg-white">
        <div className="container-page py-16 sm:py-24">
          <div className="max-w-3xl">
            <ResumeBanner />
            <p className="eyebrow">Siding Journey Guide & Product Selector</p>
            <h1 className="mt-4 text-40p font-bold text-slateCharcoal sm:text-48p">
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

            <dl className="mt-14 grid gap-8 sm:grid-cols-3">
              {BADGES.map((badge) => (
                <div key={badge.title} className="border-t-2 border-hardie-500 pt-4">
                  <dt className="text-16p font-bold text-slateCharcoal">{badge.title}</dt>
                  <dd className="mt-2 text-[13px] leading-relaxed text-slateCharcoal-light">
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
        <ol className="mt-12 grid gap-px bg-stone-300 lg:grid-cols-3">
          {STEPS.map((step, index) => (
            <li key={step.title} className="bg-stone-100 px-6 py-8">
              <span className="text-40p font-bold leading-none text-hardie-500">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-5 text-20p font-bold text-slateCharcoal">{step.title}</h3>
              <p className="mt-2.5 text-[14px] leading-relaxed text-slateCharcoal-light">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-y border-stone-300 bg-white">
        <div className="container-page py-16 sm:py-20">
          <p className="eyebrow">The questions nobody asks until it&apos;s expensive</p>
          <h2 className="mt-2 max-w-2xl text-32p font-bold text-slateCharcoal sm:text-40p">
            We answer these before you sign anything
          </h2>
          <div className="mt-12 grid gap-x-12 gap-y-10 sm:grid-cols-2">
            {ANSWERS.map((item) => (
              <div key={item.question} className="border-t border-stone-300 pt-5">
                <h3 className="text-20p font-bold text-slateCharcoal">
                  &ldquo;{item.question}&rdquo;
                </h3>
                <p className="mt-2.5 text-[14px] leading-relaxed text-slateCharcoal-light">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-16 sm:py-20">
        <div className="bg-hardie-800 px-8 py-14 text-white sm:px-14">
          <h2 className="max-w-2xl text-32p font-bold sm:text-40p">
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
