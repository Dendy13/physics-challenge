"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import type { Category, DifficultyLevel, Mode } from "@/types/game";

type LeaderboardRow = {
  username: string;
  score: number;
  difficulty: string;
  category?: string;
  duration?: number;
};

const categories: Array<{ value: Category; label: string }> = [
  { value: "mix", label: "Mix" },
  { value: "kinematika", label: "Kinematika" },
  { value: "dinamika", label: "Dinamika" },
  { value: "termodinamika", label: "Termodinamika" },
  { value: "listrik", label: "Listrik" },
];

const difficulties: Array<{ value: DifficultyLevel; label: string }> = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];

const modes: Array<{ value: Mode; label: string; hint: string }> = [
  { value: "simbol", label: "Simbol", hint: "Rumus langsung" },
  { value: "teks", label: "Teks", hint: "Cerita fisika" },
];

function Leaderboard({ category }: { category: Category }) {
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadData() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/leaderboard?category=${category}`, {
          method: "GET",
          cache: "no-store",
        });
        const data = (await res.json()) as {
          entries?: LeaderboardRow[];
          error?: string;
        };

        if (!res.ok) {
          throw new Error(data.error || "Gagal mengambil leaderboard.");
        }

        if (active) {
          setRows(data.entries ?? []);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Unknown error");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadData();
    return () => {
      active = false;
    };
  }, [category]);

  if (loading) {
    return <p className="text-sm text-slate-300">Memuat leaderboard...</p>;
  }

  if (error) {
    return <p className="text-sm text-rose-300">{error}</p>;
  }

  if (!rows.length) {
    return <p className="text-sm text-slate-300">Belum ada skor untuk kategori ini.</p>;
  }

  return (
    <ul className="space-y-2">
      <AnimatePresence mode="popLayout">
        {rows.map((row, idx) => (
          <motion.li
            key={`${row.username}_${idx}_${row.score}`}
            layout
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
            className="grid grid-cols-[36px_1fr_auto] items-center gap-3 rounded-xl border border-white/15 bg-slate-900/50 px-3 py-2"
          >
            <span className="text-center text-sm font-black text-cyan-300">#{idx + 1}</span>
            <div>
              <p className="text-sm font-semibold text-white">{row.username}</p>
              <p className="text-xs text-slate-300">
                {row.difficulty} • {Math.round(row.duration ?? 0)}s
              </p>
            </div>
            <p className="text-sm font-black text-emerald-300">{row.score}</p>
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
}

export default function Home() {
  const [mode, setMode] = useState<Mode>("simbol");
  const [category, setCategory] = useState<Category>("mix");
  const [difficulty, setDifficulty] = useState<DifficultyLevel>("easy");

  const playHref = useMemo(
    () => `/play?mode=${mode}&category=${category}&difficulty=${difficulty}`,
    [mode, category, difficulty],
  );

  return (
    <main className="dark min-h-screen bg-[radial-gradient(circle_at_top,_#0f172a,_#020617_55%,_#030712_100%)] px-4 py-8 text-slate-100 md:px-8 md:py-10">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="rounded-[2rem] border border-white/10 bg-white/10 p-6 shadow-[0_18px_70px_rgba(0,0,0,0.45)] backdrop-blur-xl md:p-10"
        >
          <p className="inline-flex rounded-full border border-cyan-200/20 bg-cyan-200/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.25em] text-cyan-200">
            Physics Sprint
          </p>
          <h1 className="mt-4 text-4xl font-black leading-tight md:text-6xl">
            Physics Challenge
          </h1>
          <p className="mt-4 max-w-2xl text-slate-300">
            Pilih kategori dan tingkat kesulitan, lalu mulai sprint kuis fisika dengan
            sistem skor berbasis waktu.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4 md:col-span-2">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-slate-400">
                Mode
              </p>
              <div className="grid grid-cols-2 gap-2">
                {modes.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setMode(item.value)}
                    className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                      mode === item.value
                        ? "bg-fuchsia-300 text-slate-950"
                        : "bg-white/5 text-slate-200 hover:bg-white/15"
                    }`}
                  >
                    {item.label}
                    <span className="ml-2 text-xs opacity-80">{item.hint}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-slate-400">
                Kategori
              </p>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setCategory(item.value)}
                    className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                      category === item.value
                        ? "bg-cyan-400 text-slate-950"
                        : "bg-white/5 text-slate-200 hover:bg-white/15"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-slate-400">
                Difficulty
              </p>
              <div className="grid grid-cols-3 gap-2">
                {difficulties.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setDifficulty(item.value)}
                    className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                      difficulty === item.value
                        ? "bg-emerald-400 text-slate-950"
                        : "bg-white/5 text-slate-200 hover:bg-white/15"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={playHref}
              className="rounded-xl bg-white px-5 py-3 font-black text-slate-950 transition hover:bg-cyan-200"
            >
              Mulai Main
            </Link>
            <span className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-slate-300">
              Mode: {mode} • {category} • {difficulty}
            </span>
          </div>
        </motion.section>

        <motion.aside
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.35 }}
          className="rounded-[2rem] border border-white/10 bg-white/10 p-6 backdrop-blur-xl"
        >
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-slate-400">
            Leaderboard
          </p>
          <h2 className="mb-4 text-2xl font-black text-white">Top 10 • {category}</h2>
          <Leaderboard category={category} />
        </motion.aside>
      </div>
    </main>
  );
}
