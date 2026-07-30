import { getErrorCode, getErrorDisplayMessage, isAuthError, isConflictError } from './apiErrorCode';

describe('getErrorCode', () => {
  it('extracts the code field from an error-like object', () => {
    expect(getErrorCode({ code: 'USER_NOT_FOUND', message: '존재하지 않는 사용자입니다.' })).toBe('USER_NOT_FOUND');
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

  it('falls back to the backend-provided message when no override exists', () => {
    expect(getErrorDisplayMessage({ code: 'DUPLICATE_NICKNAME', message: '이미 사용 중인 닉네임입니다.' })).toBe(
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
  it('returns true for duplicate/conflict codes', () => {
    expect(isConflictError({ code: 'DUPLICATE_NICKNAME' })).toBe(true);
    expect(isConflictError({ code: 'DUPLICATE_EMAIL' })).toBe(true);
    expect(isConflictError({ code: 'DUPLICATE_LOGINID' })).toBe(true);
  });

  it('returns false for unrelated codes', () => {
    expect(isConflictError({ code: 'USER_NOT_FOUND' })).toBe(false);
    expect(isConflictError(undefined)).toBe(false);
  });
});

describe('isAuthError', () => {
  it('returns true for auth-related codes', () => {
    expect(isAuthError({ code: 'INVALID_TOKEN' })).toBe(true);
    expect(isAuthError({ code: 'TOKEN_EXPIRED' })).toBe(true);
    expect(isAuthError({ code: 'MISSING_AUTH_INFO' })).toBe(true);
    expect(isAuthError({ code: 'AUTH_FAILED' })).toBe(true);
  });

  it('returns false for unrelated codes', () => {
    expect(isAuthError({ code: 'DUPLICATE_NICKNAME' })).toBe(false);
    expect(isAuthError(undefined)).toBe(false);
  });
});
