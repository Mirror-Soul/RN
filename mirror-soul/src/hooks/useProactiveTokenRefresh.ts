import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useAuthStore } from '../store/useAuthStore';
import { getTokenRemainingMs } from '../utils/jwtUtils';
import { refreshAccessToken } from '../services/apiClient';
import { logger } from '../utils/logger';

/** access token 만료 이 시간 전에 미리 갱신을 시도한다. */
const REFRESH_MARGIN_MS = 60_000;

/**
 * Access token이 401로 거부되기 전에 미리 갱신을 시도하는 훅.
 * RN 타이머는 앱이 백그라운드에 있는 동안 스로틀링/중단될 수 있으므로,
 * 포그라운드 복귀 시점에 남은 시간을 다시 계산해 즉시 갱신하거나 재예약한다.
 * 실제 갱신 요청은 apiClient의 refreshAccessToken()을 그대로 재사용하므로
 * 401 리액티브 갱신과 동시에 발생해도 isRefreshing/failedQueue로 직렬화되어 중복 호출되지 않는다.
 */
export function useProactiveTokenRefresh() {
  const { isLoggedIn, accessToken } = useAuthStore();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const clearTimer = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };

    const triggerRefresh = () => {
      refreshAccessToken().catch((error) => {
        logger.warn('useProactiveTokenRefresh: pre-emptive refresh failed', error);
      });
    };

    const scheduleRefresh = () => {
      clearTimer();
      if (!isLoggedIn || !accessToken) return;

      const remainingMs = getTokenRemainingMs(accessToken);

      if (remainingMs <= REFRESH_MARGIN_MS) {
        triggerRefresh();
        return;
      }

      timerRef.current = setTimeout(triggerRefresh, remainingMs - REFRESH_MARGIN_MS);
    };

    scheduleRefresh();

    const subscription = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      if (nextState === 'active') {
        scheduleRefresh();
      }
    });

    return () => {
      clearTimer();
      subscription.remove();
    };
  }, [isLoggedIn, accessToken]);
}
