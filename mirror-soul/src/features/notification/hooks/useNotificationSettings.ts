import { useCallback, useEffect } from 'react';
import { useNotificationStore } from '../../../store/useNotificationStore';

/**
 * 알림 설정 훅
 *
 * 컴포넌트는 이 훅만 사용하여 스토어 구조와 디커플링을 유지합니다.
 * timeLimitAlert는 GET/PATCH /my-page/alarm과 동기화된다 (eventAlert는 백엔드에
 * 대응 개념이 없어 로컬 전용으로 유지).
 */
export const useNotificationSettings = () => {
  const timeLimitAlert = useNotificationStore((s) => s.timeLimitAlert);
  const eventAlert = useNotificationStore((s) => s.eventAlert);
  const toggleTimeLimitAlert = useNotificationStore((s) => s.toggleTimeLimitAlert);
  const toggleEventAlert = useNotificationStore((s) => s.toggleEventAlert);
  const fetchAlarmSetting = useNotificationStore((s) => s.fetchAlarmSetting);

  useEffect(() => {
    fetchAlarmSetting();
  }, [fetchAlarmSetting]);

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
