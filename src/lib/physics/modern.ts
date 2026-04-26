import type { BabID, Difficulty, Mode, Question, SubBabID } from "@/types/game";
import { formatNumber, makeQuestion, type GeneratorFn } from "./shared";

const bab: BabID = "modern";

function generateModern(difficulty: Difficulty, mode: Mode, rng: () => number, count: number): Question[] {
  return Array.from({ length: count }, (_, idx) => {
    const baseMassDefect = 0.1 + rng() * 0.3;
    const c2 = 9e16;
    const massDefect = difficulty === "hard" ? baseMassDefect * 1.25 : baseMassDefect;
    const answer = massDefect * c2;
    const questionText =
      mode === "simbol"
        ? `Δm = ${formatNumber(massDefect)} kg, c^2 = 9×10^16. Cari E!`
        : `Dalam reaksi modern, terjadi defek massa sebesar ${formatNumber(massDefect)} kg. Berapa energi yang dilepaskan?`;

    return makeQuestion({
      id: `modern-relativitas-${difficulty}-${idx}`,
      bab,
      subBab: "relativitas_dasar",
      question: questionText,
      unit: "J",
      correctAnswer: answer,
      explanation: "Gunakan kesetaraan massa-energi: E = Δm × c^2.",
    });
  });
}

export const subBabRegistry: Partial<Record<SubBabID, GeneratorFn>> = {
  modern_atom: generateModern,
  radioaktivitas: generateModern,
  relativitas_dasar: generateModern,
};

export function generate(subBab: SubBabID, difficulty: Difficulty, mode: Mode, rng: () => number, count: number): Question[] {
  if (subBab === "all") {
    const questionsPerSubBab = Math.ceil(count / Object.keys(subBabRegistry).length);
    return Object.values(subBabRegistry).flatMap((generator) => generator(difficulty, mode, rng, questionsPerSubBab));
  }

  const generator = subBabRegistry[subBab];
  return generator ? generator(difficulty, mode, rng, count) : [];
}
