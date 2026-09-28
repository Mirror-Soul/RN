import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { InfiniteData, QueryClient, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/src/store/useAuthStore';
import { logger } from '@/src/utils/logger';
import type { ChatRealtimeEvent, MessageCreatedData, MessageReadData } from '@/src/types/chatRealtime';
import type { ChatRoomListResult, MessageListResult } from '@/src/types/api/chat';

const WS_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL?.replace('https://', 'wss://').replace('http://', 'ws://');
const INITIAL_RETRY_DELAY_MS = 1000;
const MAX_RETRY_DELAY_MS = 30000;
// 연결이 불가능한 환경에서도 수신 화면을 오래 비워두지 않기 위한 보정 주기다.
const REST_FALLBACK_INTERVAL_MS = 5000;

/**
 * React Native의 WebSocket 생성자는 표준 DOM lib.d.ts에 없는 3번째 인자(options.headers)를
 * Android/iOS 모두에서 지원한다. Android의 OkHttp 구현도 이 headers Map을 핸드셰이크 요청에
 * 그대로 추가하므로, 백엔드의 Authorization 기반 인증 계약과 맞는다.
 */
type RNWebSocketConstructor = new (
  url: string,
  protocols: string | string[] | undefined,
  options: { headers: Record<string, string> }
) => WebSocket;

type WebSocketCloseEvent = {
  code?: number;
  reason?: string;
  wasClean?: boolean;
};

/**
 * 앱 전역 채팅 실시간 레이어.
 *
 * 1. `/ws/chat`이 열려 있으면 MESSAGE_CREATED/MESSAGE_READ를 즉시 캐시에 반영한다.
 * 2. 토큰이 갱신되면 소켓도 새 Authorization 헤더로 다시 연결한다.
 * 3. 프록시·네트워크 문제로 연결하지 못하면 활성 채팅 쿼리를 5초마다 REST로 보정한다.
 *    따라서 소켓 실패가 수신자 화면의 빈 채팅방/오래된 목록으로 이어지지 않는다.
 */
export function useChatRealtimeConnection() {
  const queryClient = useQueryClient();
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const accessToken = useAuthStore((s) => s.accessToken);

  const wsRef = useRef<WebSocket | null>(null);
  const retryDelayRef = useRef(INITIAL_RETRY_DELAY_MS);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fallbackTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const appIsActiveRef = useRef(AppState.currentState === 'active');

  useEffect(() => {
    if (!isLoggedIn || !accessToken || !WS_BASE_URL) return;

    let disposed = false;

    const refetchActiveChatQueries = () => {
      if (!appIsActiveRef.current) return;
      // invalidate만 하면 화면에 현재 마운트된 쿼리가 없을 경우 언제 다시 보정될지 불명확하다.
      // active 쿼리는 즉시 다시 요청하고, 비활성 쿼리는 다음 화면 진입 때 최신화한다.
      void queryClient.refetchQueries({ queryKey: ['chat', 'rooms'], type: 'active' });
      void queryClient.refetchQueries({ queryKey: ['chat', 'messages'], type: 'active' });
    };

    const clearFallbackPolling = () => {
      if (fallbackTimerRef.current) {
        clearInterval(fallbackTimerRef.current);
        fallbackTimerRef.current = null;
      }
    };

    const startFallbackPolling = () => {
      if (fallbackTimerRef.current || !appIsActiveRef.current) return;
      refetchActiveChatQueries();
      fallbackTimerRef.current = setInterval(refetchActiveChatQueries, REST_FALLBACK_INTERVAL_MS);
      logger.warn('[useChatRealtimeConnection] WebSocket unavailable; REST fallback polling started');
    };

    const clearReconnectTimer = () => {
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
        retryTimerRef.current = null;
      }
    };

    const connect = () => {
      if (disposed || !appIsActiveRef.current) return;
      if (wsRef.current?.readyState === WebSocket.OPEN || wsRef.current?.readyState === WebSocket.CONNECTING) return;

      const WebSocketWithHeaders = WebSocket as unknown as RNWebSocketConstructor;
      const ws = new WebSocketWithHeaders(`${WS_BASE_URL}/ws/chat`, undefined, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      wsRef.current = ws;

      ws.onopen = () => {
        if (disposed || wsRef.current !== ws) {
          ws.close();
          return;
        }
        clearReconnectTimer();
        clearFallbackPolling();
        retryDelayRef.current = INITIAL_RETRY_DELAY_MS;
        logger.info('[useChatRealtimeConnection] connected');
        refetchActiveChatQueries();
      };

      ws.onmessage = (event) => {
        // 토큰 갱신/재연결 직후 이전 소켓이 늦게 보낸 이벤트로 최신 캐시를 덮지 않는다.
        if (disposed || wsRef.current !== ws) return;
        try {
          const chatEvent: ChatRealtimeEvent = JSON.parse(event.data as string);
          handleRealtimeEvent(queryClient, chatEvent);
        } catch (error) {
          logger.warn('[useChatRealtimeConnection] failed to parse event', error);
        }
      };

      ws.onerror = (event) => {
        const { message } = event as Event & { message?: string };
        logger.warn('[useChatRealtimeConnection] socket error', { message: message ?? 'native transport error' });
        startFallbackPolling();
      };

      ws.onclose = (event) => {
        // 새 토큰으로 이미 다른 소켓을 열었다면, 이전 소켓의 지연된 close 이벤트가
        // 재연결 타이머를 다시 만들거나 새 ref를 비워서는 안 된다.
        if (wsRef.current !== ws) return;
        wsRef.current = null;
        if (disposed) return;

        const { code, reason, wasClean } = event as unknown as WebSocketCloseEvent;
        logger.warn('[useChatRealtimeConnection] socket closed', { code, reason, wasClean });
        startFallbackPolling();
        clearReconnectTimer();
        retryTimerRef.current = setTimeout(() => {
          retryTimerRef.current = null;
          connect();
        }, retryDelayRef.current);
        retryDelayRef.current = Math.min(retryDelayRef.current * 2, MAX_RETRY_DELAY_MS);
      };
    };

    const appStateSubscription = AppState.addEventListener('change', (nextState) => {
      appIsActiveRef.current = nextState === 'active';
      if (nextState === 'active') {
        if (wsRef.current?.readyState !== WebSocket.OPEN) {
          startFallbackPolling();
          connect();
        }
        return;
      }

      clearReconnectTimer();
      clearFallbackPolling();
      wsRef.current?.close();
      wsRef.current = null;
    });

    connect();

    return () => {
      disposed = true;
      appStateSubscription.remove();
      clearReconnectTimer();
      clearFallbackPolling();
      wsRef.current?.close();
      wsRef.current = null;
      retryDelayRef.current = INITIAL_RETRY_DELAY_MS;
    };
  }, [accessToken, isLoggedIn, queryClient]);
}

function handleRealtimeEvent(queryClient: QueryClient, event: ChatRealtimeEvent) {
  switch (event.type) {
    case 'MESSAGE_CREATED': {
      // 발신자 본인은 이 이벤트를 받지 않는다. 수신자 목록의 미읽음 수만 증가시킨다.
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
      queryClient.setQueryData<InfiniteData<MessageListResult>>(
        ['chat', 'messages', event.chatRoomId],
        (old) => {
          if (!old) return old;
          const pages = [...old.pages];
          const firstPage = pages[0];
          if (firstPage.messages.some((item) => item.messageId === message.messageId)) return old;
          pages[0] = { ...firstPage, messages: [...firstPage.messages, message] };
          return { ...old, pages };
        }
      );
      break;
    }
    case 'MESSAGE_READ': {
      const readData = event.data as MessageReadData;
      queryClient.setQueryData(['chat', 'readReceipts', event.chatRoomId], readData);
      break;
    }
    default:
      logger.debug('[useChatRealtimeConnection] unhandled event type', event.type);
  }
}
