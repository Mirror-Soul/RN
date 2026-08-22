import { getErrorCode, getErrorDisplayMessage, isAuthError, isConflictError } from './apiErrorCode';

describe('getErrorCode', () => {
  it('translates a backend wire code ("PREFIX_NNNN") to its BackendErrorCode name', () => {
    // apiClient.ts가 실제로 넘기는 값은 GeneralErrorCode.getCode()의 wire 형식이지,
    // Java enum 이름 자체가 아니다 — 이 번역이 getErrorCode의 핵심 책임이다.
    expect(getErrorCode({ code: 'USER_4040', message: '존재하지 않는 사용자입니다.' })).toBe('USER_NOT_FOUND');
    expect(getErrorCode({ code: 'AUTH_4012' })).toBe('INVALID_TOKEN');
    expect(getErrorCode({ code: 'VALUE_BALANCE_4090' })).toBe('VALUE_BALANCE_ALREADY_ANSWERED');
    expect(getErrorCode({ code: 'VOICE_TRAINING_4290' })).toBe('VOICE_TRAINING_TOO_FREQUENT');
  });

  it('passes client-synthesized codes through unchanged (already final form)', () => {
    expect(getErrorCode({ code: 'TIMEOUT' })).toBe('TIMEOUT');
    expect(getErrorCode({ code: 'NETWORK_ERROR' })).toBe('NETWORK_ERROR');
    expect(getErrorCode({ code: 'AUTH_FAILED' })).toBe('AUTH_FAILED');
  });

  it('returns undefined for a wire code with no known mapping', () => {
    expect(getErrorCode({ code: 'SOME_FUTURE_BACKEND_CODE' })).toBeUndefined();
  });

  it('returns undefined for non-object or code-less errors', () => {
    expect(getErrorCode('plain string error')).toBeUndefined();
    expect(getErrorCode(new Error('boom'))).toBeUndefined();
    expect(getErrorCode(undefined)).toBeUndefined();
  });
});

describe('getErrorDisplayMessage', () => {
  it('uses the FE override message when one is registered for the code', () => {
    expect(getErrorDisplayMessage({ code: 'TIMEOUT', message: 'backend timeout text' })).toBe(
      '서버 응답이 지연되고 있습니다. 잠시 후 다시 시도해주세요.'
    );
    expect(getErrorDisplayMessage({ code: 'NETWORK_ERROR', message: 'backend network text' })).toBe(
      '네트워크 연결을 확인해주세요.'
    );
  });

  it('overrides English backend messages (value-balance/voice-training) with Korean', () => {
    expect(
      getErrorDisplayMessage({ code: 'VOICE_TRAINING_4290', message: 'Voice training can be submitted once every 2 minutes.' })
    ).toBe('목소리 학습은 2분에 한 번만 가능합니다.');
    expect(
      getErrorDisplayMessage({ code: 'VALUE_BALANCE_4090', message: 'This question was already answered today.' })
    ).toBe('오늘 이미 답변한 질문입니다.');
  });

  it('falls back to the backend-provided message when no override exists', () => {
    expect(getErrorDisplayMessage({ code: 'USER_4091', message: '이미 사용 중인 닉네임입니다.' })).toBe(
      '이미 사용 중인 닉네임입니다.'
    );
  });

  it('falls back to the provided fallback when there is no code and no message', () => {
    expect(getErrorDisplayMessage({}, '기본 오류 메시지')).toBe('기본 오류 메시지');
    expect(getErrorDisplayMessage(null, '기본 오류 메시지')).toBe('기본 오류 메시지');
  });

  it('uses the default fallback message when none is provided', () => {
    expect(getErrorDisplayMessage(null)).toBe('알 수 없는 오류가 발생했습니다.');
  });
});

describe('isConflictError', () => {
  it('returns true for duplicate/conflict wire codes', () => {
    expect(isConflictError({ code: 'USER_4091' })).toBe(true); // DUPLICATE_NICKNAME
    expect(isConflictError({ code: 'USER_4090' })).toBe(true); // DUPLICATE_EMAIL
    expect(isConflictError({ code: 'AUTH_4000' })).toBe(true); // DUPLICATE_LOGINID
  });

  it('returns false for unrelated codes', () => {
    expect(isConflictError({ code: 'USER_4040' })).toBe(false); // USER_NOT_FOUND
    expect(isConflictError(undefined)).toBe(false);
  });
});

describe('isAuthError', () => {
  it('returns true for auth-related wire codes', () => {
    expect(isAuthError({ code: 'AUTH_4012' })).toBe(true); // INVALID_TOKEN
    expect(isAuthError({ code: 'AUTH_4013' })).toBe(true); // TOKEN_EXPIRED
    expect(isAuthError({ code: 'AUTH_4010' })).toBe(true); // MISSING_AUTH_INFO
    expect(isAuthError({ code: 'AUTH_FAILED' })).toBe(true);
  });

  it('returns false for unrelated codes', () => {
    expect(isAuthError({ code: 'USER_4091' })).toBe(false); // DUPLICATE_NICKNAME
    expect(isAuthError(undefined)).toBe(false);
  });
});
