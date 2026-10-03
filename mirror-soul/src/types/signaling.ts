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

/**
 * CALL_INVITE / CALL_ACCEPT 공통 data 구조 (2026-10-03, Backend #185 · AI #40).
 *
 * callId만 담는다. 백엔드가 data의 필드 구성을 정확히 검사하므로 cloneUserUuid·mediaType 같은
 * 필드를 더 넣으면 SIGNALING_ERROR(INVALID_MESSAGE)로 거부된다. 클론·음성·mediaType은 AI 서버가
 * callId로 백엔드 내부 API(`GET /internal/ai/calls/{callId}/context`)에서 조회하고, RN은
 * mediaType을 통화 생성 REST 응답 기준으로 다룬다.
 */
export interface CallInviteData {
  callId: number;
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
 * 두 발신 주체가 있다 — AI 서버(mirror-soul-AI)가 초대를 실제로 거절/실패 처리한 경우와,
 * 백엔드(mirror-soul-back)가 CALL_INVITE를 AI 서버로 릴레이조차 못 한 경우(AI_SERVER_UNAVAILABLE)
 * 모두 이 구조로 온다.
 *
 * 2026-10-03 AI #40부터 AI는 DB 대신 백엔드 내부 API로 통화 컨텍스트를 조회하고, 그 결과에 따라
 * CALL_CONTEXT_* · INVALID_CALL_STATUS · CLONE_NOT_READY · AI_SERVER_CONFIG_ERROR로 거절한다.
 * CLONE_NOT_FOUND/RDS_* 는 그 이전 AI 서버가 보내던 값이라 롤백 대비로만 남겨 둔다.
 */
export interface CallRejectData {
  callId?: number;
  reason:
    | 'INVALID_CALL_INVITE'
    | 'CALL_CONTEXT_NOT_FOUND'
    | 'CALL_CONTEXT_UNAVAILABLE'
    | 'CALL_CONTEXT_MISMATCH'
    | 'INVALID_CALL_CONTEXT'
    | 'INVALID_CALL_STATUS'
    | 'CLONE_NOT_READY'
    | 'AI_SERVER_CONFIG_ERROR'
    | 'AI_SERVER_UNAVAILABLE'
    | 'CLONE_NOT_FOUND'
    | 'RDS_NOT_CONFIGURED'
    | 'RDS_LOOKUP_FAILED';
  detail: string;
}

/**
 * SIGNALING_ERROR data 구조 (신규 메시지 타입, 2026-08-21 백엔드 Fix/8-17에서 추가).
 *
 * OFFER/ANSWER/ICE/CALL_ACCEPT/CALL_END 등 CALL_INVITE 이외의 시그널링 메시지가 연결
 * 끊긴 상대방에게 전달되지 못했을 때, 백엔드가 발신자에게 대신 보내는 에러 알림.
 * (CALL_INVITE 전달 실패는 대신 CALL_REJECT/AI_SERVER_UNAVAILABLE로 온다 — 위 참고.)
 *
 * 2026-10-03 Backend #185부터는 메시지 형식·방향·발신자 검증에 실패해도 INVALID_MESSAGE로 온다.
 * 이때는 roomId·callId가 없을 수 있다.
 */
export interface SignalingErrorData {
  callId?: number;
  reason: 'RECEIVER_UNAVAILABLE' | 'INVALID_MESSAGE';
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
