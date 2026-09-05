import { buildClimateProfile } from "@/data/climate";
import { HARDIE_COLORS, TRIM_COLOR_NAMES, color, contrastRatio } from "@/data/colors";
import { SIDING_PROFILES, STYLE_MATRIX } from "@/data/profiles";
import {
  FINANCE_APR,
  FINANCE_TERM_MONTHS,
  monthlyPayment,
  roundTo,
} from "@/lib/finance";
import type {
  AuditItem,
  ClimateProfile,
  ContractorQuestion,
  CostEstimate,
  CostLineItem,
  HardieColor,
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
    return "Soft spots or rot means water is already past the siding and into the sheathing. Spot repair covers the evidence without fixing the path — plan on full replacement plus a sheathing and rot contingency in the budget.";
  }
  if (symptoms.length >= 2) {
    return "Two or more symptoms at once usually means the wall system is failing rather than one damaged area. Price full replacement and carry a sheathing/rot contingency, because more is typically found once the old siding is off.";
  }
  if (symptoms.includes("not-sure")) {
    return "Before you price anything, get a moisture-probe inspection at the base of the walls and around the windows. What is found there decides whether this is a repair or a replacement.";
  }
  return "One isolated symptom is the case where spot repair may genuinely be feasible. Have a contractor open a small area to confirm the sheathing is dry before you commit to a full re-side.";
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

