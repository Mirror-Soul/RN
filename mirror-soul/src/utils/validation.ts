/**
 * 이메일 형식이 유효한지 검사합니다.
 * @param email 검사할 이메일 문자열
 * @returns 유효한 이메일 형식일 경우 true
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
/**
 * 비밀번호 정규식 — 백엔드(JoinReqDTO/PasswordResetReqDTO)와 동일한 규칙.
 * - 8~20자
 * - 영문자(대소문자) 1개 이상 + 숫자 1개 이상 필수
 * - 특수문자(!@#$%^&*()_+=-)는 허용되지만 필수는 아님
 */
export const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+=-]{8,20}$/;

/**
 * 비밀번호 유효성 검사
 * @param password 검사할 비밀번호 문자열
 * @returns 유효한 비밀번호 형식일 경우 true
 */
export const isValidPassword = (password: string): boolean => {
  return PASSWORD_REGEX.test(password);
};
