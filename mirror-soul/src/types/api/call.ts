import { ApiResponse } from './common';

/**
 * 통화(Call) 도메인 API 타입 정의
 */

// ─────────────────────────────────────────────
// POST /calls/clones/{clone-user-uuid}
// ─────────────────────────────────────────────
export interface InitiateCallRequest {
  /** 호출자는 Bearer 토큰에서 서버가 식별한다. */
  mediaType: 'VOICE';
}

export interface InitiateCallResult {
  callId: number;
  roomId: string;
  mediaType: 'VOICE';
  status: string;
  callerSignalId: string;
  aiSignalId: string;
  signalingUrl: string;
}

export type InitiateCallResponse = ApiResponse<InitiateCallResult>;

// ─────────────────────────────────────────────
// PATCH /calls/{call-id}/in-progress
// ─────────────────────────────────────────────
export type InProgressResponse = ApiResponse<null>;

// ─────────────────────────────────────────────
// POST /calls/{call-id}/end
// ─────────────────────────────────────────────
export interface EndCallRequest {
  recordingUrl: string;
}

export interface EndCallResult {
  callId: number;
  status: string;
  durationSec: number;
  remainingTalkTime: number;
}

export type EndCallResponse = ApiResponse<EndCallResult>;
