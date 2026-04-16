/**
 * 이메일 형식이 유효한지 검사합니다.
 * @param email 검사할 이메일 문자열
 * @returns 유효한 이메일 형식일 경우 true
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
