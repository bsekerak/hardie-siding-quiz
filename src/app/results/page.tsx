import type { Metadata } from "next";
import { ResultsDashboard } from "@/components/results/ResultsDashboard";

export const metadata: Metadata = {
  title: "Your Hardie Siding Plan",
  description:
    "Your engineered James Hardie specification: Hardie® Zone product line, profile and texture, ColorPlus® palettes, transparent cost range, hidden-cost audit and contractor questions.",
  robots: { index: false, follow: false },
};

export default function ResultsPage() {
  return <ResultsDashboard />;
}
