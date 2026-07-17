import { ChatMessage } from '@/src/components/home/history/parts/HistoryCallCard';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import ChatBubble from './parts/ChatBubble';
import { Spacing } from '@/src/constants/theme';


interface CallDetailBodyProps {
  initialMessages: ChatMessage[];
}

/**
 * 통화 메시지 목록 및 편집 상태 관리 (SRP)
 * 메시지 렌더링과 편집 상태를 이 컴포넌트에서 중앙 관리합니다.
 */
export default function CallDetailBody({ initialMessages }: CallDetailBodyProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const handleEditStart = (id: string, currentText: string) => {
    setEditingId(id);
    setEditText(currentText);
  };

  const handleEditSave = (id: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === id
          ? { ...msg, text: editText.trim() || msg.text, isEdited: true }
          : msg
      )
    );
    setEditingId(null);
  };

  const handleEditCancel = () => {
    setEditingId(null);
  };

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {messages.map((msg) => (
        <View key={msg.id} style={styles.bubbleWrapper}>
          <ChatBubble
            message={msg}
            editingId={editingId}
            editText={editText}
            onEditStart={handleEditStart}
            onEditSave={handleEditSave}
            onEditCancel={handleEditCancel}
            onEditTextChange={setEditText}
          />
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  bubbleWrapper: {
    alignSelf: 'stretch',
  },
});
