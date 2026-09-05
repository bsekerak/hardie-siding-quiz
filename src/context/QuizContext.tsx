"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import { isQuizComplete, visibleQuestions } from "@/lib/flow";
import type { QuestionMeta, QuizAnswers } from "@/types/quiz";

const STORAGE_KEY = "hardie-siding-plan-v1";
const STORAGE_VERSION = 1;

export const EMPTY_ANSWERS: QuizAnswers = {
  stage: null,
  symptoms: [],
  zip: "",
  homeAge: null,
  currentSiding: null,
  archStyle: null,
  height: null,
  scope: null,
  gutters: null,
  priorities: [],
  timeline: null,
  installer: null,
  costPreference: null,
  roofTone: null,
  masonry: null,
  windowTrim: null,
  hoa: null,
  vibeBrightness: null,
  vibeTemperature: null,
  vibeContrast: null,
};

interface PersistedSession {
  version: number;
  answers: QuizAnswers;
  stepIndex: number;
  savedAt: string;
}

interface QuizContextValue {
  answers: QuizAnswers;
  /** Index into the currently visible question list. */
  stepIndex: number;
  /** False during the first client render, before localStorage is read. */
  hydrated: boolean;
  /** True when a previous session was restored from storage. */
  restored: boolean;
  savedAt: string | null;
  questions: QuestionMeta[];
  currentQuestion: QuestionMeta | null;
  totalSteps: number;
  progress: number;
  complete: boolean;
  setAnswer: <K extends keyof QuizAnswers>(key: K, value: QuizAnswers[K]) => void;
  toggleInList: <K extends "symptoms" | "priorities">(
    key: K,
    value: QuizAnswers[K][number],
    max?: number,
  ) => void;
  goNext: () => void;
  goBack: () => void;
  goToStep: (index: number) => void;
  reset: () => void;
  dismissRestoreNotice: () => void;
}

const QuizContext = createContext<QuizContextValue | null>(null);

/**
 * Narrows unknown localStorage content back into a QuizAnswers object. Anything
 * unrecognised falls back to the empty default, so a stale or hand-edited
 * payload can never crash the quiz.
 */
