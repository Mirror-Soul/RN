import { useEffect, useState } from 'react';

/**
 * 문자열 배열을 일정 주기로 순환 표시하는 범용 훅.
 * 렌더링 로직과 타이머/인덱스 관리 로직을 분리하기 위해 사용합니다 (SoC).
 */
export function useRotatingMessages(messages: string[], intervalMs: number): string {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    // messages가 짧아져 이전 index가 범위를 벗어나면 보정 (빈 티커 노출 방지)
    setIndex((prev) => (prev >= messages.length ? 0 : prev));

    if (messages.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [messages, intervalMs]);

  return messages[index] ?? messages[0] ?? '';
}
