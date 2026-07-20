import { useState, useRef, useCallback } from 'react';
import { ScrollView } from 'react-native';
import { MessageItem, MessageDateGroup } from '../types';

export function useMessageRoom(initialDateGroups: MessageDateGroup[]) {
  const scrollRef = useRef<ScrollView>(null);
  const [dateGroups, setDateGroups] = useState<MessageDateGroup[]>(initialDateGroups);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const handleSend = useCallback((text: string) => {
    const newMsg: MessageItem = {
      id: `sent-${Date.now()}`,
      text,
      direction: 'SENT',
      timestamp: new Date().toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }),
    };

    setDateGroups((prev) => {
      const groups = [...prev];
      const todayGroup = groups.find((g) => g.date === '오늘');
      if (todayGroup) {
        return groups.map((g) =>
          g.date === '오늘' ? { ...g, messages: [...g.messages, newMsg] } : g
        );
      }
      return [...groups, { date: '오늘', messages: [newMsg] }];
    });

    // 전송 후 스크롤 하단으로
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, []);

  return {
    dateGroups,
    handleSend,
    scrollRef,
    isPanelOpen,
    setIsPanelOpen,
  };
}
