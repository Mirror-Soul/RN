import { useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getMatchingStatus, updateMatchingStatus } from '@/src/services/matchService';
import type { MatchingStatusResult } from '@/src/types/api/match';
import { useAuthStore } from '@/src/store/useAuthStore';
import { useToast } from '@/src/components/common/Toast/ToastProvider';
import { getErrorDisplayMessage } from '@/src/utils/apiErrorCode';

/**
 * 디지털 자아 매칭 On/Off 상태 훅 — GET/PATCH /match/status를 react-query로 감싼다.
 * 발견 탭 헤더 배지와 매칭 탭 토글이 이 훅을 공유해 항상 같은 서버 상태를 본다.
 */
export const useMatchingStatus = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);

  const query = useQuery({
    queryKey: ['match', 'status'],
    queryFn: async () => (await getMatchingStatus()).result,
    enabled: isLoggedIn,
  });

  const mutation = useMutation({
    mutationFn: (matchingEnabled: boolean) => updateMatchingStatus({ matchingEnabled }),
    onSuccess: (response) => {
      queryClient.setQueryData<MatchingStatusResult>(['match', 'status'], response.result);
    },
    onError: (error) => {
      showToast(getErrorDisplayMessage(error, '매칭 상태 변경에 실패했습니다.'), 'error');
    },
  });

  const handleToggle = useCallback(() => {
    if (!query.data) return; // 조회 완료 전에는 변경 자체를 막는다.
    mutation.mutate(!query.data.matchingEnabled);
  }, [mutation, query.data]);

  return {
    // 조회 전(null)과 실제 false를 구분한다 — 로딩 중 상태를 false로 오인해 보여주지 않기 위함.
    matchingEnabled: query.data?.matchingEnabled ?? null,
    handleToggle,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    isToggling: mutation.isPending,
  };
};
