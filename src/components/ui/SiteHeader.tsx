import Link from "next/link";
import { ButtonLink, CtaArrow } from "@/components/ui/Button";

const NAV_LINKS: ReadonlyArray<{ label: string; href: string }> = [
  { label: "Products", href: "https://www.jameshardie.com/statement-collection-colors/" },
  { label: "Inspiration", href: "https://www.jameshardie.com/hardie-designer/" },
  { label: "Find a Pro", href: "https://www.jameshardie.com/find-a-contractor/" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-stone-300 bg-white">
      <div className="container-page flex h-[72px] items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-3.5">
          <span
            aria-hidden="true"
            className="flex h-10 w-10 items-center justify-center bg-hardie-500 text-[13px] font-black tracking-tight text-white"
          >
            JH
          </span>
          <span className="leading-tight">
            <span className="block text-[15px] font-black uppercase tracking-[0.04em] text-hardie-700">
              James Hardie
            </span>
            <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-slateCharcoal-muted">
              Siding Journey Guide
            </span>
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[12px] font-bold uppercase tracking-[0.1em] text-slateCharcoal-light transition-colors hover:text-hardie-600"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <ButtonLink href="/quiz" variant="primary" className="hidden sm:inline-flex">
          Request a Plan
          <CtaArrow />
        </ButtonLink>
      </div>
    </header>
  );
}
