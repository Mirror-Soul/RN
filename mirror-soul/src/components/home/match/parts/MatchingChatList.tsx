import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {Colors, FontFamily, FontSize, FontWeight, Spacing} from '@/src/constants/theme';
import MatchingChatItem from './MatchingChatItem';
import MatchingTabStatus from './MatchingTabStatus';
import { useChatRoomsQuery } from '@/src/features/chat/hooks/useChatRoomsQuery';

export default function MatchingChatList() {
  const { data, isLoading, isError, refetch } = useChatRoomsQuery();
  const rooms = data?.rooms ?? [];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>진행 중인 대화</Text>
        <Text style={styles.slotsText}>{rooms.length}자리</Text>
      </View>

      {isLoading ? (
        <MatchingTabStatus isLoading message="불러오는 중" />
      ) : isError && !data ? (
        // 캐시된 방 목록이 있으면 백그라운드 재조회 실패 정도로 전체 화면을 덮지 않는다.
        <MatchingTabStatus message="대화 목록을 불러오지 못했습니다" onRetry={refetch} />
      ) : rooms.length === 0 ? (
        <MatchingTabStatus message="아직 진행 중인 대화가 없어요" />
      ) : (
        <View style={styles.listContainer}>
          {rooms.map((room) => (
            <MatchingChatItem key={room.chatRoomId} data={room} />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: Spacing.xxxl,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  headerTitle: {
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.black,
    fontSize: FontSize.xs,
    letterSpacing: 2.11,
    textTransform: 'uppercase',
    color: Colors.neutral.disabledText,
  },
  slotsText: {
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.black,
    fontSize: FontSize.xs,
    letterSpacing: 0.11,
    color: Colors.primary.vividPurple,
  },
  listContainer: {
    gap: Spacing.lg, // gap으로 아이템 사이 여백 (marginBottom이 있으나 일관성을 위해)
  },
});
