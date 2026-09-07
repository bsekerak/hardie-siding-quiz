/**
 * Domain model for the James Hardie Siding Journey Guide & Product Selector.
 * Every answer value is a string-literal union so the rule engine can switch
 * exhaustively and the compiler catches any unhandled case.
 */

/* ---------------------------------- Block A --------------------------------- */

export type Stage =
  | "need"
  | "insurance"
  | "justify"
  | "dream"
  | "estimate"
  | "selection";

export type Symptom =
  | "soft-spots"
  | "peeling-paint"
  | "cracks-warping"
  | "hail-damage"
  | "rot-edges"
  | "energy-bills"
  | "dated"
  | "not-sure";

/* ---------------------------------- Block B --------------------------------- */

export type HomeAge = "pre-1978" | "1978-1999" | "2000-2015" | "post-2015" | "unknown";

export type CurrentSiding =
  | "vinyl"
  | "wood"
  | "aluminum"
  | "hardboard"
  | "stucco"
  | "t1-11"
  | "asbestos"
  | "brick-mix"
  | "unknown";

export type ArchStyle =
  | "colonial"
  | "craftsman"
  | "ranch"
  | "modern-farmhouse"
  | "contemporary"
  | "victorian"
  | "split-level"
  | "coastal";

export type Height = "single" | "two" | "three-plus";

export type Scope = "whole-house" | "one-two-sides" | "damaged-area";

/**
 * Gutters have to come down for a re-side regardless, so the real choice is
 * whether they go back up or get replaced while the wall is open.
 */
export type GutterChoice = "reuse" | "4-inch" | "6-inch" | "skip";

/* ---------------------------------- Block C --------------------------------- */

export type Priority =
  | "no-maintenance"
  | "lowest-lifetime-cost"
  | "real-wood-look"
  | "protection"
  | "resale"
  | "fast-install"
  | "custom-color";

export type Timeline = "under-2" | "2-5" | "5-10" | "10-plus";

export type Installer = "pro" | "pro-informed" | "diy";

export type CostPreference = "lump-sum" | "monthly" | "line-item" | "insurance";

export type Persona = "core-homeowner" | "millennial" | "diy-enthusiast";

/* ---------------------------------- Block D --------------------------------- */

export type RoofTone = "warm-red-brown" | "cool-charcoal" | "medium-gray-brown" | "replacing";

export type Masonry = "warm-brick" | "cool-gray-stone" | "none";

export type WindowTrimColor = "classic-white" | "modern-black" | "warm-sand";

export type HoaStatus = "hoa-historic" | "conformity" | "clean-slate";

/** The five James Hardie Statement Collection families offered in Q15. */
export type ColorFamily =
  | "classic-neutrals"
  | "architectural-grays"
  | "earth-tones"
  | "coastal-blues"
  | "bold-dramatic";

export type TrimPreference = "high-contrast" | "tonal";

/* --------------------------------- Answers ---------------------------------- */

export interface QuizAnswers {
  /** Q1 */ stage: Stage | null;
  /** Q2 */ symptoms: Symptom[];
  /** Q3 */ zip: string;
  /** Q4 */ homeAge: HomeAge | null;
  /** Q5 */ currentSiding: CurrentSiding | null;
  /** Q6 */ archStyle: ArchStyle | null;
  /** Q7a */ height: Height | null;
  /** Q7b */ scope: Scope | null;
  /** Q8 */ gutters: GutterChoice | null;
  /** Q9 */ priorities: Priority[];
  /** Q10 */ timeline: Timeline | null;
  /** Q11 */ installer: Installer | null;
  /** Q12 */ costPreference: CostPreference | null;
  /** Q13a */ roofTone: RoofTone | null;
  /** Q13b */ masonry: Masonry | null;
  /** Q13c */ windowTrim: WindowTrimColor | null;
  /** Q14 */ hoa: HoaStatus | null;
  /** Q15a */ colorFamily: ColorFamily | null;
  /** Q15b */ trimPreference: TrimPreference | null;
}

export type QuizAnswerKey = keyof QuizAnswers;

/* ------------------------------- Question model ------------------------------ */

export type QuestionKind = "single" | "multi" | "zip" | "compound" | "ab-pairs";

export interface ChoiceOption<T extends string> {
  value: T;
  label: string;
  description?: string;
  /** lucide-react icon name resolved by the OptionCard component. */
  icon?: string;
}

export interface QuestionMeta {
  id: string;
  /** 1-based canonical number from the specification (Q1..Q14). */
  number: number;
  block: "A" | "B" | "C" | "D";
  blockLabel: string;
  kind: QuestionKind;
  title: string;
  helper?: string;
  /** Maximum selections for a multi-select question. */
  maxSelections?: number;
  /** Minimum selections required before the step can advance. */
  minSelections?: number;
}

/* --------------------------------- Climate ---------------------------------- */

