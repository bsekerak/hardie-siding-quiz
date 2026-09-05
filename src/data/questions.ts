import type {
  ArchStyle,
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
  VibeBrightness,
  VibeContrast,
  VibeTemperature,
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

export const VIBE_BRIGHTNESS_OPTIONS: ReadonlyArray<ChoiceOption<VibeBrightness>> = [
  { value: "light-airy", label: "Light & Airy", description: "Reflective body, the house feels larger" },
  { value: "deep-dramatic", label: "Deep & Dramatic", description: "Saturated body, trim and landscape pop" },
];

export const VIBE_TEMPERATURE_OPTIONS: ReadonlyArray<ChoiceOption<VibeTemperature>> = [
  { value: "warm", label: "Warm Undertones", description: "Beige, taupe, greige, sand" },
  { value: "cool", label: "Cool Undertones", description: "Gray, blue-gray, slate, sage" },
];

export const VIBE_CONTRAST_OPTIONS: ReadonlyArray<ChoiceOption<VibeContrast>> = [
  { value: "monochromatic", label: "Classic Monochromatic + White Trim", description: "One body color, crisp trim" },
  { value: "two-tone", label: "Two-Tone / Accent Textures", description: "A second color or texture on gables and bays" },
];

/* -------------------------------- Question set ------------------------------- */

export const QUESTIONS: readonly QuestionMeta[] = [
  {
    id: "stage",
    number: 1,
    block: "A",
    blockLabel: "Where you are",
    kind: "single",
    title: "What brings you here today?",
    helper: "This sets everything that follows — there's no wrong answer.",
  },
  {
    id: "symptoms",
    number: 2,
    block: "A",
    blockLabel: "Where you are",
    kind: "multi",
    title: "What are you seeing?",
    helper: "Select everything that applies. Two or more usually changes the recommendation.",
    minSelections: 1,
  },
  {
    id: "zip",
    number: 3,
    block: "B",
    blockLabel: "Your house",
    kind: "zip",
    title: "What is your ZIP code?",
    helper: "Climate drives which Hardie® board line is engineered for your wall — this is the single most important input.",
  },
  {
    id: "homeAge",
    number: 4,
    block: "B",
    blockLabel: "Your house",
    kind: "single",
    title: "When was your home built?",
    helper: "Age determines both the legal requirements and what we expect to find behind the siding.",
  },
  {
    id: "currentSiding",
    number: 5,
    block: "B",
    blockLabel: "Your house",
    kind: "single",
    title: "What's on your house now?",
    helper: "Tear-off cost, disposal rules and what has to be replaced underneath all follow from this.",
  },
  {
    id: "archStyle",
    number: 6,
    block: "B",
    blockLabel: "Your house",
    kind: "single",
    title: "Which architectural style feels closest?",
    helper: "Close is good enough. This maps your primary profile.",
  },
  {
    id: "sizeScope",
    number: 7,
    block: "B",
    blockLabel: "Your house",
    kind: "compound",
    title: "What is the size and scope?",
    helper: "Height drives staging and labor; scope drives the material quantity.",
  },
  {
    id: "priorities",
    number: 8,
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
    number: 9,
    block: "C",
    blockLabel: "Your priorities",
    kind: "single",
    title: "How long do you plan to stay in this home?",
    helper: "This decides whether we optimize for resale return or lifecycle value.",
  },
  {
    id: "installer",
    number: 10,
    block: "C",
    blockLabel: "Your priorities",
    kind: "single",
    title: "Who is doing the work?",
    helper: "Fiber cement has real handling, cutting and dust-control requirements.",
  },
  {
    id: "costPreference",
    number: 11,
    block: "C",
    blockLabel: "Your priorities",
    kind: "single",
    title: "What would make the cost feel manageable?",
    helper: "We'll frame your numbers the way you actually want to see them.",
  },
  {
    id: "features",
    number: 12,
    block: "D",
    blockLabel: "Your color strategy",
    kind: "compound",
    title: "What exterior features are staying?",
    helper: "Your color is constrained by what you're not replacing. This is where most palettes go wrong.",
  },
  {
    id: "hoa",
    number: 13,
    block: "D",
    blockLabel: "Your color strategy",
    kind: "single",
    title: "Any neighborhood or HOA guidelines?",
    helper: "An approval process changes which colors are realistically available to you.",
  },
  {
    id: "vibe",
    number: 14,
    block: "D",
    blockLabel: "Your color strategy",
    kind: "ab-pairs",
    title: "Which aesthetic vibe feels like home?",
    helper: "Three quick either/or choices. Go with your gut.",
  },
];

export function questionByNumber(number: number): QuestionMeta | undefined {
  return QUESTIONS.find((q) => q.number === number);
}
