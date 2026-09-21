import { useQuery } from '@tanstack/react-query';
import { getReceivedMeetingRequests } from '@/src/services/meetingService';
import { useAuthStore } from '@/src/store/useAuthStore';

/** GET /match/meeting/requests — 받은 만남 신청 목록(PENDING만) 조회. */
export const useReceivedMeetingRequestsQuery = () => {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);

  return useQuery({
    queryKey: ['match', 'meetingRequests'],
    queryFn: async () => (await getReceivedMeetingRequests()).result,
    enabled: isLoggedIn,
  });
};