export type HardieZone = "HZ5" | "HZ10";

export interface ClimateProfile {
  zip: string;
  /** Two-letter state derived from the ZIP prefix, or null if unresolved. */
  state: string | null;
  regionLabel: string;
  zone: HardieZone;
  zoneHeadline: string;
  drivers: string[];
  hailCorridor: boolean;
  wildfireWui: boolean;
  /** Broad, advisory: salt-air guidance for fasteners. State-level, hedged. */
  coastalSalt: boolean;
  /** Narrow: states where coastal plain dominates housing. Drives structural calls. */
  coastalHighExposure: boolean;
  coldIecc: boolean;
  freezeThaw: boolean;
}

/* --------------------------------- Product ---------------------------------- */

export type ProfileId =
  | "hardieplank-select-cedarmill"
  | "hardieplank-smooth"
  | "hardieshingle-straight"
  | "hardieshingle-staggered"
  | "hardiepanel-vertical"
  | "hardiepanel-batten"
  | "hardie-architectural-panel";

export interface SidingProfile {
  id: ProfileId;
  name: string;
  productLine: string;
  texture: "Cedarmill" | "Smooth" | "Sierra 8" | "Fine Sand";
  exposure: string;
  summary: string;
  bestFor: ArchStyle[];
  /** Installed cost per square foot, low and high, ColorPlus finish. */
  costLow: number;
  costHigh: number;
}

export type TrimBrand = "James Hardie" | "AZEK";
export type TrimMaterial = "Fiber Cement" | "Cellular PVC";
export type InstallMethodName = "Hardie® Trim-Over Method" | "Traditional Trim-First Method";

export interface TrimRecommendation {
  brand: TrimBrand;
  product: string;
  material: TrimMaterial;
  thickness: string;
  reason: string;
  /** Set when a rule actively ruled the other material out. */
  exclusionNote: string | null;
}

export interface InstallMethodRecommendation {
  method: InstallMethodName;
  reason: string;
  contractorNote: string;
}

export interface GutterSpec {
  choice: GutterChoice;
  label: string;
  detail: string;
  rationale: string;
  downspout: string | null;
  linearFeet: number;
}

export interface ProductSpec {
  primary: SidingProfile;
  accent: SidingProfile | null;
  accentPlacement: string | null;
  zone: HardieZone;
  finish: "ColorPlus" | "Primed for Field Paint";
  finishRationale: string;
  trim: TrimRecommendation;
  trimColorNote: string;
  install: InstallMethodRecommendation;
  waterManagement: string[];
  gutters: GutterSpec;
}

/* ---------------------------------- Color ----------------------------------- */

export type ColorCollection = "Statement" | "Dream" | "Trim";
export type ColorUndertone = "warm" | "cool" | "neutral";

export interface HardieColor {
  name: string;
  hex: string;
  collection: ColorCollection;
  undertone: ColorUndertone;
  /** 0 (darkest) to 100 (lightest). */
  lightness: number;
}

export interface PaletteRole {
  color: HardieColor;
  /** Share of the visible elevation this color should occupy. */
  sharePercent: number;
  roleLabel: string;
  placement: string;
}

export interface Palette {
  id: string;
  name: string;
  tagline: string;
  family: ColorFamily;
  familyLabel: string;
  body: PaletteRole;
  trim: PaletteRole;
  accent: PaletteRole;
  rationale: string;
  /** Set when the chosen family fights a fixed element the homeowner is keeping. */
  undertoneWarning: string | null;
  hoaSafe: boolean;
}

/* ----------------------------------- Cost ----------------------------------- */

export interface CostLineItem {
  id: string;
  label: string;
  low: number;
  high: number;
  detail: string;
  /** True when the item is commonly excluded from a headline bid. */
  oftenHidden: boolean;
}

export interface CostEstimate {
  wallAreaSqFt: number;
  sidingLow: number;
  sidingHigh: number;
  lineItems: CostLineItem[];
  totalLow: number;
  totalHigh: number;
  monthlyLow: number;
  monthlyHigh: number;
  financeTermMonths: number;
  financeApr: number;
}

/* --------------------------------- Guidance --------------------------------- */

export interface StageAction {
  headline: string;
  summary: string;
  nextMilestone: string;
  supportingPoints: string[];
}

export interface AuditItem {
  id: string;
  label: string;
  detail: string;
  severity: "required" | "recommended" | "watch";
}

export interface ContractorQuestion {
  id: string;
  question: string;
  whyItMatters: string;
  goodAnswer: string;
}

export interface SidingPlan {
  climate: ClimateProfile;
  spec: ProductSpec;
  palettes: Palette[];
  cost: CostEstimate;
  stageAction: StageAction;
  audit: AuditItem[];
  contractorQuestions: ContractorQuestion[];
  persona: Persona;
  personaNote: string;
  diagnosis: string | null;
}
