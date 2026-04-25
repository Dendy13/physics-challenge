import { NextResponse } from "next/server";
import { generateQuestions } from "@/lib/generator";
import type { Difficulty, GamePayload } from "@/types/game";

export const runtime = "edge";

function parseDifficulty(value: string | null): Difficulty {
  return value === "teks" ? "teks" : "simbol";
}

function parseCount(value: string | null): number {
  const parsed = Number.parseInt(value ?? "10", 10);
  if (Number.isNaN(parsed)) return 10;
  return Math.max(3, Math.min(parsed, 30));
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const difficulty = parseDifficulty(searchParams.get("difficulty"));
  const count = parseCount(searchParams.get("count"));
  const seed = searchParams.get("seed") || crypto.randomUUID();

  const questions = generateQuestions(seed, difficulty, count);
  const sanitizedQuestions = questions.map((question) => ({
    id: question.id,
    text: question.text,
    unit: question.unit,
  }));

  const payload: GamePayload = {
    seed,
    difficulty,
    questions: sanitizedQuestions,
  };

  return NextResponse.json(payload, { status: 200 });
}
