import { create } from 'zustand';

interface CallTimeState {
  /** 남은 통화 가능 시간 (초). 실제 결제/잔액 API 연동 전까지는 로컬 mock 값. */
  remainingSeconds: number;
  setRemainingSeconds: (seconds: number) => void;
  addSeconds: (seconds: number) => void;
}

// Initial MVP mock data: 02:30:00 (2시간 30분)
const INITIAL_MOCK_SECONDS = 2 * 60 * 60 + 30 * 60;

export const useCallTimeStore = create<CallTimeState>((set) => ({
  remainingSeconds: INITIAL_MOCK_SECONDS,
  setRemainingSeconds: (seconds) => set({ remainingSeconds: seconds }),
  addSeconds: (seconds) => set((state) => ({ remainingSeconds: state.remainingSeconds + seconds })),
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
