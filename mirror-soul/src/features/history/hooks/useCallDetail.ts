import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getTalkLogs, updateTalkLog } from '@/src/services/historyService';
import type { TalkLogListResult, TalkLogResponse } from '@/src/types/api/history';
import { useAuthStore } from '@/src/store/useAuthStore';
import { useToast } from '@/src/components/common/Toast/ToastProvider';
import { getErrorDisplayMessage } from '@/src/utils/apiErrorCode';

/**
 * GET+PATCH /history/calls/{call-id}/talk-logs 결합 훅 (call-detail 화면 전용).
 * 대화 내역 조회와 "내 Twin 답변 수정" 뮤테이션을 하나로 묶는다 (useVoiceAudioSettings.ts 패턴).
 */
export const useCallDetail = (callId: number) => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const queryKey = ['history', 'talkLogs', callId];

  const query = useQuery({
    queryKey,
    queryFn: async () => (await getTalkLogs(callId)).result,
    staleTime: 30_000,
    enabled: isLoggedIn && Number.isFinite(callId),
  });

  const mutation = useMutation({
    mutationFn: ({ talkLogId, message }: { talkLogId: number; message: string }) =>
      updateTalkLog(callId, talkLogId, message),
    onSuccess: (response) => {
      queryClient.setQueryData<TalkLogListResult>(queryKey, (current) =>
        current
          ? {
              ...current,
              talkLogs: current.talkLogs.map((log) =>
                log.talkLogId === response.result.talkLogId ? response.result : log
              ),
            }
          : current
      );
    },
    onError: (error) => {
      showToast(getErrorDisplayMessage(error, '답변 수정에 실패했습니다.'), 'error');
    },
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    updateTalkLog: (talkLogId: number, message: string): Promise<TalkLogResponse> =>
      mutation.mutateAsync({ talkLogId, message }),
    isSaving: mutation.isPending,
  };
};
