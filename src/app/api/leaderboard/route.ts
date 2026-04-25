import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import type { Category } from "@/types/game";

export const runtime = "edge";

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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = parseCategory(searchParams.get("category"));

    const supabase = getSupabaseAdmin();
    let query = supabase
      .from("leaderboards")
      .select("username,score,difficulty,category,duration,created_at")
      .order("score", { ascending: false })
      .limit(10);

    if (category !== "mix") {
      query = query.eq("category", category);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        {
          error: "Gagal mengambil leaderboard.",
          detail: error.message,
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        category,
        entries: data ?? [],
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
