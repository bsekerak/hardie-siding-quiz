import { buildClimateProfile } from "@/data/climate";
import { buildPalettes } from "@/data/palettes";
import { SIDING_PROFILES, STYLE_MATRIX } from "@/data/profiles";
import { evaluateExteriorSystem } from "@/lib/system";
import {
  FINANCE_APR,
  FINANCE_TERM_MONTHS,
  monthlyPayment,
  roundTo,
} from "@/lib/finance";
import type {
  AuditItem,
  ClimateProfile,
  GutterSpec,
  ContractorQuestion,
  CostEstimate,
  CostLineItem,
  Palette,
  Persona,
  ProductSpec,
  QuizAnswers,
  SidingPlan,
  SidingProfile,
  StageAction,
} from "@/types/quiz";

/* ------------------------------- Diagnosis (Q2) ------------------------------ */

const STRUCTURAL_SYMPTOMS = new Set(["soft-spots", "rot-edges"]);

export function buildDiagnosis(answers: QuizAnswers): string | null {
  if (answers.stage !== "need" && answers.stage !== "insurance") return null;
  const symptoms = answers.symptoms;
  if (symptoms.length === 0) return null;

  const hasStructural = symptoms.some((s) => STRUCTURAL_SYMPTOMS.has(s));
  if (hasStructural) {
    return "Soft spots or rot mean water is already behind the siding, so this is a replacement rather than a patch — which is good news for your decision, because it means you get to choose the whole wall. Fiber cement is the direct answer to what failed: it doesn't rot, absorb water at the cut ends, or feed the mold that got you here. Budget a sheathing contingency and move on to picking the siding.";
  }
  if (symptoms.length >= 2) {
    return "Two or more symptoms at once means the wall system is at the end of its life, not that one area got unlucky. Replace the field rather than chase repairs — and since you're re-cladding anyway, the profile and color below are a real design decision, not damage control.";
  }
  if (symptoms.includes("not-sure")) {
    return "You don't need a diagnosis to know what you'd replace it with. The specification below is what fits your house and climate either way; the only thing an opened wall changes is whether you're doing every elevation now or one at a time.";
  }
  return "One isolated symptom is the case where a spot repair can genuinely hold. If you'd rather not do this twice, the spec below is what a full replacement should look like — and matching a single elevation to it now keeps the option open to finish the rest later.";
}

/* --------------------------------- Persona ---------------------------------- */

export function derivePersona(answers: QuizAnswers): Persona {
  if (answers.installer === "diy") return "diy-enthusiast";
  const priorities = answers.priorities;
  const millennialSignals =
    (priorities.includes("resale") ? 1 : 0) +
    (priorities.includes("custom-color") ? 1 : 0) +
    (priorities.includes("fast-install") ? 1 : 0) +
    (answers.timeline === "under-2" || answers.timeline === "2-5" ? 1 : 0);
  return millennialSignals >= 2 ? "millennial" : "core-homeowner";
}

const PERSONA_NOTES: Readonly<Record<Persona, string>> = {
  "core-homeowner":
    "You are optimizing for a decision you only want to make once. Everything below is weighted toward lifecycle performance and the 30-year non-prorated substrate warranty rather than the lowest bid.",
  millennial:
    "You are optimizing for how the house looks and what it returns. The palette work and the resale framing carry more weight here than the last dollar of material cost.",
  "diy-enthusiast":
    "You are handling some of the work yourself, so the spec below includes the handling, cutting and flashing requirements that determine whether the warranty holds.",
};

/* ------------------------------- Stage action -------------------------------- */

