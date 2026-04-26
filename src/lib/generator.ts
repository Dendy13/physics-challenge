import seedrandom from "seedrandom";
import type { BabID, Category, DifficultyLevel, Mode, Question, SubBabID } from "@/types/game";
import * as Mekanika from "@/lib/physics/mekanika";
import * as Energi from "@/lib/physics/energi";
import * as Fluida from "@/lib/physics/fluida";
import * as Listrik from "@/lib/physics/listrik";
import * as Modern from "@/lib/physics/modern";

const BAB_ORDER: BabID[] = ["mekanika", "energi", "fluida", "listrik", "modern"];

export interface GenerateProps {
  seed: string;
  mode: Mode;
  difficulty: DifficultyLevel;
  count: number;
  bab?: BabID;
  subBab?: SubBabID;
  category?: Category;
}

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

export function generateQuestions(props: GenerateProps): Question[] {
  const { seed, mode, difficulty, count, bab, subBab, category } = props;

  // Validate inputs
  if (!isMode(mode) || !isDifficultyLevel(difficulty)) {
    return [];
  }

  // Create seeded RNG
  const rng = seedrandom(seed);

  // If bab and subBab are provided, use them directly
  if (bab && subBab) {
    if (!isBabID(bab) || !subBab) {
      return [];
    }
    const babModule = resolveBabModule(bab);
    return babModule.generate(subBab, difficulty, mode, rng, count);
  }

  // Otherwise use category-based resolution
  const normalizedCategory = category && isCategory(category) ? category : "mix";
  
  if (normalizedCategory === "mix") {
    // Generate from all babs
    const questionsPerBab = Math.ceil(count / BAB_ORDER.length);
    return BAB_ORDER.flatMap((b) => {
      const babModule = resolveBabModule(b);
      return babModule.generate("all", difficulty, mode, rng, questionsPerBab);
    }).slice(0, count);
  }

  // Generate from specific bab resolved from category
  const resolvedBab = resolveBabFromCategory(normalizedCategory);
  const babModule = resolveBabModule(resolvedBab);
  return babModule.generate("all", difficulty, mode, rng, count);
}
