import type { BabID, Difficulty, Mode, Question, SubBabID } from "@/types/game";
import { formatNumber, makeQuestion, type GeneratorFn } from "./shared";

const bab: BabID = "energi";

function generateEnergi(difficulty: Difficulty, mode: Mode): Question[] {
  const m = difficulty === "hard" ? 2.5 : 2;
  const g = 10;
  const h = difficulty === "hard" ? 3.5 : 3;
  const answer = m * g * h;
  const questionText =
    mode === "simbol"
      ? `m = ${formatNumber(m)} kg, g = ${g} m/s^2, h = ${formatNumber(h)} m. Cari Ep!`
      : `Sebuah benda bermassa ${formatNumber(m)} kg berada di ketinggian ${formatNumber(h)} m. Hitung energi potensialnya dengan g = 10 m/s^2.`;

  return [
    makeQuestion({
      id: `energi-potensial-${difficulty}`,
      bab,
      subBab: "energi_potensial",
      question: questionText,
      unit: "J",
      correctAnswer: answer,
      explanation: "Gunakan rumus Ep = m × g × h.",
    }),
  ];
}

export const subBabRegistry: Partial<Record<SubBabID, GeneratorFn>> = {
  usaha: generateEnergi,
  energi_kinetik: generateEnergi,
  energi_potensial: generateEnergi,
  energi_mekanik: generateEnergi,
};

export function generate(subBab: SubBabID, difficulty: Difficulty, mode: Mode): Question[] {
  if (subBab === "all") {
    return Object.values(subBabRegistry).flatMap((generator) => generator(difficulty, mode));
  }

  const generator = subBabRegistry[subBab];
  return generator ? generator(difficulty, mode) : [];
}
