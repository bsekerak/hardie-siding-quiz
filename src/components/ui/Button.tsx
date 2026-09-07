import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/components/ui/cn";

type Variant = "primary" | "secondary" | "ghost" | "gold";
type Size = "md" | "lg";

/** Square, institutional CTAs. Never pills, never elevation. */
const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-hardie-700 text-white border-2 border-hardie-700 hover:bg-hardie-800 hover:border-hardie-800 disabled:bg-stone-300 disabled:border-stone-300 disabled:text-slateCharcoal-muted",
  secondary:
    "bg-white text-hardie-700 border-2 border-hardie-700 hover:bg-hardie-700 hover:text-white",
  ghost:
    "bg-transparent text-slateCharcoal-light border-2 border-transparent hover:text-hardie-700 hover:underline",
  gold: "bg-gold text-slateCharcoal border-2 border-gold hover:bg-gold-light hover:border-gold-light",
};

const SIZES: Record<Size, string> = {
  md: "px-5 py-2.5 text-[13px]",
  lg: "px-8 py-4 text-[15px]",
};

const BASE =
  "inline-flex items-center justify-center gap-2.5 rounded-none font-bold uppercase tracking-[0.08em] transition-colors duration-150 disabled:cursor-not-allowed";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button type={type} className={cn(BASE, VARIANTS[variant], SIZES[size], className)} {...rest}>
      {children}
    </button>
  );
}

interface ButtonLinkProps {
  href: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
}: ButtonLinkProps) {
  return (
    <Link href={href} className={cn(BASE, VARIANTS[variant], SIZES[size], className)}>
      {children}
    </Link>
  );
}

/** The authoritative right arrow used on primary CTAs. */
export function CtaArrow() {
  return (
    <span aria-hidden="true" className="text-[1.05em] leading-none">
      &rarr;
    </span>
  );
}
