import { SectionHeading } from "@/components/results/SectionHeading";
import { Icon } from "@/components/ui/Icon";
import { formatCurrency, formatRange } from "@/lib/finance";
import type { CostEstimate, CostPreference } from "@/types/quiz";

const FRAMING: Record<CostPreference, { title: string; body: string }> = {
  "lump-sum": {
    title: "Your working budget number",
    body: "Plan against the top of the range, not the bottom. Projects land high when rot is found, and the difference between the two ends of this band is almost entirely what's behind the siding.",
  },
  monthly: {
    title: "What this looks like as a payment",
    body: "Financed figures below are illustrative at a common home-improvement rate. Compare any contractor-arranged financing against your own bank or credit union before signing — dealer-arranged rates frequently carry a buy-down cost built into the project price.",
  },
  "line-item": {
    title: "The line structure to demand from every bidder",
    body: "Send this exact list to each contractor and require them to quote to it. Bid spread almost always comes from scope omissions, not from labor rates.",
  },
  insurance: {
    title: "How this maps to a claim",
    body: "Your carrier pays for damage, not for upgrades — but code-required items (flashing, water-resistive barrier, insulation) are frequently payable as a supplement. Document everything and get scope decisions in writing.",
  },
};

interface CostPanelProps {
  cost: CostEstimate;
  costPreference: CostPreference | null;
}

export function CostPanel({ cost, costPreference }: CostPanelProps) {
  const framing = FRAMING[costPreference ?? "lump-sum"];
  const hiddenItems = cost.lineItems.filter((item) => item.oftenHidden);

  return (
    <section className="card p-6 sm:p-8">
      <SectionHeading
        eyebrow="Transparent cost"
        title="Your estimated project investment"
        icon="CircleDollarSign"
        description={`Based on roughly ${cost.wallAreaSqFt.toLocaleString()} sq ft of wall area derived from your height and scope.`}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="bg-hardie-800 p-6 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold">
            Total project range
          </p>
          <p className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
            {formatRange(cost.totalLow, cost.totalHigh)}
          </p>
          <p className="mt-2 text-[13px] leading-relaxed text-hardie-100">
            Siding system, tear-off, contingencies and permits — everything below, added up.
          </p>
        </div>
        <div className="bg-stone-100 p-6">
          <p className="eyebrow">Estimated monthly</p>
          <p className="mt-2 text-3xl font-extrabold tracking-tight text-hardie-800 sm:text-4xl">
            {formatCurrency(cost.monthlyLow)} – {formatCurrency(cost.monthlyHigh)}
          </p>
          <p className="mt-2 text-[13px] leading-relaxed text-slateCharcoal-muted">
            Illustrative at {(cost.financeApr * 100).toFixed(2)}% APR over{" "}
            {cost.financeTermMonths / 12} years. Not an offer of credit.
          </p>
        </div>
      </div>

      <div className="mt-6 border-l-2 border-gold bg-stone-100 p-5">
        <p className="text-sm font-bold text-slateCharcoal">{framing.title}</p>
        <p className="mt-1.5 text-[13px] leading-relaxed text-slateCharcoal-light">{framing.body}</p>
      </div>

      <div className="mt-7 overflow-x-auto">
        <table className="w-full min-w-[520px] border-collapse text-left">
          <caption className="sr-only">Estimated cost breakdown by line item</caption>
          <thead>
            <tr className="border-b border-stone-300">
              <th className="pb-3 text-[11px] font-bold uppercase tracking-[0.1em] text-slateCharcoal-muted">
                Line item
              </th>
              <th className="pb-3 text-right text-[11px] font-bold uppercase tracking-[0.1em] text-slateCharcoal-muted">
                Estimated range
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-stone-300">
              <td className="py-4 pr-6">
                <p className="text-sm font-semibold text-slateCharcoal">
                  Siding system, installed
                </p>
                <p className="mt-1 text-[13px] leading-relaxed text-slateCharcoal-muted">
                  Board, trim, fasteners, labor and the ColorPlus® finish.
                </p>
              </td>
              <td className="whitespace-nowrap py-4 text-right text-sm font-bold text-slateCharcoal">
                {formatRange(cost.sidingLow, cost.sidingHigh)}
              </td>
            </tr>
            {cost.lineItems.map((item) => (
              <tr key={item.id} className="border-b border-stone-300">
                <td className="py-4 pr-6">
                  <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slateCharcoal">
                    {item.label}
                    {item.oftenHidden ? (
                      <span className="rounded-full bg-gold/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-gold-dark">
                        Often omitted
                      </span>
                    ) : null}
                  </p>
                  <p className="mt-1 text-[13px] leading-relaxed text-slateCharcoal-muted">
                    {item.detail}
                  </p>
                </td>
                <td className="whitespace-nowrap py-4 text-right text-sm font-bold text-slateCharcoal">
                  {formatRange(item.low, item.high)}
                </td>
              </tr>
            ))}
            <tr>
              <td className="py-4 text-base font-extrabold text-hardie-800">Total</td>
              <td className="whitespace-nowrap py-4 text-right text-base font-extrabold text-hardie-800">
                {formatRange(cost.totalLow, cost.totalHigh)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p className="mt-5 flex gap-2.5 text-[12px] leading-relaxed text-slateCharcoal-muted">
        <Icon name="TriangleAlert" className="mt-0.5 h-4 w-4 shrink-0 text-gold-dark" />
        <span>
          {hiddenItems.length} of these line items are commonly left out of a headline bid. These are
          directional planning figures built from national installed-price bands and your inputs —
          they are not a quote, and regional labor markets move them meaningfully.
        </span>
      </p>
    </section>
  );
}
