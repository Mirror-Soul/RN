import { ApiResponse } from './common';

/**
 * 매칭(Match) 도메인 API 타입 정의
 * 백엔드 MatchController(`/match`) 기준
 */

export type CallMediaType = 'VOICE' | 'VIDEO';

// ─────────────────────────────────────────────
// GET /match/twins
// ─────────────────────────────────────────────
export interface Twin {
  cloneUserUuid: string;
  name: string;
  age: number | null;
  profileImageUrl: string;
  twinAvatarImageUrl: string;
  twinSyncRate: number | null;
  twinSummary: string | null;
  latestCallId: number;
  latestCallMediaType: CallMediaType;
  lastCalledAt: string;
  totalCallCount: number;
}

export interface TwinListResult {
  totalCount: number;
  twins: Twin[];
}

export type TwinListResponse = ApiResponse<TwinListResult>;

// ─────────────────────────────────────────────
// GET /match/status
// ─────────────────────────────────────────────
export interface MatchingStatusResult {
  matchingEnabled: boolean;
}

export type MatchingStatusResponse = ApiResponse<MatchingStatusResult>;

// ─────────────────────────────────────────────
// PATCH /match/status
// ─────────────────────────────────────────────
export interface UpdateMatchingStatusRequest {
  matchingEnabled: boolean;
}
