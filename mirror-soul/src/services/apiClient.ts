import axios from 'axios';
import { router } from 'expo-router';
import { useAuthStore } from '../store/useAuthStore';
import { logger } from '../utils/logger';
import { tokenStorage } from '../utils/tokenStorage';
import { showGlobalToast } from '../components/common/Toast/ToastProvider';
import { queryClient } from './queryClient';

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

/**
 * Access token 갱신. 401 리액티브 갱신과 사전(pre-emptive) 갱신이 동시에 호출되어도
 * isRefreshing/failedQueue로 직렬화되어 실제 /auth/refresh 호출은 한 번만 나간다.
 */
export const refreshAccessToken = async (): Promise<string> => {
  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    }) as Promise<string>;
  }

  isRefreshing = true;

  try {
    const refreshToken = await tokenStorage.getRefreshToken();
    if (!refreshToken) throw new Error('No refresh token');

    const { data } = await apiClient.post('/auth/refresh', { refreshToken });

    if (!data.isSuccess) throw new Error('Refresh failed by server');

    await useAuthStore.getState().updateToken(data.result.accessToken, data.result.refreshToken);
    processQueue(null, data.result.accessToken);
    return data.result.accessToken;
  } catch (refreshError) {
    processQueue(refreshError, null);
    await useAuthStore.getState().logout();
    queryClient.clear(); // 만료된 세션의 캐시된 서버 상태(닉네임, 잔액 등)를 남기지 않는다
    showGlobalToast('세션이 만료되어 다시 로그인해주세요.', 'info');
    router.replace('/');
    throw refreshError;
  } finally {
    isRefreshing = false;
  }
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

    // 401 Unauthorized 또는 403 Forbidden 에러 시 처리 (백엔드에서 만료된 토큰을 403으로 응답함)
    if (error.response?.status === 401 || error.response?.status === 403) {
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

      // 로그아웃 중 401/403은 이미 세션이 만료된 것 → 즉시 에러 반환 (상위 finally가 로컬 정리)
      if (isLogoutPath) {
        logger.warn('apiClient: Logout returned 401/403 (session already expired).');
        return Promise.reject(error);
      }

      // 일반 API 호출 중 401/403 발생 시에만 토큰 갱신 시도
      if (!originalRequest._retry) {
        logger.info(`apiClient: ${error.response.status} detected on normal request. Attempting refresh...`);
        originalRequest._retry = true;

        try {
          const newAccessToken = await refreshAccessToken();
          originalRequest.headers = originalRequest.headers ?? {};
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          return Promise.reject(refreshError);
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
