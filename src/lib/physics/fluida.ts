import type { BabID, Difficulty, Mode, Question, SubBabID } from "@/types/game";
import { formatNumber, makeQuestion, type GeneratorFn } from "./shared";

const bab: BabID = "fluida";

function generateFluida(difficulty: Difficulty, mode: Mode, rng: () => number, count: number): Question[] {
  return Array.from({ length: count }, (_, idx) => {
    const rho = 1000;
    const g = 10;
    const baseH = 1 + rng() * 3;
    const h = difficulty === "hard" ? baseH * 1.25 : baseH;
    const answer = rho * g * h;
    const questionText =
      mode === "simbol"
        ? `ρ = ${rho} kg/m^3, g = ${g} m/s^2, h = ${formatNumber(h)} m. Cari tekanan hidrostatis!`
        : `Air memiliki massa jenis 1000 kg/m^3. Jika kedalaman titik berada ${formatNumber(h)} m, berapa tekanan hidrostatisnya?`;

    return makeQuestion({
      id: `fluida-tekanan-${difficulty}-${idx}`,
      bab,
      subBab: "tekanan",
      question: questionText,
      unit: "Pa",
      correctAnswer: answer,
      explanation: "Gunakan rumus P = ρ × g × h.",
    });
  });
}

export const subBabRegistry: Partial<Record<SubBabID, GeneratorFn>> = {
  tekanan: generateFluida,
  fluida_statis: generateFluida,
  fluida_dinamis: generateFluida,
  hukum_pascal: generateFluida,
  hukum_archimedes: generateFluida,
};

export function generate(subBab: SubBabID, difficulty: Difficulty, mode: Mode, rng: () => number, count: number): Question[] {
  if (subBab === "all") {
    const questionsPerSubBab = Math.ceil(count / Object.keys(subBabRegistry).length);
    return Object.values(subBabRegistry).flatMap((generator) => generator(difficulty, mode, rng, questionsPerSubBab));
  }

  const generator = subBabRegistry[subBab];
  return generator ? generator(difficulty, mode, rng, count) : [];
}
