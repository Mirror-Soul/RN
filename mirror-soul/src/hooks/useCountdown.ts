import { useState, useEffect, useCallback } from 'react';

/**
 * 범용 카운트다운 타이머 훅 (SRP)
 * @param initialTimeInSeconds 시작할 초 단위 시간 (기본값: 3분 = 180초)
 */
export function useCountdown(initialTimeInSeconds: number = 180) {
  const [timeLeft, setTimeLeft] = useState(initialTimeInSeconds);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isActive && timeLeft > 0) {
      intervalId = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isActive, timeLeft]);

  const start = useCallback(() => {
    setIsActive(true);
  }, []);

  const reset = useCallback((newTime: number = initialTimeInSeconds) => {
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
