import { NextResponse } from "next/server";
import { generateQuestions, type GenerateProps } from "@/lib/generator";
import { getSupabaseAdmin } from "@/lib/supabase";
import type {
  BabID,
  Category,
  DifficultyLevel,
  LeaderboardEntry,
  Mode,
  SubmitPayload,
  SubBabID,
} from "@/types/game";

export const runtime = "edge";

function isMode(value: unknown): value is Mode {
  return value === "simbol" || value === "teks";
}

function isDifficulty(value: unknown): value is DifficultyLevel {
  return value === "easy" || value === "medium" || value === "hard";
}

function isCategory(value: unknown): value is Category {
  return (
    value === "kinematika" ||
    value === "dinamika" ||
    value === "termodinamika" ||
    value === "listrik" ||
    value === "mix"
  );
}

function isBab(value: unknown): value is BabID {
  return (
    value === "mekanika" ||
    value === "energi" ||
    value === "fluida" ||
    value === "listrik" ||
    value === "modern"
  );
}

function isSubBab(value: unknown): value is SubBabID {
  return (
    value === "all" ||
    value === "vektor" ||
    value === "gerak_lurus" ||
    value === "glb_glbb" ||
    value === "hukum_newton" ||
    value === "resultan_gaya" ||
    value === "usaha" ||
    value === "energi_kinetik" ||
    value === "energi_potensial" ||
    value === "energi_mekanik" ||
    value === "momentum" ||
    value === "impuls" ||
    value === "tekanan" ||
    value === "fluida_statis" ||
    value === "fluida_dinamis" ||
    value === "hukum_pascal" ||
    value === "hukum_archimedes" ||
    value === "hukum_ohm" ||
    value === "arus_listrik" ||
    value === "rangkaian_seri" ||
    value === "rangkaian_paralel" ||
    value === "daya_listrik" ||
    value === "listrik_statis" ||
    value === "modern_atom" ||
    value === "radioaktivitas" ||
    value === "relativitas_dasar"
  );
}

function resolveCategoryFromBab(bab: BabID): Category {
  switch (bab) {
    case "mekanika":
      return "kinematika";
    case "energi":
      return "termodinamika";
    case "fluida":
      return "mix";
    case "listrik":
      return "listrik";
    case "modern":
      return "mix";
    default:
      return "mix";
  }
}

function computeScore(correctCount: number, total: number, duration: number): number {
  const safeDuration = Math.max(1, duration);
  const accuracy = correctCount / total;
  const speedMultiplier = Math.max(0.6, Math.min(2, (total * 25) / safeDuration));
  return Math.round(correctCount * 100 * speedMultiplier * (0.5 + accuracy / 2));
}

function isAnswerCorrect(actual: number, userAnswer: number): boolean {
  return Math.abs(actual - userAnswer) <= 0.01;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SubmitPayload;
    console.log("[DEBUG] Payload:", body);
    
    const { username, mode, difficulty, category, bab, subBab, seed, answers, duration } = body;
    const normalizedCategory: Category = category ?? "mix";

    if (
      !username ||
      typeof username !== "string" ||
      username.trim().length < 3 ||
      !isMode(mode) ||
      !isDifficulty(difficulty) ||
      !isCategory(normalizedCategory) ||
      (bab !== undefined && !isBab(bab)) ||
      (subBab !== undefined && !isSubBab(subBab)) ||
      !seed ||
      typeof seed !== "string" ||
      !Array.isArray(answers) ||
      answers.length < 3 ||
      answers.some((ans) => typeof ans !== "number" || Number.isNaN(ans)) ||
      typeof duration !== "number" ||
      Number.isNaN(duration) ||
      duration <= 0
    ) {
      return NextResponse.json({ error: "Payload tidak valid." }, { status: 400 });
    }

    const normalizedUsername = username.trim().slice(0, 32);
    
    // Rebuild questions using the new GenerateProps format
    let rebuiltQuestions;
    if (bab && subBab) {
      const props: GenerateProps = {
        seed,
        mode,
        difficulty,
        count: answers.length,
        bab,
        subBab,
      };
      rebuiltQuestions = generateQuestions(props);
    } else {
      const props: GenerateProps = {
        seed,
        mode,
        difficulty,
        count: answers.length,
        category: normalizedCategory,
      };
      rebuiltQuestions = generateQuestions(props);
    }

    let correctCount = 0;
    rebuiltQuestions.forEach((question, idx) => {
      if (isAnswerCorrect(question.correctAnswer, answers[idx])) {
        correctCount += 1;
      }
    });

    const score = computeScore(correctCount, rebuiltQuestions.length, duration);

    const entry: LeaderboardEntry = {
      username: normalizedUsername,
      mode,
      difficulty,
      category: bab ? resolveCategoryFromBab(bab) : normalizedCategory,
      score,
      correct_count: correctCount,
      total_questions: rebuiltQuestions.length,
      duration,
    };

    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("leaderboards").insert(entry);

    if (error) {
      return NextResponse.json(
        {
          error: "Gagal menyimpan skor.",
          detail: error.message,
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        message: "Skor berhasil disimpan.",
        score,
        correctCount,
        total: rebuiltQuestions.length,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: "Terjadi kesalahan server.",
        detail: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