function parseSession(raw: string): PersistedSession | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return null;
    const candidate = parsed as Partial<PersistedSession>;
    if (candidate.version !== STORAGE_VERSION) return null;
    if (typeof candidate.answers !== "object" || candidate.answers === null) return null;

    const stored = candidate.answers as Partial<QuizAnswers>;
    const answers: QuizAnswers = { ...EMPTY_ANSWERS };
    (Object.keys(EMPTY_ANSWERS) as Array<keyof QuizAnswers>).forEach((key) => {
      const value = stored[key];
      const fallback = EMPTY_ANSWERS[key];
      if (Array.isArray(fallback)) {
        if (Array.isArray(value) && value.every((v) => typeof v === "string")) {
          // Values are validated again by the option lists at render time.
          Object.assign(answers, { [key]: value });
        }
        return;
      }
      if (typeof fallback === "string") {
        if (typeof value === "string") Object.assign(answers, { [key]: value });
        return;
      }
      if (value === null || typeof value === "string") {
        Object.assign(answers, { [key]: value ?? null });
      }
    });

    return {
      version: STORAGE_VERSION,
      answers,
      stepIndex: typeof candidate.stepIndex === "number" ? candidate.stepIndex : 0,
      savedAt: typeof candidate.savedAt === "string" ? candidate.savedAt : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function QuizProvider({ children }: { children: ReactNode }): ReactElement {
  const [answers, setAnswers] = useState<QuizAnswers>(EMPTY_ANSWERS);
  const [stepIndex, setStepIndex] = useState<number>(0);
  const [hydrated, setHydrated] = useState<boolean>(false);
  const [restored, setRestored] = useState<boolean>(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const skipNextWrite = useRef<boolean>(true);

  // Read persisted state after mount only, so server and first client render
  // produce identical markup and React never reports a hydration mismatch.
  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const session = parseSession(raw);
      if (session) {
        setAnswers(session.answers);
        const visible = visibleQuestions(session.answers);
        const bounded = Math.min(Math.max(session.stepIndex, 0), Math.max(visible.length - 1, 0));
        setStepIndex(bounded);
        setSavedAt(session.savedAt);
        setRestored(session.answers.stage !== null);
      }
    }
    setHydrated(true);
  }, []);

  // Persist on every change once hydration has completed.
  useEffect(() => {
    if (!hydrated) return;
    if (skipNextWrite.current) {
      skipNextWrite.current = false;
      return;
    }
    const payload: PersistedSession = {
      version: STORAGE_VERSION,
      answers,
      stepIndex,
      savedAt: new Date().toISOString(),
    };
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      setSavedAt(payload.savedAt);
    } catch {
      // Storage can be full or blocked (private mode). The quiz still works.
    }
  }, [answers, stepIndex, hydrated]);

  const questions = useMemo<QuestionMeta[]>(() => visibleQuestions(answers), [answers]);
  const totalSteps = questions.length;
  const currentQuestion = questions[Math.min(stepIndex, totalSteps - 1)] ?? null;
  const complete = useMemo<boolean>(() => isQuizComplete(answers), [answers]);

  const setAnswer = useCallback(
    <K extends keyof QuizAnswers>(key: K, value: QuizAnswers[K]): void => {
      setAnswers((prev) => {
        if (prev[key] === value) return prev;
        return { ...prev, [key]: value };
      });
    },
    [],
  );

  const toggleInList = useCallback(
    <K extends "symptoms" | "priorities">(
      key: K,
      value: QuizAnswers[K][number],
      max?: number,
    ): void => {
      setAnswers((prev) => {
        const list = prev[key] as ReadonlyArray<QuizAnswers[K][number]>;
        const exists = list.includes(value);
        let next: Array<QuizAnswers[K][number]>;
        if (exists) {
          next = list.filter((item) => item !== value);
        } else if (typeof max === "number" && list.length >= max) {
          // At the cap, the newest selection replaces the oldest.
          next = [...list.slice(1), value];
        } else {
          next = [...list, value];
        }
        return { ...prev, [key]: next };
      });
    },
    [],
  );

  const goNext = useCallback((): void => {
    setStepIndex((prev) => prev + 1);
  }, []);

  const goBack = useCallback((): void => {
    setStepIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  const goToStep = useCallback((index: number): void => {
    setStepIndex(Math.max(index, 0));
  }, []);

  const reset = useCallback((): void => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
      // Retaking the quiz should earn the results celebration again.
      window.sessionStorage.removeItem("hardie-siding-plan-celebrated");
    } catch {
      // Ignore storage failures — in-memory reset below is what matters.
    }
    skipNextWrite.current = true;
    setAnswers(EMPTY_ANSWERS);
    setStepIndex(0);
    setRestored(false);
    setSavedAt(null);
  }, []);

  const dismissRestoreNotice = useCallback((): void => {
    setRestored(false);
  }, []);

  // Clamp the step whenever conditional routing shortens the visible list
  // (for example, changing Q1 away from "need" removes Q2).
  useEffect(() => {
    if (!hydrated) return;
    if (totalSteps > 0 && stepIndex > totalSteps - 1) {
      setStepIndex(totalSteps - 1);
    }
  }, [hydrated, stepIndex, totalSteps]);

  const value = useMemo<QuizContextValue>(
    () => ({
      answers,
      stepIndex,
      hydrated,
      restored,
      savedAt,
      questions,
      currentQuestion,
      totalSteps,
      progress: totalSteps === 0 ? 0 : Math.min((stepIndex + 1) / totalSteps, 1),
      complete,
      setAnswer,
      toggleInList,
      goNext,
      goBack,
      goToStep,
      reset,
      dismissRestoreNotice,
    }),
    [
      answers,
      stepIndex,
      hydrated,
      restored,
      savedAt,
      questions,
      currentQuestion,
      totalSteps,
      complete,
      setAnswer,
      toggleInList,
      goNext,
      goBack,
      goToStep,
      reset,
      dismissRestoreNotice,
    ],
  );

  return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>;
}

export function useQuiz(): QuizContextValue {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error("useQuiz must be used inside a <QuizProvider>");
  }
  return context;
}

export { STORAGE_KEY };
