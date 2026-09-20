import { useQuery } from '@tanstack/react-query';
import type { MessageReadData } from '@/src/types/chatRealtime';

/**
 * `['chat','readReceipts',roomId]` 캐시는 이 훅이 채우지 않는다 — useChatRealtimeConnection의
 * WS MESSAGE_READ 핸들러가 setQueryData로만 채워 넣는 외부 기록용 슬롯이다. enabled:false라
 * queryFn은 실행되지 않지만, react-query는 이 쿼리키의 캐시 변경을 계속 구독하므로 WS 이벤트가
 * 도착하면 이 훅을 쓰는 컴포넌트도 정상적으로 리렌더된다.
 */
export const useChatReadReceipt = (roomId: number): MessageReadData | null => {
  const { data } = useQuery<MessageReadData | null>({
    queryKey: ['chat', 'readReceipts', roomId],
    queryFn: () => null,
    enabled: false,
    staleTime: Infinity,
  });

  return data ?? null;
};
