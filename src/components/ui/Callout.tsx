import { Icon } from "@/components/ui/Icon";
import { cn } from "@/components/ui/cn";
import type { ReactNode } from "react";

type Tone = "info" | "warn" | "critical";

const TONES: Record<Tone, { wrapper: string; icon: string; iconName: string }> = {
  info: {
    wrapper: "border-l-[3px] border-hardie-500 bg-stone-200 text-slateCharcoal",
    icon: "text-hardie-700",
    iconName: "CircleHelp",
  },
  warn: {
    wrapper: "border-l-[3px] border-gold bg-stone-200 text-slateCharcoal",
    icon: "text-gold-dark",
    iconName: "TriangleAlert",
  },
  critical: {
    wrapper: "border-l-[3px] border-red-700 bg-red-50 text-slateCharcoal",
    icon: "text-red-700",
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
    <div className={cn("flex gap-3 rounded border p-4", style.wrapper, className)}>
      <span
        className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-lg", style.icon)}
      >
        <Icon name={style.iconName} className="h-4 w-4" />
      </span>
      <div className="flex-1">
        <p className="text-16p font-bold">{title}</p>
        <div className="mt-1 text-[13px] leading-relaxed opacity-90">{children}</div>
      </div>
    </div>
  );
}
