/**
 * 백엔드(GeneralErrorCode) 및 apiClient 자체 합성 코드를 아우르는 공통 에러코드 유틸리티.
 *
 * 목적은 "번역"이 아니라 "코드 기반 동작 분기"다 — 백엔드가 이미 적절한 한글 메시지를
 * `error.message`로 내려주므로, 대부분은 그 메시지를 그대로 보여주면 된다. 여기서는
 * (a) 매직 스트링 방지를 위한 타입, (b) 화면별로 다른 UX가 필요한 코드만 예외적으로
 * 오버라이드하는 메시지 매핑, (c) 카테고리 판별 헬퍼를 제공한다.
 *
 * 주의: 응답의 `code` 필드(`ApiResponse.onFailure` → `GeneralErrorCode.getCode()`)는
 * `"AUTH_4012"`, `"VALUE_BALANCE_4290"` 같은 "PREFIX_NNNN" 형식의 wire 값이지,
 * 아래 `BackendErrorCode`처럼 사람이 읽기 좋은 Java enum 이름이 아니다. `getErrorCode()`가
 * `BACKEND_WIRE_CODE`를 이용해 wire 값을 이 파일의 이름으로 역매핑해주므로, 이 파일 밖에서는
 * 항상 `BackendErrorCode` 이름으로만 비교하면 된다 — 절대 "AUTH_4012" 같은 wire 문자열을
 * 직접 코드에 하드코딩하지 말 것.
 */

/**
 * 백엔드 GeneralErrorCode 전수(60개, GeneralErrorCode.java 기준 2026-08-19 확인).
 * 카테고리 구분은 백엔드 파일의 주석 그룹과 동일한 순서를 유지한다 — 새 코드가 추가되면
 * 백엔드 파일과 나란히 놓고 diff하기 쉽도록.
 */
export type BackendErrorCode =
  // 인증 에러
  | 'DUPLICATE_LOGINID'
  | 'NOT_AGREED_TERM'
  | 'EMAIL_CODE_ATTEMPT_EXCEEDED'
  | 'MISSING_AUTH_INFO'
  | 'INVALID_LOGIN'
  | 'INVALID_TOKEN'
  | 'TOKEN_EXPIRED'
  | 'EMAIL_NOT_VERIFIED'
  | 'FORBIDDEN'
  // 요청/파라미터 에러
  | 'MISSING_PARAMETER'
  | 'INVALID_PARAMETER'
  | 'UNSUPPORTED_CONTENT_TYPE'
  // API/라우팅 에러
  | 'API_NOT_FOUND'
  | 'METHOD_NOT_ALLOWED'
  // 파일 업로드 에러
  | 'FILE_EMPTY'
  | 'UNSUPPORTED_FILE_TYPE'
  | 'FILE_TOO_LARGE'
  // S3 관련 에러
  | 'S3_UPLOAD_FAILED'
  | 'S3_DELETE_FAILED'
  | 'S3_CONNECTION_FAILED'
  // 서버 내부 에러
  | 'INTERNAL_SERVER_ERROR'
  | 'SERVICE_UNAVAILABLE'
  | 'EXTERNAL_SERVICE_TIMEOUT'
  // 유저 관련 에러
  | 'USER_NOT_FOUND'
  | 'DUPLICATE_EMAIL'
  | 'DUPLICATE_NICKNAME'
  // 지역 관련 에러
  | 'REGION_NOT_FOUND'
  // 스와이프 관련 에러
  | 'SWIPE_SELF_NOT_ALLOWED'
  | 'SWIPE_TARGET_UNAVAILABLE'
  // 추천 관련 에러
  | 'RECOMMENDATION_TARGET_NOT_FOUND'
  // 이메일 인증 에러
  | 'EMAIL_NOT_FOUND'
  | 'EMAIL_CODE_NOT_REQUESTED'
  | 'EMAIL_CODE_EXPIRED'
  | 'EMAIL_CODE_MISMATCH'
  | 'EMAIL_ALREADY_VERIFIED'
  | 'EMAIL_SEND_FAILED'
  // 비밀번호 재설정 에러
  | 'PASSWORD_RESET_NOT_VERIFIED'
  | 'PASSWORD_CONFIRM_MISMATCH'
  // 클론 관련 에러
  | 'CLONE_NOT_FOUND'
  // 통화 관련 에러
  | 'CALL_NOT_FOUND'
  | 'CALL_ALREADY_ENDED'
  | 'INSUFFICIENT_TALK_TIME'
  | 'CALL_ACCESS_DENIED'
  | 'TALK_LOG_NOT_FOUND'
  | 'TALK_LOG_UPDATE_FORBIDDEN'
  // 만남 신청 관련 오류
  | 'MEETING_REQUEST_NOT_FOUND'
  | 'MEETING_REQUEST_ALREADY_PENDING'
  | 'MEETING_REQUEST_ALREADY_PROCESSED'
  | 'MEETING_CHAT_ALREADY_EXISTS'
  | 'MEETING_INVALID_CALL'
  | 'MEETING_SELF_REQUEST'
  | 'MEETING_RECEIVER_INACTIVE'
  // 채팅 관련 오류
  | 'CHAT_ROOM_NOT_FOUND'
  | 'CHAT_MESSAGE_NOT_FOUND'
  | 'CHAT_ROOM_ACCESS_DENIED'
  // 가치관 밸런스 게임 관련 오류
  | 'VALUE_BALANCE_QUESTION_NOT_FOUND'
  | 'VALUE_BALANCE_ALREADY_ANSWERED'
  | 'VALUE_BALANCE_DAILY_LIMIT_REACHED'
  | 'VALUE_BALANCE_NO_AVAILABLE_QUESTION'
  // 목소리 정밀 학습 관련 오류
  | 'VOICE_TRAINING_TOO_FREQUENT';

