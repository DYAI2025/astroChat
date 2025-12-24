export interface DbQuizSession {
  id: string;
  user_id: string;
  started_at: string;
  completed_at: string | null;
  answers: Record<string, string>;
  current_question: number;
}

export interface DbQuizResult {
  id: string;
  session_id: string;
  user_id: string;
  profile_id: string;
  scores: {
    fire: number;
    water: number;
    air: number;
    earth: number;
    cardinal: number;
    fixed: number;
    mutable: number;
    solar: number;
    lunar: number;
  };
  is_fallback: boolean;
  completed_at: string;
  created_at: string;
}

export interface DbProfile {
  id: string;
  created_at: string;
  updated_at: string;
}
