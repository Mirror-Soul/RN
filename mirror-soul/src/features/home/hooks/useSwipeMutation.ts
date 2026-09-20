import { useMutation } from '@tanstack/react-query';
import { swipeRecommendation } from '@/src/services/homeService';
import { logger } from '@/src/utils/logger';

/**
 * POST /home/recommendations/{uuid}/swipe — fire-and-forget로 호출한다.
 * useRef 동기 락(src/features/account/CLAUDE.md 패턴)을 의도적으로 안 쓴다 — 그 패턴은
 * 계정탈퇴/결제처럼 되돌리기 어렵거나 중복 과금 위험이 있는 액션 전용이고, 스와이프는
 * 백엔드가 14일 내 재호출을 무해한 no-op으로 처리하는 멱등 액션이라 중복 호출의 대가가 없다.
 */
export const useSwipeMutation = () => {
  return useMutation({
    mutationFn: (targetUserUuid: string) => swipeRecommendation(targetUserUuid),
    onError: (error, targetUserUuid) => {
      logger.error('useSwipeMutation: swipe failed', {
        targetUserUuid,
        message: error instanceof Error ? error.message : String(error),
      });
    },
  });
};
