const COLUMNS: ReadonlyArray<{
  heading: string;
  links: ReadonlyArray<{ label: string; href: string }>;
}> = [
  {
    heading: "Products",
    links: [
      { label: "Statement Collection Colors", href: "https://www.jameshardie.com/statement-collection-colors/" },
      { label: "Color & Design Guidance", href: "https://www.jameshardie.com/color-design-guidance/" },
      { label: "Hardie™ Designer", href: "https://www.jameshardie.com/hardie-designer/" },
    ],
  },
  {
    heading: "Planning",
    links: [
      { label: "Plan a Siding Project", href: "https://www.jameshardie.com/blog/siding-project-planning/plan-a-siding-project/" },
      { label: "Choosing a Contractor", href: "https://www.jameshardie.com/blog/siding-project-planning/tips-for-choosing-a-contractor/" },
      { label: "Request the Re-Side Guide", href: "https://www.jameshardie.com/request-re-side-guide/" },
    ],
  },
  {
    heading: "Trade Professionals",
    links: [
      { label: "Find a Contractor", href: "https://www.jameshardie.com/find-a-contractor/" },
      { label: "Request a Siding Quote", href: "https://www.jameshardie.com/request-siding-quote/" },
      { label: "Silica Safety Resources", href: "https://www.jameshardie.com/build-with-hardie/safety-resources/silica-safety-resources/" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="bg-slateCharcoal text-white">
      <div className="container-page py-14">
        <div className="grid gap-10 border-b border-white/15 pb-12 lg:grid-cols-[1.3fr_2fr]">
          <div>
            <span
              aria-hidden="true"
              className="flex h-11 w-11 items-center justify-center bg-white text-[14px] font-black text-hardie-700"
            >
              JH
            </span>
            <p className="mt-5 max-w-sm text-[13px] leading-relaxed text-stone-400">
              An independent homeowner planning tool for specifying and budgeting a James Hardie
              fiber cement siding project.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="border border-gold px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-gold">
                30-Year Warranty
              </span>
              <span className="border border-white/30 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-stone-300">
                Class A Fire Rating
              </span>
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {COLUMNS.map((column) => (
              <div key={column.heading}>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white">
                  {column.heading}
                </p>
                <ul className="mt-4 space-y-2.5">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[13px] leading-snug text-stone-400 transition-colors hover:text-white hover:underline"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-8 max-w-4xl text-[11px] leading-relaxed text-stone-500">
          James Hardie®, HardiePlank®, HardieShingle®, HardiePanel®, HardieTrim®, ColorPlus®, HZ5®
          and HZ10® are trademarks of James Hardie Technology Limited. AZEK® is a trademark of The
          AZEK Company. Cost ranges are directional planning estimates derived from national
          installed-price bands and your inputs — they are not a quote. Color swatches are screen
          approximations; confirm against a physical sample. Code requirements, permit rules and
          insurance matching statutes vary by jurisdiction — verify locally before contracting.
        </p>
        <p className="mt-5 text-[11px] font-medium uppercase tracking-[0.12em] text-stone-500">
          © {new Date().getFullYear()} Siding Journey Guide — a homeowner planning tool
        </p>
      </div>
    </footer>
  );
}
