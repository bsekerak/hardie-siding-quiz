import type {
  ArchStyle,
  GutterChoice,
  ChoiceOption,
  CostPreference,
  CurrentSiding,
  Height,
  HoaStatus,
  HomeAge,
  Installer,
  Masonry,
  Priority,
  QuestionMeta,
  RoofTone,
  Scope,
  Stage,
  Symptom,
  Timeline,
  ColorFamily,
  TrimPreference,
  WindowTrimColor,
} from "@/types/quiz";

/* --------------------------------- Block A ---------------------------------- */

export const STAGE_OPTIONS: ReadonlyArray<ChoiceOption<Stage>> = [
  {
    value: "need",
    label: "Something's wrong with my siding",
    description: "Rot, cracks, peeling — you need it addressed",
    icon: "TriangleAlert",
  },
  {
    value: "insurance",
    label: "A storm damaged it",
    description: "Hail, wind or impact, and insurance may be involved",
    icon: "CloudLightning",
  },
  {
    value: "justify",
    label: "Selling soon, or I just bought",
    description: "You need the return-on-investment math",
    icon: "TrendingUp",
  },
  {
    value: "dream",
    label: "I want a new look",
    description: "The house works, the exterior is tired",
    icon: "Sparkles",
  },
  {
    value: "estimate",
    label: "Getting quotes and feeling confused",
    description: "Bids that don't line up and language you can't compare",
    icon: "FileQuestion",
  },
  {
    value: "selection",
    label: "I've picked Hardie — help me choose style & color",
    description: "Straight to the specification",
    icon: "Palette",
  },
];

export const SYMPTOM_OPTIONS: ReadonlyArray<ChoiceOption<Symptom>> = [
  { value: "soft-spots", label: "Soft or spongy spots" },
  { value: "peeling-paint", label: "Peeling or bubbling paint" },
  { value: "cracks-warping", label: "Cracks, warping, gaps" },
  { value: "hail-damage", label: "Hail dents or missing pieces" },
  { value: "rot-edges", label: "Rot around edges or windows" },
  { value: "energy-bills", label: "Higher energy bills" },
  { value: "dated", label: "Just old and dated" },
  { value: "not-sure", label: "Not sure — I need an inspection" },
];

/* --------------------------------- Block B ---------------------------------- */

export const HOME_AGE_OPTIONS: ReadonlyArray<ChoiceOption<HomeAge>> = [
  { value: "pre-1978", label: "Before 1978", description: "Lead-safe work practices are federally required" },
  { value: "1978-1999", label: "1978 – 1999", description: "Housewrap and flashing standards vary widely" },
  { value: "2000-2015", label: "2000 – 2015", description: "Modern WRB, but check the window flashing" },
  { value: "post-2015", label: "After 2015", description: "Current code envelope in most jurisdictions" },
  { value: "unknown", label: "I don't know", description: "We'll assume the conservative case" },
];

export const CURRENT_SIDING_OPTIONS: ReadonlyArray<ChoiceOption<CurrentSiding>> = [
  { value: "vinyl", label: "Vinyl", icon: "LayoutPanelTop" },
  { value: "wood", label: "Wood / Cedar", icon: "TreePine" },
  { value: "aluminum", label: "Aluminum", icon: "Layers" },
  { value: "hardboard", label: "Hardboard / Masonite", icon: "Layers2" },
  { value: "stucco", label: "Stucco", icon: "Grid2x2" },
  { value: "t1-11", label: "T1-11 / Panel", icon: "Columns3" },
  { value: "asbestos", label: "Asbestos-Cement Shingle", icon: "ShieldAlert" },
  { value: "brick-mix", label: "Brick + Siding Mix", icon: "Blocks" },
  { value: "unknown", label: "I don't know", icon: "CircleHelp" },
];

export const ARCH_STYLE_OPTIONS: ReadonlyArray<ChoiceOption<ArchStyle>> = [
  { value: "colonial", label: "Colonial / Cape Cod", description: "Symmetrical face, shutters, centered entry" },
  { value: "craftsman", label: "Craftsman / Bungalow", description: "Deep eaves, tapered columns, gable brackets" },
  { value: "ranch", label: "Ranch", description: "Long, low, single-story horizontal mass" },
  { value: "modern-farmhouse", label: "Modern Farmhouse", description: "Steep gables, black windows, vertical siding" },
  { value: "contemporary", label: "Contemporary", description: "Flat or shed roofs, large glazing, clean planes" },
  { value: "victorian", label: "Victorian / Queen Anne", description: "Turrets, layered textures, ornate trim" },
  { value: "split-level", label: "Split-Level", description: "Two offset volumes, mid-century footprint" },
  { value: "coastal", label: "Cottage / Coastal", description: "Shingled walls, porches, informal massing" },
];

export const HEIGHT_OPTIONS: ReadonlyArray<ChoiceOption<Height>> = [
  { value: "single", label: "Single story" },
  { value: "two", label: "Two story" },
  { value: "three-plus", label: "Three+ or complex rooflines" },
];

