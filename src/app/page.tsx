"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { generateQuestions } from "@/lib/generator";
import type { BabID, Category, DifficultyLevel, Mode, Question, SubBabID } from "@/types/game";

type GameState = "menu" | "playing" | "result";

type SubmitResult = {
  score: number;
  correctCount: number;
  total: number;
  message: string;
};

type LeaderboardRow = {
  username: string;
  score: number;
  difficulty: string;
  mode?: string;
  category?: string;
  duration?: number;
};

const GAME_TIME_LIMIT_SECONDS = 180;

const babOptions: Array<{ value: BabID; label: string; description: string }> = [
  { value: "mekanika", label: "Mekanika", description: "Vektor, GLB/GLBB, Newton" },
  { value: "energi", label: "Energi", description: "Usaha, energi kinetik/potensial" },
  { value: "fluida", label: "Fluida", description: "Tekanan, Pascal, Archimedes" },
  { value: "listrik", label: "Listrik", description: "Ohm, rangkaian, daya" },
  { value: "modern", label: "Modern", description: "Atom, radioaktivitas, relativitas" },
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

const subBabOptionsByBab: Record<BabID, Array<{ value: SubBabID; label: string }>> = {
  mekanika: [
    { value: "all", label: "Seluruh Bab" },
    { value: "vektor", label: "Vektor" },
    { value: "gerak_lurus", label: "Gerak Lurus" },
    { value: "glb_glbb", label: "GLB / GLBB" },
    { value: "hukum_newton", label: "Hukum Newton" },
    { value: "resultan_gaya", label: "Resultan Gaya" },
    { value: "momentum", label: "Momentum" },
    { value: "impuls", label: "Impuls" },
  ],
  energi: [
    { value: "all", label: "Seluruh Bab" },
    { value: "usaha", label: "Usaha" },
    { value: "energi_kinetik", label: "Energi Kinetik" },
    { value: "energi_potensial", label: "Energi Potensial" },
    { value: "energi_mekanik", label: "Energi Mekanik" },
  ],
  fluida: [
    { value: "all", label: "Seluruh Bab" },
    { value: "tekanan", label: "Tekanan" },
    { value: "fluida_statis", label: "Fluida Statis" },
    { value: "fluida_dinamis", label: "Fluida Dinamis" },
    { value: "hukum_pascal", label: "Hukum Pascal" },
    { value: "hukum_archimedes", label: "Hukum Archimedes" },
  ],
  listrik: [
    { value: "all", label: "Seluruh Bab" },
    { value: "hukum_ohm", label: "Hukum Ohm" },
    { value: "arus_listrik", label: "Arus Listrik" },
    { value: "rangkaian_seri", label: "Rangkaian Seri" },
    { value: "rangkaian_paralel", label: "Rangkaian Paralel" },
    { value: "daya_listrik", label: "Daya Listrik" },
    { value: "listrik_statis", label: "Listrik Statis" },
  ],
  modern: [
    { value: "all", label: "Seluruh Bab" },
    { value: "modern_atom", label: "Atom Modern" },
    { value: "radioaktivitas", label: "Radioaktivitas" },
    { value: "relativitas_dasar", label: "Relativitas Dasar" },
  ],
};

function getLeaderboardCategory(bab: BabID): Category {
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
                {row.mode ? `${row.mode} • ` : ""}
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

function formatDuration(seconds: number): string {
  return seconds.toFixed(2);
}

function parseAnswer(value: string): number {
  const parsed = Number.parseFloat(value);
  if (Number.isNaN(parsed)) {
    return 0;
  }

  return parsed;
}

export default function Home() {
  const [gameState, setGameState] = useState<GameState>("menu");
  const [username, setUsername] = useState("");
  const [mode, setMode] = useState<Mode>("simbol");
  const [selectedBab, setSelectedBab] = useState<BabID>("mekanika");
  const [selectedSubBab, setSelectedSubBab] = useState<SubBabID>("all");
  const [difficulty, setDifficulty] = useState<DifficultyLevel>("easy");

  const [seed, setSeed] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<number[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentInput, setCurrentInput] = useState("");

  const [elapsed, setElapsed] = useState(0);
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  const currentQuestion = questions[currentIndex];
  const availableSubBabOptions = subBabOptionsByBab[selectedBab];
  const leaderboardCategory = useMemo(() => getLeaderboardCategory(selectedBab), [selectedBab]);

  const questionProgress = useMemo(() => {
    if (!questions.length) return 0;
    return Math.round(((currentIndex + 1) / questions.length) * 100);
  }, [currentIndex, questions.length]);

  const timerProgress = useMemo(
    () => Math.min((elapsed / GAME_TIME_LIMIT_SECONDS) * 100, 100),
    [elapsed],
  );

  useEffect(() => {
    if (gameState !== "playing") return;

    const tick = () => {
      if (startRef.current !== null) {
        setElapsed((performance.now() - startRef.current) / 1000);
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [gameState]);

  useEffect(() => {
    if (gameState === "playing") {
      inputRef.current?.focus();
    }
  }, [gameState, currentIndex]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && gameState === "playing") {
        setWarning("Kecurangan terdeteksi: kamu berpindah tab.");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [gameState]);

  async function startGame() {
    setError(null);
    setWarning(null);
    setResult(null);
    setIsGenerating(true);

    try {
      const generatedSeed = crypto.randomUUID();
      const generatedQuestions = generateQuestions(selectedBab, selectedSubBab, difficulty, mode);

      if (!generatedQuestions.length) {
        throw new Error("Soal tidak tersedia untuk kombinasi bab/sub-bab ini.");
      }

      setSeed(generatedSeed);
      setQuestions(generatedQuestions);
      setAnswers(Array(generatedQuestions.length).fill(0));
      setCurrentIndex(0);
      setCurrentInput("");
      setElapsed(0);
      startRef.current = performance.now();
      setGameState("playing");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsGenerating(false);
    }
  }

  async function submitGame(finalAnswers: number[]) {
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          mode,
          bab: selectedBab,
          sub_bab: selectedSubBab,
          category: leaderboardCategory,
          difficulty,
          seed,
          answers: finalAnswers,
          correct_count: 0,
          total_questions: finalAnswers.length,
          duration: elapsed,
        }),
      });

      const data = (await res.json()) as SubmitResult & { error?: string };
      if (!res.ok) {
        throw new Error(data.error || "Gagal submit skor.");
      }

      setResult(data);
      setGameState("result");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleAnswerSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (gameState !== "playing" || !currentQuestion) return;

    const value = parseAnswer(currentInput);
    const nextAnswers = [...answers];
    nextAnswers[currentIndex] = value;
    setAnswers(nextAnswers);
    setCurrentInput("");

    if (currentIndex === questions.length - 1) {
      await submitGame(nextAnswers);
      return;
    }

    setCurrentIndex((prev) => prev + 1);
  }

  function resetToMenu() {
    setGameState("menu");
    setCurrentIndex(0);
    setCurrentInput("");
    setQuestions([]);
    setAnswers([]);
    setElapsed(0);
    setSeed("");
    setResult(null);
    setWarning(null);
    setError(null);
  }

  const accuracy = useMemo(() => {
    if (!result || result.total === 0) return 0;
    return Math.round((result.correctCount / result.total) * 100);
  }, [result]);

  return (
    <main className="dark min-h-[100dvh] bg-[radial-gradient(circle_at_top,_#0f172a,_#020617_55%,_#030712_100%)] px-4 py-8 text-slate-100 md:px-8 md:py-10">
      <div className="mx-auto w-full max-w-5xl">
        <AnimatePresence mode="wait">
          {gameState === "menu" && (
            <motion.div
              key="menu"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.24 }}
              className="rounded-3xl border border-white/10 bg-white/10 p-4 shadow-[0_18px_70px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:p-6"
            >
              <p className="inline-flex rounded-full border border-cyan-200/20 bg-cyan-200/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.25em] text-cyan-200">
                Menu Utama
              </p>
              <h1 className="mt-3 text-3xl font-black leading-tight sm:text-5xl">
                Physics Challenge
              </h1>
              <p className="mt-3 text-sm text-slate-300 sm:text-base">
                Pilih bab, sub-bab, mode, dan difficulty. Semua bermain di satu halaman.
              </p>

              <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/35 p-3">
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-slate-400">
                  Username
                </p>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username"
                  className="h-12 w-full rounded-xl border border-white/15 bg-white/8 px-4 text-base text-white outline-none ring-0 placeholder:text-slate-400 focus:border-cyan-300"
                />
              </div>

              <div className="mt-4 space-y-4">
                <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-3">
                  <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-slate-400">
                    Mode
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {modes.map((item) => (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => setMode(item.value)}
                        className={`min-h-14 rounded-xl px-3 py-2 text-left text-sm font-semibold transition ${
                          mode === item.value
                            ? "bg-fuchsia-300 text-slate-950"
                            : "bg-white/5 text-slate-100 active:bg-white/15"
                        }`}
                      >
                        <div>{item.label}</div>
                        <div className="text-xs opacity-80">{item.hint}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-3">
                  <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-slate-400">
                    Bab
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                    {babOptions.map((item) => (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => {
                          setSelectedBab(item.value);
                          setSelectedSubBab("all");
                        }}
                        className={`rounded-xl border px-3 py-3 text-left transition ${
                          selectedBab === item.value
                            ? "border-cyan-300 bg-cyan-300 text-slate-950"
                            : "border-white/10 bg-white/5 text-slate-100 active:bg-white/15"
                        }`}
                      >
                        <div className="text-sm font-bold">{item.label}</div>
                        <div className="text-xs opacity-80">{item.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-3">
                  <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-slate-400">
                    Sub-Bab
                  </p>
                  <select
                    value={selectedSubBab}
                    onChange={(e) => setSelectedSubBab(e.target.value as SubBabID)}
                    className="h-12 w-full rounded-xl border border-white/15 bg-white/10 px-3 text-sm font-semibold text-white outline-none focus:border-cyan-300"
                  >
                    {availableSubBabOptions.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-3">
                  <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-slate-400">
                    Difficulty
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {difficulties.map((item) => (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => setDifficulty(item.value)}
                        className={`min-h-12 rounded-xl px-3 py-2 text-sm font-semibold transition ${
                          difficulty === item.value
                            ? "bg-emerald-400 text-slate-950"
                            : "bg-white/5 text-slate-100 active:bg-white/15"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                type="button"
                disabled={isGenerating || username.trim().length < 3}
                onClick={startGame}
                className="mt-5 h-13 w-full rounded-xl bg-white text-base font-black text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {isGenerating ? "Menyiapkan soal..." : "Mulai Bermain"}
              </button>
            </motion.div>
          )}

          {gameState === "playing" && (
            <motion.div
              key="playing"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.24 }}
              className="rounded-3xl border border-white/10 bg-white/10 p-4 shadow-[0_18px_70px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:p-6"
            >
              <div className="mb-4 rounded-xl border border-slate-700 bg-slate-900/70 p-3">
                <div className="mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-[0.18em] text-slate-300">
                  <span>Waktu</span>
                  <span>
                    {Math.min(Math.round(elapsed), GAME_TIME_LIMIT_SECONDS)}s / {GAME_TIME_LIMIT_SECONDS}s
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-700">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 transition-all"
                    style={{ width: `${timerProgress}%` }}
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-950/55 p-4 text-center sm:p-6">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
                  Soal {currentIndex + 1} / {questions.length}
                </p>
                <p className="mt-3 text-2xl font-black leading-snug text-white sm:text-3xl">
                  {currentQuestion?.question ?? currentQuestion?.text}
                </p>
                <p className="mt-2 text-sm text-slate-300">Tekan Enter untuk kirim jawaban.</p>
              </div>

              <form onSubmit={handleAnswerSubmit} className="mt-4 space-y-3">
                <div className="h-2 overflow-hidden rounded-full bg-slate-700">
                  <div
                    className="h-full rounded-full bg-cyan-400 transition-all"
                    style={{ width: `${questionProgress}%` }}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    ref={inputRef}
                    value={currentInput}
                    onChange={(e) => setCurrentInput(e.target.value)}
                    inputMode="decimal"
                    type="number"
                    placeholder={`Jawaban (${currentQuestion?.unit ?? ""})`}
                    className="h-14 w-full rounded-xl border border-white/20 bg-white/10 px-4 text-center text-xl font-bold text-white outline-none ring-0 placeholder:text-slate-400 focus:border-cyan-300"
                  />
                  <div className="min-w-20 rounded-xl border border-white/15 bg-white/8 px-3 py-3 text-center text-sm font-bold text-slate-100">
                    {currentQuestion?.unit}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-14 w-full rounded-xl bg-emerald-500 text-base font-black text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-emerald-300"
                >
                  {isSubmitting
                    ? "Menghitung Skor..."
                    : currentIndex === questions.length - 1
                      ? "Submit Score"
                      : "Jawab & Lanjut"}
                </button>
              </form>
            </motion.div>
          )}

          {gameState === "result" && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.24 }}
              className="space-y-4"
            >
              <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur-xl sm:p-6">
                <h2 className="text-2xl font-black text-white sm:text-3xl">Hasil Akhir</h2>
                <p className="mt-2 text-sm text-slate-300">{result?.message}</p>

                <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <div className="rounded-xl bg-white/8 p-3 text-center">
                    <p className="text-xs uppercase tracking-wide text-slate-300">Skor</p>
                    <p className="text-2xl font-black text-emerald-300">{result?.score ?? 0}</p>
                  </div>
                  <div className="rounded-xl bg-white/8 p-3 text-center">
                    <p className="text-xs uppercase tracking-wide text-slate-300">Benar</p>
                    <p className="text-2xl font-black text-cyan-300">
                      {result?.correctCount ?? 0}/{result?.total ?? 0}
                    </p>
                  </div>
                  <div className="rounded-xl bg-white/8 p-3 text-center">
                    <p className="text-xs uppercase tracking-wide text-slate-300">Akurasi</p>
                    <p className="text-2xl font-black text-fuchsia-300">{accuracy}%</p>
                  </div>
                  <div className="rounded-xl bg-white/8 p-3 text-center">
                    <p className="text-xs uppercase tracking-wide text-slate-300">Durasi</p>
                    <p className="text-2xl font-black text-amber-300">{formatDuration(elapsed)}s</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={resetToMenu}
                  className="mt-4 h-12 w-full rounded-xl bg-white text-base font-black text-slate-950 transition hover:bg-cyan-200 sm:w-auto sm:px-6"
                >
                  Main Lagi
                </button>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur-xl sm:p-6">
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-300">
                  Leaderboard
                </p>
                <h3 className="mb-4 text-xl font-black text-white">Top 10 • {leaderboardCategory}</h3>
                <Leaderboard category={leaderboardCategory} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {warning && (
          <div className="mt-4 rounded-xl border border-amber-300 bg-amber-100 px-4 py-3 text-sm font-semibold text-amber-900">
            {warning}
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-xl border border-rose-300 bg-rose-100 px-4 py-3 text-sm font-semibold text-rose-900">
            {error}
          </div>
        )}
      </div>
    </main>
  );
}
