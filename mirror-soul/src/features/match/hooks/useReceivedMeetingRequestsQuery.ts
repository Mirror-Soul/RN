import { useQuery } from '@tanstack/react-query';
import { getReceivedMeetingRequests } from '@/src/services/meetingService';
import { useAuthStore } from '@/src/store/useAuthStore';
import { matchQueryKeys } from './matchQueryKeys';

/** 서버는 받은 PENDING 신청만 최근 순서로 반환한다. */
export const useReceivedMeetingRequestsQuery = () => {
  const userUuid = useAuthStore((s) => s.userUuid);
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  return useQuery({
    queryKey: matchQueryKeys.requests(userUuid),
    queryFn: async ({ signal }) => {
      const session = useAuthStore.getState();
      if (!userUuid || !session.isLoggedIn || session.userUuid !== userUuid)
        throw new Error('다시 로그인해 주세요.');
      return (await getReceivedMeetingRequests(signal)).result;
    },
    enabled: isLoggedIn && !!userUuid,
    staleTime: 30_000,
  });
};
