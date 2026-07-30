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
  /** 혜택 및 이벤트 알림 (새로운 소식이나 혜택) — 백엔드에 대응 필드 없음, 로컬 전용 — 기본값: false */
  eventAlert: boolean;
  toggleEventAlert: () => void;
}

/**
 * 로컬 전용 알림 설정 스토어.
 * 시간 소진 알림(lowTimeNotificationEnabled)은 서버 상태라 react-query 캐시로
 * 이전됨(useNotificationSettings.ts 참고) — 여기엔 서버 대응이 없는 eventAlert만 남는다.
 */
export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      eventAlert: false,
      toggleEventAlert: () => set((state) => ({ eventAlert: !state.eventAlert })),
    }),
    {
      name: 'notification-settings',
      storage: createJSONStorage(() => secureStorage),
    }
  )
);
