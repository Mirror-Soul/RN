import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';
import { getAudioSettings, updateAudioSettings } from '../services/profileService';
import { SpeechSpeed } from '../types/api/profile';
import { logger } from '../utils/logger';

export type SpeedOption = 'slow' | 'normal' | 'fast';

const SPEED_OPTION_BY_SPEECH_SPEED: Record<SpeechSpeed, SpeedOption> = {
  SLOW: 'slow',
  NORMAL: 'normal',
  FAST: 'fast',
};

const SPEECH_SPEED_BY_SPEED_OPTION: Record<SpeedOption, SpeechSpeed> = {
  slow: 'SLOW',
  normal: 'NORMAL',
  fast: 'FAST',
};

const toSpeedOption = (speed: SpeechSpeed): SpeedOption => SPEED_OPTION_BY_SPEECH_SPEED[speed];

const toSpeechSpeed = (speed: SpeedOption): SpeechSpeed => SPEECH_SPEED_BY_SPEED_OPTION[speed];

interface VoiceAudioState {
  speechSpeed: SpeedOption;
  /** 백엔드 audio-settings API가 요구하지만 FE에 아직 볼륨 조절 UI가 없는 숨김 필드.
   *  GET으로 받은 값을 그대로 들고 있다가 PATCH 시 함께 전송한다. */
  opponentVoiceVolume: number;
  setSpeechSpeed: (speed: SpeedOption) => void;
  /** GET /my-page/audio-settings 호출 후 스토어에 반영. 실패 시 조용히 무시(기존 값 유지). */
  fetchAudioSettings: () => Promise<void>;
  /** speechSpeed 변경을 PATCH /my-page/audio-settings로 서버에 반영 (opponentVoiceVolume은 최신 값 그대로 전송) */
  syncSpeechSpeed: (speed: SpeedOption) => Promise<void>;
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
 * 음성 및 오디오 설정 스토어
 *
 * - speechSpeed: AI 상대방의 말하기 속도 설정
 * - persist 미들웨어로 SecureStore에 영속화 (앱 재시작 후에도 유지)
 * - 추후 useAICallFlow.ts의 CALL_INVITE 메시지에 speechSpeed 파라미터로 전달 예정
 */
export const useVoiceAudioStore = create<VoiceAudioState>()(
  persist(
    (set, get) => ({
      speechSpeed: 'normal',
      opponentVoiceVolume: 50,
      setSpeechSpeed: (speed) => set({ speechSpeed: speed }),
      fetchAudioSettings: async () => {
        try {
          const response = await getAudioSettings();
          if (response.isSuccess) {
            set({
              speechSpeed: toSpeedOption(response.result.opponentSpeechSpeed),
              opponentVoiceVolume: response.result.opponentVoiceVolume,
            });
          }
        } catch (error) {
          logger.error('useVoiceAudioStore: fetchAudioSettings failed', error);
        }
      },
      syncSpeechSpeed: async (speed) => {
        const previousSpeed = get().speechSpeed;
        set({ speechSpeed: speed });
        try {
          const response = await updateAudioSettings({
            opponentVoiceVolume: get().opponentVoiceVolume,
            opponentSpeechSpeed: toSpeechSpeed(speed),
          });
          if (response.isSuccess) {
            set({
              speechSpeed: toSpeedOption(response.result.opponentSpeechSpeed),
              opponentVoiceVolume: response.result.opponentVoiceVolume,
            });
          }
        } catch (error) {
          logger.error('useVoiceAudioStore: syncSpeechSpeed failed', error);
          set({ speechSpeed: previousSpeed });
        }
      },
    }),
    {
      name: 'voice-audio-settings',
      storage: createJSONStorage(() => secureStorage),
    }
  )
);
