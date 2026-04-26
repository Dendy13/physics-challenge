import type { BabID, Difficulty, Mode, Question, SubBabID } from "@/types/game";
import { formatNumber, makeQuestion, type GeneratorFn } from "./shared";

const bab: BabID = "energi";

function generateEnergiQuestion(difficulty: Difficulty, mode: Mode, rng: () => number, count: number): Question[] {
  return Array.from({ length: count }, (_, idx) => {
    const baseM = 1 + rng() * 3;
    const g = 10;
    const baseH = 1 + rng() * 4;
    const m = difficulty === "hard" ? baseM * 1.25 : baseM;
    const h = difficulty === "hard" ? baseH * 1.25 : baseH;
    const answer = m * g * h;
    const questionText =
      mode === "simbol"
        ? `m = ${formatNumber(m)} kg, g = ${g} m/s^2, h = ${formatNumber(h)} m. Cari Ep!`
        : `Sebuah benda bermassa ${formatNumber(m)} kg berada di ketinggian ${formatNumber(h)} m. Hitung energi potensialnya dengan g = 10 m/s^2.`;

    return makeQuestion({
      id: `energi-potensial-${difficulty}-${idx}`,
      bab,
      subBab: "energi_potensial",
      question: questionText,
      unit: "J",
      correctAnswer: answer,
      explanation: "Gunakan rumus Ep = m × g × h.",
    });
  });
}

export const subBabRegistry: Partial<Record<SubBabID, GeneratorFn>> = {
  usaha: generateEnergiQuestion,
  energi_kinetik: generateEnergiQuestion,
  energi_potensial: generateEnergiQuestion,
  energi_mekanik: generateEnergiQuestion,
};

export function generate(subBab: SubBabID, difficulty: Difficulty, mode: Mode, rng: () => number, count: number): Question[] {
  if (subBab === "all") {
    const questionsPerSubBab = Math.ceil(count / Object.keys(subBabRegistry).length);
    return Object.values(subBabRegistry).flatMap((generator) => generator(difficulty, mode, rng, questionsPerSubBab));
  }

  const generator = subBabRegistry[subBab];
  return generator ? generator(difficulty, mode, rng, count) : [];
}
