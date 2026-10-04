import { useMutation, useQueryClient } from '@tanstack/react-query';
import { rejectMeetingRequest } from '@/src/services/meetingService';
import type { MeetingRequestListResult } from '@/src/types/api/meeting';
import { useAuthStore } from '@/src/store/useAuthStore';
import { matchQueryKeys } from './matchQueryKeys';

export const useRejectMeetingRequestMutation = () => {
  const client = useQueryClient();
  const userUuid = useAuthStore((s) => s.userUuid);
  const mutation = useMutation({
    mutationFn: ({
      requestId,
      userUuid,
    }: {
      requestId: number;
      userUuid: string | null;
    }) => {
      if (
        !userUuid ||
        !useAuthStore.getState().isLoggedIn ||
        useAuthStore.getState().userUuid !== userUuid
      )
        throw new Error('다시 로그인해 주세요.');
      return rejectMeetingRequest(requestId);
    },
    onMutate: ({ userUuid }) =>
      client.cancelQueries({ queryKey: matchQueryKeys.requests(userUuid) }),
    onSuccess: async (_response, { requestId, userUuid }) => {
      const currentSession = () =>
        !!userUuid &&
        useAuthStore.getState().isLoggedIn &&
        useAuthStore.getState().userUuid === userUuid;
      if (!currentSession()) return;
      await client.cancelQueries({
        queryKey: matchQueryKeys.requests(userUuid),
      });
      if (!currentSession()) return;
      client.setQueryData<MeetingRequestListResult>(
        matchQueryKeys.requests(userUuid),
        (old) => {
          if (!old) return old;
          const requests = old.requests.filter(
            (item) => item.requestId !== requestId,
          );
          return { totalCount: requests.length, requests };
        },
      );
    },
  });
  return {
    ...mutation,
    mutateAsync: (requestId: number) =>
      mutation.mutateAsync({ requestId, userUuid }),
    mutate: (requestId: number) => mutation.mutate({ requestId, userUuid }),
  };
};
