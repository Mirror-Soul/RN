/**
 * 백엔드(GeneralErrorCode) 및 apiClient 자체 합성 코드를 아우르는 공통 에러코드 유틸리티.
 *
 * 목적은 "번역"이 아니라 "코드 기반 동작 분기"다 — 백엔드가 이미 적절한 한글 메시지를
 * `error.message`로 내려주므로, 대부분은 그 메시지를 그대로 보여주면 된다. 여기서는
 * (a) 매직 스트링 방지를 위한 타입, (b) 화면별로 다른 UX가 필요한 코드만 예외적으로
 * 오버라이드하는 메시지 매핑, (c) 카테고리 판별 헬퍼를 제공한다.
 */

/**
 * 백엔드 GeneralErrorCode 전수 (backend-schema.json errorCodes 기준, 스냅샷 이후 추가된 코드는 직접 보충).
 * VALUE_BALANCE_* 4개는 backend-schema.json 스냅샷에 없어(가치관 밸런스 게임 기능 자체가 스냅샷 이후 추가됨)
 * GeneralErrorCode.java에서 직접 확인해 추가함.
 */
export type BackendErrorCode =
  | 'DUPLICATE_LOGINID'
  | 'NOT_AGREED_TERM'
  | 'EMAIL_CODE_ATTEMPT_EXCEEDED'
  | 'MISSING_AUTH_INFO'
  | 'INVALID_LOGIN'
  | 'INVALID_TOKEN'
  | 'TOKEN_EXPIRED'
  | 'EMAIL_NOT_VERIFIED'
  | 'FORBIDDEN'
  | 'MISSING_PARAMETER'
  | 'INVALID_PARAMETER'
  | 'UNSUPPORTED_CONTENT_TYPE'
  | 'API_NOT_FOUND'
  | 'METHOD_NOT_ALLOWED'
  | 'FILE_EMPTY'
  | 'UNSUPPORTED_FILE_TYPE'
  | 'FILE_TOO_LARGE'
  | 'S3_UPLOAD_FAILED'
  | 'S3_DELETE_FAILED'
  | 'S3_CONNECTION_FAILED'
  | 'INTERNAL_SERVER_ERROR'
  | 'SERVICE_UNAVAILABLE'
  | 'EXTERNAL_SERVICE_TIMEOUT'
  | 'USER_NOT_FOUND'
  | 'DUPLICATE_EMAIL'
  | 'DUPLICATE_NICKNAME'
  | 'REGION_NOT_FOUND'
  | 'EMAIL_NOT_FOUND'
  | 'EMAIL_CODE_NOT_REQUESTED'
  | 'EMAIL_CODE_EXPIRED'
  | 'EMAIL_CODE_MISMATCH'
  | 'EMAIL_ALREADY_VERIFIED'
  | 'EMAIL_SEND_FAILED'
  | 'CLONE_NOT_FOUND'
  | 'CALL_NOT_FOUND'
  | 'CALL_ALREADY_ENDED'
  | 'INSUFFICIENT_TALK_TIME'
  | 'MEETING_REQUEST_NOT_FOUND'
  | 'MEETING_REQUEST_ALREADY_PENDING'
  | 'MEETING_REQUEST_ALREADY_PROCESSED'
  | 'MEETING_CHAT_ALREADY_EXISTS'
  | 'MEETING_INVALID_CALL'
  | 'MEETING_SELF_REQUEST'
  | 'MEETING_RECEIVER_INACTIVE'
  | 'CHAT_ROOM_NOT_FOUND'
  | 'CHAT_MESSAGE_NOT_FOUND'
  | 'CHAT_ROOM_ACCESS_DENIED'
  | 'VALUE_BALANCE_QUESTION_NOT_FOUND'
  | 'VALUE_BALANCE_ALREADY_ANSWERED'
  | 'VALUE_BALANCE_DAILY_LIMIT_REACHED'
  | 'VALUE_BALANCE_NO_AVAILABLE_QUESTION'
  // 아래 3개도 VALUE_BALANCE_*와 같은 이유로 스냅샷엔 없음(발견 탭 추천/스와이프 기능 자체가
  // 스냅샷 이후 추가) — RecommendationDetailService/SwipeService 소스에서 직접 확인해 추가함.
  | 'RECOMMENDATION_TARGET_NOT_FOUND'
  | 'SWIPE_SELF_NOT_ALLOWED'
  | 'SWIPE_TARGET_UNAVAILABLE';

/** apiClient.ts 응답 인터셉터가 전송 계층 실패에 대해 자체적으로 합성하는 코드 */
export type ClientSyntheticErrorCode = 'AUTH_FAILED' | 'TIMEOUT' | 'NETWORK_ERROR' | 'UNKNOWN_ERROR';

export type ApiErrorCode = BackendErrorCode | ClientSyntheticErrorCode;

interface ApiErrorLike {
  code?: string;
  message?: string;
}

const DEFAULT_FALLBACK_MESSAGE = '알 수 없는 오류가 발생했습니다.';

/**
 * 코드별로 백엔드 메시지 대신 FE에서 보여주고 싶은 문구가 있을 때만 등록한다.
 * 등록되지 않은 코드는 백엔드가 내려준 error.message를 그대로 사용한다.
 */
const CODE_MESSAGE_OVERRIDES: Partial<Record<ApiErrorCode, string>> = {
  TIMEOUT: '서버 응답이 지연되고 있습니다. 잠시 후 다시 시도해주세요.',
  NETWORK_ERROR: '네트워크 연결을 확인해주세요.',
};

/** 에러 객체에서 code 필드를 안전하게 추출 */
export const getErrorCode = (error: unknown): ApiErrorCode | undefined => {
  if (error && typeof error === 'object' && 'code' in error) {
    return (error as ApiErrorLike).code as ApiErrorCode | undefined;
  }
  return undefined;
};

/**
 * 사용자에게 보여줄 에러 메시지를 결정한다.
 * 우선순위: FE 오버라이드 메시지 → 백엔드가 보낸 error.message → fallback
 */
export const getErrorDisplayMessage = (error: unknown, fallback = DEFAULT_FALLBACK_MESSAGE): string => {
  const code = getErrorCode(error);
  if (code && CODE_MESSAGE_OVERRIDES[code]) {
    return CODE_MESSAGE_OVERRIDES[code]!;
  }
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as ApiErrorLike).message;
    if (typeof message === 'string' && message.length > 0) {
      return message;
    }
  }
  return fallback;
};

/** 중복/충돌류 에러 (닉네임, 이메일 등) — 화면에서 Alert 대신 폼 인라인 에러로 보여줄지 분기할 때 사용 */
export const isConflictError = (error: unknown): boolean => {
  const code = getErrorCode(error);
  return code === 'DUPLICATE_NICKNAME' || code === 'DUPLICATE_EMAIL' || code === 'DUPLICATE_LOGINID';
};

/** 인증 만료/무효 에러 — 재로그인 유도가 필요한지 분기할 때 사용 */
export const isAuthError = (error: unknown): boolean => {
  const code = getErrorCode(error);
  return (
    code === 'INVALID_TOKEN' ||
    code === 'TOKEN_EXPIRED' ||
    code === 'MISSING_AUTH_INFO' ||
    code === 'AUTH_FAILED'
  );
};
