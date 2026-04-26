import type { BabID, Difficulty, Mode, Question, SubBabID } from "@/types/game";
import { formatNumber, makeQuestion, type GeneratorFn } from "./shared";

const bab: BabID = "listrik";

function generateListrik(difficulty: Difficulty, mode: Mode, rng: () => number, count: number): Question[] {
  return Array.from({ length: count }, (_, idx) => {
    const baseI = 1 + rng() * 3;
    const baseR = 3 + rng() * 6;
    const i = difficulty === "hard" ? baseI * 1.25 : baseI;
    const r = difficulty === "hard" ? baseR * 1.25 : baseR;
    const answer = i * r;
    const questionText =
      mode === "simbol"
        ? `I = ${formatNumber(i)} A, R = ${formatNumber(r)} ohm. Cari V!`
        : `Arus listrik sebesar ${formatNumber(i)} A melewati hambatan ${formatNumber(r)} ohm. Berapa beda potensialnya?`;

    return makeQuestion({
      id: `listrik-ohm-${difficulty}-${idx}`,
      bab,
      subBab: "hukum_ohm",
      question: questionText,
      unit: "V",
      correctAnswer: answer,
      explanation: "Gunakan Hukum Ohm: V = I × R.",
    });
  });
}

export const subBabRegistry: Partial<Record<SubBabID, GeneratorFn>> = {
  hukum_ohm: generateListrik,
  arus_listrik: generateListrik,
  rangkaian_seri: generateListrik,
  rangkaian_paralel: generateListrik,
  daya_listrik: generateListrik,
  listrik_statis: generateListrik,
};

export function generate(subBab: SubBabID, difficulty: Difficulty, mode: Mode, rng: () => number, count: number): Question[] {
  if (subBab === "all") {
    const questionsPerSubBab = Math.ceil(count / Object.keys(subBabRegistry).length);
    return Object.values(subBabRegistry).flatMap((generator) => generator(difficulty, mode, rng, questionsPerSubBab));
  }

  const generator = subBabRegistry[subBab];
  return generator ? generator(difficulty, mode, rng, count) : [];
}
