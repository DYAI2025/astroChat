// AstroMirror Quiz Types – Cosmic Archetype System
// Generated from validated JSON schema

export interface DesignTokens {
  bg_primary: string;
  bg_surface: string;
  gold_primary: string;
  gold_muted: string;
  emerald_deep: string;
  text_ivory: string;
  text_mist: string;
}

export interface Disclaimer {
  short: string;
  full: string;
  display_mode: 'footer_always_full_on_result' | 'footer_short' | 'modal';
}

export interface QuizMeta {
  id: string;
  version: string;
  title: string;
  subtitle: string;
  description: string;
  estimated_duration_seconds: number;
  commercial_goal: string;
  design_tokens: DesignTokens;
  disclaimer: Disclaimer;
}

export type ElementKey = 'fire' | 'water' | 'air' | 'earth';
export type ModalityKey = 'cardinal' | 'fixed' | 'mutable';
export type OrientationKey = 'solar' | 'lunar';
export type ScoringKey = ElementKey | ModalityKey | OrientationKey;

export interface Scoring {
  fire?: number;
  water?: number;
  air?: number;
  earth?: number;
  cardinal?: number;
  fixed?: number;
  mutable?: number;
  solar?: number;
  lunar?: number;
}

export interface Answer {
  id: string;
  text: string;
  scoring: Scoring;
}

export interface Question {
  id: string;
  order: number;
  headline: string;
  question_text: string;
  question_subtext: string;
  image_gen_prompt: string;
  answers: Answer[];
}

export interface MatchingCriteria {
  primary: { key: ScoringKey; min_score: number };
  secondary: { key: ScoringKey; min_score: number };
  tertiary: { key: ScoringKey; min_score: number };
}

export interface TradingCardVisual {
  background: string;
  accent_color: string;
  symbol: string;
  border_style: string;
}

export interface Profile {
  id: string;
  archetype_name: string;
  archetype_subtitle: string;
  planet_association: string;
  element: ElementKey;
  modality: ModalityKey;
  orientation: OrientationKey;
  matching_criteria: MatchingCriteria;
  headline: string;
  description: string;
  strengths: string[];
  growth_edges: string[];
  cosmic_insight: string;
  image_gen_prompt: string;
  trading_card_visual: TradingCardVisual;
  bridge_text: string;
  cta_text: string;
  cta_url: string;
}

export interface FallbackProfile {
  id: string;
  archetype_name: string;
  archetype_subtitle: string;
  description: string;
  headline: string;
  bridge_text: string;
  image_gen_prompt: string;
  cta_text: string;
  cta_url: string;
}

export interface QuizData {
  quiz_meta: QuizMeta;
  questions: Question[];
  profiles: Profile[];
  fallback_profile: FallbackProfile;
}

// Session & Runtime Types

export interface QuizSession {
  id: string;
  started_at: string;
  answers: Record<string, string>; // question_id -> answer_id
  current_question: number;
  completed_at?: string;
  profile_id?: string;
}

export interface ScoreState {
  fire: number;
  water: number;
  air: number;
  earth: number;
  cardinal: number;
  fixed: number;
  mutable: number;
  solar: number;
  lunar: number;
}

export interface QuizResult {
  session_id: string;
  profile: Profile | FallbackProfile;
  scores: ScoreState;
  completed_at: string;
  is_fallback: boolean;
}

// API Types

export interface StartQuizResponse {
  session_id: string;
  first_question: Question;
  total_questions: number;
  meta: Pick<QuizMeta, 'title' | 'subtitle' | 'disclaimer'>;
}

export interface AnswerQuizRequest {
  session_id: string;
  question_id: string;
  answer_id: string;
}

export interface AnswerQuizResponse {
  next_question: Question | null;
  progress: {
    current: number;
    total: number;
  };
  is_complete: boolean;
  result_url?: string;
}

export interface GetResultResponse {
  result: QuizResult;
  design_tokens: DesignTokens;
  disclaimer: Disclaimer;
}