export function buildStageAction(
  answers: QuizAnswers,
  climate: ClimateProfile,
  spec: ProductSpec,
  palettes: Palette[],
): StageAction {
  // Naming the actual recommendation is the point of the tool. Every stage
  // lands on a siding decision the homeowner can act on; condition and claim
  // issues ride along as supporting notes rather than becoming the next step.
  const lead = palettes[0];
  const bodyName = lead ? lead.body.color.name : "your body color";
  const trimName = lead ? lead.trim.color.name : "Arctic White";
  const profile = spec.primary.name;
  const shortProfile = spec.primary.productLine;
  const sampleLine = `Order ${bodyName} and ${trimName} samples, hold them on the wall, and put ${shortProfile} in ${climate.zone}® with ColorPlus® in ${bodyName} on every bid you request.`;

  switch (answers.stage) {
    case "need":
      return {
        headline: `Your answer is ${profile} in ${bodyName}.`,
        summary: `What failed on your wall is exactly what fiber cement is engineered against — it doesn't rot, swell at the cut ends or feed mold, and the ${climate.zone}® board is formulated for your climate specifically. You're not just fixing a problem; you're choosing the last siding this house needs.`,
        nextMilestone: sampleLine,
        supportingPoints: [
          `${spec.primary.texture} texture is the right call for your architecture — it reads correct from the street without the maintenance cycle of real wood.`,
          "Ask each bidder to price the rot contingency as a unit price per sheet so a surprise behind the siding doesn't become an open-ended number.",
          "The 30-year non-prorated substrate warranty is why this is a one-time decision rather than a recurring one.",
        ],
      };
    case "insurance":
      return {
        headline: `Claim or no claim, ${profile} in ${bodyName} is the right rebuild.`,
        summary: `Your carrier decides how much of it they fund. You decide what goes back on the house — and a hail claim is the cheapest opportunity you will ever get to upgrade the entire envelope to ${climate.zone}® fiber cement.`,
        nextMilestone: `Put this exact spec into your claim scope — ${shortProfile}, ${climate.zone}®, ColorPlus® in ${bodyName} with ${trimName} trim — then order those two samples while the adjuster works.`,
        supportingPoints: [
          climate.hailCorridor
            ? "You're in the hail corridor, where most states' uniform-appearance rules can extend the scope to elevations that can no longer be matched. Raise it in writing."
            : "Ask your adjuster in writing whether the undamaged elevations can be matched — if they can't, matching rules may extend the scope.",
          "Code-required upgrades — flashing, water-resistive barrier, insulation — are frequently payable as a supplement even when the first scope omits them.",
          "Fiber cement resists the impact denting that got you here, which is worth raising with your carrier at renewal.",
        ],
      };
    case "justify":
      return {
        headline: `${profile} in ${bodyName} is the version a buyer pays for.`,
        summary:
          "Fiber cement siding replacement consistently ranks among the highest-recouping exterior remodels, and it's the change a buyer registers before they reach the front door. The palette below is chosen to read correct to the broadest possible buyer, not to a personal favorite.",
        nextMilestone: sampleLine,
        supportingPoints: [
          "The transferable 30-year non-prorated warranty belongs on your listing sheet — it's a document buyers can hold.",
          answers.timeline === "under-2"
            ? `${bodyName} is deliberately the broad-appeal choice. Save the bolder option for a house you're keeping.`
            : "You have time to schedule in a good season, which usually means a better crew at a better price.",
          "A buyer's inspector will find soft sheathing. Handling it before listing is always cheaper than negotiating it after.",
        ],
      };
    case "dream":
      return {
        headline: `${bodyName} with ${trimName} trim, on ${profile}.`,
        summary: `This palette isn't a mood board — it's built against the roof, masonry and windows you told us are staying. That's why it will look right on your house specifically, and why a color you loved on someone else's might not have.`,
        nextMilestone: sampleLine,
        supportingPoints: [
          `${spec.primary.texture} texture on ${shortProfile} is what gives you the look you're after without the repaint cycle.`,
          "View samples on the north and south faces, morning and late afternoon. Fiber cement finishes shift noticeably with daylight and sheen.",
          "If you want to push further, the second and third palettes below are progressively bolder from the same constraint set.",
        ],
      };
    case "estimate":
      return {
        headline: `Give every bidder this: ${profile}, ${climate.zone}®, ColorPlus® in ${bodyName}.`,
        summary:
          "Your bids don't line up because they aren't quoting the same job. Four omissions cause nearly all of it: the finish method, the flashing detail, the tear-off and disposal, and the rot contingency. A written spec collapses the spread.",
        nextMilestone: `Send all bidders the same scope — ${shortProfile} in ${climate.zone}® with ColorPlus® in ${bodyName}, ${trimName} trim, Trim-Over install — and require them to re-quote to the line structure below.`,
        supportingPoints: [
          'A bid that says only "Hardie siding" can legally mean primed board painted on site. Different product, different warranty, different price.',
          "Require the rot contingency as a unit price per sheet rather than an open allowance.",
          "The lowest bid is usually the one that left something out. The audit list below tells you what to look for.",
        ],
      };
    case "selection":
      return {
        headline: `Locked: ${profile} in ${bodyName}, ${trimName} trim.`,
        summary: `You've made the decision, so the only remaining risk is field substitution — the wrong Hardie Zone board, primed stock instead of ColorPlus®, or missing joint flashing.`,
        nextMilestone: `Write the spec into the contract by name and require the delivery packing slips to show ${climate.zone}® and the ColorPlus® color at the door.`,
        supportingPoints: [
          `Your climate requires the ${climate.zone}® line. Confirm it on paperwork, not in conversation.`,
          "ColorPlus® carries a separate 15-year finish warranty. Field paint carries none.",
          "Order one extra square while your color is in current production — discontinued colors make future repairs impossible to match.",
        ],
      };
    default:
      return {
        headline: "Let's find your siding.",
        summary: "Complete the quiz and we'll build the specification from your answers.",
        nextMilestone: "Start with the first question.",
        supportingPoints: [],
      };
  }
}

