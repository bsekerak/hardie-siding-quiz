import type { Metadata } from "next";
import { Suspense } from "react";
import { Visualizer } from "@/components/visualizer/Visualizer";

export const metadata: Metadata = {
  title: "Visualize Your Siding",
  description:
    "Upload a photo of your home and see your James Hardie specification — profile, texture and ColorPlus® palette — rendered on your own house.",
  robots: { index: false, follow: false },
};

function Fallback() {
  return (
    <div className="container-page py-14">
      <div className="mx-auto max-w-5xl animate-pulse space-y-5">
        <div className="h-10 w-2/3 bg-stone-200" />
        <div className="h-[420px] bg-stone-200" />
      </div>
    </div>
  );
}

export default function VisualizerPage() {
  return (
    <Suspense fallback={<Fallback />}>
      <Visualizer />
    </Suspense>
  );
}
