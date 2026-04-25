import type { BabID, Difficulty, Mode, Question, SubBabID } from "@/types/game";
import { formatNumber, makeQuestion, type GeneratorFn } from "./shared";

const bab: BabID = "listrik";

function generateListrik(difficulty: Difficulty, mode: Mode): Question[] {
  const i = difficulty === "hard" ? 2.5 : 2;
  const r = difficulty === "hard" ? 7.5 : 6;
  const answer = i * r;
  const questionText =
    mode === "simbol"
      ? `I = ${formatNumber(i)} A, R = ${formatNumber(r)} ohm. Cari V!`
      : `Arus listrik sebesar ${formatNumber(i)} A melewati hambatan ${formatNumber(r)} ohm. Berapa beda potensialnya?`;

  return [
    makeQuestion({
      id: `listrik-ohm-${difficulty}`,
      bab,
      subBab: "hukum_ohm",
      question: questionText,
      unit: "V",
      correctAnswer: answer,
      explanation: "Gunakan Hukum Ohm: V = I × R.",
    }),
  ];
}

export const subBabRegistry: Partial<Record<SubBabID, GeneratorFn>> = {
  hukum_ohm: generateListrik,
  arus_listrik: generateListrik,
  rangkaian_seri: generateListrik,
  rangkaian_paralel: generateListrik,
  daya_listrik: generateListrik,
  listrik_statis: generateListrik,
};

export function generate(subBab: SubBabID, difficulty: Difficulty, mode: Mode): Question[] {
  if (subBab === "all") {
    return Object.values(subBabRegistry).flatMap((generator) => generator(difficulty, mode));
  }

  const generator = subBabRegistry[subBab];
  return generator ? generator(difficulty, mode) : [];
}