/* ------------------------------- Product spec -------------------------------- */

function wantsSmooth(answers: QuizAnswers): boolean {
  if (answers.priorities.includes("real-wood-look")) return false;
  return (
    answers.archStyle === "contemporary" ||
    answers.archStyle === "modern-farmhouse" ||
    answers.colorFamily === "bold-dramatic"
  );
}

/** Eave length tracks roofline, not wall area, so it gets its own base table. */
const BASE_GUTTER_LF: Readonly<Record<NonNullable<QuizAnswers["height"]>, number>> = {
  single: 170,
  two: 190,
  "three-plus": 230,
};

const GUTTER_SCOPE_FACTOR: Readonly<Record<NonNullable<QuizAnswers["scope"]>, number>> = {
  "whole-house": 1,
  "one-two-sides": 0.5,
  "damaged-area": 0.25,
};

export function estimateGutterFeet(answers: QuizAnswers): number {
  const height = answers.height ?? "two";
  const scope = answers.scope ?? "whole-house";
  return roundTo(BASE_GUTTER_LF[height] * GUTTER_SCOPE_FACTOR[scope], 10);
}

function buildGutterSpec(answers: QuizAnswers, climate: ClimateProfile): GutterSpec {
  const choice = answers.gutters ?? "reuse";
  const linearFeet = choice === "skip" ? 0 : estimateGutterFeet(answers);
  // Oversized gutters earn their cost on big roof planes, steep pitches and
  // regions that get their rain in short heavy bursts.
  const wantsOversize =
    answers.height === "three-plus" || climate.hailCorridor || climate.zone === "HZ10";

  switch (choice) {
    case "6-inch":
      return {
        choice,
        label: '6" K-style aluminum gutter, seamless',
        detail: `Approximately ${linearFeet} linear feet with 3" x 4" downspouts.`,
        rationale:
          'A 6" trough carries roughly 40% more water than a 5" and nearly double a 4", and the larger 3" x 4" downspout is far less prone to clogging with leaf litter. On a re-side this is the moment to size up — the gutters are already coming down.',
        downspout: '3" x 4" downspouts, discharging a minimum of 4 feet from the foundation',
        linearFeet,
      };
    case "4-inch":
      return {
        choice,
        label: '4" K-style aluminum gutter, seamless',
        detail: `Approximately ${linearFeet} linear feet with 2" x 3" downspouts.`,
        rationale: wantsOversize
          ? `A 4" trough keeps the fascia line light, but your roof and climate push real volume — in a heavy downpour a 4" gutter will overshoot at the valleys. Worth pricing the 6" alongside it before you commit.`
          : 'A 4" trough suits a small, simple roof with short runs, and it keeps the fascia line visually light against the new siding.',
        downspout: '2" x 3" downspouts, discharging a minimum of 4 feet from the foundation',
        linearFeet,
      };
    case "skip":
      return {
        choice,
        label: "No gutter work in this project",
        detail: "Excluded from your budget below.",
        rationale:
          "Worth knowing: your gutters still have to come off for the siding to go on and be re-hung afterward. Confirm with your contractor whether that labor is inside their number or billed separately — it is a common source of a surprise line on the final invoice.",
        downspout: null,
        linearFeet: 0,
      };
    default:
      return {
        choice: "reuse",
        label: "Remove and re-hang existing gutters",
        detail: `Approximately ${linearFeet} linear feet taken down and reinstalled.`,
        rationale:
          "Re-hanging is cheaper than replacing, but it is not free — and aluminum that has been taken down once often shows dents and drilled fascia holes when it goes back up. Ask to inspect them on the ground before they are reinstalled.",
        downspout: "Existing downspouts re-hung; replace any that are dented or undersized",
        linearFeet,
      };
  }
}

