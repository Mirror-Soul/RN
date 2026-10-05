import { useQuery } from '@tanstack/react-query';
import { getValueBalanceQuestion } from '@/src/services/evolveService';
import { useAuthStore } from '@/src/store/useAuthStore';

export const useValueBalanceQuestionQuery = () => {
  const isLoggedIn = useAuthStore(state => state.isLoggedIn);
  const userUuid = useAuthStore(state => state.userUuid);
  return useQuery({
    queryKey: ['growth', 'valueBalanceQuestion', userUuid],
    queryFn: async () => {
      const session = useAuthStore.getState();
      if (!userUuid || !session.isLoggedIn || session.userUuid !== userUuid) throw new Error('다시 로그인해 주세요.');
      return (await getValueBalanceQuestion()).result;
    },
    staleTime: 0,
    enabled: isLoggedIn && !!userUuid,
  });
};
