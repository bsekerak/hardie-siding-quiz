import type { ClimateProfile, HardieZone } from "@/types/quiz";

/**
 * Three-digit ZIP prefix ranges mapped to state. Ranges are inclusive and cover
 * the contiguous USPS allocations; prefixes that fall in an unallocated gap
 * resolve to `null` and the engine falls back to first-digit logic only.
 */
const ZIP_PREFIX_RANGES: ReadonlyArray<readonly [number, number, string]> = [
  [10, 27, "MA"],
  [28, 29, "RI"],
  [30, 38, "NH"],
  [39, 49, "ME"],
  [50, 59, "VT"],
  [60, 69, "CT"],
  [70, 89, "NJ"],
  [100, 149, "NY"],
  [150, 196, "PA"],
  [197, 199, "DE"],
  [200, 205, "DC"],
  [206, 219, "MD"],
  [220, 246, "VA"],
  [247, 268, "WV"],
  [270, 289, "NC"],
  [290, 299, "SC"],
  [300, 319, "GA"],
  [320, 349, "FL"],
  [350, 369, "AL"],
  [370, 385, "TN"],
  [386, 397, "MS"],
  [398, 399, "GA"],
  [400, 427, "KY"],
  [430, 459, "OH"],
  [460, 479, "IN"],
  [480, 499, "MI"],
  [500, 528, "IA"],
  [530, 549, "WI"],
  [550, 567, "MN"],
  [570, 577, "SD"],
  [580, 588, "ND"],
  [590, 599, "MT"],
  [600, 629, "IL"],
  [630, 658, "MO"],
  [660, 679, "KS"],
  [680, 693, "NE"],
  [700, 714, "LA"],
  [716, 729, "AR"],
  [730, 749, "OK"],
  [750, 799, "TX"],
  [800, 816, "CO"],
  [820, 831, "WY"],
  [832, 838, "ID"],
  [840, 847, "UT"],
  [850, 865, "AZ"],
  [870, 884, "NM"],
  [885, 885, "TX"],
  [889, 898, "NV"],
  [900, 961, "CA"],
  [967, 968, "HI"],
  [970, 979, "OR"],
  [980, 994, "WA"],
  [995, 999, "AK"],
];

const STATE_NAMES: Readonly<Record<string, string>> = {
  AK: "Alaska", AL: "Alabama", AR: "Arkansas", AZ: "Arizona", CA: "California",
  CO: "Colorado", CT: "Connecticut", DC: "Washington, D.C.", DE: "Delaware",
  FL: "Florida", GA: "Georgia", HI: "Hawaii", IA: "Iowa", ID: "Idaho",
  IL: "Illinois", IN: "Indiana", KS: "Kansas", KY: "Kentucky", LA: "Louisiana",
  MA: "Massachusetts", MD: "Maryland", ME: "Maine", MI: "Michigan",
  MN: "Minnesota", MO: "Missouri", MS: "Mississippi", MT: "Montana",
  NC: "North Carolina", ND: "North Dakota", NE: "Nebraska", NH: "New Hampshire",
  NJ: "New Jersey", NM: "New Mexico", NV: "Nevada", NY: "New York", OH: "Ohio",
  OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania", RI: "Rhode Island",
  SC: "South Carolina", SD: "South Dakota", TN: "Tennessee", TX: "Texas",
  UT: "Utah", VA: "Virginia", VT: "Vermont", WA: "Washington", WI: "Wisconsin",
  WV: "West Virginia", WY: "Wyoming",
};

/** Great Plains / Midwest hail alley — impact and uniform-appearance rules apply. */
const HAIL_STATES = new Set([
  "TX", "OK", "KS", "NE", "CO", "SD", "ND", "MN", "IA", "MO", "IL", "WY", "NM", "MT", "AR",
]);

/** Western and Mountain states with mapped Wildland-Urban Interface areas. */
const WUI_STATES = new Set([
  "CA", "OR", "WA", "ID", "MT", "WY", "CO", "UT", "NV", "AZ", "NM",
]);

/** States where a meaningful share of homes sit within salt-air exposure. */
const COASTAL_STATES = new Set([
  "FL", "HI", "SC", "NC", "GA", "LA", "MS", "AL", "TX", "VA", "MD", "DE", "NJ",
  "NY", "CT", "RI", "MA", "NH", "ME", "CA", "OR", "WA", "AK",
]);

/** IECC climate zone 5 and colder — continuous insulation belongs in the bid. */
const COLD_IECC_STATES = new Set([
  "AK", "ME", "NH", "VT", "MA", "CT", "RI", "NY", "PA", "OH", "IN", "IL", "IA",
  "WI", "MN", "MI", "ND", "SD", "NE", "MT", "WY", "ID", "CO", "UT", "WV",
]);

