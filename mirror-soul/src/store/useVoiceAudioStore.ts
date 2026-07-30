import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';

export type SpeedOption = 'slow' | 'normal' | 'fast';

interface VoiceAudioState {
  speechSpeed: SpeedOption;
  setSpeechSpeed: (speed: SpeedOption) => void;
}

/**
 * expo-secure-store 기반 Zustand persist 어댑터
 * (프로젝트에 @react-native-async-storage가 미설치 → SecureStore 활용)
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

/**
 * speechSpeed 로컬 미러 스토어.
 * 진실의 원천은 react-query 캐시(['profile','audioSettings'], useVoiceAudioSettings.ts 참고)이고,
 * 이 스토어는 useAICallFlow.ts가 훅 없이 동기적으로(getState()) 값을 읽을 수 있도록 미러링만 한다.
 */
export const useVoiceAudioStore = create<VoiceAudioState>()(
  persist(
    (set) => ({
      speechSpeed: 'normal',
      setSpeechSpeed: (speed) => set({ speechSpeed: speed }),
    }),
    {
      name: 'voice-audio-settings',
      storage: createJSONStorage(() => secureStorage),
    }
  )
);
