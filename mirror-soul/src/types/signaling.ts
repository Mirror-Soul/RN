/**
 * WebSocket 시그널링 메시지 타입 정의
 *
 * 이 파일의 data 필드 구조는 백엔드에 전달하여 서버측 검증 로직에 사용됩니다.
 * (백엔드 엔지니어에게 이 파일의 내용을 공유하세요)
 */

export type SignalingType =
  | 'JOIN'
  | 'LEAVE'
  | 'JOINED'
  | 'CALL_INVITE'
  | 'CALL_ACCEPT'
  | 'CALL_REJECT'
  | 'CALL_END'
  | 'OFFER'
  | 'ANSWER'
  | 'ICE'
  | 'SIGNALING_ERROR';

/** WebSocket 메시지 공통 래퍼 */
export interface SignalingMessage {
  type: SignalingType;
  roomId: string | null;
  from: string;
  to: string;
  data: SignalingData | null;
}

// ─────────────────────────────────────────────
// data 필드 세부 타입 (메시지 종류별 확정 구조)
// ─────────────────────────────────────────────

/** CALL_INVITE / CALL_ACCEPT 공통 data 구조 */
export interface CallInviteData {
  callId: number;
  cloneUserUuid: string;
  mediaType: 'VOICE';
}
export type CallAcceptData = CallInviteData;

/** OFFER data 구조 */
export interface OfferData {
  callId: number;
  sdp: {
    type: 'offer';
    sdp: string;
  };
}

/** ANSWER data 구조 */
export interface AnswerData {
  callId: number;
  sdp: {
    type: 'answer';
    sdp: string;
  };
}

/** ICE data 구조 */
export interface IceData {
  callId: number;
  candidate: {
    candidate: string;
    sdpMid: string;
    sdpMLineIndex: number;
  };
}

/** CALL_END data 구조 */
export interface CallEndData {
  callId: number;
}

/**
 * CALL_REJECT data 구조 (2026-08-21, 백엔드 Fix/8-17 확인 중 추가).
 *
 * 두 발신 주체가 있다 — AI 서버(mirror-soul-AI)가 초대를 실제로 거절/실패 처리한 경우
 * (INVALID_CALL_INVITE/CLONE_NOT_FOUND/RDS_NOT_CONFIGURED/RDS_LOOKUP_FAILED, 이 4개는
 * 이전부터 있었음)와, 백엔드(mirror-soul-back)가 CALL_INVITE를 AI 서버로 릴레이조차
 * 못 한 경우(AI_SERVER_UNAVAILABLE, 이번에 추가) 모두 이 구조로 온다.
 */
export interface CallRejectData {
  callId?: number;
  reason:
    | 'INVALID_CALL_INVITE'
    | 'CLONE_NOT_FOUND'
    | 'RDS_NOT_CONFIGURED'
    | 'RDS_LOOKUP_FAILED'
    | 'AI_SERVER_UNAVAILABLE';
  detail: string;
}

/**
 * SIGNALING_ERROR data 구조 (신규 메시지 타입, 2026-08-21 백엔드 Fix/8-17에서 추가).
 *
 * OFFER/ANSWER/ICE/CALL_ACCEPT/CALL_END 등 CALL_INVITE 이외의 시그널링 메시지가 연결
 * 끊긴 상대방에게 전달되지 못했을 때, 백엔드가 발신자에게 대신 보내는 에러 알림.
 * (CALL_INVITE 전달 실패는 대신 CALL_REJECT/AI_SERVER_UNAVAILABLE로 온다 — 위 참고.)
 */
export interface SignalingErrorData {
  callId?: number;
  reason: 'RECEIVER_UNAVAILABLE';
  detail: string;
}

/** data 필드 유니온 타입 */
export type SignalingData =
  | CallInviteData
  | AnswerData
  | OfferData
  | IceData
  | CallEndData
  | CallRejectData
  | SignalingErrorData;
