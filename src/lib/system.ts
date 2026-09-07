import type {
  ClimateProfile,
  InstallMethodRecommendation,
  QuizAnswers,
  TrimRecommendation,
} from "@/types/quiz";

export interface SystemRecommendation {
  trim: TrimRecommendation;
  install: InstallMethodRecommendation;
}

/**
 * Decides the trim material and the install method as one coupled system,
 * because they constrain each other: the Trim-Over method requires the
 * dimensional stability of 5/4 fiber cement, so choosing it forecloses PVC.
 *
 * Climate is passed explicitly rather than read off the answers — the ZIP is
 * the only raw input we store, and the derived flags live on ClimateProfile.
 */
export function evaluateExteriorSystem(
  answers: QuizAnswers,
  climate: ClimateProfile,
): SystemRecommendation {
  const wantsZeroCaulk = answers.priorities.includes("no-maintenance");
  const isHistoricIntricate = answers.archStyle === "victorian" || answers.archStyle === "craftsman";
  // Moisture-heavy conditions where PVC's rot-immunity and tolerance for tight
  // clearances against grade and roofing is worth more than fiber cement's
  // rigidity.
  const needsMoistureTolerance = climate.coastalSalt || answers.symptoms.includes("rot-edges");
  const isFireZone = climate.wildfireWui;

  // RULE 1: Trim-Over eligibility is decided first, because it locks the trim.
  const favorsTrimOver = wantsZeroCaulk && !isHistoricIntricate && !needsMoistureTolerance;

  if (favorsTrimOver) {
    return {
      install: {
        method: "Hardie® Trim-Over Method",
        reason:
          "Siding is installed continuously across the wall first, then trim is fastened over the siding face. The field boards run long and get cut to a clean line, which removes the accumulated tolerance error that produces wavy corners — and it eliminates the caulked joint where siding would otherwise butt into casing.",
        contractorNote:
          "Must use 5/4 thickness HardieTrim® boards with fasteners long enough to penetrate framing through both the trim and the siding beneath it. Cellular PVC cannot be substituted in a trim-over application — its thermal movement is roughly three times that of fiber cement, and spanning siding courses it will telegraph and pull its fasteners.",
      },
      trim: {
        brand: "James Hardie",
        product: "HardieTrim® 5/4 Boards",
        material: "Fiber Cement",
        thickness: "5/4 nominal (1 inch actual)",
        reason:
          "Engineered fiber cement has the rigidity to span over siding courses without bowing or thermal distortion, and it takes the same ColorPlus® finish as your field boards for an exact match.",
        exclusionNote:
          "Cellular PVC is ruled out here by the install method, not by preference.",
      },
    };
  }

  // Someone who asked for "never caulk again" and still lands here deserves an
  // explanation, because Trim-First has more sealed joints, not fewer.
  const tradeoffPrefix = wantsZeroCaulk
    ? isHistoricIntricate
      ? "You asked for the lowest-maintenance joint detail, and Trim-Over would deliver it — but not on this elevation. "
      : "You asked for the lowest-maintenance joint detail. Trim-Over would give you fewer sealed joints, but your wall conditions outrank that here. "
    : "";

  const install: InstallMethodRecommendation = {
    method: "Traditional Trim-First Method",
    reason: tradeoffPrefix + (isHistoricIntricate
      ? "Corner and casing boards are fastened to the sheathing first, then siding is cut and butted to them. On an intricate elevation this is the correct choice — it lets the trim carry the period profiles and reveals that a trim-over detail would flatten."
      : needsMoistureTolerance
        ? "Corner and casing boards go on the sheathing first, then siding is cut and butted to them. This keeps the trim material free to be the one that best resists moisture, which matters more than joint count on your wall."
        : "Corner and casing boards are fastened to the sheathing first, with siding cut and butted against the casing."),
    contractorNote:
      'Leave a 1/8" gap between siding cut ends and the trim boards. Prime every field cut and seal the joint with a high-performance color-matched sealant — this is the joint that will need inspection every few years, so make sure it is done with sealant rather than painter\'s caulk.',
  };

  // RULE 2: In a mapped WUI area, combustible trim is off the table regardless
  // of how well PVC would otherwise suit the detailing.
  const pvcSuits =
    isHistoricIntricate || needsMoistureTolerance || answers.installer === "diy";

  if (!isFireZone && pvcSuits) {
    return {
      install,
      trim: {
        brand: "AZEK",
        product: "AZEK® Cellular PVC Trim",
        material: "Cellular PVC",
        thickness: "4/4 or 5/4 nominal",
        reason: isHistoricIntricate
          ? "Impervious to moisture and rot, and it mills cleanly — which is what you want for the custom profiles and historic detailing your elevation calls for."
          : answers.installer === "diy"
            ? "Impervious to moisture and rot, cuts with standard woodworking tools, and produces no respirable silica — a meaningful advantage if you are doing the cutting yourself."
            : "Impervious to moisture and rot, with zero-clearance capability against grade, rooflines and kick-out flashing where fiber cement needs a maintained gap.",
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
      exclusionNote: isFireZone
        ? "Cellular PVC was ruled out by your wildfire exposure: PVC is combustible, and in a mapped Wildland-Urban Interface area every exterior component should be non-combustible. This is a safety constraint, not a style preference."
        : null,
    },
  };
}
