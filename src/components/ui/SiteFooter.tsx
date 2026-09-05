export function SiteFooter() {
  return (
    <footer className="border-t border-stone-200 bg-white">
      <div className="container-page py-10">
        <p className="max-w-3xl text-xs leading-relaxed text-slateCharcoal-muted">
          This tool is an independent planning aid built to help homeowners specify and budget a
          fiber cement siding project. James Hardie®, HardiePlank®, HardieShingle®, HardiePanel®,
          HardieTrim®, ColorPlus®, HZ5® and HZ10® are trademarks of James Hardie Technology Limited.
          Cost ranges are directional planning estimates derived from national installed-price bands
          and your inputs — they are not a quote. Color swatches are screen approximations; always
          confirm against a physical sample. Code requirements, permit rules and insurance
          matching statutes vary by jurisdiction — verify locally before contracting.
        </p>
        <p className="mt-6 text-xs font-medium text-slateCharcoal-muted">
          © {new Date().getFullYear()} Siding Journey Guide — a homeowner planning tool.
        </p>
      </div>
    </footer>
  );
}
