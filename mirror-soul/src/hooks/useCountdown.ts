import { useState, useEffect, useCallback, useRef } from 'react';
import { AppState } from 'react-native';

/**
 * 범용 카운트다운 타이머 훅 (SRP)
 * @param initialTimeInSeconds 시작할 초 단위 시간 (기본값: 3분 = 180초)
 */
export function useCountdown(initialTimeInSeconds: number = 180) {
  const [timeLeft, setTimeLeft] = useState(initialTimeInSeconds);
  const [isActive, setIsActive] = useState(false);
  const remaining = useRef(initialTimeInSeconds);
  const deadline = useRef<number | null>(null);

  useEffect(() => {
    if (!isActive) return;
    const refresh = () => {
      if (deadline.current == null) return;
      const seconds = Math.max(0, Math.ceil((deadline.current - Date.now()) / 1000));
      remaining.current = seconds;
      setTimeLeft(seconds);
      if (seconds === 0) { deadline.current = null; setIsActive(false); }
    };
    refresh();
    const intervalId = setInterval(refresh, 1000);
    const subscription = AppState.addEventListener('change', state => { if (state === 'active') refresh(); });
    return () => {
      clearInterval(intervalId);
      subscription.remove();
    };
  }, [isActive]);

  const start = useCallback(() => {
    if (remaining.current <= 0) return;
    if (deadline.current == null) deadline.current = Date.now() + remaining.current * 1000;
    setIsActive(true);
  }, []);

  const reset = useCallback((newTime: number = initialTimeInSeconds) => {
    deadline.current = null;
    remaining.current = newTime;
    setIsActive(false);
    setTimeLeft(newTime);
  }, [initialTimeInSeconds]);

  // '03:00' 포맷팅 유틸리티
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return {
    timeLeft,
    isActive,
    start,
    reset,
    formattedTime: formatTime(timeLeft),
  };
}
