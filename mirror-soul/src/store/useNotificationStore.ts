import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';
import { getAlarmSetting, modifyAlarmSetting } from '../services/profileService';
import { logger } from '../utils/logger';

/**
 * expo-secure-store 기반 Zustand persist 어댑터
 * (useVoiceAudioStore에서 구축된 패턴을 동일하게 재활용)
 */
const secureStorage = {
  getItem: async (key: string) => {
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  setItem: async (key: string, value: string) => {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch {}
  },
  removeItem: async (key: string) => {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch {}
  },
};

interface NotificationState {
  /** 시간 소진 알림 (대화 가능 시간이 부족할 때) — 백엔드 lowTimeNotificationEnabled와 동기화 — 기본값: true */
  timeLimitAlert: boolean;
  /** 혜택 및 이벤트 알림 (새로운 소식이나 혜택) — 백엔드에 대응 필드 없음, 로컬 전용 — 기본값: false */
  eventAlert: boolean;
  /** 부재중 통화 알림. FE에 아직 토글 UI가 없는 숨김 필드 — 백엔드 missedCallNotificationEnabled가
   *  PATCH 시 필수라서 GET으로 받은 값을 그대로 들고 있다가 함께 전송한다. */
  missedCallNotificationEnabled: boolean;

  toggleTimeLimitAlert: () => void;
  toggleEventAlert: () => void;
  /** GET /my-page/alarm 호출 후 스토어에 반영. 실패 시 조용히 무시(기존 값 유지). */
  fetchAlarmSetting: () => Promise<void>;
}

/**
 * 알림 설정 스토어
 *
 * - SecureStore에 영속화: 앱 재시작 후에도 설정 유지
 * - timeLimitAlert만 백엔드 PATCH /my-page/alarm과 동기화됨 (lowTimeNotificationEnabled).
 *   eventAlert는 백엔드에 대응 개념이 없어 로컬 전용으로 남는다.
 */
export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      timeLimitAlert: true,
      eventAlert: false,
      missedCallNotificationEnabled: true,

      toggleTimeLimitAlert: () => {
        const nextValue = !get().timeLimitAlert;
        set({ timeLimitAlert: nextValue });
        modifyAlarmSetting({
          lowTimeNotificationEnabled: nextValue,
          missedCallNotificationEnabled: get().missedCallNotificationEnabled,
        })
          .then((response) => {
            if (response.isSuccess) {
              set({
                timeLimitAlert: response.result.lowTimeNotificationEnabled,
                missedCallNotificationEnabled: response.result.missedCallNotificationEnabled,
              });
            }
          })
          .catch((error) => {
            logger.error('useNotificationStore: toggleTimeLimitAlert sync failed', error);
            set({ timeLimitAlert: !nextValue });
          });
      },
      toggleEventAlert: () =>
        set((state) => ({ eventAlert: !state.eventAlert })),
      fetchAlarmSetting: async () => {
        try {
          const response = await getAlarmSetting();
          if (response.isSuccess) {
            set({
              timeLimitAlert: response.result.lowTimeNotificationEnabled,
              missedCallNotificationEnabled: response.result.missedCallNotificationEnabled,
            });
          }
        } catch (error) {
          logger.error('useNotificationStore: fetchAlarmSetting failed', error);
        }
      },
    }),
    {
      name: 'notification-settings',
      storage: createJSONStorage(() => secureStorage),
    }
  )
);
