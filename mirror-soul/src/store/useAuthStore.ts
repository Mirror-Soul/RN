import { create } from 'zustand';
import { tokenStorage } from '../utils/tokenStorage';
import { logger } from '../utils/logger';
import { queryClient } from '../services/queryClient';

import { isTokenExpired } from '../utils/jwtUtils';

interface AuthState {
  isHydrated: boolean; 
  isLoggedIn: boolean;
  accessToken: string | null;
  userUuid: string | null;
  userStatus: string | null;
  
  hydrate: () => Promise<void>;
  login: (data: { accessToken: string, refreshToken: string, userUuid: string, userStatus: string }) => Promise<void>;
  updateUserStatus: (userStatus: string) => Promise<void>;
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
      const refreshToken = await tokenStorage.getRefreshToken();
      const userUuid = await tokenStorage.getUserUuid();
      const userStatus = await tokenStorage.getUserStatus();
      
      if (accessToken && userStatus !== 'ACTIVE') {
        logger.warn(`useAuthStore: Incomplete onboarding detected (${userStatus}). Clearing session.`);
        await tokenStorage.clearAll();
        // 이 경로는 performLogout()을 거치지 않으므로 react-query 캐시가 남아있을 수 있다 —
        // 다음 로그인 사용자에게 이전 세션의 캐시된 데이터가 잠깐 보이는 것을 막기 위해 직접 비운다.
        queryClient.clear();
        set({ isHydrated: true, isLoggedIn: false, accessToken: null, userUuid: null, userStatus: null });
        return;
      }

      if (accessToken && isTokenExpired(refreshToken)) {
        logger.warn(`useAuthStore: Refresh token is expired. Clearing session.`);
        await tokenStorage.clearAll();
        queryClient.clear();
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

  updateUserStatus: async (userStatus) => {
    // 다음 화면으로 이동하기 전에 메모리 상태를 먼저 갱신해야 전역 라우팅 가드가
    // 이전 단계로 되돌리는 레이스가 생기지 않는다.
    set({ userStatus });
    try {
      await tokenStorage.saveUserStatus(userStatus);
    } catch (error) {
      // 서버 저장은 이미 성공한 상태다. 현재 세션의 진행은 유지하고, 저장소 갱신 실패는
      // 다음 앱 실행 시 로그인으로 복구할 수 있도록 로그만 남긴다.
      logger.error('useAuthStore: Failed to persist user status', error);
    }
  },

  updateToken: async (newAccessToken, newRefreshToken) => {
    logger.debug('useAuthStore: Updating access token');
    const currentRefreshToken = await tokenStorage.getRefreshToken();
    const refreshTokenToSave = newRefreshToken ?? currentRefreshToken;
    const userUuid = get().userUuid;
    const userStatus = get().userStatus;

    if (!refreshTokenToSave || !userUuid || !userStatus) {
      logger.error('useAuthStore: Critical session metadata lost. Forcing logout.', { hasRefresh: !!refreshTokenToSave, userUuid, userStatus });
      // get().logout()은 performLogout()을 거치지 않으므로 캐시를 직접 비운다 (hydrate()와 동일한 이유).
      queryClient.clear();
      await get().logout();
      return;
    }

    // saveTokens()가 아니라 saveRefreshedTokens()를 쓴다 — USER_STATUS를 다시 쓰면, 이 함수가
    // 위에서 읽어둔(오래됐을 수 있는) userStatus가 온보딩 단계 전환(updateUserStatus)의 쓰기와
    // 경합해 방금 완료된 단계를 되돌릴 수 있다.
    await tokenStorage.saveRefreshedTokens(newAccessToken, refreshTokenToSave);
    set({ accessToken: newAccessToken });
  },

  logout: async () => {
    logger.info('useAuthStore: Logging out');
    try {
      await tokenStorage.clearAll();
    } catch (error) {
      // SecureStore 삭제가 실패해도 로그아웃 자체는 성공으로 취급 — 여기서 throw하면
      // 호출부(performLogout 등)의 후속 로직(예: 로그인 화면 이동)이 통째로 스킵된다.
      logger.error('useAuthStore: tokenStorage.clearAll failed during logout', error);
    } finally {
      // clearAll()이 실패하더라도 메모리 상태는 반드시 초기화 (라우팅 가드 작동 보장)
      set({ isLoggedIn: false, accessToken: null, userUuid: null, userStatus: null });
    }
  }
}));