export const SCOPE_OPTIONS: ReadonlyArray<ChoiceOption<Scope>> = [
  { value: "whole-house", label: "Whole house" },
  { value: "one-two-sides", label: "One or two sides" },
  { value: "damaged-area", label: "Damaged area only" },
];

export const GUTTER_OPTIONS: ReadonlyArray<ChoiceOption<GutterChoice>> = [
  {
    value: "6-inch",
    label: '6" oversized gutters',
    description: "Handles heavy rain, large roof planes and steep pitches without overshooting",
    icon: "CloudHail",
  },
  {
    value: "4-inch",
    label: '4" gutters',
    description: "Lower profile and less visually heavy — best on small or simple roofs",
    icon: "Ruler",
  },
  {
    value: "reuse",
    label: "Re-hang my existing gutters",
    description: "They still have to come down and go back up — that's labor, not free",
    icon: "RotateCcw",
  },
  {
    value: "skip",
    label: "Not handling gutters in this project",
    description: "We'll leave them out of your budget entirely",
    icon: "X",
  },
];

/* --------------------------------- Block C ---------------------------------- */

export const PRIORITY_OPTIONS: ReadonlyArray<ChoiceOption<Priority>> = [
  { value: "no-maintenance", label: "Never paint or caulk again", icon: "PaintBucket" },
  { value: "lowest-lifetime-cost", label: "Lowest total cost over time", icon: "PiggyBank" },
  { value: "real-wood-look", label: "Looks like authentic real wood", icon: "TreePine" },
  { value: "protection", label: "Fire, wind and hail protection", icon: "ShieldCheck" },
  { value: "resale", label: "Resale value & curb appeal", icon: "TrendingUp" },
  { value: "fast-install", label: "Done fast with minimal disruption", icon: "Timer" },
  { value: "custom-color", label: "A specific custom color", icon: "Palette" },
];

export const TIMELINE_OPTIONS: ReadonlyArray<ChoiceOption<Timeline>> = [
  { value: "under-2", label: "Under 2 years", description: "Resale return is the deciding metric" },
  { value: "2-5", label: "2 – 5 years", description: "Balance upfront cost against sale-ready condition" },
  { value: "5-10", label: "5 – 10 years", description: "You will live with this choice through a full weather cycle" },
  { value: "10-plus", label: "10+ years", description: "The 30-year non-prorated warranty is doing real work for you" },
];

export const INSTALLER_OPTIONS: ReadonlyArray<ChoiceOption<Installer>> = [
  { value: "pro", label: "Hiring a pro", description: "You want the plan, they handle the method" },
  { value: "pro-informed", label: "Hiring, but I want to understand the details", description: "You intend to read the bid line by line" },
  { value: "diy", label: "Doing some or all myself", description: "You'll be cutting board and setting flashing" },
];

export const COST_PREFERENCE_OPTIONS: ReadonlyArray<ChoiceOption<CostPreference>> = [
  { value: "lump-sum", label: "A total lump-sum budget" },
  { value: "monthly", label: "A monthly payment plan" },
  { value: "line-item", label: "A clear line-item quote comparison" },
  { value: "insurance", label: "Help understanding insurance coverage" },
];

/* --------------------------------- Block D ---------------------------------- */

export const ROOF_TONE_OPTIONS: ReadonlyArray<ChoiceOption<RoofTone>> = [
  { value: "warm-red-brown", label: "Warm red-brown" },
  { value: "cool-charcoal", label: "Cool charcoal / black" },
  { value: "medium-gray-brown", label: "Medium gray-brown" },
  { value: "replacing", label: "I'm replacing it" },
];

export const MASONRY_OPTIONS: ReadonlyArray<ChoiceOption<Masonry>> = [
  { value: "warm-brick", label: "Warm brick or stone" },
  { value: "cool-gray-stone", label: "Cool gray stone" },
  { value: "none", label: "No masonry" },
];

export const WINDOW_TRIM_OPTIONS: ReadonlyArray<ChoiceOption<WindowTrimColor>> = [
  { value: "classic-white", label: "Classic white" },
  { value: "modern-black", label: "Modern black / bronze" },
  { value: "warm-sand", label: "Warm sand / tan / wood" },
];

export const HOA_OPTIONS: ReadonlyArray<ChoiceOption<HoaStatus>> = [
  {
    value: "hoa-historic",
    label: "HOA or historic district",
    description: "We'll lock to approvable neutrals and build a pre-approval packet",
    icon: "Landmark",
  },
  {
    value: "conformity",
    label: "Neighborhood conformity matters",
    description: "No formal rules, but you don't want to be the outlier",
    icon: "House",
  },
  {
    value: "clean-slate",
    label: "No rules / clean slate",
    description: "Full color range is open to you",
    icon: "Sparkles",
  },
];

