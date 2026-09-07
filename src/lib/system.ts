import type {
  ClimateProfile,
  InstallMethodRecommendation,
  ProfileId,
  QuizAnswers,
  SidingProfile,
  TrimRecommendation,
} from "@/types/quiz";

export interface SystemRecommendation {
  trim: TrimRecommendation;
  install: InstallMethodRecommendation;
}

/**
 * Only horizontal lap courses give trim something to span. Panels, battens,
 * shingle panels and architectural panels with expressed reveal channels do not
 * present a consistent plane to fasten over.
 */
const LAP_PROFILES: ReadonlySet<ProfileId> = new Set<ProfileId>([
  "hardieplank-select-cedarmill",
  "hardieplank-smooth",
]);

type DisqualifierId = "non-lap" | "intricate-casing" | "moisture-pvc";

interface Disqualifier {
  id: DisqualifierId;
  /** Plain-English cause, used in the trim-first explanation. */
  because: string;
}

/**
 * Trim-Over with HardieTrim® 5/4 fiber cement is the DEFAULT recommendation.
 * It is James Hardie's own differentiated method and the better detail on a
 * standard lap wall, so it stands unless a concrete structural or material
 * exception rules it out.
 */
function findDisqualifier(
  answers: QuizAnswers,
  climate: ClimateProfile,
  primary: SidingProfile,
): Disqualifier | null {
  // EXCEPTION 1 — structural. No lap courses to span.
  if (!LAP_PROFILES.has(primary.id)) {
    return {
      id: "non-lap",
      because: `your ${primary.productLine} field is not horizontal lap siding, so there are no courses for trim to span`,
    };
  }

  // EXCEPTION 2 — intricate casing needing a flush sheathing mount. Victorian
  // always; Craftsman only when the roofline is genuinely complex, which is the
  // one complexity signal the quiz actually captures (Q7 "Three+ or complex
  // rooflines") rather than assuming every Craftsman is ornate.
  const isIntricate =
    answers.archStyle === "victorian" ||
    (answers.archStyle === "craftsman" && answers.height === "three-plus");
  if (isIntricate) {
    return {
      id: "intricate-casing",
      because:
        answers.archStyle === "victorian"
          ? "Victorian casing profiles have to mount flush to the sheathing to hold their depth and reveals"
          : "your Craftsman elevation has complex rooflines, and the casing needs a flush sheathing mount to carry its profiles cleanly",
    };
  }

  // EXCEPTION 3 — moisture conditions that call for cellular PVC, which cannot
  // be installed over siding. If PVC is off the table anyway because of
  // wildfire exposure, this exception does not apply and Trim-Over stands.
  // Uses the narrow coastal flag: the broad one covers whole inland states and
  // would strip the default from homeowners hundreds of miles from salt water.
  const needsMoistureTolerance =
    climate.coastalHighExposure || answers.symptoms.includes("rot-edges");
  if (needsMoistureTolerance && !climate.wildfireWui) {
    return {
      id: "moisture-pvc",
      because: climate.coastalHighExposure
        ? "your coastal exposure calls for cellular PVC trim at grade and rooflines, and PVC cannot be installed over siding"
        : "the rot already in your wall calls for cellular PVC trim, which cannot be installed over siding",
    };
  }

  return null;
}

