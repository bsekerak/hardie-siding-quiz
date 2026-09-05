import { QUESTIONS } from "@/data/questions";
import type { QuestionMeta, QuizAnswers } from "@/types/quiz";
import { isValidZip } from "@/data/climate";

export const TOTAL_QUESTION_COUNT = QUESTIONS.length;

/**
 * Block A routing: Q2 ("What are you seeing?") only appears for homeowners who
 * arrived with a problem or storm damage. Everyone else jumps straight to Q3.
 */
export function isQuestionVisible(question: QuestionMeta, answers: QuizAnswers): boolean {
  if (question.number === 2) {
    return answers.stage === "need" || answers.stage === "insurance";
  }
  return true;
}

export function visibleQuestions(answers: QuizAnswers): QuestionMeta[] {
  return QUESTIONS.filter((q) => isQuestionVisible(q, answers));
}

/** True when the current step holds enough input to move forward. */
export function isStepAnswered(question: QuestionMeta, answers: QuizAnswers): boolean {
  switch (question.id) {
    case "stage":
      return answers.stage !== null;
    case "symptoms":
      return answers.symptoms.length >= 1;
    case "zip":
      return isValidZip(answers.zip);
    case "homeAge":
      return answers.homeAge !== null;
    case "currentSiding":
      return answers.currentSiding !== null;
    case "archStyle":
      return answers.archStyle !== null;
    case "sizeScope":
      return answers.height !== null && answers.scope !== null;
    case "priorities":
      return answers.priorities.length >= 1;
    case "timeline":
      return answers.timeline !== null;
    case "installer":
      return answers.installer !== null;
    case "costPreference":
      return answers.costPreference !== null;
    case "features":
      return answers.roofTone !== null && answers.masonry !== null && answers.windowTrim !== null;
    case "hoa":
      return answers.hoa !== null;
    case "vibe":
      return (
        answers.vibeBrightness !== null &&
        answers.vibeTemperature !== null &&
        answers.vibeContrast !== null
      );
    default:
      return false;
  }
}

/** Every visible step must be answered before the results dashboard is valid. */
export function isQuizComplete(answers: QuizAnswers): boolean {
  return visibleQuestions(answers).every((q) => isStepAnswered(q, answers));
}

/** The first unanswered visible step, used to resume a saved session. */
export function firstIncompleteIndex(answers: QuizAnswers): number {
  const visible = visibleQuestions(answers);
  const index = visible.findIndex((q) => !isStepAnswered(q, answers));
  return index === -1 ? Math.max(visible.length - 1, 0) : index;
}
