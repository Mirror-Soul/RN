import { useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getMatchingStatus,
  updateMatchingStatus,
} from '@/src/services/matchService';
import { useAuthStore } from '@/src/store/useAuthStore';
import { useToast } from '@/src/components/common/Toast/ToastProvider';
import { getErrorDisplayMessage } from '@/src/utils/apiErrorCode';
import { matchQueryKeys } from '@/src/features/match/hooks/matchQueryKeys';

/** 발견과 매칭 화면에서 같은 추천 노출 상태를 사용한다. */
export const useMatchingStatus = () => {
  const client = useQueryClient();
  const { showToast } = useToast();
  const userUuid = useAuthStore((s) => s.userUuid);
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const lock = useRef(false);
  const currentSession = () =>
    !!userUuid &&
    useAuthStore.getState().isLoggedIn &&
    useAuthStore.getState().userUuid === userUuid;
  const query = useQuery({
    queryKey: matchQueryKeys.status(userUuid),
    queryFn: async ({ signal }) => {
      if (!currentSession()) throw new Error('다시 로그인해 주세요.');
      return (await getMatchingStatus(signal)).result;
    },
    enabled: isLoggedIn && !!userUuid,
    staleTime: 30_000,
  });
  const mutation = useMutation({
    mutationFn: ({
      matchingEnabled,
      userUuid,
    }: {
      matchingEnabled: boolean;
      userUuid: string | null;
    }) => {
      if (
        !userUuid ||
        !useAuthStore.getState().isLoggedIn ||
        useAuthStore.getState().userUuid !== userUuid
      )
        throw new Error('다시 로그인해 주세요.');
      return updateMatchingStatus({ matchingEnabled });
    },
    onMutate: ({ userUuid }) =>
      client.cancelQueries({ queryKey: matchQueryKeys.status(userUuid) }),
    onSuccess: async (response, { userUuid }) => {
      const currentSession = () =>
        !!userUuid &&
        useAuthStore.getState().isLoggedIn &&
        useAuthStore.getState().userUuid === userUuid;
      if (!currentSession()) return;
      await client.cancelQueries({ queryKey: matchQueryKeys.status(userUuid) });
      if (currentSession())
        client.setQueryData(matchQueryKeys.status(userUuid), response.result);
    },
    onError: (error, { userUuid }) => {
      if (
        useAuthStore.getState().isLoggedIn &&
        useAuthStore.getState().userUuid === userUuid
      )
        showToast(
          getErrorDisplayMessage(error, '추천 노출 설정을 저장하지 못했어요.'),
          'error',
        );
    },
    onSettled: () => {
      lock.current = false;
    },
  });
  const handleToggle = () => {
    if (lock.current || !query.data || !currentSession()) return;
    lock.current = true;
    mutation.mutate({ matchingEnabled: !query.data.matchingEnabled, userUuid });
  };
  return {
    matchingEnabled: query.data?.matchingEnabled ?? null,
    handleToggle,
    isLoading: query.isLoading,
    isError: query.isError,
    isFetching: query.isFetching,
    refetch: query.refetch,
    isToggling: mutation.isPending,
  };
};
