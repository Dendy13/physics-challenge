import seedrandom from "seedrandom";
import type { Category, Difficulty, DifficultyLevel, Question } from "@/types/game";

type VariableSet = {
  m: number;
  a: number;
  t: number;
  dt: number;
  c: number;
  i: number;
  r: number;
  d: number;
  v0: number;
};

type Template = {
  id: string;
  category: Exclude<Category, "mix">;
  text: string;
  unit: string;
  solve: (vars: VariableSet) => number;
};

const templates: Template[] = [
  {
    id: "kinematika_kecepatan",
    category: "kinematika",
    text: "Sebuah benda menempuh jarak {d} m dalam waktu {t} s. Berapa kecepatannya?",
    unit: "m/s",
    solve: ({ d, t }) => d / t,
  },
  {
    id: "kinematika_jarak",
    category: "kinematika",
    text: "Sebuah benda bergerak dengan kecepatan awal {v0} m/s dan percepatan {a} m/s^2 selama {t} s. Berapa jarak tempuhnya?",
    unit: "m",
    solve: ({ v0, a, t }) => v0 * t + 0.5 * a * t * t,
  },
  {
    id: "dinamika_gaya",
    category: "dinamika",
    text: "Massa benda {m} kg dipercepat {a} m/s^2. Berapa gaya resultannya?",
    unit: "N",
    solve: ({ m, a }) => m * a,
  },
  {
    id: "dinamika_berat",
    category: "dinamika",
    text: "Sebuah benda bermassa {m} kg berada di bumi (g = 10 m/s^2). Berapa berat benda tersebut?",
    unit: "N",
    solve: ({ m }) => m * 10,
  },
  {
    id: "termodinamika_kalor",
    category: "termodinamika",
    text: "Sebanyak {m} kg air dipanaskan dengan kalor jenis {c} kJ/(kg.C) dan kenaikan suhu {dt} C. Berapa kalor yang dibutuhkan?",
    unit: "kJ",
    solve: ({ m, c, dt }) => m * c * dt,
  },
  {
    id: "termodinamika_daya_kalor",
    category: "termodinamika",
    text: "Energi panas sebesar {d} kJ ditransfer dalam {t} s. Berapa laju transfer kalor rata-ratanya?",
    unit: "kW",
    solve: ({ d, t }) => d / t,
  },
  {
    id: "listrik_ohm",
    category: "listrik",
    text: "Arus listrik {i} A mengalir pada hambatan {r} ohm. Berapa beda potensialnya?",
    unit: "V",
    solve: ({ i, r }) => i * r,
  },
  {
    id: "listrik_daya",
    category: "listrik",
    text: "Tegangan pada rangkaian {d} V dan arus {i} A. Berapa daya listriknya?",
    unit: "W",
    solve: ({ d, i }) => d * i,
  },
];

function randomInt(rng: seedrandom.PRNG, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function randomDecimal(
  rng: seedrandom.PRNG,
  min: number,
  max: number,
  decimals = 1,
): number {
  const factor = 10 ** decimals;
  return Math.round((rng() * (max - min) + min) * factor) / factor;
}

function normalizeDifficulty(difficulty: Difficulty): DifficultyLevel {
  if (difficulty === "simbol") return "easy";
  if (difficulty === "teks") return "medium";
  return difficulty;
}

function formatValue(value: number): string {
  if (Number.isInteger(value)) return String(value);
  return value.toFixed(1);
}

function createVariables(rng: seedrandom.PRNG, difficulty: DifficultyLevel): VariableSet {
  const isEasy = difficulty === "easy";
  const isHard = difficulty === "hard";

  if (isEasy) {
    return {
      m: randomInt(rng, 1, 20),
      a: randomInt(rng, 1, 10),
      t: randomInt(rng, 2, 12),
      dt: randomInt(rng, 5, 40),
      c: randomInt(rng, 1, 5),
      i: randomInt(rng, 1, 8),
      r: randomInt(rng, 2, 30),
      d: randomInt(rng, 10, 200),
      v0: randomInt(rng, 1, 20),
    };
  }

  if (isHard) {
    return {
      m: randomDecimal(rng, 1.2, 20.8),
      a: randomDecimal(rng, 0.8, 12.6),
      t: randomDecimal(rng, 1.5, 12.5),
      dt: randomDecimal(rng, 4.5, 39.5),
      c: randomDecimal(rng, 1.2, 5.2),
      i: randomDecimal(rng, 0.5, 8.5),
      r: randomDecimal(rng, 1.5, 30.5),
      d: randomDecimal(rng, 12.5, 220.5),
      v0: randomDecimal(rng, 1.2, 20.5),
    };
  }

  return {
    m: randomInt(rng, 2, 35),
    a: randomInt(rng, 1, 15),
    t: randomInt(rng, 2, 15),
    dt: randomInt(rng, 8, 50),
    c: randomInt(rng, 2, 6),
    i: randomInt(rng, 1, 10),
    r: randomInt(rng, 3, 40),
    d: randomInt(rng, 20, 260),
    v0: randomInt(rng, 2, 24),
  };
}

function interpolateText(text: string, vars: VariableSet): string {
  return text
    .replaceAll("{m}", formatValue(vars.m))
    .replaceAll("{a}", formatValue(vars.a))
    .replaceAll("{t}", formatValue(vars.t))
    .replaceAll("{dt}", formatValue(vars.dt))
    .replaceAll("{c}", formatValue(vars.c))
    .replaceAll("{i}", formatValue(vars.i))
    .replaceAll("{r}", formatValue(vars.r))
    .replaceAll("{d}", formatValue(vars.d))
    .replaceAll("{v0}", formatValue(vars.v0));
}

function pickTemplate(rng: seedrandom.PRNG, category: Category): Template {
  const pool =
    category === "mix"
      ? templates
      : templates.filter((item) => item.category === category);

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
  category: Category = "mix",
): Question[] {
  const rng = seedrandom(seed);
  const safeCount = Math.max(1, Math.min(count, 30));
  const normalizedDifficulty = normalizeDifficulty(difficulty);

  return Array.from({ length: safeCount }, (_, idx) => {
    const vars = createVariables(rng, normalizedDifficulty);
    const template = pickTemplate(rng, category);
    const correctAnswer = normalizeAnswer(template.solve(vars));

    return {
      id: `${template.id}_${idx + 1}`,
      text: interpolateText(template.text, vars),
      unit: template.unit,
      correctAnswer,
    };
  });
}
