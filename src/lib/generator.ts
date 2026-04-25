import seedrandom from "seedrandom";
import type { BabID, Category, Difficulty, DifficultyLevel, Mode, Question, SubBabID } from "@/types/game";
import * as Mekanika from "@/lib/physics/mekanika";
import * as Energi from "@/lib/physics/energi";
import * as Fluida from "@/lib/physics/fluida";
import * as Listrik from "@/lib/physics/listrik";
import * as Modern from "@/lib/physics/modern";

const BAB_ORDER: BabID[] = ["mekanika", "energi", "fluida", "listrik", "modern"];

function isBabID(value: string): value is BabID {
  return value === "mekanika" || value === "energi" || value === "fluida" || value === "listrik" || value === "modern";
}

function isMode(value: string): value is Mode {
  return value === "simbol" || value === "teks";
}

function isDifficultyLevel(value: string): value is DifficultyLevel {
  return value === "easy" || value === "medium" || value === "hard";
}

function isCategory(value: string): value is Category {
  return value === "kinematika" || value === "dinamika" || value === "listrik" || value === "mix" || value === "termodinamika";
}

function pickQuestionFromPool(seed: string, pool: Question[], count: number): Question[] {
  const rng = seedrandom(seed);
  if (!pool.length || count <= 0) {
    return [];
  }

  return Array.from({ length: count }, (_, idx) => {
    const selectedIndex = Math.floor(rng() * pool.length);
    const picked = pool[selectedIndex];

    return {
      ...picked,
      id: `${picked.id}_${idx + 1}`,
    };
  });
}

function resolveBabModule(bab: BabID) {
  switch (bab) {
    case "mekanika":
      return Mekanika;
    case "energi":
      return Energi;
    case "fluida":
      return Fluida;
    case "listrik":
      return Listrik;
    case "modern":
      return Modern;
    default:
      return Mekanika;
  }
}

function resolveBabFromCategory(category: Category): BabID {
  switch (category) {
    case "kinematika":
    case "dinamika":
      return "mekanika";
    case "termodinamika":
      return "energi";
    case "listrik":
      return "listrik";
    case "mix":
    default:
      return "mekanika";
  }
}

function resolveQuestionsByBab(seed: string, category: Category, difficulty: DifficultyLevel, mode: Mode, count: number): Question[] {
  if (category === "mix") {
    const pool = BAB_ORDER.flatMap((bab) => resolveBabModule(bab).generate("all", difficulty, mode));
    return pickQuestionFromPool(seed, pool, count);
  }

  const bab = resolveBabFromCategory(category);
  const pool = resolveBabModule(bab).generate("all", difficulty, mode);
  return pickQuestionFromPool(seed, pool, count);
}

export function generateQuestions(bab: BabID, subBab: SubBabID, difficulty: Difficulty, mode: Mode): Question[];
export function generateQuestions(seed: string, mode: Mode, category: Category, difficulty: DifficultyLevel, count: number): Question[];
export function generateQuestions(
  firstArg: BabID | string,
  secondArg: SubBabID | Mode,
  thirdArg: Difficulty | Category,
  fourthArg: DifficultyLevel | Mode,
  fifthArg?: number,
): Question[] {
  if (isBabID(firstArg)) {
    const bab = firstArg;
    const subBab = secondArg as SubBabID;
    const difficulty = thirdArg as Difficulty;
    const mode = fourthArg as Mode;

    switch (bab) {
      case "mekanika":
        return Mekanika.generate(subBab, difficulty, mode);
      case "energi":
        return Energi.generate(subBab, difficulty, mode);
      case "fluida":
        return Fluida.generate(subBab, difficulty, mode);
      case "listrik":
        return Listrik.generate(subBab, difficulty, mode);
      case "modern":
        return Modern.generate(subBab, difficulty, mode);
      default:
        return [];
    }
  }

  const seed = firstArg;
  const mode = secondArg as Mode;
  const category = thirdArg as Category;
  const difficulty = fourthArg as DifficultyLevel;
  const count = fifthArg ?? 10;

  if (!isMode(mode) || !isDifficultyLevel(difficulty) || !isCategory(category)) {
    return [];
  }

  return resolveQuestionsByBab(seed, category, difficulty, mode, count);
}
