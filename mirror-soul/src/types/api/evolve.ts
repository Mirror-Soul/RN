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