/** Adds the shoulder states that still see meaningful freeze/thaw cycling. */
const FREEZE_THAW_EXTRA = new Set(["MO", "KS", "NJ", "MD", "DE", "VA", "KY", "OR", "WA", "NV"]);

export function isValidZip(zip: string): boolean {
  return /^\d{5}$/.test(zip);
}

export function stateFromZip(zip: string): string | null {
  if (!isValidZip(zip)) return null;
  const prefix = Number.parseInt(zip.slice(0, 3), 10);
  for (const [min, max, state] of ZIP_PREFIX_RANGES) {
    if (prefix >= min && prefix <= max) return state;
  }
  return null;
}

/**
 * States in the HZ10 region — sustained heat, humidity, UV load and salt air.
 * Everything else is HZ5 (freeze/thaw and snow). NC, TN and OK straddle the
 * real boundary; they are assigned to the dominant condition for that state.
 */
const HZ10_STATES = new Set([
  "FL", "GA", "AL", "MS", "LA", "TX", "AR", "SC", "NC", "TN", "OK", "CA", "AZ", "NM", "NV", "HI",
]);

/**
 * Set to true to use the first-digit ZIP rule exactly as written in the source
 * specification (leading 0-3, 5, 6, 8 -> HZ5; 4, 7, 9 -> HZ10). That rule is
 * retained as a documented fallback rather than the primary path because it
 * misclassifies large regions: it places all of Florida and Georgia (3xxxx) in
 * HZ5 and all of Ohio and Kentucky (4xxxx) in HZ10, which inverts the real
 * Hardie Zone map. The state-derived mapping below is used instead, with the
 * first-digit rule applied only when a ZIP does not resolve to a state.
 */
const USE_SPEC_FIRST_DIGIT_RULE = false;

function zoneFromFirstDigit(zip: string): HardieZone {
  const first = zip.charAt(0);
  return first === "4" || first === "7" || first === "9" ? "HZ10" : "HZ5";
}

export function zoneFromZip(zip: string): HardieZone {
  if (USE_SPEC_FIRST_DIGIT_RULE) return zoneFromFirstDigit(zip);
  const state = stateFromZip(zip);
  if (state === null) return zoneFromFirstDigit(zip);
  return HZ10_STATES.has(state) ? "HZ10" : "HZ5";
}

export function buildClimateProfile(zip: string): ClimateProfile {
  const state = stateFromZip(zip);
  const zone = zoneFromZip(zip);
  const hailCorridor = state !== null && HAIL_STATES.has(state);
  const wildfireWui = state !== null && WUI_STATES.has(state);
  const coastalSalt = state !== null && COASTAL_STATES.has(state);
  const coldIecc = state !== null && COLD_IECC_STATES.has(state);
  const freezeThaw = coldIecc || (state !== null && FREEZE_THAW_EXTRA.has(state));

  const drivers: string[] = [];
  if (zone === "HZ5") {
    drivers.push(
      "Freeze/thaw cycling and wind-driven snow — HZ5 boards are engineered for moisture that expands as it freezes.",
    );
  } else {
    drivers.push(
      "Sustained heat, humidity and UV load — HZ10 boards and ColorPlus finishes are engineered for the shrink/swell and fade cycle.",
    );
  }
  if (freezeThaw && zone === "HZ5") {
    drivers.push("Below-freezing swings make sealed field cuts and correct clearances non-negotiable.");
  }
  if (hailCorridor) {
    drivers.push(
      "Hail corridor: fiber cement resists dents that dimple vinyl and aluminum, and most state uniform-appearance rules let you claim siding that can no longer be matched.",
    );
  }
  if (wildfireWui) {
    drivers.push(
      "Wildland-Urban Interface exposure: James Hardie fiber cement is non-combustible per ASTM E136 and carries a Class A flame-spread rating.",
    );
  }
  if (coastalSalt) {
    drivers.push(
      "If your home sits within roughly half a mile of salt water, specify stainless or hot-dipped galvanized fasteners and rinse the walls seasonally.",
    );
  }
  if (coldIecc) {
    drivers.push(
      "IECC climate zone 5 or colder: continuous exterior insulation is frequently required on a full re-side and belongs as its own line item.",
    );
  }

  const regionLabel = state ? `${STATE_NAMES[state] ?? state} (${state})` : "your region";

  const zoneHeadline =
    zone === "HZ5"
      ? "HZ5® — engineered for freeze/thaw, snow load and seasonal swing"
      : "HZ10® — engineered for heat, humidity, UV and salt-air exposure";

  return {
    zip,
    state,
    regionLabel,
    zone,
    zoneHeadline,
    drivers,
    hailCorridor,
    wildfireWui,
    coastalSalt,
    coldIecc,
    freezeThaw,
  };
}
