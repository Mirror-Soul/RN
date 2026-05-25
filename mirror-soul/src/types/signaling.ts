/**
 * WebSocket 시그널링 메시지 타입 정의
 *
 * 이 파일의 data 필드 구조는 백엔드에 전달하여 서버측 검증 로직에 사용됩니다.
 * (백엔드 엔지니어에게 이 파일의 내용을 공유하세요)
 */

export type SignalingType =
  | 'JOIN'
  | 'LEAVE'
  | 'CALL_INVITE'
  | 'CALL_ACCEPT'
  | 'CALL_REJECT'
  | 'CALL_END'
  | 'OFFER'
  | 'ANSWER'
  | 'ICE';

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

/** data 필드 유니온 타입 */
export type SignalingData =
  | CallInviteData
  | AnswerData
  | OfferData
  | IceData
  | CallEndData;