export function buildStageAction(answers: QuizAnswers, climate: ClimateProfile): StageAction {
  const stage = answers.stage;
  switch (stage) {
    case "need":
      return {
        headline: "You have a wall problem to solve, not a style project — yet.",
        summary:
          "The first job is establishing whether water has reached the sheathing. That single fact decides your scope, your budget and your timeline.",
        nextMilestone:
          "Book one inspection that includes a moisture probe at the base of the walls and under the windows — before you collect any bids.",
        supportingPoints: [
          "Ask for photographs of the probe readings, not just a verbal summary.",
          "Any bid written before someone has looked behind the siding is a guess.",
          "Bring the spec below to that inspection so you are comparing the same system across every quote.",
        ],
      };
    case "insurance":
      return {
        headline: "Your claim and your specification are two separate conversations.",
        summary:
          "Handle the insurance scope first with documentation, then choose the system. Mixing the two costs homeowners money in both directions.",
        nextMilestone:
          "Document the damage — dated photos of every elevation and the test square — and request a supplement for code-required upgrades before signing any contract.",
        supportingPoints: [
          climate.hailCorridor
            ? "Your state is in the hail corridor: most states have a uniform-appearance rule that can require replacing siding that can no longer be matched, not just the damaged elevation."
            : "Ask your adjuster in writing whether the undamaged elevations can be matched — if they can't, matching rules may extend the scope.",
          "Code-required upgrades (housewrap, flashing, insulation) are often payable as a supplement even when the original scope omits them.",
          "Do not let a contractor 'handle the deductible' — that is fraud, and it voids you as well as them.",
        ],
      };
    case "justify":
      return {
        headline: "This is a return-on-investment decision, so treat it like one.",
        summary:
          "Fiber cement siding replacement consistently ranks among the highest-recouping exterior remodels, and it is the change a buyer sees before they open the door.",
        nextMilestone:
          "Get one bid for the full ColorPlus® spec below and ask your agent what comparable re-sided homes in your ZIP closed at versus the un-updated ones.",
        supportingPoints: [
          "The transferable 30-year non-prorated warranty is a line item on your listing sheet, not just a document in a drawer.",
          "A buyer's inspector will find soft sheathing. Fixing it before listing is always cheaper than negotiating it after.",
          answers.timeline === "under-2"
            ? "Under two years to sale: prioritize a broadly appealing palette over a personal favorite."
            : "You have time to do this in the right season, which usually means a better crew at a better price.",
        ],
      };
    case "dream":
      return {
        headline: "You're designing, so the constraints matter more than the inspiration.",
        summary:
          "Your roof, masonry and window color are already chosen for you. A palette that ignores them is the single most common and most expensive exterior mistake.",
        nextMilestone:
          "Order physical samples of the top palette below and view them on the actual wall — north face and south face, morning and late afternoon.",
        supportingPoints: [
          "Screen color is not real color. Fiber cement finishes shift noticeably with sheen and daylight.",
          "Hold the sample against the roof and masonry, not against a white wall or a screen.",
          "Decide the trim color before the body color if your windows are staying — trim has fewer options.",
        ],
      };
    case "estimate":
      return {
        headline: "Your bids don't line up because they aren't quoting the same job.",
        summary:
          "Nearly every confusing bid spread comes from four omissions: the finish method, the flashing detail, the tear-off and disposal, and the rot contingency.",
        nextMilestone:
          "Send every bidder the same written scope — the spec and the five contractor questions below — and require them to re-quote to it line by line.",
        supportingPoints: [
          "A bid that says only 'Hardie siding' can legally mean primed board painted on site. That is a different product with a different warranty.",
          "Require the rot contingency to be quoted as a unit price per sheet, not left open-ended.",
          "The lowest bid is usually the one that left something out. Find out what.",
        ],
      };
    case "selection":
      return {
        headline: "You've made the decision. Now lock the specification.",
        summary:
          "The remaining risk is field substitution — the wrong Hardie Zone product, primed board instead of ColorPlus®, or missing joint flashing.",
        nextMilestone:
          "Put the spec below into your contract by name — profile, texture, ColorPlus® color, zone and trim — and require the packing slips to match at delivery.",
        supportingPoints: [
          `Your climate requires the ${climate.zone}® product line. Confirm it on the delivery paperwork, not in conversation.`,
          "ColorPlus® finish carries a separate 15-year finish warranty. Field paint does not.",
          "Order one extra square of material for future repairs while your color is in current production.",
        ],
      };
    default:
      return {
        headline: "Let's establish where you are.",
        summary: "Complete the quiz and we will build your plan from your answers.",
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
    (answers.vibeContrast === "monochromatic" && answers.vibeBrightness === "deep-dramatic")
  );
}

export function buildProductSpec(answers: QuizAnswers, climate: ClimateProfile): ProductSpec {
  const style = answers.archStyle ?? "ranch";
  const mapping = STYLE_MATRIX[style];
  const primaryId = wantsSmooth(answers) ? mapping.modernPrimary : mapping.primary;
  const primary: SidingProfile = SIDING_PROFILES[primaryId];

  const useAccent = answers.vibeContrast === "two-tone" && mapping.accent !== null;
  const accent: SidingProfile | null = useAccent && mapping.accent ? SIDING_PROFILES[mapping.accent] : null;

  const wantsCustomColor = answers.priorities.includes("custom-color");
  // ColorPlus is specified in every case: the Dream Collection covers custom
  // requests, and field paint forfeits the finish warranty.
  const finish: ProductSpec["finish"] = "ColorPlus";

  const finishRationale = wantsCustomColor
    ? "You named a specific color, so start in the ColorPlus® Dream Collection — several hundred factory-applied colors — before you consider field paint. Factory finish is baked on in a controlled environment and carries a 15-year finish warranty; a field-painted board does not."
    : "ColorPlus® Technology, not primed-and-field-painted. The finish is applied and baked in the factory, which is why it resists fading and never needs the scrape-and-repaint cycle that drives the real lifetime cost of siding.";

  const trimColorHint =
    answers.windowTrim === "modern-black"
      ? "in a dark ColorPlus finish to carry the window line"
      : answers.windowTrim === "warm-sand"
        ? "in a warm neutral to bridge the windows and body"
        : "in Arctic White or a near-white to hold the classic outline";

  const trim = `HardieTrim® 4/4 boards — 5.5" at corners and 3.5" at windows and doors, ${trimColorHint}. Add HardieTrim® 5/4 at the water table and any structural post wrap.`;

  const trimRationale =
    "Trim width is what makes an elevation read intentional. Under-scaled trim is the most visible tell of a budget re-side, and it is a small fraction of total cost.";

  const installMethod =
    "Trim-Over installation: HardieTrim® boards are installed over the siding field at corners and openings rather than butting siding into pre-set trim.";

  const installRationale =
    "Trim-Over lets the field boards run long and be cut to a clean line, removes the accumulated tolerance error that produces wavy corners, and keeps the vulnerable end cuts covered. It is faster in the field and it is the detail that most cleanly separates an experienced Hardie crew from a general remodeler.";

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
    trim,
    trimRationale,
    installMethod,
    installRationale,
    waterManagement,
  };
}