export function buildProductSpec(answers: QuizAnswers, climate: ClimateProfile): ProductSpec {
  const style = answers.archStyle ?? "ranch";
  const mapping = STYLE_MATRIX[style];
  const primaryId = wantsSmooth(answers) ? mapping.modernPrimary : mapping.primary;
  const primary: SidingProfile = SIDING_PROFILES[primaryId];

  // A second texture only earns its place when the trim is already doing
  // contrast work; a tonal scheme wants one uninterrupted field.
  const useAccent = answers.trimPreference === "high-contrast" && mapping.accent !== null;
  const accent: SidingProfile | null = useAccent && mapping.accent ? SIDING_PROFILES[mapping.accent] : null;

  const wantsCustomColor = answers.priorities.includes("custom-color");
  // ColorPlus is specified in every case: the Dream Collection covers custom
  // requests, and field paint forfeits the finish warranty.
  const finish: ProductSpec["finish"] = "ColorPlus";

  const finishRationale = wantsCustomColor
    ? "You named a specific color, so start in the ColorPlus® Dream Collection — several hundred factory-applied colors — before you consider field paint. Factory finish is baked on in a controlled environment and carries a 15-year finish warranty; a field-painted board does not."
    : "ColorPlus® Technology, not primed-and-field-painted. The finish is applied and baked in the factory, which is why it resists fading and never needs the scrape-and-repaint cycle that drives the real lifetime cost of siding.";

  const system = evaluateExteriorSystem(answers, climate, primary);

  const trimColorHint =
    answers.windowTrim === "modern-black"
      ? "in a dark ColorPlus finish to carry the window line"
      : answers.windowTrim === "warm-sand"
        ? "in a warm neutral to bridge the windows and body"
        : "in Arctic White or a near-white to hold the classic outline";

  const trimColorNote = `Size it 5.5" at corners and 3.5" at windows and doors, ${trimColorHint}. Under-scaled trim is the most visible tell of a budget re-side, and it is a small fraction of total cost.`;

  const waterManagement: string[] = [
    "Continuous water-resistive barrier behind the siding, lapped shingle-fashion over all flashings.",
    "Joint flashing behind every butt joint. Per the James Hardie installation guide, leave butt joints in moderate contact and do not caulk them — the flashing is the water management, and sealing the joint traps moisture.",
    "Kickout flashing at every roof-to-wall intersection. Its absence is the single most common cause of concealed rot in a re-side.",
    'Clearances: 6" to grade, 2" to roofing and horizontal surfaces, 1/4" above horizontal flashing, 2" to decks and paths.',
  ];

  if (climate.coastalSalt) {
    waterManagement.push(
      "Coastal exposure: stainless steel or hot-dipped galvanized fasteners only. Electro-galvanized fasteners will bleed rust through the finish.",
    );
  }
  if (climate.coldIecc) {
    waterManagement.push(
      "Cold-climate assembly: continuous exterior insulation with furring, and fasteners long enough to reach the framing through the foam. Confirm fastener length is specified in writing.",
    );
  }

  waterManagement.push(system.install.contractorNote);

  if (answers.scope !== "whole-house") {
    waterManagement.push(
      "Partial scope: specify a transition trim board at the boundary between new and existing siding. New ColorPlus® next to weathered siding will read as a visible mismatch, and it becomes more pronounced over the first two years.",
    );
  }

  return {
    primary,
    accent,
    accentPlacement: accent ? mapping.accentPlacement : null,
    zone: climate.zone,
    finish,
    finishRationale,
    trim: system.trim,
    trimColorNote,
    install: system.install,
    waterManagement,
    gutters: buildGutterSpec(answers, climate),
  };
}

/* ------------------------------------ Cost ----------------------------------- */

const BASE_WALL_AREA: Readonly<Record<NonNullable<QuizAnswers["height"]>, number>> = {
  single: 1450,
  two: 2500,
  "three-plus": 3400,
};

