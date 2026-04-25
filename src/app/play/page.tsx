"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import type {
  Category,
  DifficultyLevel,
  GamePayload,
  Mode,
  PublicQuestion,
} from "@/types/game";

type SubmitResult = {
  score: number;
  correctCount: number;
  total: number;
  message: string;
};

const DEFAULT_COUNT = 10;
const GAME_TIME_LIMIT_SECONDS = 180;

function parseModeParam(value: string | null): Mode {
  if (value === "simbol" || value === "teks") {
    return value;
  }

  return "simbol";
}

function parseDifficultyParam(value: string | null): DifficultyLevel {
  if (value === "easy" || value === "medium" || value === "hard") {
    return value;
  }

  return "easy";
}

function parseCategoryParam(value: string | null): Category {
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

function formatDuration(seconds: number): string {
  return seconds.toFixed(2);
}

export default function PlayPage() {
  const [username, setUsername] = useState("");
  const [mode, setMode] = useState<Mode>(() => {
    if (typeof window === "undefined") return "simbol";
    const params = new URLSearchParams(window.location.search);
    return parseModeParam(params.get("mode"));
  });
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(() => {
    if (typeof window === "undefined") return "easy";
    const params = new URLSearchParams(window.location.search);
    return parseDifficultyParam(params.get("difficulty"));
  });
  const [category, setCategory] = useState<Category>(() => {
    if (typeof window === "undefined") return "mix";
    const params = new URLSearchParams(window.location.search);
    return parseCategoryParam(params.get("category"));
  });
  const [seed, setSeed] = useState("");
  const [questions, setQuestions] = useState<PublicQuestion[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const tick = () => {
      if (started && !finished && startRef.current !== null) {
        setElapsed((performance.now() - startRef.current) / 1000);
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    if (started && !finished) {
      rafRef.current = requestAnimationFrame(tick);
    }

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [started, finished]);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.hidden && started && !finished) {
        setWarning("Kecurangan terdeteksi: kamu berpindah tab selama permainan.");
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [started, finished]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [currentIndex, started, finished]);

  const currentQuestion = questions[currentIndex];

  const progress = useMemo(() => {
    if (!questions.length) return 0;
    return Math.round(((currentIndex + 1) / questions.length) * 100);
  }, [currentIndex, questions.length]);

  const timeProgress = useMemo(() => {
    return Math.min((elapsed / GAME_TIME_LIMIT_SECONDS) * 100, 100);
  }, [elapsed]);

  async function startGame() {
    setError(null);
    setWarning(null);
    setResult(null);
    setIsGenerating(true);

    try {
      const res = await fetch(
        `/api/generate?mode=${mode}&difficulty=${difficulty}&category=${category}&count=${DEFAULT_COUNT}`,
        { method: "GET" },
      );

      if (!res.ok) {
        throw new Error("Gagal mengambil soal.");
      }

      const payload = (await res.json()) as GamePayload;
      setSeed(payload.seed);
      setMode(payload.mode);
      setDifficulty(payload.difficulty);
      setCategory(payload.category ?? category);
      setQuestions(payload.questions);
      setAnswers(Array(payload.questions.length).fill(""));
      setCurrentIndex(0);
      setCurrentAnswer("");
      setStarted(true);
      setFinished(false);
      setElapsed(0);
      startRef.current = performance.now();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsGenerating(false);
    }
  }

  function updateAnswer(value: string) {
    setCurrentAnswer(value);
    setAnswers((prev) => {
      const next = [...prev];
      next[currentIndex] = value;
      return next;
    });
  }

  async function submitGame(finalAnswers = answers) {
    if (!started || finished) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const numericAnswers = finalAnswers.map((answer) => Number.parseFloat(answer || "0"));
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          mode,
          difficulty,
          category,
          seed,
          answers: numericAnswers,
          duration: elapsed,
        }),
      });

      const data = (await res.json()) as SubmitResult & { error?: string };

      if (!res.ok) {
        throw new Error(data.error || "Submit gagal");
      }

      setResult(data);
      setFinished(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleAnswer(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!started || finished || !currentQuestion) return;

    const nextAnswers = [...answers];
    nextAnswers[currentIndex] = currentAnswer;
    setAnswers(nextAnswers);
    setCurrentAnswer("");

    if (currentIndex === questions.length - 1) {
      await submitGame(nextAnswers);
      return;
    }

    setCurrentIndex((index) => index + 1);
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#dbeafe,_#f8fafc_40%,_#e2e8f0_100%)] px-4 py-6 text-slate-900 md:px-8 md:py-10">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-4xl items-center justify-center">
        <div className="w-full rounded-[2rem] border border-white/60 bg-white/85 p-6 shadow-[0_25px_80px_rgba(15,23,42,0.12)] backdrop-blur md:p-10">
          <div className="mb-6 flex flex-col items-center justify-between gap-4 text-center md:flex-row md:text-left">
            <div>
              <p className="mb-2 inline-flex rounded-full bg-slate-900 px-3 py-1 text-xs font-bold uppercase tracking-[0.25em] text-white">
                Physics Challenge
              </p>
              <h1 className="text-3xl font-black tracking-tight md:text-4xl">
                Sprint fisika, jawab secepat mungkin.
              </h1>
            </div>
            <div className="rounded-3xl bg-slate-950 px-5 py-4 text-white shadow-lg shadow-slate-950/20">
              <p className="text-[0.7rem] uppercase tracking-[0.35em] text-slate-300">Timer</p>
              <p className="mt-1 text-4xl font-black tabular-nums md:text-5xl">
                {formatDuration(elapsed)}
              </p>
              <p className="text-sm text-slate-300">detik</p>
            </div>
          </div>

          {started && !finished && (
            <div className="mb-6 rounded-xl border border-slate-700 bg-slate-900/70 p-3">
              <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-widest text-slate-300">
                <span>Progress Waktu</span>
                <span>{Math.min(Math.round(elapsed), GAME_TIME_LIMIT_SECONDS)}s / {GAME_TIME_LIMIT_SECONDS}s</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-700">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 transition-all"
                  style={{ width: `${timeProgress}%` }}
                />
              </div>
            </div>
          )}

          {!started && (
            <div className="mx-auto grid max-w-2xl gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-5 md:grid-cols-2 md:p-6">
              <label className="flex flex-col gap-2 md:col-span-1">
                <span className="text-sm font-semibold text-slate-700">Username</span>
                <input
                  className="h-14 rounded-2xl border border-slate-300 bg-white px-4 text-center text-lg font-semibold outline-none transition focus:border-blue-500 focus:ring-0"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="contoh: dendy"
                />
              </label>

              <label className="flex flex-col gap-2 md:col-span-1">
                <span className="text-sm font-semibold text-slate-700">Mode Soal</span>
                <select
                  className="h-14 rounded-2xl border border-slate-300 bg-white px-4 text-center text-lg font-semibold outline-none transition focus:border-blue-500 focus:ring-0"
                  value={mode}
                  onChange={(e) => setMode(parseModeParam(e.target.value))}
                >
                  <option value="simbol">Simbol</option>
                  <option value="teks">Teks</option>
                </select>
              </label>

              <label className="flex flex-col gap-2 md:col-span-1">
                <span className="text-sm font-semibold text-slate-700">Difficulty</span>
                <select
                  className="h-14 rounded-2xl border border-slate-300 bg-white px-4 text-center text-lg font-semibold outline-none transition focus:border-blue-500 focus:ring-0"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </label>

              <label className="flex flex-col gap-2 md:col-span-2">
                <span className="text-sm font-semibold text-slate-700">Kategori</span>
                <select
                  className="h-14 rounded-2xl border border-slate-300 bg-white px-4 text-center text-lg font-semibold outline-none transition focus:border-blue-500 focus:ring-0"
                  value={category}
                  onChange={(e) => setCategory(parseCategoryParam(e.target.value))}
                >
                  <option value="mix">Mix</option>
                  <option value="kinematika">Kinematika</option>
                  <option value="dinamika">Dinamika</option>
                  <option value="termodinamika">Termodinamika</option>
                  <option value="listrik">Listrik</option>
                </select>
              </label>

              <button
                type="button"
                disabled={isGenerating || username.trim().length < 3}
                onClick={startGame}
                className="h-14 rounded-2xl bg-slate-900 text-base font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400 md:col-span-2"
              >
                {isGenerating ? "Menyiapkan soal..." : "Mulai Challenge"}
              </button>
            </div>
          )}

          {started && currentQuestion && !finished && (
            <form onSubmit={handleAnswer} className="space-y-5">
              <div className="h-3 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="rounded-[2rem] border border-slate-200 bg-slate-950 px-6 py-8 text-center text-white shadow-xl shadow-slate-900/10 md:px-10 md:py-12">
                <p className="mb-3 text-sm font-semibold uppercase tracking-[0.35em] text-cyan-300">
                  Soal {currentIndex + 1} dari {questions.length}
                </p>
                <p className="mx-auto max-w-3xl text-2xl font-black leading-snug md:text-4xl">
                  {currentQuestion.text}
                </p>
                <p className="mt-4 text-sm text-slate-300">Jawab cepat, tekan Enter untuk lanjut.</p>
              </div>

              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <input
                  ref={inputRef}
                  className="h-16 w-full rounded-2xl border border-slate-300 bg-white px-4 text-center text-2xl font-bold tracking-tight outline-none transition focus:border-blue-500 focus:ring-0 md:text-3xl"
                  type="number"
                  inputMode="decimal"
                  value={currentAnswer}
                  onChange={(e) => updateAnswer(e.target.value)}
                  placeholder={`Jawaban (${currentQuestion.unit})`}
                  aria-label="Jawaban soal"
                />
                <div className="rounded-2xl bg-slate-100 px-5 py-4 text-center text-sm font-bold uppercase tracking-[0.25em] text-slate-700 md:min-w-28">
                  {currentQuestion.unit}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="h-14 w-full rounded-2xl bg-emerald-600 text-base font-bold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-emerald-300"
              >
                {isSubmitting
                  ? "Menghitung Skor..."
                  : currentIndex === questions.length - 1
                    ? "Submit Score"
                    : "Kirim Jawaban"}
              </button>
            </form>
          )}

          {result && (
            <div className="mt-6 rounded-3xl border border-emerald-200 bg-emerald-50 p-5 text-center md:p-6">
              <h2 className="text-2xl font-black text-emerald-950">Hasil Challenge</h2>
              <p className="mt-2 text-emerald-800">{result.message}</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-500">Skor</p>
                  <p className="mt-1 text-2xl font-black text-slate-900">{result.score}</p>
                </div>
                <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-500">Benar</p>
                  <p className="mt-1 text-2xl font-black text-slate-900">
                    {result.correctCount}/{result.total}
                  </p>
                </div>
                <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-500">Waktu</p>
                  <p className="mt-1 text-2xl font-black text-slate-900">{formatDuration(elapsed)}s</p>
                </div>
              </div>
            </div>
          )}

          {warning && (
            <div className="mt-6 rounded-2xl border border-amber-300 bg-amber-100 px-4 py-3 text-center font-semibold text-amber-900">
              {warning}
            </div>
          )}

          {error && (
            <div className="mt-6 rounded-2xl border border-rose-300 bg-rose-100 px-4 py-3 text-center font-semibold text-rose-900">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
