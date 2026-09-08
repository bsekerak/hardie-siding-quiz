"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button, ButtonLink, CtaArrow } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/components/ui/cn";
import { useQuiz } from "@/context/QuizContext";
import { buildPlan } from "@/lib/engine";
import { decodePlan } from "@/lib/share";
import { QUICK_ADJUSTMENTS, type LandscapingMode } from "@/lib/visualizerPrompt";
import type { Palette } from "@/types/quiz";

type Stage = "setup" | "working" | "done";

function PaletteTier({
  palette,
  index,
  selected,
  onSelect,
}: {
  palette: Palette;
  index: number;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "relative rounded-none p-4 text-left transition-colors",
        selected
          ? "border-2 border-hardie-500 bg-hardie-50"
          : "border border-stone-300 bg-white hover:border-slateCharcoal",
      )}
    >
      {selected ? (
        <span
          aria-hidden="true"
          className="absolute right-0 top-0 flex h-6 w-6 items-center justify-center bg-hardie-500 text-white"
        >
          <Icon name="Check" className="h-3.5 w-3.5" strokeWidth={3} />
        </span>
      ) : null}
      <p className="spec-num text-[10px] font-bold uppercase tracking-[0.14em] text-slateCharcoal-muted">
        Tier {String(index + 1).padStart(2, "0")}
      </p>
      <p
        className={cn(
          "mt-1 pr-5 text-[14px] font-black tracking-tight",
          selected ? "text-hardie-700" : "text-slateCharcoal",
        )}
      >
        {palette.name}
      </p>
      <span className="mt-3 flex h-4">
        <span style={{ width: "70%", backgroundColor: palette.body.color.hex }} />
        <span style={{ width: "20%", backgroundColor: palette.trim.color.hex }} />
        <span style={{ width: "10%", backgroundColor: palette.accent.color.hex }} />
      </span>
      <p className="mt-2 text-[11px] leading-snug text-slateCharcoal-muted">
        {palette.body.color.name} · {palette.trim.color.name}
      </p>
    </button>
  );
}

