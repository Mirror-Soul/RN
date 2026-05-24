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

  async getAccessToken() { return SecureStore.getItemAsync(KEYS.ACCESS_TOKEN); },
  async getRefreshToken() { return SecureStore.getItemAsync(KEYS.REFRESH_TOKEN); },
  async getUserUuid() { return SecureStore.getItemAsync(KEYS.USER_UUID); },
  async getUserStatus() { return SecureStore.getItemAsync(KEYS.USER_STATUS); },

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
