import { useQuery } from '@tanstack/react-query';
import { getValueBalanceQuestion } from '@/src/services/evolveService';

/**
 * GET /evolve/value-balance — 가치관 밸런스 게임 오늘의 질문 조회.
 * 성장 탭 진입 시 미리 불러서 미션 카드에 quota 상태를 바로 보여준다(prefetch).
 * 일일 quota를 다 쓰면 result 자체가 아니라 그 안의 questionId/axis/leftLabel/rightLabel이
 * 전부 null로 온다(answeredCount/dailyLimit은 이 경우에도 항상 채워져 있다) —
 * ValueBalanceQuestionResult 타입 주석 참고. 소비하는 쪽은 result === null이 아니라
 * result.questionId === null(또는 isAnswerableQuestion 가드)로 판별해야 한다.
 */
export const useValueBalanceQuestionQuery = () => {
  return useQuery({
    queryKey: ['growth', 'valueBalanceQuestion'],
    queryFn: async () => (await getValueBalanceQuestion()).result,
    staleTime: 0,
  });
};