export function Visualizer() {
  const { answers: ownAnswers, hydrated, complete: ownComplete } = useQuiz();
  const searchParams = useSearchParams();

  const shared = useMemo(() => {
    const code = searchParams.get("plan");
    return code ? decodePlan(code) : null;
  }, [searchParams]);

  const answers = shared ? shared.answers : ownAnswers;
  const complete = shared ? true : ownComplete;
  const plan = useMemo(() => (complete ? buildPlan(answers) : null), [answers, complete]);

  const [tierIndex, setTierIndex] = useState<number>(shared?.paletteIndex ?? 0);
  const [landscaping, setLandscaping] = useState<LandscapingMode>("keep");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [stage, setStage] = useState<Stage>("setup");
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyLabel, setBusyLabel] = useState<string>("");
  const fileInput = useRef<HTMLInputElement>(null);

  if (!hydrated) {
    return (
      <div className="container-page py-14">
        <div className="mx-auto max-w-5xl animate-pulse space-y-5">
          <div className="h-10 w-2/3 bg-stone-200" />
          <div className="h-[420px] bg-stone-200" />
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="container-page py-20 text-center">
        <p className="eyebrow">Visualizer</p>
        <h1 className="mt-3 text-32p font-black tracking-tight text-slateCharcoal">
          Take the quiz first
        </h1>
        <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-slateCharcoal-muted">
          The visualizer renders the specification the quiz produces — the profile, texture and
          ColorPlus® palette matched to your house and climate.
        </p>
        <div className="mt-8 flex justify-center">
          <ButtonLink href="/quiz" size="lg">
            Start the quiz
            <CtaArrow />
          </ButtonLink>
        </div>
      </div>
    );
  }

  const palette = plan.palettes[tierIndex] ?? plan.palettes[0];
  if (!palette) return null;

  const onPickFile = (file: File | null): void => {
    setError(null);
    setPhoto(file);
    setPhotoPreview(file ? URL.createObjectURL(file) : null);
  };

  const run = async (mode: "initial" | "refine", instruction?: string): Promise<void> => {
    setError(null);
    setStage("working");
    setBusyLabel(mode === "initial" ? "Re-cladding your house…" : "Applying your change…");

    const body = new FormData();
    body.set("mode", mode);
    body.set("plan", JSON.stringify(plan));
    body.set("palette", JSON.stringify(palette));

    if (mode === "initial") {
      if (!photo) {
        setError("Add a photo of your house first.");
        setStage("setup");
        return;
      }
      body.set("image", photo);
      body.set("landscaping", landscaping);
    } else {
      if (!result || !instruction) {
        setStage("done");
        return;
      }
      body.set("currentImage", result);
      body.set("instruction", instruction);
    }

    try {
      const response = await fetch("/api/visualize", { method: "POST", body });
      const payload: unknown = await response.json();
      const data = payload as { imageUrl?: string; error?: string };
      if (!response.ok || !data.imageUrl) {
        setError(data.error ?? "The visualizer failed. Try again.");
        setStage(result ? "done" : "setup");
        return;
      }
      setResult(data.imageUrl);
      setStage("done");
    } catch {
      setError("Could not reach the visualizer. Check your connection and try again.");
      setStage(result ? "done" : "setup");
    }
  };

  const working = stage === "working";

  return (
    <div className="container-page py-10 sm:py-14">
      <div className="mx-auto max-w-5xl">
        <header className="border-b-2 border-hardie-500 pb-5">
          <p className="eyebrow">Step 02 — Visualize</p>
          <h1 className="mt-2 text-32p font-black tracking-tight text-slateCharcoal sm:text-40p">
            See your plan on your own house
          </h1>
          <p className="mt-2.5 max-w-2xl text-[15px] leading-relaxed text-slateCharcoal-muted">
            Upload a photo of your home and we&apos;ll re-clad it in{" "}
            {plan.spec.primary.productLine} using the palette tier you select below.
          </p>
        </header>

        <div className="mt-8 grid gap-8 lg:grid-cols-[340px_1fr]">
          {/* ── Controls ─────────────────────────────────────────── */}
          <div className="space-y-8">
            <section>
              <p className="spec-label mb-3">1 — Choose a palette tier</p>
              <div className="grid gap-2.5">
                {plan.palettes.map((entry, index) => (
                  <PaletteTier
                    key={entry.id}
                    palette={entry}
                    index={index}
                    selected={index === tierIndex}
                    onSelect={() => setTierIndex(index)}
                  />
                ))}
              </div>
            </section>

            <section>
              <p className="spec-label mb-3">2 — Landscaping</p>
              <button
                type="button"
                role="switch"
                aria-checked={landscaping === "keep"}
                onClick={() => setLandscaping((v) => (v === "keep" ? "clear" : "keep"))}
                className="flex w-full items-center justify-between gap-4 border border-stone-300 bg-white p-4 text-left transition-colors hover:border-slateCharcoal"
              >
                <span>
                  <span className="block text-[14px] font-bold tracking-tight text-slateCharcoal">
                    {landscaping === "keep" ? "Keep it as it looks" : "Clear it back"}
                  </span>
                  <span className="mt-1 block text-[12px] leading-snug text-slateCharcoal-muted">
                    {landscaping === "keep"
                      ? "Shrubs, beds and trees stay exactly as they are"
                      : "Foundation plantings removed so the siding is fully visible"}
                  </span>
                </span>
                <span
                  aria-hidden="true"
                  className={cn(
                    "flex h-6 w-11 shrink-0 items-center border-2 p-0.5 transition-colors",
                    landscaping === "keep"
                      ? "justify-end border-hardie-500 bg-hardie-500"
                      : "justify-start border-stone-400 bg-white",
                  )}
                >
                  <span
                    className={cn(
                      "h-4 w-4",
                      landscaping === "keep" ? "bg-white" : "bg-stone-400",
                    )}
                  />
                </span>
              </button>
            </section>

            <section>
              <p className="spec-label mb-3">3 — Your house photo</p>
              <input
                ref={fileInput}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="sr-only"
                onChange={(event) => onPickFile(event.target.files?.[0] ?? null)}
              />
              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                className="flex w-full flex-col items-center justify-center gap-2 border-2 border-dashed border-stone-400 bg-stone-100 px-4 py-8 transition-colors hover:border-hardie-500 hover:bg-hardie-50"
              >
                <Icon name="Download" className="h-6 w-6 rotate-180 text-slateCharcoal-muted" />
                <span className="text-[13px] font-bold tracking-tight text-slateCharcoal">
                  {photo ? "Choose a different photo" : "Upload a photo"}
                </span>
                <span className="text-[11px] text-slateCharcoal-muted">
                  Straight-on front elevation works best · JPG or PNG
                </span>
              </button>
              {photoPreview ? (
                <div className="mt-3 border border-stone-300">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photoPreview} alt="Your house" className="block w-full" />
                </div>
              ) : null}
            </section>

            <Button
              size="lg"
              className="w-full"
              disabled={!photo || working}
              onClick={() => void run("initial")}
            >
              {working ? busyLabel : result ? "Re-render with this tier" : "Visualize my siding"}
              {!working ? <CtaArrow /> : null}
            </Button>

            {error ? (
              <div className="border-l-[3px] border-red-700 bg-red-50 p-4">
                <p className="text-[13px] leading-relaxed text-red-900">{error}</p>
              </div>
            ) : null}
          </div>

          {/* ── Canvas ───────────────────────────────────────────── */}
          <div>
            <div className="flex min-h-[420px] items-center justify-center border border-stone-300 bg-stone-100">
              {working ? (
                <div className="p-8 text-center">
                  <div className="mx-auto h-8 w-8 animate-spin border-2 border-stone-400 border-t-hardie-500" />
                  <p className="mt-4 text-[14px] font-bold tracking-tight text-slateCharcoal">
                    {busyLabel}
                  </p>
                  <p className="mt-1.5 text-[12px] text-slateCharcoal-muted">
                    This usually takes 30–60 seconds.
                  </p>
                </div>
              ) : result ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={result} alt="Your house with the new siding" className="block w-full" />
              ) : (
                <div className="p-10 text-center">
                  <p className="text-[14px] font-bold tracking-tight text-slateCharcoal">
                    Your rendering appears here
                  </p>
                  <p className="mx-auto mt-2 max-w-xs text-[12px] leading-relaxed text-slateCharcoal-muted">
                    Pick a tier, choose how landscaping should look, and upload a photo.
                  </p>
                </div>
              )}
            </div>

            {result && !working ? (
              <>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border border-stone-300 bg-white p-4">
                  <p className="text-[12px] leading-snug text-slateCharcoal-muted">
                    <span className="font-bold text-slateCharcoal">{palette.name}</span> ·{" "}
                    {palette.body.color.name} body · {palette.trim.color.name} trim ·{" "}
                    {palette.accent.color.name} door
                  </p>
                  <a
                    href={result}
                    download={`hardie-visualization-${palette.body.color.name.toLowerCase().replace(/\s+/g, "-")}.png`}
                    className="inline-flex items-center gap-2 border-2 border-hardie-700 px-4 py-2 text-[12px] font-bold uppercase tracking-[0.08em] text-hardie-700 transition-colors hover:bg-hardie-700 hover:text-white"
                  >
                    <Icon name="Download" className="h-4 w-4" />
                    Download
                  </a>
                </div>

                <section className="mt-4">
                  <p className="spec-label mb-3">Refine it</p>
                  <div className="flex flex-wrap gap-2">
                    {QUICK_ADJUSTMENTS.map((adjustment) => (
                      <button
                        key={adjustment.label}
                        type="button"
                        onClick={() => void run("refine", adjustment.instruction)}
                        className="border border-stone-300 bg-white px-3.5 py-2 text-[12px] font-bold tracking-tight text-slateCharcoal transition-colors hover:border-hardie-500 hover:text-hardie-700"
                      >
                        {adjustment.label}
                      </button>
                    ))}
                  </div>
                </section>
              </>
            ) : null}

            <div className="mt-5 border-l-[3px] border-stone-400 bg-stone-100 p-4">
              <p className="text-[12px] leading-relaxed text-slateCharcoal-muted">
                Renderings are an AI approximation for design exploration — colors shift with
                lighting and screen calibration, and the model can misread architectural details.
                Confirm every color against a physical ColorPlus® sample on the actual wall before
                ordering. Your photo is sent to OpenAI to produce the image and is not stored by
                this tool.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap gap-3 border-t border-stone-300 pt-6">
          <Link
            href="/results"
            className="inline-flex items-center gap-2 text-[13px] font-bold uppercase tracking-[0.08em] text-hardie-700 hover:underline"
          >
            <Icon name="ArrowLeft" className="h-4 w-4" />
            Back to my plan
          </Link>
        </div>
      </div>
    </div>
  );
}