const SCOPE_FACTOR: Readonly<Record<NonNullable<QuizAnswers["scope"]>, number>> = {
  "whole-house": 1,
  "one-two-sides": 0.45,
  "damaged-area": 0.18,
};

const HEIGHT_LABOR_FACTOR: Readonly<Record<NonNullable<QuizAnswers["height"]>, number>> = {
  single: 1,
  two: 1.08,
  "three-plus": 1.18,
};

export function estimateWallArea(answers: QuizAnswers): number {
  const height = answers.height ?? "two";
  const scope = answers.scope ?? "whole-house";
  return roundTo(BASE_WALL_AREA[height] * SCOPE_FACTOR[scope], 50);
}

export function buildCostEstimate(
  answers: QuizAnswers,
  climate: ClimateProfile,
  spec: ProductSpec,
): CostEstimate {
  const area = estimateWallArea(answers);
  const height = answers.height ?? "two";
  const laborFactor = HEIGHT_LABOR_FACTOR[height];

  const blendLow = spec.accent
    ? (spec.primary.costLow * 0.75 + spec.accent.costLow * 0.25) * 1.04
    : spec.primary.costLow;
  const blendHigh = spec.accent
    ? (spec.primary.costHigh * 0.75 + spec.accent.costHigh * 0.25) * 1.04
    : spec.primary.costHigh;

  // A single-story DIY install removes most of the labor line; multi-story is
  // priced as a professional install regardless, because staging dominates.
  const diySingleStory = answers.installer === "diy" && height === "single";
  const diyFactor = diySingleStory ? 0.48 : 1;

  const sidingLow = roundTo(area * blendLow * laborFactor * diyFactor, 100);
  const sidingHigh = roundTo(area * blendHigh * laborFactor * diyFactor, 100);

  const lineItems: CostLineItem[] = [];

  if (answers.currentSiding === "asbestos") {
    lineItems.push({
      id: "abatement",
      label: "Licensed asbestos abatement & disposal",
      low: roundTo(area * 4, 100),
      high: roundTo(area * 9, 100),
      detail:
        "Asbestos-cement shingle must be removed by a licensed abatement contractor under state notification rules. This is not a line a siding crew can legally absorb, and it is never included in a standard tear-off number.",
      oftenHidden: true,
    });
  } else {
    lineItems.push({
      id: "tear-off",
      label: "Tear-off, dumpster & disposal",
      low: roundTo(area * 1.0, 100),
      high: roundTo(area * 2.5, 100),
      detail:
        "Removing the existing siding, hauling it and paying tipping fees. Some bids quote 'siding installed' and add this later.",
      oftenHidden: true,
    });
  }

  const highRotRisk =
    answers.symptoms.some((s) => STRUCTURAL_SYMPTOMS.has(s)) ||
    answers.currentSiding === "wood" ||
    answers.currentSiding === "hardboard" ||
    answers.currentSiding === "t1-11" ||
    answers.homeAge === "pre-1978";
  const rotShare = highRotRisk ? 0.12 : 0.05;
  lineItems.push({
    id: "rot",
    label: "Sheathing & rot contingency",
    low: roundTo(area * rotShare * 5, 50),
    high: roundTo(area * rotShare * 11, 50),
    detail: highRotRisk
      ? "Your combination of age, existing cladding and symptoms puts you in the higher-risk band. Require this as a unit price per sheet of sheathing in the contract, not an open-ended allowance."
      : "Even a healthy wall turns up some rot at the windows and the base. Carry the allowance and require a unit price per sheet.",
    oftenHidden: true,
  });

  if (
    answers.currentSiding === "wood" ||
    answers.currentSiding === "hardboard" ||
    answers.currentSiding === "t1-11" ||
    answers.currentSiding === "unknown"
  ) {
    lineItems.push({
      id: "wrb",
      label: "Water-resistive barrier replacement",
      low: roundTo(area * 0.85, 50),
      high: roundTo(area * 1.75, 50),
      detail:
        "Wood, hardboard and T1-11 walls frequently have felt paper or nothing at all behind them. New siding over a failed barrier reproduces the original failure on a 30-year board.",
      oftenHidden: true,
    });
  }

  if (answers.homeAge === "pre-1978") {
    lineItems.push({
      id: "rrp",
      label: "EPA RRP lead-safe work practices",
      low: roundTo(area * 0.75, 50),
      high: roundTo(area * 1.75, 50),
      detail:
        "Federal law requires an EPA Lead-Safe certified firm for renovation that disturbs paint in pre-1978 housing. Containment, HEPA cleanup and documentation carry real cost — and a contractor who doesn't mention it is telling you something.",
      oftenHidden: true,
    });
  }

  if (climate.coldIecc) {
    lineItems.push({
      id: "ci",
      label: "Continuous exterior insulation",
      low: roundTo(area * 2.25, 50),
      high: roundTo(area * 4.5, 50),
      detail:
        "In IECC climate zone 5 and colder, a full re-side is frequently the trigger for continuous insulation. It also fixes thermal bridging at every stud, which is what most homeowners actually feel as a cold wall.",
      oftenHidden: true,
    });
  }

  if (height !== "single") {
    lineItems.push({
      id: "staging",
      label: "Staging, scaffold or lift",
      low: height === "two" ? 400 : 900,
      high: height === "two" ? 1500 : 3000,
      detail:
        "Fiber cement plank is heavy and it is cut on the ground. Multi-story elevations need real staging, and it is often buried inside a labor number you can't compare.",
      oftenHidden: false,
    });
  }

  if (answers.installer === "diy") {
    lineItems.push({
      id: "silica",
      label: "Cutting & silica dust control",
      low: 200,
      high: 750,
      detail:
        "Cutting fiber cement generates respirable crystalline silica. You need a HardieBlade™-style polycrystalline blade, a dust-collecting saw shroud with a HEPA vacuum, and an N95 minimum. This is a genuine health requirement, not a comfort item.",
      oftenHidden: false,
    });
  }

  if (spec.gutters.choice !== "skip") {
    const perFootLow = spec.gutters.choice === "6-inch" ? 9 : spec.gutters.choice === "4-inch" ? 6 : 2.5;
    const perFootHigh = spec.gutters.choice === "6-inch" ? 18 : spec.gutters.choice === "4-inch" ? 12 : 5;
    lineItems.push({
      id: "gutters",
      label:
        spec.gutters.choice === "reuse"
          ? "Gutters — remove & re-hang existing"
          : `Gutters — new ${spec.gutters.choice === "6-inch" ? '6"' : '4"'} seamless aluminum`,
      low: roundTo(spec.gutters.linearFeet * perFootLow, 50),
      high: roundTo(spec.gutters.linearFeet * perFootHigh, 50),
      detail: `${spec.gutters.detail} ${
        spec.gutters.choice === "reuse"
          ? "Removal and reinstallation labor only — no new material."
          : "Includes downspouts, hangers and disposal of the old run."
      }`,
      oftenHidden: true,
    });
  }

  lineItems.push({
    id: "permits",
    label: "Permits & inspections",
    low: 250,
    high: 1200,
    detail:
      "Most jurisdictions permit a full re-side, and many inspect the water-resistive barrier before the siding goes up. A contractor pulling no permit is a contractor whose flashing nobody will check.",
    oftenHidden: true,
  });

  const itemsLow = lineItems.reduce((sum, item) => sum + item.low, 0);
  const itemsHigh = lineItems.reduce((sum, item) => sum + item.high, 0);

  const totalLow = roundTo(sidingLow + itemsLow, 100);
  const totalHigh = roundTo(sidingHigh + itemsHigh, 100);

  return {
    wallAreaSqFt: area,
    sidingLow,
    sidingHigh,
    lineItems,
    totalLow,
    totalHigh,
    monthlyLow: Math.round(monthlyPayment(totalLow)),
    monthlyHigh: Math.round(monthlyPayment(totalHigh)),
    financeTermMonths: FINANCE_TERM_MONTHS,
    financeApr: FINANCE_APR,
  };
}

