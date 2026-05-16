import axios from 'axios';
import { tokenStorage } from '../utils/tokenStorage';
import { useAuthStore } from '../store/useAuthStore';
import { router } from 'expo-router';
import { logger } from '../utils/logger';

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

    if (originalRequest?.url?.includes('/auth/refresh')) {
      logger.error('apiClient: Refresh token expired or invalid. Force logout.');
      await useAuthStore.getState().logout();
      router.replace('/');
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      logger.info('apiClient: 401 Unauthorized detected. Attempting token refresh...');
      
      if (isRefreshing) {
        logger.debug('apiClient: Already refreshing. Adding request to queue.');
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        }).catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await tokenStorage.getRefreshToken();
        if (!refreshToken) {
          logger.error('apiClient: No refresh token found in storage');
          throw new Error("No refresh token");
        }

        const { data } = await axios.post(`${apiBaseUrl}/auth/refresh`, { refreshToken });
        
        if (data.isSuccess) {
          logger.info('apiClient: Token refresh successful');
          await useAuthStore.getState().updateToken(data.result.accessToken, data.result.refreshToken);

          processQueue(null, data.result.accessToken);
          originalRequest.headers.Authorization = `Bearer ${data.result.accessToken}`;
          return apiClient(originalRequest);
        } else {
          logger.error('apiClient: Token refresh failed via API response', data.message);
          throw new Error('Refresh failed by server flag');
        }
      } catch (refreshError) {
        logger.error('apiClient: Token refresh pipeline failed', refreshError);
        processQueue(refreshError, null);
        await useAuthStore.getState().logout();
        router.replace('/');
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
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
