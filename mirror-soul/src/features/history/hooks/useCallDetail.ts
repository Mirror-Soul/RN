import { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getTalkLogs, updateTalkLog } from '@/src/services/historyService';
import type { TalkLogListResult, TalkLogResponse } from '@/src/types/api/history';
import { useAuthStore } from '@/src/store/useAuthStore';
import { useToast } from '@/src/components/common/Toast/ToastProvider';
import { getErrorDisplayMessage } from '@/src/utils/apiErrorCode';
import { TRANSCRIPT_POLL_INTERVAL_MS } from '../callTranscriptSettle';
import { useTranscriptSettling } from './useTranscriptSettling';

/**
 * GET+PATCH /history/calls/{call-id}/talk-logs 결합 훅 (call-detail 화면 전용).
 * 대화 내역 조회와 "내 Twin 답변 수정" 뮤테이션을 하나로 묶는다 (useVoiceAudioSettings.ts 패턴).
 *
 * 이 앱에서 방금 끝낸 통화는 AI 서버가 남은 대화를 마저 저장하는 동안(callTranscriptSettle 참고)
 * 기록을 주기적으로 다시 불러오고 transcriptSettling으로 알린다. 그 외 통화는 평소처럼 한 번만 조회한다.
 */
export const useCallDetail = (callId: number) => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const settling = useTranscriptSettling(callId);
  const queryKey = ['history', 'talkLogs', callId];

  const mutation = useMutation({
    mutationFn: ({ talkLogId, message }: { talkLogId: number; message: string }) =>
      updateTalkLog(callId, talkLogId, message),
    // 자동 재조회가 수정 직전의 옛 응답으로 방금 저장한 답변을 덮어쓰지 못하게 진행 중인 조회를 취소한다.
    onMutate: () => queryClient.cancelQueries({ queryKey }),
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

  const enabled = isLoggedIn && Number.isSafeInteger(callId) && callId > 0;
  const query = useQuery({
    queryKey,
    queryFn: async () => (await getTalkLogs(callId)).result,
    staleTime: settling ? 0 : 30_000,
    refetchInterval: settling && !mutation.isPending ? TRANSCRIPT_POLL_INTERVAL_MS : false,
    enabled,
  });

  // 정리 구간이 끝나는 순간 한 번 더 읽는다. 앱이 백그라운드에 있어 폴링 타이머가 멈췄다 돌아온 경우에도
  // 마지막 대화를 놓친 채 "대화 기록의 끝"으로 굳지 않게 한다.
  const wasSettling = useRef(settling);
  const [catchingUp, setCatchingUp] = useState(false);
  const { refetch } = query;
  useEffect(() => {
    if (wasSettling.current && !settling && enabled) {
      setCatchingUp(true);
      void refetch().finally(() => setCatchingUp(false));
    }
    wasSettling.current = settling;
  }, [settling, enabled, refetch]);

  return {
    data: query.data,
    isLoading: query.isLoading,
    // 정리 구간의 자동 재조회는 화면 조작(전화/메뉴)을 막지 않도록 진행 중으로 알리지 않는다.
    isFetching: query.isFetching && !((settling || catchingUp) && query.data !== undefined),
    isError: query.isError,
    refetch: query.refetch,
    updateTalkLog: (talkLogId: number, message: string): Promise<TalkLogResponse> =>
      mutation.mutateAsync({ talkLogId, message }),
    isSaving: mutation.isPending,
    transcriptSettling: settling,
  };
};