export const COLOR_FAMILY_OPTIONS: ReadonlyArray<ChoiceOption<ColorFamily>> = [
  {
    value: "classic-neutrals",
    label: "Classic Whites & Warm Neutrals",
    description: "Arctic White, Cobble Stone — the broadest appeal and the lowest resale risk",
  },
  {
    value: "architectural-grays",
    label: "Architectural Grays",
    description: "Pearl Gray, Iron Gray — crisp and current, strongest with black windows",
  },
  {
    value: "earth-tones",
    label: "Nature-Inspired Earth Tones",
    description: "Mountain Sage, Timber Bark — settles a house into a wooded or rural lot",
  },
  {
    value: "coastal-blues",
    label: "Coastal Blues",
    description: "Boothbay Blue, Evening Blue, Deep Ocean — cottage character without the kitsch",
  },
  {
    value: "bold-dramatic",
    label: "Bold & Dramatic",
    description: "Night Gray, Iron Gray, Countrylane Red — high commitment, high reward",
  },
];

export const TRIM_PREFERENCE_OPTIONS: ReadonlyArray<ChoiceOption<TrimPreference>> = [
  {
    value: "high-contrast",
    label: "Crisp High-Contrast Trim",
    description: "Trim reads as a deliberate architectural outline from the street",
  },
  {
    value: "tonal",
    label: "Tonal / Subtle Trim",
    description: "Trim sits close to the body so the massing reads as one quiet volume",
  },
];

/* -------------------------------- Question set ------------------------------- */

/**
 * Question order is the single source of truth for numbering — `number` is
 * derived from position below, so inserting a question can never leave two
 * steps sharing a number.
 */
const QUESTION_DEFS: ReadonlyArray<Omit<QuestionMeta, "number">> = [
  {
    id: "stage",
    block: "A",
    blockLabel: "Where you are",
    kind: "single",
    title: "What brings you here today?",
    helper: "This sets everything that follows — there's no wrong answer.",
  },
  {
    id: "symptoms",
    block: "A",
    blockLabel: "Where you are",
    kind: "multi",
    title: "What are you seeing?",
    helper: "Select everything that applies. Two or more usually changes the recommendation.",
    minSelections: 1,
  },
  {
    id: "zip",
    block: "B",
    blockLabel: "Your house",
    kind: "zip",
    title: "What is your ZIP code?",
    helper: "Climate drives which Hardie® board line is engineered for your wall — this is the single most important input.",
  },
  {
    id: "homeAge",
    block: "B",
    blockLabel: "Your house",
    kind: "single",
    title: "When was your home built?",
    helper: "Age determines both the legal requirements and what we expect to find behind the siding.",
  },
  {
    id: "currentSiding",
    block: "B",
    blockLabel: "Your house",
    kind: "single",
    title: "What's on your house now?",
    helper: "Tear-off cost, disposal rules and what has to be replaced underneath all follow from this.",
  },
  {
    id: "archStyle",
    block: "B",
    blockLabel: "Your house",
    kind: "single",
    title: "Which architectural style feels closest?",
    helper: "Close is good enough. This maps your primary profile.",
  },
  {
    id: "sizeScope",
    block: "B",
    blockLabel: "Your house",
    kind: "compound",
    title: "What is the size and scope?",
    helper: "Height drives staging and labor; scope drives the material quantity.",
  },
  {
    id: "gutters",
    block: "B",
    blockLabel: "Your house",
    kind: "single",
    title: "What about gutters?",
    helper:
      "Your gutters have to come off for the siding to go on. Replacing them now costs a fraction of doing it as its own job later.",
  },
  {
    id: "priorities",
    block: "C",
    blockLabel: "Your priorities",
    kind: "multi",
    title: "What matters most to you?",
    helper: "Pick your top two. Everything is a trade-off against these.",
    maxSelections: 2,
    minSelections: 1,
  },
  {
    id: "timeline",
    block: "C",
    blockLabel: "Your priorities",
    kind: "single",
    title: "How long do you plan to stay in this home?",
    helper: "This decides whether we optimize for resale return or lifecycle value.",
  },
  {
    id: "installer",
    block: "C",
    blockLabel: "Your priorities",
    kind: "single",
    title: "Who is doing the work?",
    helper: "Fiber cement has real handling, cutting and dust-control requirements.",
  },
  {
    id: "costPreference",
    block: "C",
    blockLabel: "Your priorities",
    kind: "single",
    title: "What would make the cost feel manageable?",
    helper: "We'll frame your numbers the way you actually want to see them.",
  },
  {
    id: "features",
    block: "D",
    blockLabel: "Your color strategy",
    kind: "compound",
    title: "What exterior features are staying?",
    helper: "Your color is constrained by what you're not replacing. This is where most palettes go wrong.",
  },
  {
    id: "hoa",
    block: "D",
    blockLabel: "Your color strategy",
    kind: "single",
    title: "Any neighborhood or HOA guidelines?",
    helper: "An approval process changes which colors are realistically available to you.",
  },
  {
    id: "colorFamily",
    block: "D",
    blockLabel: "Your color strategy",
    kind: "compound",
    title: "Which color family are you drawn to?",
    helper:
      "Every color below is a real James Hardie Statement Collection color. Pick the family — we'll choose the specific colors that work against the roof, masonry and windows you're keeping.",
  },
];

export const QUESTIONS: readonly QuestionMeta[] = QUESTION_DEFS.map((definition, index) => ({
  ...definition,
  number: index + 1,
}));

export function questionByNumber(number: number): QuestionMeta | undefined {
  return QUESTIONS.find((q) => q.number === number);
}
