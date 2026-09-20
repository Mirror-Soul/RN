import { ApiResponse } from './common';

/**
 * 만남 신청(Meeting) 도메인 API 타입 정의
 * 백엔드 MeetingController(`/match/meeting`) 기준
 */

export type MeetingRequestStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

// ─────────────────────────────────────────────
// GET /match/meeting/requests
// ─────────────────────────────────────────────
export interface MeetingRequestItem {
  requestId: number;
  senderUserUuid: string;
  name: string;
  age: number | null;
  profileImageUrl: string;
  lastActiveAt: string | null;
  /** CallMatchAnalysis가 COMPLETED 상태로 분석되기 전까지는 아래 3개 필드 전부 비어있다(null/빈 배열). */
  twinSimilarity: number | null;
  message: string;
  conversationSummary: string | null;
  summaryPoints: string[];
  requestedAt: string;
}

export interface MeetingRequestListResult {
  totalCount: number;
  requests: MeetingRequestItem[];
}

export type MeetingRequestListResponse = ApiResponse<MeetingRequestListResult>;

// ─────────────────────────────────────────────
// POST /match/meeting/requests
// ─────────────────────────────────────────────
export interface CreateMeetingRequestPayload {
  receiverUserUuid: string;
  /** 이 통화가 실제로 COMPLETED 상태이고, 요청자 본인이 건 통화여야 백엔드가 통과시킨다. */
  videoCallId: number;
  message: string;
}

export interface CreatedMeetingRequestResult {
  requestId: number;
  status: MeetingRequestStatus;
  requestedAt: string;
}

export type CreatedMeetingRequestResponse = ApiResponse<CreatedMeetingRequestResult>;

// ─────────────────────────────────────────────
// POST /match/meeting/requests/{request-id}/reject
// ─────────────────────────────────────────────
export interface RespondedMeetingRequestResult {
  requestId: number;
  status: MeetingRequestStatus;
  respondedAt: string;
}

export type RespondedMeetingRequestResponse = ApiResponse<RespondedMeetingRequestResult>;

// ─────────────────────────────────────────────
// POST /match/meeting/requests/{request-id}/accept
// ─────────────────────────────────────────────
export interface AcceptedMeetingRequestResult {
  requestId: number;
  status: MeetingRequestStatus;
  chatRoomId: number;
  /** 이미 수락되어 있던 요청을 재수락한 경우 false — 기존 방을 그대로 리턴한 것뿐이라 새로 만들어진 게 아님. */
  chatRoomCreated: boolean;
  respondedAt: string;
}

export type AcceptedMeetingRequestResponse = ApiResponse<AcceptedMeetingRequestResult>;
