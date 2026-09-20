import { useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useAuthStore } from '@/src/store/useAuthStore';
import { getErrorDisplayMessage } from '@/src/utils/apiErrorCode';
import { useChatMessagesQuery } from '@/src/features/chat/hooks/useChatMessagesQuery';
import { useSendMessageMutation } from '@/src/features/chat/hooks/useSendMessageMutation';
import { useReadMessagesMutation } from '@/src/features/chat/hooks/useReadMessagesMutation';
import { useChatReadReceipt } from '@/src/features/chat/hooks/useChatReadReceipt';
import { mapMessagesToDateGroups } from '../utils/mapMessagesToDateGroups';
import { FlattenedListItem } from '../types';

/** 메시지방 화면 오케스트레이션 훅 — 실제 메시지 조회/전송/읽음 처리를 조합한다(SoC). */
export function useMessageRoom(roomId: number) {
  const scrollRef = useRef<FlashList<FlattenedListItem>>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const myUuid = useAuthStore((s) => s.userUuid);

  const { messages, isLoading, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useChatMessagesQuery(roomId);
  const sendMutation = useSendMessageMutation(roomId);
  const readMutation = useReadMessagesMutation(roomId);
  const readReceipt = useChatReadReceipt(roomId);

  const dateGroups = mapMessagesToDateGroups(messages, myUuid, readReceipt?.lastReadMessageId ?? null);

  // 방에 새 메시지가 보일 때마다(REST 응답 반영이든 실시간 갱신이든) 자동으로 읽음 처리한다.
  const lastMarkedReadIdRef = useRef<number | null>(null);
  useEffect(() => {
    if (messages.length === 0) return;
    const latestId = messages[messages.length - 1].messageId;
    if (latestId === lastMarkedReadIdRef.current) return;
    lastMarkedReadIdRef.current = latestId;
    readMutation.mutate(latestId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  const handleSend = (text: string) => {
    sendMutation.mutate(text, {
      onError: (error) => Alert.alert('전송 실패', getErrorDisplayMessage(error, '메시지를 보내지 못했습니다.')),
    });
  };

  return {
    dateGroups,
    handleSend,
    scrollRef,
    isPanelOpen,
    setIsPanelOpen,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  };
}