/* ----------------------------------- Audit ----------------------------------- */

export function buildAudit(answers: QuizAnswers, climate: ClimateProfile): AuditItem[] {
  const items: AuditItem[] = [
    {
      id: "tear-off",
      label: "Tear-off, dumpster and disposal are itemized",
      detail:
        "Confirm in writing whether removal and tipping fees are in the number or added later. This is the most common gap between two bids that look identical.",
      severity: "required",
    },
    {
      id: "rot",
      label: "Rot and sheathing repair has a stated unit price",
      detail:
        'Require a per-sheet price for OSB/plywood replacement and a per-foot price for framing repair. "We\'ll let you know what we find" is how a fixed budget becomes an open one.',
      severity: "required",
    },
    {
      id: "flashing",
      label: "Joint flashing and kickout flashing are in the scope",
      detail:
        "Butt-joint flashing and kickout flashing at every roof-to-wall intersection. Missing kickouts are the leading cause of hidden rot in an otherwise correct re-side.",
      severity: "required",
    },
    {
      id: "permits",
      label: "Permits and inspections are pulled by the contractor",
      detail:
        "Written confirmation of who pulls the permit and whether the WRB gets inspected before the siding covers it.",
      severity: "required",
    },
  ];

  if (answers.homeAge === "pre-1978") {
    items.unshift({
      id: "rrp",
      label: "EPA Lead-Safe (RRP) certified firm — federally required",
      detail:
        "Your home predates the 1978 lead paint ban. Ask for the firm's EPA certification number and verify it. This is a legal requirement, not a preference, and it must be documented.",
      severity: "required",
    });
  }

  if (answers.currentSiding === "asbestos") {
    items.unshift({
      id: "asbestos",
      label: "Licensed asbestos abatement — do not disturb before testing",
      detail:
        "Asbestos-cement shingle requires a licensed abatement contractor and, in most states, advance notification. Do not let anyone break, sand or pressure-wash it in the meantime.",
      severity: "required",
    });
  }

  if (climate.coldIecc) {
    items.push({
      id: "ci",
      label: "Continuous insulation is priced, not assumed",
      detail:
        "In your climate zone a full re-side often triggers continuous exterior insulation. Confirm whether your jurisdiction requires it and that fastener length accounts for the added thickness.",
      severity: "recommended",
    });
  }

  if (climate.wildfireWui) {
    items.push({
      id: "wui",
      label: "WUI compliance documentation",
      detail:
        "If your parcel is in a mapped Wildland-Urban Interface area, request the ASTM E136 non-combustibility and Class A flame-spread documentation for your file — insurers increasingly ask for it.",
      severity: "recommended",
    });
  }

  if (climate.hailCorridor || answers.stage === "insurance") {
    items.push({
      id: "matching",
      label: "Uniform-appearance / matching rule raised with the adjuster",
      detail:
        "If the undamaged elevations can no longer be matched, many states require the carrier to address the mismatch rather than replace one wall. Ask in writing and keep the response.",
      severity: "recommended",
    });
  }

  if (answers.scope !== "whole-house") {
    items.push({
      id: "transition",
      label: "Transition trim and weathering mismatch acknowledged",
      detail:
        "New ColorPlus® against weathered existing siding will not match, and the difference grows over the first two seasons. A transition trim board makes the boundary intentional.",
      severity: "watch",
    });
  }

  items.push({
    id: "color-extras",
    label: "One extra square of siding ordered for future repairs",
    detail:
      "Colors get discontinued. A square of matching board in the garage is cheap insurance against a future repair you cannot match.",
    severity: "watch",
  });

  return items;
}

