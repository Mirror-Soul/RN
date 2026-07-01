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
 * JWT 토큰의 만료 여부를 확인하는 함수.
 * @param token JWT 토큰 문자열
 * @returns 만료되었거나 비정상적인 토큰이면 true, 유효하면 false 반환
 */
export const isTokenExpired = (token: string | null): boolean => {
  if (!token) return true;
  
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      decodeBase64(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    const payload = JSON.parse(jsonPayload);
    
    // [리뷰 반영] exp가 없거나 숫자가 아니면 비정상 토큰으로 간주하여 만료(true) 처리
    // 보안 보수성(Fail-closed) 원칙 적용
    if (!payload.exp || typeof payload.exp !== 'number') {
      return true;
    }
    
    return payload.exp * 1000 < Date.now();
  } catch (error) {
    // 파싱 중 에러가 발생해도 안전하게 만료(true) 처리
    return true;
  }
};
