"use client";

import { ChipGroup } from "@/components/quiz/ChipGroup";
import { OptionGrid } from "@/components/quiz/OptionGrid";
import { ZipInput } from "@/components/quiz/ZipInput";
import { Callout } from "@/components/ui/Callout";
import { useQuiz } from "@/context/QuizContext";
import {
  ARCH_STYLE_OPTIONS,
  COST_PREFERENCE_OPTIONS,
  CURRENT_SIDING_OPTIONS,
  HEIGHT_OPTIONS,
  HOA_OPTIONS,
  COLOR_FAMILY_OPTIONS,
  GUTTER_OPTIONS,
  HOME_AGE_OPTIONS,
  INSTALLER_OPTIONS,
  MASONRY_OPTIONS,
  PRIORITY_OPTIONS,
  ROOF_TONE_OPTIONS,
  SCOPE_OPTIONS,
  STAGE_OPTIONS,
  SYMPTOM_OPTIONS,
  TIMELINE_OPTIONS,
  TRIM_PREFERENCE_OPTIONS,
  WINDOW_TRIM_OPTIONS,
} from "@/data/questions";
import { COLOR_FAMILIES, readFixedElements, undertoneClashMessage } from "@/data/palettes";
import { color } from "@/data/colors";
import type { QuestionMeta } from "@/types/quiz";

function SubGroupLabel({ children }: { children: string }) {
  return (
    <p className="mb-2.5 text-[13px] font-bold uppercase tracking-[0.1em] text-slateCharcoal-light">
      {children}
    </p>
  );
}

interface QuestionRendererProps {
  question: QuestionMeta;
  onAutoAdvance: () => void;
}

