import { NextResponse } from "next/server";
import { generateQuestions } from "@/lib/generator";
import type { Category, Difficulty, GamePayload } from "@/types/game";

export const runtime = "edge";

function parseDifficulty(value: string | null): Difficulty {
  if (
    value === "easy" ||
    value === "medium" ||
    value === "hard" ||
    value === "simbol" ||
    value === "teks"
  ) {
    return value;
  }

  return "easy";
}

function parseCategory(value: string | null): Category {
  if (
    value === "kinematika" ||
    value === "dinamika" ||
    value === "termodinamika" ||
    value === "listrik" ||
    value === "mix"
  ) {
    return value;
  }

  return "mix";
}

function parseCount(value: string | null): number {
  const parsed = Number.parseInt(value ?? "10", 10);
  if (Number.isNaN(parsed)) return 10;
  return Math.max(3, Math.min(parsed, 30));
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const difficulty = parseDifficulty(searchParams.get("difficulty"));
  const category = parseCategory(searchParams.get("category"));
  const count = parseCount(searchParams.get("count"));
  const seed = searchParams.get("seed") || crypto.randomUUID();

  const questions = generateQuestions(seed, difficulty, count, category);
  const sanitizedQuestions = questions.map((question) => ({
    id: question.id,
    text: question.text,
    unit: question.unit,
  }));

  const payload: GamePayload = {
    seed,
    difficulty,
    category,
    questions: sanitizedQuestions,
  };

  return NextResponse.json(payload, { status: 200 });
}
