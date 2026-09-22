import { useCallback, useEffect, useRef, useState } from 'react';

// 추천 API(GET /home/recommend)엔 새로고침 자체에 대한 백엔드 rate-limit이 없다
// (RecommendationPolicy.java엔 스와이프 재노출/노출 정책만 있음) — 순수 프론트 전용 쿨다운.
const REFRESH_COOLDOWN_MS = 4000;

/**
 * 새로고침이 끝난 직후 잠깐 버튼을 다시 못 누르게 막는다 — isFetching 가드만으로는
 * 요청이 끝나자마자 바로 다시 눌러 짧은 시간에 불필요한 서버 호출이 반복될 수 있다.
 */
export function useRefreshCooldown() {
  const [isInCooldown, setIsInCooldown] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const startCooldown = useCallback(() => {
    setIsInCooldown(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setIsInCooldown(false), REFRESH_COOLDOWN_MS);
  }, []);

  return { isInCooldown, startCooldown };
}
