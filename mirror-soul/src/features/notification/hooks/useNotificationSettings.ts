import { useCallback } from 'react';
import { useNotificationStore } from '../../../store/useNotificationStore';

/**
 * 알림 설정 훅
 *
 * 컴포넌트는 이 훅만 사용하여 스토어 구조와 디커플링을 유지합니다.
 * 추후 API 연동 시 이 훅 내부에서만 수정하면 됩니다.
 */
export const useNotificationSettings = () => {
  const timeLimitAlert = useNotificationStore((s) => s.timeLimitAlert);
  const eventAlert = useNotificationStore((s) => s.eventAlert);
  const toggleTimeLimitAlert = useNotificationStore((s) => s.toggleTimeLimitAlert);
  const toggleEventAlert = useNotificationStore((s) => s.toggleEventAlert);

  const handleToggleTimeLimit = useCallback(() => {
    toggleTimeLimitAlert();
  }, [toggleTimeLimitAlert]);

  const handleToggleEvent = useCallback(() => {
    toggleEventAlert();
  }, [toggleEventAlert]);

  return {
    timeLimitAlert,
    eventAlert,
    handleToggleTimeLimit,
    handleToggleEvent,
  };
};
