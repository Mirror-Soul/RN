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
      await Promise.all([
        SecureStore.setItemAsync(KEYS.ACCESS_TOKEN, accessToken),
        SecureStore.setItemAsync(KEYS.REFRESH_TOKEN, refreshToken),
        SecureStore.setItemAsync(KEYS.USER_UUID, userUuid),
        SecureStore.setItemAsync(KEYS.USER_STATUS, userStatus),
      ]);
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
