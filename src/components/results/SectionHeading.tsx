interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  /** Retained for call-site compatibility; JH headings don't carry an icon. */
  icon?: string;
  description?: string;
}

export function SectionHeading({ eyebrow, title, description }: SectionHeadingProps) {
  return (
    <div className="mb-6 border-b border-stone-300 pb-5">
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mt-2 text-24p font-bold text-slateCharcoal sm:text-28p">{title}</h2>
      {description ? (
        <p className="mt-2.5 max-w-2xl text-[14px] leading-relaxed text-slateCharcoal-light">
          {description}
        </p>
      ) : null}
    </div>
  );
}