/* ---------------------------------- Palettes --------------------------------- */

interface ColorConstraint {
  temperature: "warm" | "cool" | "either";
  overridden: boolean;
  reason: string;
}

function resolveTemperature(answers: QuizAnswers): ColorConstraint {
  const warmFixtures =
    (answers.roofTone === "warm-red-brown" ? 1 : 0) + (answers.masonry === "warm-brick" ? 1 : 0);
  const coolFixtures =
    (answers.roofTone === "cool-charcoal" ? 1 : 0) + (answers.masonry === "cool-gray-stone" ? 1 : 0);

  const preference = answers.vibeTemperature ?? "warm";

  if (warmFixtures > 0 && coolFixtures === 0) {
    return {
      temperature: "warm",
      overridden: preference === "cool",
      reason:
        "Your roof or masonry carries a warm red-brown undertone that isn't changing. Cool grays placed next to warm brick read dirty and mismatched, so the palettes below stay in the warm and greige family.",
    };
  }
  if (coolFixtures > 0 && warmFixtures === 0) {
    return {
      temperature: "cool",
      overridden: preference === "warm",
      reason:
        "Your roof or masonry is cool-toned, so the palettes stay in the gray, slate and blue-gray family to keep the whole elevation reading as one deliberate scheme.",
    };
  }
  if (warmFixtures > 0 && coolFixtures > 0) {
    return {
      temperature: "either",
      overridden: false,
      reason:
        "You have both warm and cool fixed elements. Neutral greige bodies are the reliable bridge — they let the brick stay warm without fighting the roof.",
    };
  }
  return {
    temperature: preference,
    overridden: false,
    reason:
      answers.roofTone === "replacing"
        ? "You're replacing the roof, so the siding leads and the roof follows. Choose the siding first, then match the shingle to it."
        : "Nothing fixed is forcing your hand, so we followed your stated undertone preference.",
  };
}

function candidateBodies(answers: QuizAnswers, constraint: ColorConstraint): HardieColor[] {
  const hoaLocked = answers.hoa === "hoa-historic";
  return HARDIE_COLORS.filter((c) => {
    if (hoaLocked && c.collection !== "Statement") return false;
    if (hoaLocked && (c.lightness < 22 || c.name === "Countrylane Red")) return false;
    if (constraint.temperature === "either") return true;
    return c.undertone === constraint.temperature || c.undertone === "neutral";
  });
}

function targetLightness(answers: QuizAnswers): number {
  return answers.vibeBrightness === "deep-dramatic" ? 30 : 74;
}

function chooseTrim(body: HardieColor, answers: QuizAnswers): HardieColor {
  const preferred: string =
    answers.windowTrim === "modern-black"
      ? body.lightness > 55
        ? "Midnight Black"
        : "Arctic White"
      : answers.windowTrim === "warm-sand"
        ? body.lightness > 55
          ? "Monterey Taupe"
          : "Sail Cloth"
        : "Arctic White";

  const candidate = color(preferred);
  // White trim on a light body is a deliberate, classic low-contrast pairing —
  // only substitute when the trim would genuinely disappear into the field.
  if (contrastRatio(candidate.hex, body.hex) >= 1.3) return candidate;

  // Aim for a ~3:1 architectural outline rather than maximum contrast, so a
  // homeowner who asked for white trim doesn't get handed black.
  const alternatives = TRIM_COLOR_NAMES.map((name) => color(name))
    .filter((c) => c.name !== body.name && contrastRatio(c.hex, body.hex) >= 2)
    .sort(
      (a, b) =>
        Math.abs(contrastRatio(a.hex, body.hex) - 3) -
        Math.abs(contrastRatio(b.hex, body.hex) - 3),
    );

  return alternatives[0] ?? color("Arctic White");
}

