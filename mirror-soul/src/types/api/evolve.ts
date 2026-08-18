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
  /** 누적 목소리 정밀 학습(음성 업데이트) 횟수 */
  voiceTrainingCount: number;
  /** 마지막 목소리 정밀 학습 시각. 한 번도 학습한 적 없으면 null. */
  lastVoiceTrainingAt: string | null;
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
  /** 오늘의 quota를 다 썼으면 questionId/axis/leftLabel/rightLabel이 전부 null로 온다(VALUE_BALANCE_DAILY_LIMIT_REACHED 성공코드). answeredCount/dailyLimit은 이 경우에도 항상 채워져 온다. */
  questionId: number | null;
  axis: ValueBalanceAxis | null;
  leftLabel: string | null;
  rightLabel: string | null;
  /** 오늘 답변한 질문 수 */
  answeredCount: number;
  /** 하루 최대 질문 수 */
  dailyLimit: number;
}

export type ValueBalanceQuestionResponse = ApiResponse<ValueBalanceQuestionResult>;

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
