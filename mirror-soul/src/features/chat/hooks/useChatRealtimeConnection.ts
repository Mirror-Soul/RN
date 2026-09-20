import { useEffect, useRef } from 'react';
import { QueryClient, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/src/store/useAuthStore';
import { logger } from '@/src/utils/logger';
import type { ChatRealtimeEvent, MessageCreatedData, MessageReadData } from '@/src/types/chatRealtime';
import type { ChatRoomListResult } from '@/src/types/api/chat';

const WS_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL?.replace('https://', 'wss://').replace('http://', 'ws://');

const INITIAL_RETRY_DELAY_MS = 1000;
const MAX_RETRY_DELAY_MS = 30000;

/**
 * React Native의 WebSocket 생성자는 표준 DOM lib.d.ts에 없는 3번째 인자(options.headers)를
 * 런타임에서 지원한다(RN 자체 확장) — TS 표준 타입엔 없으므로 생성자 시그니처만 좁게 캐스팅한다.
 */
type RNWebSocketConstructor = new (
  url: string,
  protocols: string | string[] | undefined,
  options: { headers: Record<string, string> }
) => WebSocket;

/**
 * 채팅 실시간 레이어 — 앱 전역에서 `/ws/chat` 연결을 1개만 유지하며 MESSAGE_CREATED/
 * MESSAGE_READ 수신 시 react-query 캐시를 직접 갱신한다. `app/_layout.tsx`에서 로그인 세션
 * 내내 1회만 마운트한다(특정 방 화면 전용이 아님 — 목록 화면에 있을 때도 실시간 반영되어야
 * 의미가 있다).
 *
 * `/ws/signaling`(통화 시그널링)과 달리 이 엔드포인트는 핸드셰이크 시점에 인증이 필요하다 —
 * SecurityConfig의 permitAll 목록에서 제외되어 있어 JwtAuthenticationFilter가 그대로 적용되고,
 * 그 필터는 `Authorization` 헤더만 읽는다(쿼리 파라미터 폴백 없음, JwtAuthenticationFilter.java
 * 확인함). 그래서 RN 전용 3번째 인자로 헤더를 실어야 핸드셰이크가 통과한다.
 */
export function useChatRealtimeConnection() {
  const queryClient = useQueryClient();
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);

  const wsRef = useRef<WebSocket | null>(null);
  const retryDelayRef = useRef(INITIAL_RETRY_DELAY_MS);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shouldReconnectRef = useRef(false);

  useEffect(() => {
    if (!isLoggedIn || !WS_BASE_URL) return;

    shouldReconnectRef.current = true;

    const connect = () => {
      // 재연결 시 클로저에 갇힌 옛 토큰이 아니라 매번 최신 토큰을 다시 읽는다(회전 대응).
      const token = useAuthStore.getState().accessToken;
      if (!token) return;

      const WebSocketWithHeaders = WebSocket as unknown as RNWebSocketConstructor;
      const ws = new WebSocketWithHeaders(`${WS_BASE_URL}/ws/chat`, undefined, {
        headers: { Authorization: `Bearer ${token}` },
      });
      wsRef.current = ws;

      ws.onopen = () => {
        logger.debug('[useChatRealtimeConnection] connected');
        retryDelayRef.current = INITIAL_RETRY_DELAY_MS;
        // 끊겨 있던 동안 놓쳤을 수 있는 변화를 REST 재조회로 보정한다.
        queryClient.invalidateQueries({ queryKey: ['chat', 'rooms'] });
      };

      ws.onmessage = (event) => {
        try {
          const chatEvent: ChatRealtimeEvent = JSON.parse(event.data as string);
          handleRealtimeEvent(queryClient, chatEvent);
        } catch (error) {
          logger.warn('[useChatRealtimeConnection] failed to parse event', error);
        }
      };

      ws.onerror = (error) => {
        logger.warn('[useChatRealtimeConnection] socket error', error);
      };

      ws.onclose = () => {
        wsRef.current = null;
        if (!shouldReconnectRef.current) return;
        retryTimerRef.current = setTimeout(connect, retryDelayRef.current);
        retryDelayRef.current = Math.min(retryDelayRef.current * 2, MAX_RETRY_DELAY_MS);
      };
    };

    connect();

    return () => {
      shouldReconnectRef.current = false;
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
      wsRef.current?.close();
      wsRef.current = null;
      retryDelayRef.current = INITIAL_RETRY_DELAY_MS;
    };
  }, [isLoggedIn, queryClient]);
}

function handleRealtimeEvent(queryClient: QueryClient, event: ChatRealtimeEvent) {
  switch (event.type) {
    case 'MESSAGE_CREATED': {
      // 발신자 본인은 이 이벤트를 받지 않는다(findRealtimeRecipientUuids가 제외) — 즉 이 클라이언트가
      // 받는 MESSAGE_CREATED는 항상 상대방이 보낸 메시지라 unreadCount를 그대로 +1 하면 된다.
      const message = event.data as MessageCreatedData;
      queryClient.setQueryData<ChatRoomListResult>(['chat', 'rooms'], (old) => {
        if (!old) return old;
        return {
          ...old,
          rooms: old.rooms.map((room) =>
            room.chatRoomId === event.chatRoomId
              ? { ...room, lastMessage: message, unreadCount: room.unreadCount + 1 }
              : room
          ),
        };
      });
      // 메시지 상세 목록(useChatMessagesQuery) 캐시 갱신은 그 쿼리가 생기는 Phase 3-D에서 추가한다.
      break;
    }
    case 'MESSAGE_READ': {
      // 방 목록 REST 응답엔 상대방의 읽음 커서가 아예 안 내려오므로, 이 이벤트가 유일한 정보원이다.
      // 아직 이 캐시를 구독하는 화면이 없다 — 메시지 상세 화면(Phase 3-D)이 읽어서 쓸 슬롯만 미리 채워둔다.
      const readData = event.data as MessageReadData;
      queryClient.setQueryData(['chat', 'readReceipts', event.chatRoomId], readData);
      break;
    }
    default:
      logger.debug('[useChatRealtimeConnection] unhandled event type', event.type);
  }
}
