import { useQuery } from '@tanstack/react-query';
import { getValueBalanceQuestion } from '@/src/services/evolveService';

/**
 * GET /evolve/value-balance — 가치관 밸런스 게임 오늘의 질문 조회.
 * 성장 탭 진입 시 미리 불러서 미션 카드에 quota 상태를 바로 보여준다(prefetch).
 * 일일 quota를 다 쓰면 서버가 에러가 아니라 result: null로 응답한다 — data === null이
 * "오늘은 더 이상 질문이 없음"을 의미하므로 isLoading/isError와 구분해서 다뤄야 한다.
 */
export const useValueBalanceQuestionQuery = () => {
  return useQuery({
    queryKey: ['growth', 'valueBalanceQuestion'],
    queryFn: async () => (await getValueBalanceQuestion()).result,
    staleTime: 0,
  });
};
