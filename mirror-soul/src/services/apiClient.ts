import axios from 'axios';

const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;

if (!apiBaseUrl) {
  throw new Error('EXPO_PUBLIC_API_BASE_URL is not set. Please check your .env file.');
}

/**
 * API 클라이언트 (SoC: HTTP 통신 관심사 분리)
 * - Base URL: 환경 변수에서 로드
 * - 타임아웃: 10초 (모바일 네트워크 환경 고려)
 * - 응답 인터셉터: isSuccess === false → reject 변환 (DRY)
 *
 * 추후 JWT 인증이 필요해지면 request 인터셉터에
 * Authorization 헤더를 추가하면 됩니다. (OCP)
 */
const apiClient = axios.create({
  baseURL: apiBaseUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─────────────────────────────────────────────
// 응답 인터셉터
// 서버가 200으로 응답하되 isSuccess: false인 경우를
// 에러로 변환하여, 호출부에서 try/catch로 일관 처리
// ─────────────────────────────────────────────
apiClient.interceptors.response.use(
  (response) => {
    const data = response.data;
    if (data && data.isSuccess === false) {
      return Promise.reject({
        code: data.code,
        message: data.message || '요청 처리에 실패했습니다.',
        error: data.error,
      });
    }
    return response;
  },
  (error) => {
    // 네트워크 에러 / 타임아웃 등
    if (error.code === 'ECONNABORTED') {
      return Promise.reject({
        code: 'TIMEOUT',
        message: '서버 응답 시간이 초과되었습니다.',
        error: error.message,
      });
    }
    if (!error.response) {
      return Promise.reject({
        code: 'NETWORK_ERROR',
        message: '네트워크 연결을 확인해주세요.',
        error: error.message,
      });
    }

    // 서버가 에러 JSON(400, 500 등)을 응답으로 보낸 경우
    const data = error.response.data;
    if (data) {
      return Promise.reject({
        code: data.code || 'UNKNOWN_ERROR',
        message: data.message || '요청 처리에 실패했습니다.',
        error: data.error || error.message,
      });
    }

    return Promise.reject(error);
  }
);

export default apiClient;
