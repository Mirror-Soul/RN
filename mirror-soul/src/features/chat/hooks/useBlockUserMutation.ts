import { useMutation, useQueryClient, type InfiniteData } from '@tanstack/react-query';
import { blockUser } from '@/src/services/blockService';
import type { ChatRoomListResult } from '@/src/types/api/chat';
import type { CallHistoryListResult, TalkLogListResult } from '@/src/types/api/history';
import type { RecommendationsResult } from '@/src/types/api/home';
import type { MeetingRequestListResult } from '@/src/types/api/meeting';
import { useAuthStore } from '@/src/store/useAuthStore';

/**
 * POST /blocks/{uuid} — 성공 후 서버의 양방향 차단 정책을 화면 캐시에 반영한다.
 * 추천·기록·메시지·대기 신청에서 상대를 제거하고 집계는 서버에서 다시 확인한다.
 */
export const useBlockUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (targetUserUuid: string) => blockUser(targetUserUuid),
    onMutate: () => ({ userUuid: useAuthStore.getState().userUuid }),
    onSuccess: async (_response, targetUserUuid, context) => {
      // A late response from a previous account must not alter the new account's caches.
      if (context?.userUuid !== useAuthStore.getState().userUuid) return;
      const prefixes = [['chat', 'rooms'], ['home', 'recommendations'], ['history', 'calls'], ['history', 'weeklySummary'], ['history', 'talkLogs'], ['match', 'meetingRequests']] as const;
      await Promise.all(prefixes.map(queryKey => queryClient.cancelQueries({ queryKey })));
      await queryClient.cancelQueries({ queryKey: ['home', 'recommendationDetail', targetUserUuid] });
      if (context?.userUuid !== useAuthStore.getState().userUuid) return;
      queryClient.setQueryData<ChatRoomListResult>(['chat', 'rooms'], (old) => {
        if (!old) return old;
        const rooms = old.rooms.filter((room) => room.partner.userUuid !== targetUserUuid);
        return { totalCount: rooms.length, rooms };
      });
      queryClient.setQueryData<CallHistoryListResult>(['history', 'calls'], old => {
        if (!old) return old;
        const groups = old.groups.map(group => ({ ...group, histories: group.histories.filter(item => item.partner.userUuid !== targetUserUuid) })).filter(group => group.histories.length > 0);
        const histories = groups.flatMap(group => group.histories);
        return { groups, summary: { totalCount: histories.length, receivedCount: histories.filter(item => item.type === 'RECEIVED').length, sentCount: histories.filter(item => item.type === 'SENT').length } };
      });
      queryClient.setQueryData<InfiniteData<RecommendationsResult>>(['home', 'recommendations'], old => old ? {
        ...old, pages: old.pages.map(page => ({ ...page, recommendations: page.recommendations.filter(item => item.userUuid !== targetUserUuid) })),
      } : old);
      queryClient.setQueriesData<MeetingRequestListResult>({ queryKey: ['match', 'meetingRequests'] }, old => {
        if (!old) return old;
        const requests = old.requests.filter(item => item.senderUserUuid !== targetUserUuid);
        return { ...old, requests, totalCount: requests.length };
      });
      queryClient.removeQueries({ queryKey: ['home', 'recommendationDetail', targetUserUuid] });
      queryClient.removeQueries({ predicate: query => query.queryKey[0] === 'history' && query.queryKey[1] === 'talkLogs' && (query.state.data as TalkLogListResult | undefined)?.partner.userUuid === targetUserUuid });
      // Refresh aggregates from the server; removed peers stay absent while this happens.
      prefixes.forEach(queryKey => { void queryClient.invalidateQueries({ queryKey }); });
    },
  });
};
