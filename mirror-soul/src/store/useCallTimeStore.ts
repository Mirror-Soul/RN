import { create } from 'zustand';
import { getMyTime } from '../services/profileService';
import { logger } from '../utils/logger';

interface CallTimeState {
  /** 남은 통화 가능 시간 (초). GET /my-page/buy-time으로 조회된 서버 값의 로컬 캐시. */
  remainingSeconds: number;
  setRemainingSeconds: (seconds: number) => void;
  addSeconds: (seconds: number) => void;
  /** GET /my-page/buy-time 호출 후 remainingSeconds를 서버 값으로 갱신. 실패 시 조용히 무시(기존 값 유지). */
  fetchRemainingTime: () => Promise<void>;
}

export const useCallTimeStore = create<CallTimeState>((set) => ({
  remainingSeconds: 0,
  setRemainingSeconds: (seconds) => set({ remainingSeconds: seconds }),
  addSeconds: (seconds) => set((state) => ({ remainingSeconds: state.remainingSeconds + seconds })),
  fetchRemainingTime: async () => {
    try {
      const response = await getMyTime();
      if (response.isSuccess) {
        set({ remainingSeconds: response.result.remainingTalkTime });
      }
    } catch (error) {
      logger.error('useCallTimeStore: fetchRemainingTime failed', error);
    }
  },
}));

/** HH:MM:SS 형식으로 포맷. 실제 결제 연동 전까지 여러 화면에서 공통으로 사용. */
export function formatCallTime(totalSeconds: number): string {
  const clamped = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(clamped / 3600);
  const minutes = Math.floor((clamped % 3600) / 60);
  const seconds = clamped % 60;
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}