/* ---------------------------- Contractor questions --------------------------- */

export function buildContractorQuestions(
  answers: QuizAnswers,
  climate: ClimateProfile,
  spec: ProductSpec,
): ContractorQuestion[] {
  const questions: ContractorQuestion[] = [
    {
      id: "colorplus",
      question:
        "Are you quoting ColorPlus® Technology factory finish, or primed board painted in the field? Show me the line on the order.",
      whyItMatters:
        "This is the most common substitution in the industry. Primed-and-painted board is cheaper to bid, looks identical on day one, and carries no 15-year finish warranty.",
      goodAnswer:
        "They name the ColorPlus color on the quote and can produce the supplier order showing factory-finished board.",
    },
    {
      id: "zone",
      question: `My climate requires the ${climate.zone}® product line. Will the delivery packing slip show ${climate.zone}, and will you show it to me?`,
      whyItMatters:
        "James Hardie engineers different board for different climates. The wrong zone product is a warranty problem you will not discover for years.",
      goodAnswer:
        "They know what Hardie Zone you are in without looking it up, and they agree to show the packing slip at delivery.",
    },
    {
      id: "flashing",
      question:
        "How are you treating butt joints — joint flashing behind each one, left uncaulked? And are you installing kickout flashing at every roof-to-wall intersection?",
      whyItMatters:
        "Caulking butt joints instead of flashing them traps water in the wall. Missing kickouts dump an entire roof valley behind your siding.",
      goodAnswer:
        'They say "joint flashing, joints in moderate contact, no caulk at butt joints" without hesitation, and they treat kickouts as obviously included.',
    },
    {
      id: "clearances",
      question:
        'What clearances are you holding to grade, to the roof, and above horizontal flashing? And how are you fastening — blind-nail or face-nail, what fastener, what spacing?',
      whyItMatters:
        'The published minimums are 6" to grade, 2" to roofing, and 1/4" above horizontal flashing. Violating them voids the warranty and wicks water into the board.',
      goodAnswer:
        "They quote the numbers back to you and can explain why they chose blind- or face-nailing for your wall.",
    },
    {
      id: "method",
      question: `Have you installed the ${spec.install.method} before? Walk me through your sequence at an outside corner.`,
      whyItMatters:
        spec.install.method.includes("Trim-Over")
          ? "Trim-Over needs longer fasteners that reach framing through both trim and siding, and a crew that has only done trim-first will hang it short. That is a fastener pull-out problem two winters from now."
          : "Trim-first lives or dies on the gap and the sealant at every siding-to-casing joint. A crew that jams the cut ends tight against the trim has built in a moisture trap.",
      goodAnswer:
        spec.install.method.includes("Trim-Over")
          ? `They describe running the field boards long, cutting to a line, then fastening ${spec.trim.thickness} trim over the top into framing.`
          : 'They mention the 1/8" gap, priming the field cuts, and using a high-performance sealant rather than painter\'s caulk.',
    },
    {
      id: "hidden",
      question:
        "What is in this number, and what specifically is not? Give me the tear-off, disposal, rot repair unit price, permit and trim package as separate lines.",
      whyItMatters:
        "Bid spread almost always comes from scope omissions, not from labor rates. Forcing the same line structure on every bidder is the only way to compare them.",
      goodAnswer:
        "They re-issue the quote in your line structure without pushing back. A contractor who won't itemize is protecting something.",
    },
  ];

  if (answers.homeAge === "pre-1978") {
    questions.push({
      id: "rrp-q",
      question:
        "My home is pre-1978. What is your EPA Lead-Safe (RRP) certification number, and what containment will you set up?",
      whyItMatters:
        "It is a federal requirement for disturbing paint in pre-1978 housing, and the certification is verifiable. Uncertified work exposes your family and your liability.",
      goodAnswer:
        "They give you the number without being defensive and describe plastic containment, HEPA cleanup and a written record.",
    });
  }

  if (climate.coastalSalt) {
    questions.push({
      id: "fasteners",
      question:
        "We're in a salt-air environment. Are you using stainless or hot-dipped galvanized fasteners, and which?",
      whyItMatters:
        "Electro-galvanized fasteners corrode near salt water and bleed rust streaks through the finish within a few seasons.",
      goodAnswer:
        "They specify stainless (or hot-dipped galvanized) by name and put it on the quote.",
    });
  }

  if (answers.stage === "insurance") {
    questions.push({
      id: "supplement",
      question:
        "Will you write a supplement for code-required upgrades, and will you work directly with my adjuster on scope?",
      whyItMatters:
        "Flashing, housewrap and insulation upgrades required by current code are frequently payable but almost never in the adjuster's first scope.",
      goodAnswer:
        "They have done supplements before and will document the code sections. They never offer to absorb or waive your deductible.",
    });
  }

  return questions;
}

/* ------------------------------- Plan assembly ------------------------------- */

export function buildPlan(answers: QuizAnswers): SidingPlan {
  const climate = buildClimateProfile(answers.zip);
  const spec = buildProductSpec(answers, climate);
  const palettes = buildPalettes(answers);
  const cost = buildCostEstimate(answers, climate, spec);
  const stageAction = buildStageAction(answers, climate, spec, palettes);
  const audit = buildAudit(answers, climate);
  const contractorQuestions = buildContractorQuestions(answers, climate, spec);
  const persona = derivePersona(answers);

  return {
    climate,
    spec,
    palettes,
    cost,
    stageAction,
    audit,
    contractorQuestions,
    persona,
    personaNote: PERSONA_NOTES[persona],
    diagnosis: buildDiagnosis(answers),
  };
}