function chooseAccent(body: HardieColor, trim: HardieColor, answers: QuizAnswers): HardieColor {
  const wantsDarkAccent = body.lightness > 50;
  const pool = HARDIE_COLORS.filter((c) => {
    if (c.name === body.name || c.name === trim.name) return false;
    if (answers.hoa === "hoa-historic" && c.collection !== "Statement") return false;
    return wantsDarkAccent ? c.lightness <= 35 : c.lightness >= 65;
  });

  const scored = pool
    .map((c) => ({ c, score: contrastRatio(c.hex, body.hex) }))
    .sort((a, b) => b.score - a.score);

  return scored[0]?.c ?? color("Midnight Black");
}

export function buildPalettes(answers: QuizAnswers): Palette[] {
  const constraint = resolveTemperature(answers);
  const pool = candidateBodies(answers, constraint);
  const target = targetLightness(answers);

  const ranked = [...pool].sort(
    (a, b) => Math.abs(a.lightness - target) - Math.abs(b.lightness - target),
  );

  const bodies: HardieColor[] = [];
  for (const candidate of ranked) {
    if (bodies.length >= 3) break;
    const farEnough = bodies.every((chosen) => Math.abs(chosen.lightness - candidate.lightness) >= 10);
    if (farEnough) bodies.push(candidate);
  }
  // Backfill if the constrained pool was too tight to yield three distinct bodies.
  for (const candidate of ranked) {
    if (bodies.length >= 3) break;
    if (!bodies.some((chosen) => chosen.name === candidate.name)) bodies.push(candidate);
  }
  while (bodies.length < 3) {
    bodies.push(color("Cobble Stone"));
  }

  const names = ["The Safe Bet", "The Elevated Choice", "The Designer Move"] as const;
  const taglines = [
    "Broadest appeal, lowest regret. This is the palette that reads correct to almost everyone, including a future buyer.",
    "One step more considered. Enough depth to look designed without becoming the house people describe by its color.",
    "The confident option. Higher contrast and more commitment — best when your massing and trim can carry it.",
  ] as const;

  return bodies.slice(0, 3).map((body, index) => {
    const trim = chooseTrim(body, answers);
    const accent = chooseAccent(body, trim, answers);
    const paletteName = names[index] ?? "Curated Palette";
    const tagline = taglines[index] ?? "";
    const contrast = contrastRatio(body.hex, trim.hex);

    const rationaleParts: string[] = [constraint.reason];
    if (answers.windowTrim === "modern-black") {
      rationaleParts.push(
        "Black windows want a high-contrast scheme — a mid-to-deep body with a decisive trim keeps them from reading as an accident.",
      );
    }
    if (answers.hoa === "hoa-historic") {
      rationaleParts.push(
        "Locked to the ColorPlus® Statement Collection, which is what review boards approve most consistently.",
      );
    }
    rationaleParts.push(
      `Body-to-trim contrast ratio is ${contrast.toFixed(1)}:1 — ${
        contrast >= 3
          ? "strong enough to read as deliberate architectural outline from the street."
          : "a soft, tonal outline. Choose this if you want the trim to disappear into the composition."
      }`,
    );

    return {
      id: `palette-${index + 1}`,
      name: paletteName,
      tagline,
      body,
      trim,
      accent,
      rationale: rationaleParts.join(" "),
      hoaSafe: body.collection === "Statement" && trim.collection !== "Dream",
    };
  });
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
  const stageAction = buildStageAction(answers, climate);
  const audit = buildAudit(answers, climate);
  const contractorQuestions = buildContractorQuestions(answers, climate);
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
