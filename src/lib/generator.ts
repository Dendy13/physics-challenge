import seedrandom from "seedrandom";
import type { Difficulty, Question } from "@/types/game";

type VariableSet = {
  m: number;
  a: number;
  h: number;
  v: number;
};

type Template = {
  id: string;
  difficulty: Difficulty;
  text: string;
  unit: string;
  solve: (vars: VariableSet) => number;
};

const GRAVITY = 10;

const templates: Template[] = [
  {
    id: "newton_force_symbol",
    difficulty: "simbol",
    text: "m = {m} kg, a = {a} m/s^2. Cari F?",
    unit: "N",
    solve: ({ m, a }) => m * a,
  },
  {
    id: "potential_energy_symbol",
    difficulty: "simbol",
    text: "m = {m} kg, h = {h} m, g = 10 m/s^2. Cari Ep?",
    unit: "J",
    solve: ({ m, h }) => m * GRAVITY * h,
  },
  {
    id: "kinetic_energy_symbol",
    difficulty: "simbol",
    text: "m = {m} kg, v = {v} m/s. Cari Ek?",
    unit: "J",
    solve: ({ m, v }) => 0.5 * m * v * v,
  },
  {
    id: "newton_force_text",
    difficulty: "teks",
    text: "Sebuah kotak bermassa {m} kg didorong hingga mengalami percepatan {a} m/s^2. Berapakah besar gaya yang diberikan?",
    unit: "N",
    solve: ({ m, a }) => m * a,
  },
  {
    id: "potential_energy_text",
    difficulty: "teks",
    text: "Benda bermassa {m} kg berada pada ketinggian {h} m dari tanah. Jika g = 10 m/s^2, berapa energi potensialnya?",
    unit: "J",
    solve: ({ m, h }) => m * GRAVITY * h,
  },
  {
    id: "kinetic_energy_text",
    difficulty: "teks",
    text: "Sebuah benda bermassa {m} kg bergerak dengan kelajuan {v} m/s. Berapa energi kinetiknya?",
    unit: "J",
    solve: ({ m, v }) => 0.5 * m * v * v,
  },
];

function randomInt(rng: seedrandom.PRNG, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function createVariables(rng: seedrandom.PRNG): VariableSet {
  return {
    m: randomInt(rng, 1, 20),
    a: randomInt(rng, 1, 12),
    h: randomInt(rng, 1, 30),
    v: randomInt(rng, 2, 25),
  };
}

function interpolateText(text: string, vars: VariableSet): string {
  return text
    .replaceAll("{m}", String(vars.m))
    .replaceAll("{a}", String(vars.a))
    .replaceAll("{h}", String(vars.h))
    .replaceAll("{v}", String(vars.v));
}

function pickTemplate(rng: seedrandom.PRNG, difficulty: Difficulty): Template {
  const pool = templates.filter((item) => item.difficulty === difficulty);
  const index = randomInt(rng, 0, pool.length - 1);
  return pool[index];
}

function normalizeAnswer(value: number): number {
  return Number(value.toFixed(2));
}

export function generateQuestions(
  seed: string,
  difficulty: Difficulty,
  count: number,
): Question[] {
  const rng = seedrandom(seed);
  const safeCount = Math.max(1, Math.min(count, 30));

  return Array.from({ length: safeCount }, (_, idx) => {
    const vars = createVariables(rng);
    const template = pickTemplate(rng, difficulty);
    const correctAnswer = normalizeAnswer(template.solve(vars));

    return {
      id: `${template.id}_${idx + 1}`,
      text: interpolateText(template.text, vars),
      unit: template.unit,
      correctAnswer,
    };
  });
}
