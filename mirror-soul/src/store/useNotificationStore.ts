import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';

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
  /** 시간 소진 알림 (대화 가능 시간이 부족할 때) — 기본값: true */
  timeLimitAlert: boolean;
  /** 혜택 및 이벤트 알림 (새로운 소식이나 혜택) — 기본값: false */
  eventAlert: boolean;

  toggleTimeLimitAlert: () => void;
  toggleEventAlert: () => void;
}

/**
 * 알림 설정 스토어
 *
 * - SecureStore에 영속화: 앱 재시작 후에도 설정 유지
 * - 추후 백엔드 협의 후 PUT /notifications/settings API와 동기화 예정
 * - 참고: PUSH_NOTIFICATION_ARCHITECTURE.md
 */
export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      timeLimitAlert: true,
      eventAlert: false,

      toggleTimeLimitAlert: () =>
        set((state) => ({ timeLimitAlert: !state.timeLimitAlert })),
      toggleEventAlert: () =>
        set((state) => ({ eventAlert: !state.eventAlert })),
    }),
    {
      name: 'notification-settings',
      storage: createJSONStorage(() => secureStorage),
    }
  )
);
