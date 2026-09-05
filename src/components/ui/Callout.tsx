import { Icon } from "@/components/ui/Icon";
import { cn } from "@/components/ui/cn";
import type { ReactNode } from "react";

type Tone = "info" | "warn" | "critical";

const TONES: Record<Tone, { wrapper: string; icon: string; iconName: string }> = {
  info: {
    wrapper: "border-hardie-200 bg-hardie-50 text-hardie-800",
    icon: "bg-hardie-700 text-white",
    iconName: "CircleHelp",
  },
  warn: {
    wrapper: "border-gold/40 bg-gold/10 text-slateCharcoal",
    icon: "bg-gold text-hardie-900",
    iconName: "TriangleAlert",
  },
  critical: {
    wrapper: "border-red-200 bg-red-50 text-red-900",
    icon: "bg-red-600 text-white",
    iconName: "ShieldAlert",
  },
};

interface CalloutProps {
  tone?: Tone;
  title: string;
  children: ReactNode;
  className?: string;
}

export function Callout({ tone = "info", title, children, className }: CalloutProps) {
  const style = TONES[tone];
  return (
    <div className={cn("flex gap-3 rounded-xl border p-4", style.wrapper, className)}>
      <span
        className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-lg", style.icon)}
      >
        <Icon name={style.iconName} className="h-4 w-4" />
      </span>
      <div className="flex-1">
        <p className="text-sm font-bold leading-snug">{title}</p>
        <div className="mt-1 text-[13px] leading-relaxed opacity-90">{children}</div>
      </div>
    </div>
  );
}
