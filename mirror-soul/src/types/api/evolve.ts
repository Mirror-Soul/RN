import { ApiResponse } from './common';

/**
 * 성장(Evolve) 도메인 API 타입 정의
 * 백엔드 EvolveController(`/evolve`) 기준
 */

// ─────────────────────────────────────────────
// GET /evolve
// ─────────────────────────────────────────────
export interface TwinSyncResult {
  syncRate: number;
}

export type TwinSyncResponse = ApiResponse<TwinSyncResult>;

// ─────────────────────────────────────────────
// GET /evolve/voice
// ─────────────────────────────────────────────
export interface VoiceTrainingSentenceResult {
  sentenceId: number;
  speechLine: string;
}

export type VoiceTrainingSentenceResponse = ApiResponse<VoiceTrainingSentenceResult>;

// ─────────────────────────────────────────────
// POST /evolve/voice
// ─────────────────────────────────────────────
export interface CompleteVoiceUpdateRequest {
  sentenceId: number;
  audioObjectKey: string;
  durationSeconds?: number;
}

export interface VoiceUpdateJobResult {
  jobId: number;
  status: string;
}

export type VoiceUpdateJobResponse = ApiResponse<VoiceUpdateJobResult>;

// ─────────────────────────────────────────────
// GET /evolve/value-balance
// ─────────────────────────────────────────────
export type ValueBalanceAxis =
  | 'LOVE'
  | 'LIFESTYLE'
  | 'COMM'
  | 'DECISION'
  | 'SOCIAL'
  | 'PRIORITY'
  | 'TONE'
  | 'TASTE';

export interface ValueBalanceQuestionResult {
  questionId: number;
  axis: ValueBalanceAxis;
  leftLabel: string;
  rightLabel: string;
}

/** 오늘의 quota를 다 썼으면 result가 null(VALUE_BALANCE_DAILY_LIMIT_REACHED 성공코드)로 온다. */
export type ValueBalanceQuestionResponse = ApiResponse<ValueBalanceQuestionResult | null>;

// ─────────────────────────────────────────────
// POST /evolve/value-balance/{questionId}/answer
// ─────────────────────────────────────────────
export type ValueBalanceChosenSide = 'LEFT' | 'RIGHT';

export interface ValueBalanceAnswerRequest {
  chosenSide: ValueBalanceChosenSide;
}

export interface ValueBalanceAnswerResult {
  questionId: number;
  answeredCount: number;
  dailyLimit: number;
}

export type ValueBalanceAnswerResponse = ApiResponse<ValueBalanceAnswerResult>;
