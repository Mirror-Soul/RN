/**
 * 에러 객체에서 안전하게 메시지를 추출하는 전역 유틸리티 (DRY)
 */
export const getErrorMessage = (error: unknown, fallback = '알 수 없는 오류가 발생했습니다.'): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as Record<string, unknown>).message);
  }
  return fallback;
};
