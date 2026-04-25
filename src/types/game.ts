export type Mode = "simbol" | "teks";
export type DifficultyLevel = "easy" | "medium" | "hard";
export type Difficulty = DifficultyLevel;
export type BabID = "mekanika" | "energi" | "fluida" | "listrik" | "modern";
export type SubBabID =
  | "all"
  | "vektor"
  | "gerak_lurus"
  | "glb_glbb"
  | "hukum_newton"
  | "resultan_gaya"
  | "usaha"
  | "energi_kinetik"
  | "energi_potensial"
  | "energi_mekanik"
  | "momentum"
  | "impuls"
  | "tekanan"
  | "fluida_statis"
  | "fluida_dinamis"
  | "hukum_pascal"
  | "hukum_archimedes"
  | "hukum_ohm"
  | "arus_listrik"
  | "rangkaian_seri"
  | "rangkaian_paralel"
  | "daya_listrik"
  | "listrik_statis"
  | "modern_atom"
  | "radioaktivitas"
  | "relativitas_dasar";
export type Category =
  | "kinematika"
  | "dinamika"
  | "listrik"
  | "mix"
  | "termodinamika";

export interface Question {
  id: string;
  question: string;
  unit: string;
  correctAnswer: number;
  explanation: string;
  bab?: BabID;
  subBab?: SubBabID;
  text?: string;
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
  bab?: BabID;
  subBab?: SubBabID;
  questions: PublicQuestion[];
}

export interface SubmitPayload {
  username: string;
  mode: Mode;
  difficulty: DifficultyLevel;
  category?: Category;
  bab?: BabID;
  subBab?: SubBabID;
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
  bab?: BabID;
  subBab?: SubBabID;
  score: number;
  correct_count: number;
  total_questions: number;
  duration: number;
  created_at?: string;
}
