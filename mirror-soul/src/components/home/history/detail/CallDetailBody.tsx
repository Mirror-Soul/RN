import type { TalkLogResponse, TalkLogResult } from '@/src/types/api/history';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import ChatBubble from './parts/ChatBubble';
import { FontFamily, FontSize, FontWeight, Spacing } from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';


interface CallDetailBodyProps {
  talkLogs: TalkLogResult[];
  onSaveTalkLog: (talkLogId: number, message: string) => Promise<TalkLogResponse>;
  isSaving: boolean;
}

/**
 * 통화 메시지 목록 렌더링 및 편집 트리거 (SRP)
 * 메시지 데이터 자체는 react-query 캐시(talkLogs prop)가 단일 진실 공급원이며,
 * 이 컴포넌트는 "현재 편집 중인 말풍선이 어느 것인가"라는 UI 전용 상태만 소유한다.
 * 저장 요청/캐시 갱신/에러 토스트는 useCallDetail 훅(부모)이 책임진다.
 */
export default function CallDetailBody({ talkLogs, onSaveTalkLog, isSaving }: CallDetailBodyProps) {
  const { colors } = useThemeColors();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState('');

  const handleEditStart = (id: number, currentText: string) => {
    setEditingId(id);
    setEditText(currentText);
  };

  const handleEditSave = async (id: number) => {
    const trimmed = editText.trim();
    if (!trimmed) {
      setEditingId(null);
      return;
    }
    try {
      await onSaveTalkLog(id, trimmed);
      setEditingId(null);
    } catch {
      // 에러 토스트는 훅에서 이미 표시됨 — 편집 상태를 유지해 재시도할 수 있게 둔다
    }
  };

  const handleEditCancel = () => {
    setEditingId(null);
  };

  if (talkLogs.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { color: colors.text.muted }]}>대화 내용이 없습니다</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {talkLogs.map((log) => (
        <View key={log.talkLogId} style={styles.bubbleWrapper}>
          <ChatBubble
            message={log}
            editingId={editingId}
            editText={editText}
            isSaving={isSaving && editingId === log.talkLogId}
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
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.giant,
  },
  emptyText: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
});
