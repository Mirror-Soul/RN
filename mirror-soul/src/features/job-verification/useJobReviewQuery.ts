import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/src/store/useAuthStore';
import { getJobReview } from '@/src/services/jobVerificationService';

export const jobReviewKey = (owner: string | null) => ['job-verification', owner] as const;
export function useJobReviewQuery(enabled = true) {
  const owner = useAuthStore(s => s.userUuid);
  const loggedIn = useAuthStore(s => s.isLoggedIn);
  return useQuery({
    queryKey: jobReviewKey(owner),
    enabled: enabled && loggedIn && !!owner,
    staleTime: 0,
    retry: 1,
    queryFn: async ({ signal }) => {
      if (!owner || useAuthStore.getState().userUuid !== owner) throw new Error('다시 로그인해 주세요.');
      return (await getJobReview(signal)).result;
    },
  });
}
