import { useEffect } from 'react';
import { reconcilePendingCall } from '../services/callService';
import { useAuthStore } from '../store/useAuthStore';
import { logger } from '../utils/logger';

// 프로세스당 계정별 1회만 시도한다. 통화 중 포그라운드 복귀 등으로 다시 돌면 진행 중인 통화를 끊을 수 있다.
const attemptedUsers = new Set<string>();

/** 로그인 후 앱 시작 시, 이전 실행이 통화 중 종료되어 서버에 남긴 통화를 정리한다. */
export function useReconcilePendingCall() {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const userUuid = useAuthStore((state) => state.userUuid);

  useEffect(() => {
    if (!isLoggedIn || !userUuid || attemptedUsers.has(userUuid)) return;
    attemptedUsers.add(userUuid);
    reconcilePendingCall().catch((error) => {
      logger.warn('useReconcilePendingCall: unexpected failure', error);
    });
  }, [isLoggedIn, userUuid]);
}
