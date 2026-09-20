import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { getChatMessages } from '@/src/services/chatService';

const MESSAGES_PAGE_SIZE = 30;

/**
 * GET /chat/rooms/{room-id}/messages — beforeMessageId 커서 페이지네이션.
 * pages[0]이 가장 최근 메시지 묶음이고, 다음 페이지로 갈수록 더 과거다 — 화면에는
 * 오래된 순으로 펼친 배열만 노출한다(pages를 뒤집어서 flatMap).
 */
export const useChatMessagesQuery = (roomId: number) => {
  const query = useInfiniteQuery({
    queryKey: ['chat', 'messages', roomId],
    queryFn: async ({ pageParam }) =>
      (await getChatMessages(roomId, { beforeMessageId: pageParam, size: MESSAGES_PAGE_SIZE })).result,
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage, _pages, lastPageParam) => {
      if (!lastPage.hasNext) return undefined;
      const { nextCursor } = lastPage;
      // hasNext가 true인데 커서가 없거나(백엔드 계약 위반) 이전 요청보다 과거로 가지 않으면
      // (beforeMessageId는 갈수록 작아져야 함) 조용히 페이지네이션을 멈추는 대신 바로 드러낸다.
      if (nextCursor == null || (lastPageParam != null && nextCursor >= lastPageParam)) {
        throw new Error('Invalid message pagination cursor');
      }
      return nextCursor;
    },
  });

  const messages = useMemo(
    () => [...(query.data?.pages ?? [])].reverse().flatMap((page) => page.messages),
    [query.data]
  );

  return { ...query, messages };
};
