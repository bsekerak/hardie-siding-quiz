import {
  ARCH_STYLE_OPTIONS,
  COST_PREFERENCE_OPTIONS,
  CURRENT_SIDING_OPTIONS,
  HEIGHT_OPTIONS,
  HOA_OPTIONS,
  HOME_AGE_OPTIONS,
  INSTALLER_OPTIONS,
  MASONRY_OPTIONS,
  PRIORITY_OPTIONS,
  ROOF_TONE_OPTIONS,
  SCOPE_OPTIONS,
  STAGE_OPTIONS,
  SYMPTOM_OPTIONS,
  TIMELINE_OPTIONS,
  VIBE_BRIGHTNESS_OPTIONS,
  VIBE_CONTRAST_OPTIONS,
  VIBE_TEMPERATURE_OPTIONS,
  WINDOW_TRIM_OPTIONS,
} from "@/data/questions";
import { isValidZip } from "@/data/climate";
import { isQuizComplete } from "@/lib/flow";
import type { ChoiceOption, QuizAnswers } from "@/types/quiz";

/**
 * A shared plan travels entirely in the URL — there is no backend to store it
 * in. Answers are packed positionally, so the link stays short enough to
 * survive being pasted into a text message or an email client.
 */

const FIELD_SEPARATOR = "~";
const LIST_SEPARATOR = ".";
const VERSION = "1";

function valueSet<T extends string>(options: ReadonlyArray<ChoiceOption<T>>): ReadonlySet<string> {
  return new Set(options.map((option) => option.value));
}

const SETS = {
  stage: valueSet(STAGE_OPTIONS),
  symptoms: valueSet(SYMPTOM_OPTIONS),
  homeAge: valueSet(HOME_AGE_OPTIONS),
  currentSiding: valueSet(CURRENT_SIDING_OPTIONS),
  archStyle: valueSet(ARCH_STYLE_OPTIONS),
  height: valueSet(HEIGHT_OPTIONS),
  scope: valueSet(SCOPE_OPTIONS),
  priorities: valueSet(PRIORITY_OPTIONS),
  timeline: valueSet(TIMELINE_OPTIONS),
  installer: valueSet(INSTALLER_OPTIONS),
  costPreference: valueSet(COST_PREFERENCE_OPTIONS),
  roofTone: valueSet(ROOF_TONE_OPTIONS),
  masonry: valueSet(MASONRY_OPTIONS),
  windowTrim: valueSet(WINDOW_TRIM_OPTIONS),
  hoa: valueSet(HOA_OPTIONS),
  vibeBrightness: valueSet(VIBE_BRIGHTNESS_OPTIONS),
  vibeTemperature: valueSet(VIBE_TEMPERATURE_OPTIONS),
  vibeContrast: valueSet(VIBE_CONTRAST_OPTIONS),
} as const;

export interface SharedPlan {
  answers: QuizAnswers;
  paletteIndex: number;
}

function toBase64Url(input: string): string {
  return btoa(input).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(input: string): string {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padding = (4 - (normalized.length % 4)) % 4;
  return atob(normalized + "=".repeat(padding));
}

export function encodePlan(answers: QuizAnswers, paletteIndex: number): string {
  const fields: string[] = [
    VERSION,
    answers.stage ?? "",
    answers.symptoms.join(LIST_SEPARATOR),
    answers.zip,
    answers.homeAge ?? "",
    answers.currentSiding ?? "",
    answers.archStyle ?? "",
    answers.height ?? "",
    answers.scope ?? "",
    answers.priorities.join(LIST_SEPARATOR),
    answers.timeline ?? "",
    answers.installer ?? "",
    answers.costPreference ?? "",
    answers.roofTone ?? "",
    answers.masonry ?? "",
    answers.windowTrim ?? "",
    answers.hoa ?? "",
    answers.vibeBrightness ?? "",
    answers.vibeTemperature ?? "",
    answers.vibeContrast ?? "",
    String(paletteIndex),
  ];
  return toBase64Url(fields.join(FIELD_SEPARATOR));
}

function single(raw: string | undefined, allowed: ReadonlySet<string>): string | null {
  if (!raw) return null;
  return allowed.has(raw) ? raw : null;
}

function multi(raw: string | undefined, allowed: ReadonlySet<string>): string[] {
  if (!raw) return [];
  return raw.split(LIST_SEPARATOR).filter((value) => allowed.has(value));
}

/**
 * Every field is re-validated against the live option lists, so a truncated,
 * hand-edited or stale link degrades to null rather than producing a plan built
 * on values the engine has never heard of.
 */
export function decodePlan(code: string): SharedPlan | null {
  let decoded: string;
  try {
    decoded = fromBase64Url(code);
  } catch {
    return null;
  }

  const parts = decoded.split(FIELD_SEPARATOR);
  if (parts[0] !== VERSION) return null;

  const zip = parts[3] ?? "";
  const answers: QuizAnswers = {
    stage: single(parts[1], SETS.stage) as QuizAnswers["stage"],
    symptoms: multi(parts[2], SETS.symptoms) as QuizAnswers["symptoms"],
    zip: isValidZip(zip) ? zip : "",
    homeAge: single(parts[4], SETS.homeAge) as QuizAnswers["homeAge"],
    currentSiding: single(parts[5], SETS.currentSiding) as QuizAnswers["currentSiding"],
    archStyle: single(parts[6], SETS.archStyle) as QuizAnswers["archStyle"],
    height: single(parts[7], SETS.height) as QuizAnswers["height"],
    scope: single(parts[8], SETS.scope) as QuizAnswers["scope"],
    priorities: multi(parts[9], SETS.priorities) as QuizAnswers["priorities"],
    timeline: single(parts[10], SETS.timeline) as QuizAnswers["timeline"],
    installer: single(parts[11], SETS.installer) as QuizAnswers["installer"],
    costPreference: single(parts[12], SETS.costPreference) as QuizAnswers["costPreference"],
    roofTone: single(parts[13], SETS.roofTone) as QuizAnswers["roofTone"],
    masonry: single(parts[14], SETS.masonry) as QuizAnswers["masonry"],
    windowTrim: single(parts[15], SETS.windowTrim) as QuizAnswers["windowTrim"],
    hoa: single(parts[16], SETS.hoa) as QuizAnswers["hoa"],
    vibeBrightness: single(parts[17], SETS.vibeBrightness) as QuizAnswers["vibeBrightness"],
    vibeTemperature: single(parts[18], SETS.vibeTemperature) as QuizAnswers["vibeTemperature"],
    vibeContrast: single(parts[19], SETS.vibeContrast) as QuizAnswers["vibeContrast"],
  };

  if (!isQuizComplete(answers)) return null;

  const parsedIndex = Number.parseInt(parts[20] ?? "0", 10);
  const paletteIndex = Number.isFinite(parsedIndex) && parsedIndex >= 0 && parsedIndex <= 2
    ? parsedIndex
    : 0;

  return { answers, paletteIndex };
}

export function buildShareUrl(answers: QuizAnswers, paletteIndex: number): string {
  const origin = typeof window === "undefined" ? "" : window.location.origin;
  return `${origin}/results?plan=${encodePlan(answers, paletteIndex)}`;
}
