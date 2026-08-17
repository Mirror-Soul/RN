import type { TalkLogResponse, TalkLogResult } from '@/src/types/api/history';
import React, { useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { FlashList, FlashListRef, ListRenderItemInfo } from '@shopify/flash-list';
import ChatBubble from './parts/ChatBubble';
import { Animation, FontFamily, FontSize, FontWeight, Spacing } from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';

interface CallDetailBodyProps {
  talkLogs: TalkLogResult[];
  partnerName: string;
  partnerProfileImageUrl?: string | null;
  onSaveTalkLog: (talkLogId: number, message: string) => Promise<TalkLogResponse>;
  isSaving: boolean;
}

interface FlattenedTalkLog {
  log: TalkLogResult;
  hideAvatar: boolean;
  enterDelay: number;
}

// FlashList는 스크롤 중 새 인덱스의 셀을 마운트하며 재사용한다 — 인덱스에 비례해 무제한으로
// 커지는 딜레이를 주면, 리스트를 한참 내렸을 때 방금 화면에 들어온 말풍선이 그 큰 딜레이만큼
// 빈 공간으로 있다가 뒤늦게 나타나는 것처럼 보인다. 초기 화면에 보이는 분량 정도로만 stagger를
// 제한하고 그 이후는 즉시 렌더링한다.
const STAGGER_ITEM_LIMIT = 12;

/**
 * 통화 메시지 목록 렌더링 및 편집 트리거 (SRP)
 * 메시지 데이터 자체는 react-query 캐시(talkLogs prop)가 단일 진실 공급원이며,
 * 이 컴포넌트는 "현재 편집 중인 말풍선이 어느 것인가"라는 UI 전용 상태만 소유한다.
 * 저장 요청/캐시 갱신/에러 토스트는 useCallDetail 훅(부모)이 책임진다.
 *
 * FlashList를 시간순(비-inverted)으로 사용한다 — message-room의 실시간 채팅과 달리
 * "지난 통화를 처음부터 리뷰"하는 용도라 최신순이 아니라 시간순이 자연스럽다.
 */
export default function CallDetailBody({
  talkLogs,
  partnerName,
  partnerProfileImageUrl,
  onSaveTalkLog,
  isSaving,
}: CallDetailBodyProps) {
  const { colors } = useThemeColors();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState('');
  const listRef = useRef<FlashListRef<FlattenedTalkLog>>(null);
  // isSaving(mutation.isPending)만으로는 리렌더 사이의 좁은 레이스 윈도우에서 중복 저장이 가능하다 —
  // 루트 CLAUDE.md 컨벤션대로 동기 락을 병행한다 (TimeRefillBottomSheet.tsx와 동일 패턴).
  const savingInFlightRef = useRef(false);

  // 연속된 상대방 메시지에서 아바타를 반복 표시하지 않기 위한 그룹핑 + stagger 진입 딜레이.
  // message-room의 useMessageListFormatter.ts와 동일한 계산이지만, 통화 하나 = 세션 하나라
  // 날짜 분할은 필요 없다.
  const items: FlattenedTalkLog[] = useMemo(() => {
    return talkLogs.map((log, index) => {
      const isMine = log.speaker === 'ME' || log.speaker === 'MY_TWIN';
      const prev = talkLogs[index - 1];
      const prevIsMine = prev ? prev.speaker === 'ME' || prev.speaker === 'MY_TWIN' : null;
      const hideAvatar = !isMine && prevIsMine === false;
      const enterDelay = index < STAGGER_ITEM_LIMIT ? index * Animation.staggerDelay : 0;
      return { log, hideAvatar, enterDelay };
    });
  }, [talkLogs]);

  const handleEditStart = (id: number, currentText: string) => {
    setEditingId(id);
    setEditText(currentText);
    // 편집 대상이 화면 아래쪽에 있으면 키보드에 가려질 수 있다 — FlashList는 자체 recycler view라
    // iOS의 TextInput 포커스 자동 스크롤이 그대로 안 먹을 수 있어 직접 스크롤해준다. 이미 화면
    // 맨 위쪽에 보이는 항목이면(키보드가 떠도 가려질 위험이 낮음) 불필요한 스크롤 애니메이션을
    // 건너뛴다 — 그 외(아래쪽/애매한 위치)는 안전하게 스크롤한다.
    const index = items.findIndex((item) => item.log.talkLogId === id);
    if (index < 0) return;
    const { startIndex } = listRef.current?.computeVisibleIndices() ?? { startIndex: -1, endIndex: -1 };
    const isNearTop = startIndex >= 0 && index <= startIndex + 1;
    if (isNearTop) return;
    requestAnimationFrame(() => {
      listRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.3 });
    });
  };

  const handleEditSave = async (id: number) => {
    const trimmed = editText.trim();
    if (!trimmed) {
      setEditingId(null);
      return;
    }
    if (savingInFlightRef.current) return;
    savingInFlightRef.current = true;
    try {
      await onSaveTalkLog(id, trimmed);
      setEditingId(null);
    } catch {
      // 에러 토스트는 훅에서 이미 표시됨 — 편집 상태를 유지해 재시도할 수 있게 둔다
    } finally {
      savingInFlightRef.current = false;
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

  const renderItem = ({ item }: ListRenderItemInfo<FlattenedTalkLog>) => (
    <ChatBubble
      message={item.log}
      partnerName={partnerName}
      partnerProfileImageUrl={partnerProfileImageUrl}
      hideAvatar={item.hideAvatar}
      enterDelay={item.enterDelay}
      editingId={editingId}
      editText={editText}
      isSaving={isSaving && editingId === item.log.talkLogId}
      onEditStart={handleEditStart}
      onEditSave={handleEditSave}
      onEditCancel={handleEditCancel}
      onEditTextChange={setEditText}
    />
  );

  return (
    <FlashList
      ref={listRef}
      data={items}
      renderItem={renderItem}
      keyExtractor={(item) => String(item.log.talkLogId)}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    />
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
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