/** apiClient.ts 응답 인터셉터가 전송 계층 실패에 대해 자체적으로 합성하는 코드 (이미 최종 형태라 별도 역매핑 불필요) */
export type ClientSyntheticErrorCode = 'AUTH_FAILED' | 'TIMEOUT' | 'NETWORK_ERROR' | 'UNKNOWN_ERROR';

export type ApiErrorCode = BackendErrorCode | ClientSyntheticErrorCode;

const CLIENT_SYNTHETIC_CODES: readonly ClientSyntheticErrorCode[] = [
  'AUTH_FAILED',
  'TIMEOUT',
  'NETWORK_ERROR',
  'UNKNOWN_ERROR',
];

/**
 * BackendErrorCode → 실제 wire 코드(GeneralErrorCode.getCode(), "PREFIX_NNNN" 형식).
 * GeneralErrorCode.java의 두 번째 생성자 인자를 그대로 옮긴 것 — 백엔드 코드가 바뀌면
 * 이 표만 갱신하면 되고, 소비하는 쪽(isConflictError 등)은 손댈 필요 없다.
 */
const BACKEND_WIRE_CODE: Record<BackendErrorCode, string> = {
  DUPLICATE_LOGINID: 'AUTH_4000',
  NOT_AGREED_TERM: 'AUTH_4001',
  EMAIL_CODE_ATTEMPT_EXCEEDED: 'AUTH_4002',
  MISSING_AUTH_INFO: 'AUTH_4010',
  INVALID_LOGIN: 'AUTH_4011',
  INVALID_TOKEN: 'AUTH_4012',
  TOKEN_EXPIRED: 'AUTH_4013',
  EMAIL_NOT_VERIFIED: 'AUTH_4014',
  FORBIDDEN: 'AUTH_4030',

  MISSING_PARAMETER: 'REQ_4000',
  INVALID_PARAMETER: 'REQ_4001',
  UNSUPPORTED_CONTENT_TYPE: 'REQ_4150',

  API_NOT_FOUND: 'API_4040',
  METHOD_NOT_ALLOWED: 'API_4050',

  FILE_EMPTY: 'FILE_4000',
  UNSUPPORTED_FILE_TYPE: 'FILE_4150',
  FILE_TOO_LARGE: 'FILE_4130',

  S3_UPLOAD_FAILED: 'S3_5000',
  S3_DELETE_FAILED: 'S3_5001',
  S3_CONNECTION_FAILED: 'S3_5002',

  INTERNAL_SERVER_ERROR: 'SERVER_5001',
  SERVICE_UNAVAILABLE: 'SERVER_5031',
  EXTERNAL_SERVICE_TIMEOUT: 'SERVER_5041',

  USER_NOT_FOUND: 'USER_4040',
  DUPLICATE_EMAIL: 'USER_4090',
  DUPLICATE_NICKNAME: 'USER_4091',

  REGION_NOT_FOUND: 'REGION_4040',

  SWIPE_SELF_NOT_ALLOWED: 'SWIPE_4000',
  SWIPE_TARGET_UNAVAILABLE: 'SWIPE_4040',

  RECOMMENDATION_TARGET_NOT_FOUND: 'RECOMMENDATION_4040',

  EMAIL_NOT_FOUND: 'EMAIL_4000',
  EMAIL_CODE_NOT_REQUESTED: 'EMAIL_4001',
  EMAIL_CODE_EXPIRED: 'EMAIL_4002',
  EMAIL_CODE_MISMATCH: 'EMAIL_4003',
  EMAIL_ALREADY_VERIFIED: 'EMAIL_4004',
  EMAIL_SEND_FAILED: 'EMAIL_5000',

  PASSWORD_RESET_NOT_VERIFIED: 'PASSWORD_4030',
  PASSWORD_CONFIRM_MISMATCH: 'PASSWORD_4000',

  CLONE_NOT_FOUND: 'CLONE_4000',

  CALL_NOT_FOUND: 'CALL_4040',
  CALL_ALREADY_ENDED: 'CALL_4000',
  INSUFFICIENT_TALK_TIME: 'CALL_4001',
  CALL_ACCESS_DENIED: 'CALL_4030',
  TALK_LOG_NOT_FOUND: 'TALK_LOG_4040',
  TALK_LOG_UPDATE_FORBIDDEN: 'TALK_LOG_4030',

  MEETING_REQUEST_NOT_FOUND: 'MEETING_4040',
  MEETING_REQUEST_ALREADY_PENDING: 'MEETING_4090',
  MEETING_REQUEST_ALREADY_PROCESSED: 'MEETING_4091',
  MEETING_CHAT_ALREADY_EXISTS: 'MEETING_4092',
  MEETING_INVALID_CALL: 'MEETING_4000',
  MEETING_SELF_REQUEST: 'MEETING_4001',
  MEETING_RECEIVER_INACTIVE: 'MEETING_4002',

  CHAT_ROOM_NOT_FOUND: 'CHAT_4040',
  CHAT_MESSAGE_NOT_FOUND: 'CHAT_4041',
  CHAT_ROOM_ACCESS_DENIED: 'CHAT_4030',

  VALUE_BALANCE_QUESTION_NOT_FOUND: 'VALUE_BALANCE_4040',
  VALUE_BALANCE_ALREADY_ANSWERED: 'VALUE_BALANCE_4090',
  VALUE_BALANCE_DAILY_LIMIT_REACHED: 'VALUE_BALANCE_4290',
  VALUE_BALANCE_NO_AVAILABLE_QUESTION: 'VALUE_BALANCE_5030',

  VOICE_TRAINING_TOO_FREQUENT: 'VOICE_TRAINING_4290',
};