export function QuestionRenderer({ question, onAutoAdvance }: QuestionRendererProps) {
  const { answers, setAnswer, toggleInList } = useQuiz();

  // Surfaced live in Q15 so the homeowner sees the constraint as they choose,
  // not for the first time on the results page.
  const clash =
    answers.colorFamily !== null
      ? undertoneClashMessage(COLOR_FAMILIES[answers.colorFamily], readFixedElements(answers))
      : null;

  switch (question.id) {
    case "stage":
      return (
        <OptionGrid
          name={question.title}
          options={STAGE_OPTIONS}
          value={answers.stage}
          onSelect={(value) => {
            setAnswer("stage", value);
            onAutoAdvance();
          }}
          columns={2}
        />
      );

    case "symptoms":
      return (
        <div className="space-y-5">
          <ChipGroup
            name={question.title}
            options={SYMPTOM_OPTIONS}
            values={answers.symptoms}
            onToggle={(value) => toggleInList("symptoms", value)}
          />
          {answers.symptoms.some((s) => s === "soft-spots" || s === "rot-edges") ? (
            <Callout tone="warn" title="That changes the scope">
              Soft spots or rot means water has already reached the sheathing. We&apos;ll budget a
              rot contingency and treat this as a replacement rather than a repair.
            </Callout>
          ) : null}
        </div>
      );

    case "zip":
      return (
        <ZipInput
          value={answers.zip}
          onChange={(value) => setAnswer("zip", value)}
          onSubmit={onAutoAdvance}
        />
      );

    case "homeAge":
      return (
        <div className="space-y-5">
          <OptionGrid
            name={question.title}
            options={HOME_AGE_OPTIONS}
            value={answers.homeAge}
            onSelect={(value) => {
              setAnswer("homeAge", value);
              onAutoAdvance();
            }}
            columns={2}
          />
          {answers.homeAge === "pre-1978" ? (
            <Callout tone="critical" title="Federal requirement: EPA Lead-Safe certified firm">
              Homes built before 1978 may contain lead paint. Any contractor disturbing painted
              surfaces must be EPA RRP certified, use containment and document the cleanup. Ask for
              the certification number — a firm that gets defensive about this is telling you
              something.
            </Callout>
          ) : null}
        </div>
      );

    case "currentSiding":
      return (
        <div className="space-y-5">
          <OptionGrid
            name={question.title}
            options={CURRENT_SIDING_OPTIONS}
            value={answers.currentSiding}
            onSelect={(value) => {
              setAnswer("currentSiding", value);
              onAutoAdvance();
            }}
            columns={3}
          />
          {answers.currentSiding === "asbestos" ? (
            <Callout tone="critical" title="Stop — do not disturb this yourself">
              Asbestos-cement shingle requires a licensed abatement contractor and, in most states,
              advance notification. Don&apos;t break, sand or pressure-wash it. We&apos;ve added
              abatement as its own budget line.
            </Callout>
          ) : null}
          {answers.currentSiding === "wood" ||
          answers.currentSiding === "hardboard" ||
          answers.currentSiding === "t1-11" ? (
            <Callout tone="warn" title="Plan on replacing the water-resistive barrier">
              Walls of this vintage often have felt paper — or nothing — behind the cladding. New
              siding over a failed barrier reproduces the original failure on a 30-year board.
            </Callout>
          ) : null}
          {answers.currentSiding === "vinyl" ? (
            <Callout tone="info" title="The comparison that matters is lifetime, not upfront">
              Vinyl bids lower. Fiber cement wins on the second cycle: it won&apos;t melt, warp or
              crack in a freeze, and the ColorPlus® finish removes the repaint interval that drives
              real long-term cost.
            </Callout>
          ) : null}
        </div>
      );

    case "archStyle":
      return (
        <OptionGrid
          name={question.title}
          options={ARCH_STYLE_OPTIONS}
          value={answers.archStyle}
          onSelect={(value) => {
            setAnswer("archStyle", value);
            onAutoAdvance();
          }}
          columns={2}
        />
      );

    case "sizeScope":
      return (
        <div className="space-y-7">
          <div>
            <SubGroupLabel>Height</SubGroupLabel>
            <OptionGrid
              name="Height"
              options={HEIGHT_OPTIONS}
              value={answers.height}
              onSelect={(value) => setAnswer("height", value)}
              columns={3}
            />
          </div>
          <div>
            <SubGroupLabel>Scope</SubGroupLabel>
            <OptionGrid
              name="Scope"
              options={SCOPE_OPTIONS}
              value={answers.scope}
              onSelect={(value) => setAnswer("scope", value)}
              columns={3}
            />
          </div>
          {answers.scope === "one-two-sides" || answers.scope === "damaged-area" ? (
            <Callout tone="warn" title="Partial jobs need a transition detail">
              New ColorPlus® next to weathered siding will not match, and the gap widens over the
              first two seasons. Specify a transition trim board at the boundary so the change reads
              as intentional architecture rather than a patch.
            </Callout>
          ) : null}
        </div>
      );

    case "gutters":
      return (
        <div className="space-y-5">
          <OptionGrid
            name={question.title}
            options={GUTTER_OPTIONS}
            value={answers.gutters}
            onSelect={(value) => {
              setAnswer("gutters", value);
              onAutoAdvance();
            }}
            columns={2}
          />
          {answers.gutters === "4-inch" && answers.height === "three-plus" ? (
            <Callout tone="warn" title='A 4" trough may undersize a roof this large'>
              Taller homes usually carry more roof area feeding each downspout. In a heavy downpour a
              4&quot; gutter overshoots at the valleys, which puts water exactly where you just paid
              to keep it out. Worth pricing the 6&quot; alongside it.
            </Callout>
          ) : null}
          {answers.gutters === "skip" ? (
            <Callout tone="info" title="They still come off and go back on">
              Gutters have to be removed for the siding to go on. Confirm whether that labor sits
              inside your contractor&apos;s number or gets billed separately — it&apos;s a common
              surprise on a final invoice.
            </Callout>
          ) : null}
          {answers.gutters === "6-inch" ? (
            <Callout tone="info" title="Good time to size up">
              A 6&quot; trough carries roughly 40% more water than a 5&quot;, and the 3&quot; x 4&quot;
              downspout clogs far less with leaf litter. Since the gutters are already coming down,
              the incremental cost is mostly material.
            </Callout>
          ) : null}
        </div>
      );

    case "priorities":
      return (
        <ChipGroup
          name={question.title}
          options={PRIORITY_OPTIONS}
          values={answers.priorities}
          onToggle={(value) => toggleInList("priorities", value, question.maxSelections)}
          max={question.maxSelections}
        />
      );

    case "timeline":
      return (
        <OptionGrid
          name={question.title}
          options={TIMELINE_OPTIONS}
          value={answers.timeline}
          onSelect={(value) => {
            setAnswer("timeline", value);
            onAutoAdvance();
          }}
          columns={2}
        />
      );

    case "installer":
      return (
        <div className="space-y-5">
          <OptionGrid
            name={question.title}
            options={INSTALLER_OPTIONS}
            value={answers.installer}
            onSelect={(value) => {
              setAnswer("installer", value);
              onAutoAdvance();
            }}
            columns={1}
          />
          {answers.installer === "diy" ? (
            <Callout tone="warn" title="What DIY actually involves with fiber cement">
              Plank is heavy and awkward — most installs are a two-person lift. Cutting generates
              respirable crystalline silica, so you need a polycrystalline blade, a dust-collecting
              shroud with a HEPA vacuum and an N95 minimum. Butt joints get flashing behind them and
              are left uncaulked, and the Trim-Over sequence has to be planned before the first
              board goes up.
              {answers.height !== "single" && answers.height !== null
                ? " At two stories or more, staging cost and fall risk usually make a professional install the better call."
                : ""}
            </Callout>
          ) : null}
        </div>
      );

    case "costPreference":
      return (
        <OptionGrid
          name={question.title}
          options={COST_PREFERENCE_OPTIONS}
          value={answers.costPreference}
          onSelect={(value) => {
            setAnswer("costPreference", value);
            onAutoAdvance();
          }}
          columns={2}
        />
      );

    case "features":
      return (
        <div className="space-y-7">
          <div>
            <SubGroupLabel>Roof tone</SubGroupLabel>
            <OptionGrid
              name="Roof tone"
              options={ROOF_TONE_OPTIONS}
              value={answers.roofTone}
              onSelect={(value) => setAnswer("roofTone", value)}
              columns={2}
            />
          </div>
          <div>
            <SubGroupLabel>Masonry</SubGroupLabel>
            <OptionGrid
              name="Masonry"
              options={MASONRY_OPTIONS}
              value={answers.masonry}
              onSelect={(value) => setAnswer("masonry", value)}
              columns={3}
            />
          </div>
          <div>
            <SubGroupLabel>Window &amp; door trim</SubGroupLabel>
            <OptionGrid
              name="Window trim"
              options={WINDOW_TRIM_OPTIONS}
              value={answers.windowTrim}
              onSelect={(value) => setAnswer("windowTrim", value)}
              columns={3}
            />
          </div>
          {answers.roofTone === "warm-red-brown" || answers.masonry === "warm-brick" ? (
            <Callout tone="info" title="Your warm fixed elements rule out cool gray">
              Cool gray siding against warm brick or a red-brown roof reads dirty rather than
              intentional. Your palettes will stay in the warm and greige family.
            </Callout>
          ) : null}
          {answers.windowTrim === "modern-black" ? (
            <Callout tone="info" title="Black windows want contrast">
              With black or bronze windows, a mid-to-deep body with decisive trim keeps the windows
              reading as a design choice instead of an accident.
            </Callout>
          ) : null}
        </div>
      );

    case "hoa":
      return (
        <div className="space-y-5">
          <OptionGrid
            name={question.title}
            options={HOA_OPTIONS}
            value={answers.hoa}
            onSelect={(value) => {
              setAnswer("hoa", value);
              onAutoAdvance();
            }}
            columns={1}
          />
          {answers.hoa === "hoa-historic" ? (
            <Callout tone="info" title="We'll build you a pre-approval packet">
              Your palettes will be locked to the ColorPlus® Statement Collection, which review
              boards approve most consistently, and your plan will include the product and color
              details a submission normally requires.
            </Callout>
          ) : null}
        </div>
      );

    case "colorFamily":
      return (
        <div className="space-y-8">
          <div>
            <SubGroupLabel>Color family</SubGroupLabel>
            <div className="grid gap-px bg-stone-300 sm:grid-cols-2">
              {COLOR_FAMILY_OPTIONS.map((option) => {
                const family = COLOR_FAMILIES[option.value];
                const selected = answers.colorFamily === option.value;
                const swatches = [...family.anchors, ...family.members].slice(0, 5);
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setAnswer("colorFamily", option.value)}
                    className={
                      selected
                        ? "bg-hardie-50 p-5 text-left ring-1 ring-inset ring-hardie-500"
                        : "bg-white p-5 text-left transition-colors hover:bg-stone-50"
                    }
                  >
                    <span className="flex h-12 overflow-hidden rounded-sm">
                      {swatches.map((name) => (
                        <span
                          key={name}
                          className="block flex-1"
                          style={{ backgroundColor: color(name).hex }}
                        />
                      ))}
                    </span>
                    <span
                      className={
                        selected
                          ? "mt-3 block text-16p font-bold text-hardie-600"
                          : "mt-3 block text-16p font-bold text-slateCharcoal"
                      }
                    >
                      {option.label}
                    </span>
                    <span className="mt-1.5 block text-[13px] leading-relaxed text-slateCharcoal-light">
                      {option.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <SubGroupLabel>Trim preference</SubGroupLabel>
            <OptionGrid
              name="Trim preference"
              options={TRIM_PREFERENCE_OPTIONS}
              value={answers.trimPreference}
              onSelect={(value) => setAnswer("trimPreference", value)}
              columns={2}
            />
          </div>

          {clash ? (
            <Callout tone="warn" title="Worth checking against samples">
              {clash}
            </Callout>
          ) : null}
        </div>
      );

    default:
      return null;
  }
}
