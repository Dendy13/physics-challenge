export type Difficulty = "simbol" | "teks";

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
  questions: PublicQuestion[];
}

export interface SubmitPayload {
  username: string;
  difficulty: Difficulty;
  seed: string;
  answers: number[];
  duration: number;
}

export interface LeaderboardEntry {
  id?: string;
  username: string;
  difficulty: Difficulty;
  score: number;
  correct_count: number;
  total_questions: number;
  duration: number;
  created_at?: string;
}
