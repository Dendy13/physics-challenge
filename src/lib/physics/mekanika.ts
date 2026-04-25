import type { BabID, Difficulty, Mode, Question, SubBabID } from "@/types/game";
import { formatNumber, makeQuestion, type GeneratorFn } from "./shared";

const bab: BabID = "mekanika";

function buildSymbolQuestion(subBab: SubBabID, difficulty: Difficulty, mode: Mode): Question[] {
  const label = subBab === "vektor" ? "V" : "s";

  if (subBab === "vektor") {
    const x = difficulty === "hard" ? 3.5 : 3;
    const y = difficulty === "hard" ? 4.5 : 4;
    const answer = Math.sqrt(x * x + y * y);
    const questionText =
      mode === "simbol"
        ? `Vx = ${formatNumber(x)}, Vy = ${formatNumber(y)}. Cari besar resultan vektor!`
        : `Sebuah vektor memiliki komponen mendatar ${formatNumber(x)} dan vertikal ${formatNumber(y)}. Berapa besar resultannya?`;

    return [
      makeQuestion({
        id: `mekanika-vektor-${difficulty}`,
        bab,
        subBab,
        question: questionText,
        unit: label,
        correctAnswer: answer,
        explanation:
          "Gunakan rumus Pythagoras pada komponen vektor: R = sqrt(Vx^2 + Vy^2).",
      }),
    ];
  }

  const v0 = difficulty === "hard" ? 12.5 : 10;
  const a = difficulty === "hard" ? 2.5 : 2;
  const t = difficulty === "hard" ? 3.5 : 3;
  const answer = v0 + a * t;
  const questionText =
    mode === "simbol"
      ? `v0 = ${formatNumber(v0)} m/s, a = ${formatNumber(a)} m/s^2, t = ${formatNumber(t)} s. Cari v akhir!`
      : `Sebuah benda bergerak dengan kecepatan awal ${formatNumber(v0)} m/s dan percepatan ${formatNumber(a)} m/s^2 selama ${formatNumber(t)} s. Berapa kecepatan akhirnya?`;

  return [
    makeQuestion({
      id: `mekanika-kinematika-${difficulty}`,
      bab,
      subBab,
      question: questionText,
      unit: "m/s",
      correctAnswer: answer,
      explanation: "Gunakan persamaan v = v0 + a × t untuk menghitung kecepatan akhir.",
    }),
  ];
}

export const generateVektor: GeneratorFn = (difficulty, mode) =>
  buildSymbolQuestion("vektor", difficulty, mode);

export const generateKinematika: GeneratorFn = (difficulty, mode) =>
  buildSymbolQuestion("glb_glbb", difficulty, mode);

export const subBabRegistry: Partial<Record<SubBabID, GeneratorFn>> = {
  vektor: generateVektor,
  gerak_lurus: generateKinematika,
  glb_glbb: generateKinematika,
  hukum_newton: generateKinematika,
  resultan_gaya: generateKinematika,
  momentum: generateKinematika,
  impuls: generateKinematika,
};

export function generate(subBab: SubBabID, difficulty: Difficulty, mode: Mode): Question[] {
  if (subBab === "all") {
    return Object.values(subBabRegistry).flatMap((generator) => generator(difficulty, mode));
  }

  const generator = subBabRegistry[subBab];
  return generator ? generator(difficulty, mode) : [];
}
