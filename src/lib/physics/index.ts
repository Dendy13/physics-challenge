import type { Difficulty, Mode, Question, SubBabID } from "@/types/game";
import type { GeneratorFn } from "./shared";
import { subBabRegistry as mekanikaRegistry } from "./mekanika";
import { subBabRegistry as energiRegistry } from "./energi";
import { subBabRegistry as fluidaRegistry } from "./fluida";
import { subBabRegistry as listrikRegistry } from "./listrik";
import { subBabRegistry as modernRegistry } from "./modern";

export const subBabRegistry: Partial<Record<SubBabID, GeneratorFn>> = {
  ...mekanikaRegistry,
  ...energiRegistry,
  ...fluidaRegistry,
  ...listrikRegistry,
  ...modernRegistry,
};

export function generate(subBab: SubBabID, difficulty: Difficulty, mode: Mode): Question[] {
  if (subBab === "all") {
    return Object.values(subBabRegistry).flatMap((generator) => generator(difficulty, mode));
  }

  const generator = subBabRegistry[subBab];
  if (!generator) {
    return [];
  }

  return generator(difficulty, mode);
}
