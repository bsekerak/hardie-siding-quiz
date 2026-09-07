import type { Metadata } from "next";
import { Suspense } from "react";
import { ResultsDashboard } from "@/components/results/ResultsDashboard";

export const metadata: Metadata = {
  title: "Your Hardie Siding Plan",
  description:
    "Your engineered James Hardie specification: Hardie® Zone product line, profile and texture, ColorPlus® palettes, transparent cost range, hidden-cost audit and contractor questions.",
  robots: { index: false, follow: false },
};

function DashboardFallback() {
  return (
    <div className="container-page py-12">
      <div className="mx-auto max-w-5xl animate-pulse space-y-6">
        <div className="h-48 bg-stone-200" />
        <div className="h-40 bg-stone-200" />
        <div className="h-64 bg-stone-200" />
      </div>
    </div>
  );
}

export default function ResultsPage() {
  // useSearchParams (for shared ?plan= links) must sit inside a Suspense
  // boundary or it opts the whole route out of static prerendering.
  return (
    <Suspense fallback={<DashboardFallback />}>
      <ResultsDashboard />
    </Suspense>
  );
}
