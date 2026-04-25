export type DifficultyLevel = "easy" | "medium" | "hard";
export type LegacyDifficulty = "simbol" | "teks";
export type Difficulty = DifficultyLevel | LegacyDifficulty;
export type Category =
  | "kinematika"
  | "dinamika"
  | "termodinamika"
  | "listrik"
  | "mix";

export interface Question {
  id: string;
  text: string;
  unit: string;
  correctAnswer: number;
}

export interface PublicQuestion {
  id: string;
  text: string;
  unit: string;
}

export interface GamePayload {
  seed: string;
  difficulty: Difficulty;
  category?: Category;
  questions: PublicQuestion[];
}

export interface SubmitPayload {
  username: string;
  difficulty: Difficulty;
  category?: Category;
  seed: string;
  answers: number[];
  duration: number;
}

export interface LeaderboardEntry {
  id?: string;
  username: string;
  difficulty: Difficulty;
  category?: Category;
  score: number;
  correct_count: number;
  total_questions: number;
  duration: number;
  created_at?: string;
}
