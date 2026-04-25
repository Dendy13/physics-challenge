import type { BabID, Difficulty, Mode, Question, SubBabID } from "@/types/game";
import { formatNumber, makeQuestion, type GeneratorFn } from "./shared";

const bab: BabID = "modern";

function generateModern(difficulty: Difficulty, mode: Mode): Question[] {
  const massDefect = difficulty === "hard" ? 0.25 : 0.2;
  const c2 = 9e16;
  const answer = massDefect * c2;
  const questionText =
    mode === "simbol"
      ? `Δm = ${formatNumber(massDefect)} kg, c^2 = 9×10^16. Cari E!`
      : `Dalam reaksi modern, terjadi defek massa sebesar ${formatNumber(massDefect)} kg. Berapa energi yang dilepaskan?`;

  return [
    makeQuestion({
      id: `modern-relativitas-${difficulty}`,
      bab,
      subBab: "relativitas_dasar",
      question: questionText,
      unit: "J",
      correctAnswer: answer,
      explanation: "Gunakan kesetaraan massa-energi: E = Δm × c^2.",
    }),
  ];
}

export const subBabRegistry: Partial<Record<SubBabID, GeneratorFn>> = {
  modern_atom: generateModern,
  radioaktivitas: generateModern,
  relativitas_dasar: generateModern,
};

export function generate(subBab: SubBabID, difficulty: Difficulty, mode: Mode): Question[] {
  if (subBab === "all") {
    return Object.values(subBabRegistry).flatMap((generator) => generator(difficulty, mode));
  }

  const generator = subBabRegistry[subBab];
  return generator ? generator(difficulty, mode) : [];
}
