import { ApiResponse } from './common';

/**
 * 성장(Evolve) 도메인 API 타입 정의
 * 백엔드 EvolveController(`/evolve`) 기준
 */

// ─────────────────────────────────────────────
// GET /evolve
// ─────────────────────────────────────────────
export interface TwinSyncResult {
  /** 트윈 READY 이전에는 null이다. */
  syncRate: number | null;
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
  /** 현재 세트가 잠겼거나 전체 과정을 완료했으면 null이다. */
  questionId: number | null;
  axis: ValueBalanceAxis | null;
  leftLabel: string | null;
  rightLabel: string | null;
  /** 현재 진행 중인 세트 번호(1부터 시작). */
  currentSet: number;
  /** 현재 세트에서 답한 질문 수. */
  answeredInSet: number;
  /** 세트 하나의 질문 수. */
  setSize: number;
  /** 전체 세트 수. */
  totalSets: number;
  /** 전체 누적 답변 수. */
  totalAnswered: number;
  /** 세트 분석 대기 중인지 여부. */
  locked: boolean;
  /** 다음 세트가 열리는 시각. 잠기지 않았으면 null. */
  lockedUntil: string | null;
  /** 전체 가치관 밸런스 과정을 모두 완료했는지 여부. */
  completed: boolean;
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
  currentSet: number;
  answeredInSet: number;
  setSize: number;
  totalSets: number;
  totalAnswered: number;
  locked: boolean;
  lockedUntil: string | null;
  completed: boolean;
  analysisJobId: number | null;
}

export type ValueBalanceAnswerResponse = ApiResponse<ValueBalanceAnswerResult>;
