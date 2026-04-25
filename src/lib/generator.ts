import seedrandom from "seedrandom";
import type { Category, DifficultyLevel, Mode, Question } from "@/types/game";

type FullCategory = Exclude<Category, "mix">;

type GeneratorContext = {
  rng: seedrandom.PRNG;
  category: FullCategory;
  mode: Mode;
  difficulty: DifficultyLevel;
};

type QuestionTemplate = {
  id: string;
  category: FullCategory;
  unit: string;
  build: (ctx: GeneratorContext) => { text: string; answer: number };
};

const GRAVITY = 10;

const textIntros = [
  "Dalam sebuah percobaan laboratorium",
  "Pada sesi praktikum fisika",
  "Di lintasan uji sekolah",
  "Saat simulasi pembelajaran",
];

const clutterFacts = [
  "warna mobil merah metalik",
  "suhu ruangan 29 C",
  "pengamat memakai jam digital",
  "panjang meja 1,2 m",
];

function randomInt(rng: seedrandom.PRNG, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function randomHalf(rng: seedrandom.PRNG, min: number, max: number): number {
  const start = Math.ceil(min * 2);
  const end = Math.floor(max * 2);
  return randomInt(rng, start, end) / 2;
}

function randomDecimal(
  rng: seedrandom.PRNG,
  min: number,
  max: number,
  decimals = 2,
): number {
  const factor = 10 ** decimals;
  return Math.round((rng() * (max - min) + min) * factor) / factor;
}

function formatNumber(value: number): string {
  if (Number.isInteger(value)) {
    return String(value);
  }

  return Number(value.toFixed(2)).toString();
}

function normalizeAnswer(value: number): number {
  return Number(value.toFixed(2));
}

function buildText(
  mode: Mode,
  simbolText: string,
  teksBuilder: () => string,
): string {
  return mode === "simbol" ? simbolText : teksBuilder();
}

function pickCategory(rng: seedrandom.PRNG, category: Category): FullCategory {
  const all: FullCategory[] = ["kinematika", "dinamika", "listrik"];
  if (category !== "mix") {
    return category;
  }

  return all[randomInt(rng, 0, all.length - 1)];
}

function makeKinematikaQuestion(ctx: GeneratorContext): { text: string; answer: number } {
  const { rng, mode, difficulty } = ctx;

  if (difficulty === "easy") {
    const s = randomInt(rng, 24, 160);
    const t = randomInt(rng, 3, 16);
    const v = s / t;

    const text = buildText(
      mode,
      `s = ${formatNumber(s)} m, t = ${formatNumber(t)} s. Cari v!`,
      () =>
        `${textIntros[randomInt(rng, 0, textIntros.length - 1)]}, sebuah benda menempuh jarak ${formatNumber(
          s,
        )} m dalam waktu ${formatNumber(t)} s. Hitung kecepatan benda tersebut.`,
    );

    return { text, answer: normalizeAnswer(v) };
  }

  if (difficulty === "medium") {
    const vKmh = randomHalf(rng, 18, 90);
    const t = randomHalf(rng, 2, 10);
    const vMs = vKmh / 3.6;
    const s = vMs * t;

    const text = buildText(
      mode,
      `v = ${formatNumber(vKmh)} km/jam, t = ${formatNumber(t)} s. Konversi v ke m/s lalu cari s!`,
      () =>
        `${textIntros[randomInt(rng, 0, textIntros.length - 1)]}, sebuah troli bergerak dengan kecepatan ${formatNumber(
          vKmh,
        )} km/jam selama ${formatNumber(t)} s. Ubah kecepatan ke m/s lalu tentukan jarak tempuhnya.`,
    );

    return { text, answer: normalizeAnswer(s) };
  }

  const v0 = randomDecimal(rng, 1.25, 12.75);
  const a = randomDecimal(rng, 0.45, 3.25);
  const t = randomDecimal(rng, 2.1, 8.7);
  const v = v0 + a * t;
  const s = ((v0 + v) / 2) * t;

  const text = buildText(
    mode,
    `v0 = ${formatNumber(v0)} m/s, a = ${formatNumber(a)} m/s^2, t = ${formatNumber(
      t,
    )} s, catatan: ${clutterFacts[randomInt(rng, 0, clutterFacts.length - 1)]}. Cari s!`,
    () =>
      `${textIntros[randomInt(rng, 0, textIntros.length - 1)]}, sebuah kereta mini memiliki kecepatan awal ${formatNumber(
        v0,
      )} m/s lalu dipercepat ${formatNumber(a)} m/s^2 selama ${formatNumber(
        t,
      )} s. Data tambahan: ${clutterFacts[randomInt(
        rng,
        0,
        clutterFacts.length - 1,
      )]}. Hitung jarak tempuh totalnya dengan langkah bertahap.`,
  );

  return { text, answer: normalizeAnswer(s) };
}

function makeDinamikaQuestion(ctx: GeneratorContext): { text: string; answer: number } {
  const { rng, mode, difficulty } = ctx;

  if (difficulty === "easy") {
    const m = randomInt(rng, 2, 20);
    const a = randomInt(rng, 1, 10);
    const f = m * a;

    const text = buildText(
      mode,
      `m = ${formatNumber(m)} kg, a = ${formatNumber(a)} m/s^2. Cari F!`,
      () =>
        `${textIntros[randomInt(rng, 0, textIntros.length - 1)]}, sebuah benda bermassa ${formatNumber(
          m,
        )} kg dipercepat ${formatNumber(a)} m/s^2. Berapakah gaya yang bekerja pada benda itu?`,
    );

    return { text, answer: normalizeAnswer(f) };
  }

  if (difficulty === "medium") {
    const m = randomHalf(rng, 4, 18);
    const vKmh = randomHalf(rng, 18, 72);
    const t = randomHalf(rng, 2, 8);
    const vMs = vKmh / 3.6;
    const a = vMs / t;
    const f = m * a;

    const text = buildText(
      mode,
      `m = ${formatNumber(m)} kg, v = ${formatNumber(vKmh)} km/jam, t = ${formatNumber(
        t,
      )} s. Ubah v ke m/s, cari a lalu F!`,
      () =>
        `${textIntros[randomInt(rng, 0, textIntros.length - 1)]}, sebuah benda bermassa ${formatNumber(
          m,
        )} kg dari diam mencapai kecepatan ${formatNumber(vKmh)} km/jam dalam ${formatNumber(
          t,
        )} s. Konversi satuan yang diperlukan, lalu tentukan gaya resultannya.`,
    );

    return { text, answer: normalizeAnswer(f) };
  }

  const m = randomDecimal(rng, 3.2, 14.8);
  const thetaFactor = randomDecimal(rng, 0.35, 0.75);
  const mu = randomDecimal(rng, 0.08, 0.28);
  const n = m * GRAVITY * thetaFactor;
  const friction = mu * n;
  const fApplied = randomDecimal(rng, 30, 120);
  const net = fApplied - friction;
  const a = net / m;

  const text = buildText(
    mode,
    `m = ${formatNumber(m)} kg, F = ${formatNumber(fApplied)} N, mu = ${formatNumber(
      mu,
    )}, N = ${formatNumber(n)} N, info: ${clutterFacts[randomInt(
      rng,
      0,
      clutterFacts.length - 1,
    )]}. Cari a!`,
    () =>
      `${textIntros[randomInt(rng, 0, textIntros.length - 1)]}, balok bermassa ${formatNumber(
        m,
      )} kg didorong gaya horizontal ${formatNumber(
        fApplied,
      )} N di permukaan kasar. Diketahui koefisien gesek ${formatNumber(
        mu,
      )} dan gaya normal efektif ${formatNumber(
        n,
      )} N. Informasi tambahan yang tidak wajib: ${clutterFacts[randomInt(
        rng,
        0,
        clutterFacts.length - 1,
      )]}. Hitung percepatan balok.`,
  );

  return { text, answer: normalizeAnswer(a) };
}

function makeListrikQuestion(ctx: GeneratorContext): { text: string; answer: number } {
  const { rng, mode, difficulty } = ctx;

  if (difficulty === "easy") {
    const i = randomInt(rng, 1, 8);
    const r = randomInt(rng, 2, 30);
    const v = i * r;

    const text = buildText(
      mode,
      `I = ${formatNumber(i)} A, R = ${formatNumber(r)} ohm. Cari V!`,
      () =>
        `${textIntros[randomInt(rng, 0, textIntros.length - 1)]}, arus sebesar ${formatNumber(
          i,
        )} A mengalir pada hambatan ${formatNumber(r)} ohm. Berapa beda potensialnya?`,
    );

    return { text, answer: normalizeAnswer(v) };
  }

  if (difficulty === "medium") {
    const v = randomHalf(rng, 12, 48);
    const r = randomHalf(rng, 4, 20);
    const i = v / r;
    const p = v * i;

    const text = buildText(
      mode,
      `V = ${formatNumber(v)} V, R = ${formatNumber(r)} ohm. Cari I lalu P!`,
      () =>
        `${textIntros[randomInt(rng, 0, textIntros.length - 1)]}, sebuah rangkaian memiliki tegangan ${formatNumber(
          v,
        )} V dan hambatan ${formatNumber(r)} ohm. Tentukan arus terlebih dahulu, lalu hitung dayanya.`,
    );

    return { text, answer: normalizeAnswer(p) };
  }

  const p = randomDecimal(rng, 45, 320);
  const tHour = randomDecimal(rng, 0.35, 2.4);
  const v = randomDecimal(rng, 110, 230);
  const eWh = p * tHour;
  const i = p / v;
  const eJ = eWh * 3600;

  const text = buildText(
    mode,
    `P = ${formatNumber(p)} W, t = ${formatNumber(tHour)} jam, V = ${formatNumber(
      v,
    )} V, info: ${clutterFacts[randomInt(rng, 0, clutterFacts.length - 1)]}. Cari energi (J)!`,
    () =>
      `${textIntros[randomInt(rng, 0, textIntros.length - 1)]}, sebuah alat listrik bekerja pada daya ${formatNumber(
        p,
      )} W selama ${formatNumber(tHour)} jam dengan tegangan ${formatNumber(
        v,
      )} V. Informasi tambahan: ${clutterFacts[randomInt(
        rng,
        0,
        clutterFacts.length - 1,
      )]}. Hitung energi listrik total dalam satuan joule (petunjuk: perlu beberapa langkah).`,
  );

  return { text, answer: normalizeAnswer(eJ + i - i) };
}

const templates: QuestionTemplate[] = [
  {
    id: "kinematika_combo",
    category: "kinematika",
    unit: "m",
    build: makeKinematikaQuestion,
  },
  {
    id: "dinamika_combo",
    category: "dinamika",
    unit: "N",
    build: makeDinamikaQuestion,
  },
  {
    id: "listrik_combo",
    category: "listrik",
    unit: "V",
    build: makeListrikQuestion,
  },
];

function determineUnit(category: FullCategory, difficulty: DifficultyLevel): string {
  if (category === "kinematika") {
    return difficulty === "easy" ? "m/s" : "m";
  }

  if (category === "dinamika") {
    return difficulty === "hard" ? "m/s^2" : "N";
  }

  return difficulty === "easy" ? "V" : difficulty === "medium" ? "W" : "J";
}

export function generateQuestions(
  seed: string,
  mode: Mode,
  category: Category,
  difficulty: DifficultyLevel,
  count: number,
): Question[] {
  const rng = seedrandom(seed);
  const safeCount = Math.max(1, Math.min(count, 30));

  return Array.from({ length: safeCount }, (_, idx) => {
    const pickedCategory = pickCategory(rng, category);
    const template = templates.find((item) => item.category === pickedCategory);

    if (!template) {
      throw new Error("Template soal tidak ditemukan.");
    }

    const built = template.build({
      rng,
      category: pickedCategory,
      mode,
      difficulty,
    });

    return {
      id: `${template.id}_${mode}_${difficulty}_${idx + 1}`,
      text: built.text,
      unit: determineUnit(pickedCategory, difficulty),
      correctAnswer: normalizeAnswer(built.answer),
    };
  });
}
