import { useMutation, useQueryClient } from '@tanstack/react-query';
import { buyTime } from '@/src/services/profileService';

/** POST /my-page/buy-time — 대화 시간 충전. 백엔드가 최신 잔액을 돌려주므로 그대로 캐시에 반영한다. */
export const useBuyTimeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (seconds: number) => buyTime(seconds),
    onSuccess: (response) => {
      queryClient.setQueryData(['profile', 'time'], response.result);
    },
  });
};
