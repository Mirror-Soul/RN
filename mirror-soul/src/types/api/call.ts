import { ApiResponse } from './common';

/**
 * 통화(Call) 도메인 API 타입 정의
 */

// ─────────────────────────────────────────────
// POST /calls/clones/{clone-user-uuid}
// ─────────────────────────────────────────────
export interface InitiateCallRequest {
  callerUserUuid: string;
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
export type InProgressResponse = ApiResponse<string>;

// ─────────────────────────────────────────────
// POST /calls/{call-id}/end
// ─────────────────────────────────────────────
export interface EndCallRequest {
  recordingUrl: string;
}

export interface EndCallResult {
  recordingUrl: string;
}

export type EndCallResponse = ApiResponse<EndCallResult>;
