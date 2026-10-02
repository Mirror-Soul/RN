import { useQuery } from '@tanstack/react-query';
import { getValueBalanceQuestion } from '@/src/services/evolveService';

/**
 * GET /evolve/value-balance — 가치관 밸런스 게임 오늘의 질문 조회.
 * 성장 탭 진입 시 미리 불러서 미션 카드에 quota 상태를 바로 보여준다(prefetch).
 * 세트 분석 대기 또는 전체 완료 상태에서는 result 자체가 아니라 그 안의 questionId/axis/leftLabel/rightLabel이
 * null로 온다. 소비하는 쪽은 result === null이 아니라 locked/completed와 questionId를 함께
 * 확인해야 한다.
 */
export const useValueBalanceQuestionQuery = () => {
  return useQuery({
    queryKey: ['growth', 'valueBalanceQuestion'],
    queryFn: async () => (await getValueBalanceQuestion()).result,
    staleTime: 0,
  });
};
