import type { BabID, Difficulty, Mode, Question, SubBabID } from "@/types/game";

export type GeneratorFn = (difficulty: Difficulty, mode: Mode) => Question[];

export function formatNumber(value: number): string {
  if (Number.isInteger(value)) {
    return String(value);
  }

  return Number(value.toFixed(2)).toString();
}

export function makeQuestion(input: {
  id: string;
  bab: BabID;
  subBab: SubBabID;
  question: string;
  unit: string;
  correctAnswer: number;
  explanation: string;
}): Question {
  return {
    id: input.id,
    bab: input.bab,
    subBab: input.subBab,
    question: input.question,
    text: input.question,
    unit: input.unit,
    correctAnswer: Number(input.correctAnswer.toFixed(2)),
    explanation: input.explanation,
  };
}