/** wire 코드 → BackendErrorCode 역매핑. BACKEND_WIRE_CODE에서 한 번만 파생시켜 두 표가 어긋날 일이 없다. */
const WIRE_CODE_TO_BACKEND_ERROR_CODE: Record<string, BackendErrorCode> = Object.fromEntries(
  (Object.entries(BACKEND_WIRE_CODE) as [BackendErrorCode, string][]).map(([name, wireCode]) => [wireCode, name])
);

interface ApiErrorLike {
  code?: string;
  message?: string;
}

const DEFAULT_FALLBACK_MESSAGE = '알 수 없는 오류가 발생했습니다.';

/**
 * 코드별로 백엔드 메시지 대신 FE에서 보여주고 싶은 문구가 있을 때만 등록한다.
 * 등록되지 않은 코드는 백엔드가 내려준 error.message를 그대로 사용한다.
 * VALUE_BALANCE 계열/VOICE_TRAINING_TOO_FREQUENT는 백엔드 메시지 자체가 영어라(다른 코드는 한글)
 * 여기서 한글로 대체한다.
 */
const CODE_MESSAGE_OVERRIDES: Partial<Record<ApiErrorCode, string>> = {
  TIMEOUT: '서버 응답이 지연되고 있습니다. 잠시 후 다시 시도해주세요.',
  NETWORK_ERROR: '네트워크 연결을 확인해주세요.',
  VALUE_BALANCE_QUESTION_NOT_FOUND: '질문을 찾을 수 없습니다. 다시 시도해주세요.',
  VALUE_BALANCE_ALREADY_ANSWERED: '오늘 이미 답변한 질문입니다.',
  VALUE_BALANCE_DAILY_LIMIT_REACHED: '오늘의 질문을 모두 완료했습니다.',
  VALUE_BALANCE_NO_AVAILABLE_QUESTION: '지금은 답변할 수 있는 질문이 없습니다. 잠시 후 다시 시도해주세요.',
  VOICE_TRAINING_TOO_FREQUENT: '목소리 학습은 2분에 한 번만 가능합니다.',
};

/**
 * 에러 객체에서 code 필드를 안전하게 추출한다.
 * 백엔드가 보내는 code는 wire 형식("AUTH_4012" 등)이라 BackendErrorCode 이름으로 역매핑하고,
 * apiClient가 자체 합성하는 코드(TIMEOUT 등)는 이미 최종 형태이므로 그대로 통과시킨다.
 * 어느 쪽에도 없는 코드(아직 이 파일에 등록 안 된 새 백엔드 코드 등)는 undefined를 반환한다 —
 * 실제로는 아닌데 ApiErrorCode인 척 반환하지 않기 위해서다.
 */
export const getErrorCode = (error: unknown): ApiErrorCode | undefined => {
  if (!error || typeof error !== 'object' || !('code' in error)) {
    return undefined;
  }
  const rawCode = (error as ApiErrorLike).code;
  if (!rawCode) return undefined;

  if ((CLIENT_SYNTHETIC_CODES as readonly string[]).includes(rawCode)) {
    return rawCode as ClientSyntheticErrorCode;
  }
  return WIRE_CODE_TO_BACKEND_ERROR_CODE[rawCode];
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
