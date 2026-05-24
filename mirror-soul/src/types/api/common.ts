/**
 * 서버 API 공통 응답 래퍼 (DRY)
 * 모든 API 엔드포인트에서 동일한 구조를 사용합니다.
 */
export interface ApiResponse<T> {
  isSuccess: boolean;
  code: string;
  message: string;
  result: T;
  error: string;
}
