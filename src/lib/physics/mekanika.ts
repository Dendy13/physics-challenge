import type { BabID, Difficulty, Mode, Question, SubBabID } from "@/types/game";
import { formatNumber, makeQuestion, type GeneratorFn } from "./shared";

const bab: BabID = "mekanika";

function buildSymbolQuestion(subBab: SubBabID, difficulty: Difficulty, mode: Mode, rng: () => number, count: number): Question[] {
  return Array.from({ length: count }, (_, idx) => {
    if (subBab === "vektor") {
      const baseX = 2 + rng() * 2;
      const baseY = 2 + rng() * 2;
      const x = difficulty === "hard" ? baseX * 1.5 : baseX;
      const y = difficulty === "hard" ? baseY * 1.5 : baseY;
      const answer = Math.sqrt(x * x + y * y);
      const questionText =
        mode === "simbol"
          ? `Vx = ${formatNumber(x)}, Vy = ${formatNumber(y)}. Cari besar resultan vektor!`
          : `Sebuah vektor memiliki komponen mendatar ${formatNumber(x)} dan vertikal ${formatNumber(y)}. Berapa besar resultannya?`;

      return makeQuestion({
        id: `mekanika-vektor-${difficulty}-${idx}`,
        bab,
        subBab,
        question: questionText,
        unit: "V",
        correctAnswer: answer,
        explanation: "Gunakan rumus Pythagoras pada komponen vektor: R = sqrt(Vx^2 + Vy^2).",
      });
    }

    const baseV0 = 5 + rng() * 10;
    const baseA = 1 + rng() * 3;
    const baseT = 1 + rng() * 4;
    const v0 = difficulty === "hard" ? baseV0 * 1.25 : baseV0;
    const a = difficulty === "hard" ? baseA * 1.25 : baseA;
    const t = difficulty === "hard" ? baseT * 1.25 : baseT;
    const answer = v0 + a * t;
    const questionText =
      mode === "simbol"
        ? `v0 = ${formatNumber(v0)} m/s, a = ${formatNumber(a)} m/s^2, t = ${formatNumber(t)} s. Cari v akhir!`
        : `Sebuah benda bergerak dengan kecepatan awal ${formatNumber(v0)} m/s dan percepatan ${formatNumber(a)} m/s^2 selama ${formatNumber(t)} s. Berapa kecepatan akhirnya?`;

    return makeQuestion({
      id: `mekanika-kinematika-${difficulty}-${idx}`,
      bab,
      subBab,
      question: questionText,
      unit: "m/s",
      correctAnswer: answer,
      explanation: "Gunakan persamaan v = v0 + a × t untuk menghitung kecepatan akhir.",
    });
  });
}

export const generateVektor: GeneratorFn = (difficulty, mode, rng, count) =>
  buildSymbolQuestion("vektor", difficulty, mode, rng, count);

export const generateKinematika: GeneratorFn = (difficulty, mode, rng, count) =>
  buildSymbolQuestion("glb_glbb", difficulty, mode, rng, count);

export const subBabRegistry: Partial<Record<SubBabID, GeneratorFn>> = {
  vektor: generateVektor,
  gerak_lurus: generateKinematika,
  glb_glbb: generateKinematika,
  hukum_newton: generateKinematika,
  resultan_gaya: generateKinematika,
  momentum: generateKinematika,
  impuls: generateKinematika,
};

export function generate(subBab: SubBabID, difficulty: Difficulty, mode: Mode, rng: () => number, count: number): Question[] {
  if (subBab === "all") {
    const questionsPerSubBab = Math.ceil(count / Object.keys(subBabRegistry).length);
    return Object.values(subBabRegistry).flatMap((generator) => generator(difficulty, mode, rng, questionsPerSubBab));
  }

  const generator = subBabRegistry[subBab];
  return generator ? generator(difficulty, mode, rng, count) : [];
}
