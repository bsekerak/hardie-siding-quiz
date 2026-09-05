import { Icon } from "@/components/ui/Icon";

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  icon: string;
  description?: string;
}

export function SectionHeading({ eyebrow, title, icon, description }: SectionHeadingProps) {
  return (
    <div className="mb-5 flex items-start gap-3.5">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-hardie-700 text-white">
        <Icon name={icon} className="h-5 w-5" />
      </span>
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="mt-0.5 text-xl font-extrabold tracking-tight text-hardie-800 sm:text-2xl">
          {title}
        </h2>
        {description ? (
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slateCharcoal-muted">
            {description}
          </p>
        ) : null}
      </div>
    </div>
  );
}