export function evaluateExteriorSystem(
  answers: QuizAnswers,
  climate: ClimateProfile,
  primary: SidingProfile,
): SystemRecommendation {
  const disqualifier = findDisqualifier(answers, climate, primary);

  if (disqualifier === null) {
    return {
      install: {
        method: "Hardie® Trim-Over Method",
        reason:
          "The default and the better detail on a lap wall. Siding runs continuously across the elevation, then trim is fastened over the siding face — the field boards run long and get cut to a clean line, which removes the accumulated tolerance error that produces wavy corners, and it eliminates the sealed joint where siding would otherwise butt into casing.",
        contractorNote:
          "Must use 5/4 thickness HardieTrim® boards with fasteners long enough to penetrate framing through both the trim and the siding beneath it. Cellular PVC cannot be substituted in a trim-over application — its thermal movement is roughly three times that of fiber cement, and spanning siding courses it will telegraph and pull its fasteners." +
          (climate.coastalSalt && !climate.coastalHighExposure
            ? " One caveat we can't settle from a ZIP code: if your home actually sits within about half a mile of salt water, raise trim-first with AZEK® cellular PVC instead — PVC tolerates ground and roofline contact that fiber cement needs a maintained gap for."
            : ""),
      },
      trim: {
        brand: "James Hardie",
        product: "HardieTrim® 5/4 Boards",
        material: "Fiber Cement",
        thickness: "5/4 nominal (1 inch actual)",
        reason:
          "Engineered fiber cement has the rigidity to span over siding courses without bowing or thermal distortion, and it takes the same ColorPlus® finish as your field boards for an exact match.",
        exclusionNote:
          "Cellular PVC is ruled out here by the install method, not by preference — 5/4 fiber cement is what makes Trim-Over possible.",
      },
    };
  }

  // A homeowner who asked for the lowest-maintenance joint detail and still
  // lands on trim-first deserves the trade-off stated plainly, because
  // trim-first has more sealed joints, not fewer.
  const wantsZeroCaulk = answers.priorities.includes("no-maintenance");
  const tradeoffNote = wantsZeroCaulk
    ? `You asked to never paint or caulk again, and Trim-Over would give you the lowest-maintenance joint detail there is. We can't specify it here because ${disqualifier.because}. That is a condition of your home rather than a preference we're overriding — so the sealed joints below need to be done properly and inspected every few years. `
    : "";

  const install: InstallMethodRecommendation = {
    method: "Traditional Trim-First Method",
    reason: `${tradeoffNote}Corner and casing boards are fastened to the sheathing first, then siding is cut and butted against them. Specified here because ${disqualifier.because}.`,
    contractorNote:
      'Leave a 1/8" gap between siding cut ends and the trim boards. Prime every field cut and seal the joint with a high-performance color-matched sealant — this is the joint that will need inspection every few years, so make sure it is done with sealant rather than painter\'s caulk.',
  };

  // Within trim-first, PVC is available unless wildfire exposure forbids it.
  const pvcSuits =
    disqualifier.id === "moisture-pvc" ||
    disqualifier.id === "intricate-casing" ||
    answers.installer === "diy";

  if (!climate.wildfireWui && pvcSuits) {
    return {
      install,
      trim: {
        brand: "AZEK",
        product: "AZEK® Cellular PVC Trim",
        material: "Cellular PVC",
        thickness: "4/4 or 5/4 nominal",
        reason:
          disqualifier.id === "intricate-casing"
            ? "Impervious to moisture and rot, and it mills cleanly — which is what you want for the custom profiles and historic detailing your elevation calls for."
            : disqualifier.id === "moisture-pvc"
              ? "Impervious to moisture and rot, with zero-clearance capability against grade, rooflines and kick-out flashing where fiber cement needs a maintained gap."
              : "Impervious to moisture and rot, cuts with standard woodworking tools, and produces no respirable silica — a meaningful advantage if you are doing the cutting yourself.",
        exclusionNote: null,
      },
    };
  }

  return {
    install,
    trim: {
      brand: "James Hardie",
      product: "HardieTrim® Boards",
      material: "Fiber Cement",
      thickness: "4/4 or 5/4 nominal",
      reason:
        "Class A non-combustible protection with ColorPlus® factory finish that matches your field boards exactly.",
      exclusionNote: climate.wildfireWui
        ? "Cellular PVC was ruled out by your wildfire exposure: PVC is combustible, and in a mapped Wildland-Urban Interface area every exterior component should be non-combustible. This is a safety constraint, not a style preference."
        : null,
    },
  };
}
