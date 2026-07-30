/**
 * JWT 및 Base64 관련 유틸리티 함수 모음
 * SoC (관심사 분리) 원칙에 따라 상태 관리 파일(useAuthStore)에서 토큰 파싱 로직을 분리.
 */

/**
 * 브라우저의 atob()나 Node.js의 Buffer 없이 React Native 환경에서 순수 JS로 Base64를 디코딩하는 함수.
 */
export const decodeBase64 = (str: string): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let output = '';
  str = String(str).replace(/=+$/, '');
  
  for (
    let bc = 0, bs = 0, buffer, i = 0;
    (buffer = str.charAt(i++));
    ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer, bc++ % 4)
      ? (output += String.fromCharCode(255 & (bs >> ((-2 * bc) & 6))))
      : 0
  ) {
    buffer = chars.indexOf(buffer);
  }
  return output;
};

/**
 * JWT 토큰의 payload를 파싱하는 함수. 파싱 실패 시 null 반환.
 */
const decodeJwtPayload = (token: string): { exp?: number; [key: string]: unknown } | null => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      decodeBase64(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
};

/**
 * JWT 토큰의 만료 여부를 확인하는 함수.
 * @param token JWT 토큰 문자열
 * @returns 만료되었거나 비정상적인 토큰이면 true, 유효하면 false 반환
 */
export const isTokenExpired = (token: string | null): boolean => {
  if (!token) return true;

  const payload = decodeJwtPayload(token);

  // [리뷰 반영] exp가 없거나 숫자가 아니면 비정상 토큰으로 간주하여 만료(true) 처리
  // 보안 보수성(Fail-closed) 원칙 적용
  if (!payload || typeof payload.exp !== 'number') {
    return true;
  }

  return payload.exp * 1000 < Date.now();
};

/**
 * JWT 토큰의 만료까지 남은 시간(ms)을 반환하는 함수. 사전 갱신(pre-emptive refresh) 스케줄링에 사용.
 * @param token JWT 토큰 문자열
 * @returns 남은 시간(ms). 이미 만료되었거나 비정상 토큰이면 0 (fail-closed).
 */
export const getTokenRemainingMs = (token: string | null): number => {
  if (!token) return 0;

  const payload = decodeJwtPayload(token);
  if (!payload || typeof payload.exp !== 'number') {
    return 0;
  }

  return Math.max(0, payload.exp * 1000 - Date.now());
};
