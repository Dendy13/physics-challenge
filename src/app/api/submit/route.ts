import { NextResponse } from "next/server";
import { generateQuestions } from "@/lib/generator";
import { getSupabaseAdmin } from "@/lib/supabase";
import type {
  Category,
  Difficulty,
  LeaderboardEntry,
  SubmitPayload,
} from "@/types/game";

export const runtime = "edge";

function isDifficulty(value: unknown): value is Difficulty {
  return (
    value === "easy" ||
    value === "medium" ||
    value === "hard" ||
    value === "simbol" ||
    value === "teks"
  );
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
    const { username, difficulty, category, seed, answers, duration } = body;
    const normalizedCategory: Category = category ?? "mix";

    if (
      !username ||
      typeof username !== "string" ||
      username.trim().length < 3 ||
      !isDifficulty(difficulty) ||
      !isCategory(normalizedCategory) ||
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
    const rebuiltQuestions = generateQuestions(
      seed,
      difficulty,
      answers.length,
      normalizedCategory,
    );

    let correctCount = 0;
    rebuiltQuestions.forEach((question, idx) => {
      if (isAnswerCorrect(question.correctAnswer, answers[idx])) {
        correctCount += 1;
      }
    });

    const score = computeScore(correctCount, rebuiltQuestions.length, duration);

    const entry: LeaderboardEntry = {
      username: normalizedUsername,
      difficulty,
      category: normalizedCategory,
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
