export type Mode = "simbol" | "teks";
export type DifficultyLevel = "easy" | "medium" | "hard";
export type Difficulty = DifficultyLevel;
export type Category =
  | "kinematika"
  | "dinamika"
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
  mode: Mode;
  difficulty: DifficultyLevel;
  category?: Category;
  questions: PublicQuestion[];
}

export interface SubmitPayload {
  username: string;
  mode: Mode;
  difficulty: DifficultyLevel;
  category?: Category;
  seed: string;
  answers: number[];
  duration: number;
}

export interface LeaderboardEntry {
  id?: string;
  username: string;
  mode?: Mode;
  difficulty: DifficultyLevel;
  category?: Category;
  score: number;
  correct_count: number;
  total_questions: number;
  duration: number;
  created_at?: string;
}
