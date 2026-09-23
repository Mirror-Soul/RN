import * as SecureStore from 'expo-secure-store';
import { logger } from './logger';

const KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_UUID: 'user_uuid',
  USER_STATUS: 'user_status',
} as const;

export const tokenStorage = {
  async saveTokens(accessToken: string, refreshToken: string, userUuid: string, userStatus: string) {
    try {
      const results = await Promise.allSettled([
        SecureStore.setItemAsync(KEYS.ACCESS_TOKEN, accessToken),
        SecureStore.setItemAsync(KEYS.REFRESH_TOKEN, refreshToken),
        SecureStore.setItemAsync(KEYS.USER_UUID, userUuid),
        SecureStore.setItemAsync(KEYS.USER_STATUS, userStatus),
      ]);
      const hasFailure = results.some((r) => r.status === 'rejected');
      if (hasFailure) {
        // 부분 성공 상태 방지: 저장에 실패하면 전체 롤백
        await Promise.allSettled(Object.values(KEYS).map(key => SecureStore.deleteItemAsync(key)));
        throw new Error('tokenStorage: partial save detected, rolled back');
      }
      logger.info('tokenStorage: Tokens saved successfully');
    } catch (error) {
      logger.error('tokenStorage: Failed to save tokens', error);
      throw error;
    }
  },

  /**
   * 토큰 갱신 전용 — USER_UUID/USER_STATUS는 건드리지 않는다. saveTokens()로 이 두 값까지
   * 매번 다시 쓰면, 온보딩 단계 전환(updateUserStatus)의 SecureStore 쓰기와 경합해 먼저 읽어둔
   * 오래된 userStatus가 나중에 끝나 방금 갱신된 값을 덮어쓸 수 있다.
   */
  async saveRefreshedTokens(accessToken: string, refreshToken: string) {
    try {
      const results = await Promise.allSettled([
        SecureStore.setItemAsync(KEYS.ACCESS_TOKEN, accessToken),
        SecureStore.setItemAsync(KEYS.REFRESH_TOKEN, refreshToken),
      ]);
      const hasFailure = results.some((r) => r.status === 'rejected');
      if (hasFailure) {
        // 부분 성공 상태 방지: access/refresh 중 하나만 저장되면 다음 401 때 잘못된 refreshToken을 쓰게 된다.
        await Promise.allSettled([
          SecureStore.deleteItemAsync(KEYS.ACCESS_TOKEN),
          SecureStore.deleteItemAsync(KEYS.REFRESH_TOKEN),
        ]);
        throw new Error('tokenStorage: partial refreshed-token save detected, rolled back');
      }
      logger.info('tokenStorage: Refreshed tokens saved successfully');
    } catch (error) {
      logger.error('tokenStorage: Failed to save refreshed tokens', error);
      throw error;
    }
  },

  async getAccessToken() { return SecureStore.getItemAsync(KEYS.ACCESS_TOKEN); },
  async getRefreshToken() { return SecureStore.getItemAsync(KEYS.REFRESH_TOKEN); },
  async getUserUuid() { return SecureStore.getItemAsync(KEYS.USER_UUID); },
  async getUserStatus() { return SecureStore.getItemAsync(KEYS.USER_STATUS); },
  async saveUserStatus(userStatus: string) {
    await SecureStore.setItemAsync(KEYS.USER_STATUS, userStatus);
  },

  async clearAll() {
    try {
      await Promise.all(Object.values(KEYS).map(key => SecureStore.deleteItemAsync(key)));
      logger.info('tokenStorage: All tokens cleared');
    } catch (error) {
      logger.error('tokenStorage: Failed to clear tokens', error);
      throw error;
    }
  },
};
