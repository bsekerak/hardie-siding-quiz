import type { Metadata } from "next";
import { QuizEngine } from "@/components/quiz/QuizEngine";

export const metadata: Metadata = {
  title: "Your Siding Questions",
  description:
    "Fourteen questions covering your funnel stage, your house, your priorities and your color constraints — then an engineered James Hardie specification.",
};

export default function QuizPage() {
  return <QuizEngine />;
}
