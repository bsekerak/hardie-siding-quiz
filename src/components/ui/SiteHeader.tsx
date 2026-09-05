import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-stone-200/80 bg-stone-100/85 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-hardie-700 text-sm font-extrabold text-white"
          >
            JH
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-bold text-hardie-800">James Hardie</span>
            <span className="block text-[11px] font-medium uppercase tracking-[0.14em] text-slateCharcoal-muted">
              Siding Journey Guide
            </span>
          </span>
        </Link>
        <ButtonLink href="/quiz" variant="primary" className="hidden sm:inline-flex">
          Start your siding plan
        </ButtonLink>
      </div>
    </header>
  );
}
