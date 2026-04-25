"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Difficulty, GamePayload, PublicQuestion } from "@/types/game";

type SubmitResult = {
  score: number;
  correctCount: number;
  total: number;
  message: string;
};

const DEFAULT_COUNT = 10;

function formatDuration(seconds: number): string {
  return seconds.toFixed(2);
}

export default function PlayPage() {
  const [username, setUsername] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("simbol");
  const [seed, setSeed] = useState("");
  const [questions, setQuestions] = useState<PublicQuestion[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [elapsed, setElapsed] = useState(0);
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

  const currentQuestion = questions[currentIndex];

  const progress = useMemo(() => {
    if (!questions.length) return 0;
    return Math.round(((currentIndex + 1) / questions.length) * 100);
  }, [currentIndex, questions.length]);

  async function startGame() {
    setError(null);
    setWarning(null);
    setResult(null);
    setLoading(true);

    try {
      const res = await fetch(
        `/api/generate?difficulty=${difficulty}&count=${DEFAULT_COUNT}`,
        { method: "GET" },
      );

      if (!res.ok) throw new Error("Gagal mengambil soal.");

      const payload = (await res.json()) as GamePayload;
      setSeed(payload.seed);
      setQuestions(payload.questions);
      setAnswers(Array(payload.questions.length).fill(""));
      setCurrentIndex(0);
      setStarted(true);
      setFinished(false);
      setElapsed(0);
      startRef.current = performance.now();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  function updateAnswer(value: string) {
    setAnswers((prev) => {
      const next = [...prev];
      next[currentIndex] = value;
      return next;
    });
  }

  function goNext() {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((idx) => idx + 1);
    }
  }

  function goPrev() {
    if (currentIndex > 0) {
      setCurrentIndex((idx) => idx - 1);
    }
  }

  async function submitGame() {
    if (!started || finished) return;

    setLoading(true);
    setError(null);

    try {
      const numericAnswers = answers.map((ans) => Number.parseFloat(ans || "0"));
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          difficulty,
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
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8">
      <div className="mx-auto max-w-4xl rounded-3xl bg-white p-6 shadow-xl md:p-10">
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
              Physics Challenge
            </h1>
            <p className="text-slate-600">Sprint fisika untuk skor berbasis kecepatan.</p>
          </div>
          <div className="rounded-2xl bg-slate-900 px-4 py-3 text-right text-white">
            <p className="text-xs uppercase tracking-widest text-slate-300">Stopwatch</p>
            <p className="text-2xl font-bold tabular-nums">{formatDuration(elapsed)} s</p>
          </div>
        </div>

        {!started && (
          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-slate-700">Username</span>
              <input
                className="rounded-xl border border-slate-300 px-4 py-3 outline-none ring-blue-500 transition focus:ring"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="contoh: dendy"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-slate-700">Mode Soal</span>
              <select
                className="rounded-xl border border-slate-300 px-4 py-3 outline-none ring-blue-500 transition focus:ring"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as Difficulty)}
              >
                <option value="simbol">Model Simbol (Sprint Physics)</option>
                <option value="teks">Model Teks (Concept Mastery)</option>
              </select>
            </label>

            <button
              type="button"
              disabled={loading || username.trim().length < 3}
              onClick={startGame}
              className="md:col-span-2 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              {loading ? "Menyiapkan soal..." : "Mulai Challenge"}
            </button>
          </div>
        )}

        {started && currentQuestion && !finished && (
          <div className="space-y-5">
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full bg-blue-600 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="mb-2 text-sm font-semibold text-slate-500">
                Soal {currentIndex + 1} / {questions.length}
              </p>
              <p className="text-lg font-semibold leading-relaxed text-slate-900">
                {currentQuestion.text}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <input
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-lg outline-none ring-blue-500 transition focus:ring"
                type="number"
                inputMode="decimal"
                value={answers[currentIndex] || ""}
                onChange={(e) => updateAnswer(e.target.value)}
                placeholder={`Jawaban (${currentQuestion.unit})`}
              />
              <span className="rounded-lg bg-slate-200 px-3 py-2 text-slate-700">
                {currentQuestion.unit}
              </span>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={goPrev}
                disabled={currentIndex === 0}
                className="rounded-xl border border-slate-300 px-4 py-2 font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Sebelumnya
              </button>

              {currentIndex < questions.length - 1 ? (
                <button
                  type="button"
                  onClick={goNext}
                  className="rounded-xl bg-slate-900 px-4 py-2 font-semibold text-white transition hover:bg-slate-700"
                >
                  Lanjut
                </button>
              ) : (
                <button
                  type="button"
                  onClick={submitGame}
                  disabled={loading}
                  className="rounded-xl bg-emerald-600 px-4 py-2 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
                >
                  {loading ? "Mengirim skor..." : "Submit Score"}
                </button>
              )}
            </div>
          </div>
        )}

        {result && (
          <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
            <h2 className="text-xl font-bold text-emerald-900">Hasil Challenge</h2>
            <p className="mt-2 text-emerald-800">{result.message}</p>
            <p className="mt-1 text-emerald-800">Skor: {result.score}</p>
            <p className="text-emerald-800">
              Benar: {result.correctCount} / {result.total}
            </p>
          </div>
        )}

        {warning && (
          <div className="mt-6 rounded-xl border border-amber-300 bg-amber-100 px-4 py-3 text-amber-900">
            {warning}
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-xl border border-rose-300 bg-rose-100 px-4 py-3 text-rose-900">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
