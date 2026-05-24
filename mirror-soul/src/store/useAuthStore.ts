import { create } from 'zustand';
import { tokenStorage } from '../utils/tokenStorage';
import { logger } from '../utils/logger';

interface AuthState {
  isHydrated: boolean; 
  isLoggedIn: boolean;
  accessToken: string | null;
  userUuid: string | null;
  userStatus: string | null;
  
  hydrate: () => Promise<void>;
  login: (data: { accessToken: string, refreshToken: string, userUuid: string, userStatus: string }) => Promise<void>;
  updateToken: (newAccessToken: string, newRefreshToken?: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isHydrated: false,
  isLoggedIn: false,
  accessToken: null,
  userUuid: null,
  userStatus: null,

  hydrate: async () => {
    logger.debug('useAuthStore: Starting hydration...');
    try {
      const accessToken = await tokenStorage.getAccessToken();
      const userUuid = await tokenStorage.getUserUuid();
      const userStatus = await tokenStorage.getUserStatus();
      
      if (accessToken && userStatus !== 'ACTIVE') {
        logger.warn(`useAuthStore: Incomplete onboarding detected (${userStatus}). Clearing session.`);
        await tokenStorage.clearAll();
        set({ isHydrated: true, isLoggedIn: false, accessToken: null, userUuid: null, userStatus: null });
        return;
      }
      
      set({
        isHydrated: true,
        isLoggedIn: !!accessToken,
        accessToken,
        userUuid,
        userStatus
      });
      logger.info('useAuthStore: Hydration completed', { isLoggedIn: !!accessToken, userStatus });
    } catch (error) {
      logger.error('useAuthStore: Hydration failed', error);
      set({ isHydrated: true });
    }
  },

  login: async (data) => {
    logger.info('useAuthStore: Logging in...', { userUuid: data.userUuid, userStatus: data.userStatus });
    await tokenStorage.saveTokens(data.accessToken, data.refreshToken, data.userUuid, data.userStatus);
    set({ isLoggedIn: true, ...data });
  },

  updateToken: async (newAccessToken, newRefreshToken) => {
    logger.debug('useAuthStore: Updating access token');
    const currentRefreshToken = await tokenStorage.getRefreshToken();
    const refreshTokenToSave = newRefreshToken ?? currentRefreshToken;
    const userUuid = get().userUuid;
    const userStatus = get().userStatus;

    if (!refreshTokenToSave || !userUuid || !userStatus) {
      logger.error('useAuthStore: Critical session metadata lost. Forcing logout.', { hasRefresh: !!refreshTokenToSave, userUuid, userStatus });
      await get().logout();
      return;
    }

    await tokenStorage.saveTokens(newAccessToken, refreshTokenToSave, userUuid, userStatus);
    set({ accessToken: newAccessToken });
  },

  logout: async () => {
    logger.info('useAuthStore: Logging out');
    try {
      await tokenStorage.clearAll();
    } finally {
      // clearAll()이 실패하더라도 메모리 상태는 반드시 초기화 (라우팅 가드 작동 보장)
      set({ isLoggedIn: false, accessToken: null, userUuid: null, userStatus: null });
    }
  }
}));
