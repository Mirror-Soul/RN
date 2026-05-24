import axios from 'axios';
import { router } from 'expo-router';
import { useAuthStore } from '../store/useAuthStore';
import { logger } from '../utils/logger';
import { tokenStorage } from '../utils/tokenStorage';

const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;

if (!apiBaseUrl) {
  throw new Error('EXPO_PUBLIC_API_BASE_URL is not set. Please check your .env file.');
}

const apiClient = axios.create({
  baseURL: apiBaseUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─────────────────────────────────────────────
// 요청 인터셉터
// ─────────────────────────────────────────────
apiClient.interceptors.request.use(async (config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null) => {
  failedQueue.forEach(prom => {
    if (error) { prom.reject(error); }
    else { prom.resolve(token); }
  });
  failedQueue = [];
};

// ─────────────────────────────────────────────
// 응답 인터셉터
// ─────────────────────────────────────────────
apiClient.interceptors.response.use(
  (response) => {
    const data = response.data;
    if (data && data.isSuccess === false) {
      logger.warn(`apiClient: Response success flag is false`, { url: response.config.url, message: data.message });
      return Promise.reject({
        code: data.code,
        message: data.message || '요청 처리에 실패했습니다.',
        error: data.error,
      });
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // 401 Unauthorized 에러 시 처리
    if (error.response?.status === 401) {
      // [고도화] 인증 경로별 예외 처리 (각각 다른 응답 정책)
      const isLoginPath = originalRequest?.url?.includes('/auth/login');
      const isRefreshPath = originalRequest?.url?.includes('/auth/refresh');
      const isLogoutPath = originalRequest?.url?.includes('/auth/logout');

      if (isLoginPath || isRefreshPath) {
        logger.warn(`apiClient: Auth failed on ${originalRequest?.url}. Skipping refresh.`);
        return Promise.reject({
          code: 'AUTH_FAILED',
          message: '이메일 또는 비밀번호가 일치하지 않습니다.',
          error: error.message,
        });
      }

      // 로그아웃 중 401은 이미 세션이 만료된 것 → 즉시 에러 반환 (상위 finally가 로컬 정리)
      if (isLogoutPath) {
        logger.warn('apiClient: Logout returned 401 (session already expired).');
        return Promise.reject(error);
      }

      // 일반 API 호출 중 401 발생 시에만 토큰 갱신 시도
      if (!originalRequest._retry) {
        logger.info('apiClient: 401 detected on normal request. Attempting refresh...');

        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then(token => {
            originalRequest.headers = originalRequest.headers ?? {};
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          }).catch(err => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const refreshToken = await tokenStorage.getRefreshToken();
          if (!refreshToken) throw new Error("No refresh token");

          const { data } = await apiClient.post('/auth/refresh', { refreshToken });

          if (data.isSuccess) {
            await useAuthStore.getState().updateToken(data.result.accessToken, data.result.refreshToken);
            processQueue(null, data.result.accessToken);
            originalRequest.headers = originalRequest.headers ?? {};
            originalRequest.headers.Authorization = `Bearer ${data.result.accessToken}`;
            return apiClient(originalRequest);
          } else {
            throw new Error('Refresh failed by server');
          }
        } catch (refreshError) {
          processQueue(refreshError, null);
          await useAuthStore.getState().logout();
          router.replace('/');
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }
    }

    if (error.code === 'ECONNABORTED') {
      logger.error('apiClient: Request timeout', originalRequest?.url);
      return Promise.reject({
        code: 'TIMEOUT',
        message: '서버 응답 시간이 초과되었습니다.',
        error: error.message,
      });
    }

    if (!error.response) {
      logger.error('apiClient: Network error', error.message);
      return Promise.reject({
        code: 'NETWORK_ERROR',
        message: '네트워크 연결을 확인해주세요.',
        error: error.message,
      });
    }

    const data = error.response.data;
    if (data) {
      logger.error('apiClient: Server returned error', { status: error.response.status, url: originalRequest?.url, data });
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
