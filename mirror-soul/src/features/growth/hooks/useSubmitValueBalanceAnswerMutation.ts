import { useMutation, useQueryClient } from '@tanstack/react-query';
import { submitValueBalanceAnswer } from '@/src/services/evolveService';
import { useAuthStore } from '@/src/store/useAuthStore';
import type { ValueBalanceChosenSide } from '@/src/types/api/evolve';

interface SubmitValueBalanceAnswerParams {
  questionId: number;
  chosenSide: ValueBalanceChosenSide;
}

/**
 * POST /evolve/value-balance/{questionId}/answer — 답변 제출.
 * 성공 시 다음 질문을 받아야 하므로 valueBalanceQuestion 쿼리를 무효화해 자동 refetch시킨다
 * (GET이 한 번에 질문 1개만 주는 구조라, 연속 질문 흐름은 "답변마다 재조회"로 구현한다).
 * twinSync(유사도)에도 영향을 줄 수 있어 함께 무효화한다.
 */
export const useSubmitValueBalanceAnswerMutation = () => {
  const queryClient = useQueryClient();
  const userUuid = useAuthStore(state => state.userUuid);

  return useMutation({
    onMutate: () => ({ userUuid }),
    mutationFn: ({ questionId, chosenSide }: SubmitValueBalanceAnswerParams) => {
      const session = useAuthStore.getState();
      if (!userUuid || !session.isLoggedIn || session.userUuid !== userUuid) throw new Error('다시 로그인해 주세요.');
      return submitValueBalanceAnswer(questionId, chosenSide);
    },
    onSuccess: (_response, _params, context) => {
      const session = useAuthStore.getState();
      if (!session.isLoggedIn || session.userUuid !== context?.userUuid) return;
      queryClient.invalidateQueries({ queryKey: ['growth', 'valueBalanceQuestion'] });
      queryClient.invalidateQueries({ queryKey: ['growth', 'twinSync'] });
    },
  });
};
