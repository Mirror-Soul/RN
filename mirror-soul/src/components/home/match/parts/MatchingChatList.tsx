import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {FontFamily, FontSize, FontWeight, Spacing} from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import MatchingChatItem, { MatchingChatData } from './MatchingChatItem';
import { Colors } from '@/src/constants/theme';
import { MOCK_CHAT_ROOMS } from '@/src/mocks/messageMocks';

/**
 * MOCK_CHAT_ROOMS → MatchingChatData 변환 (단일 출처 유지)
 * API 연동 시 이 매핑 로직을 useQuery 결과 변환으로 교체합니다.
 */
const MOCK_CHATS: MatchingChatData[] = MOCK_CHAT_ROOMS.map((room) => {
  const lastGroup = room.dateGroups[room.dateGroups.length - 1];
  const lastMsg = lastGroup?.messages[lastGroup.messages.length - 1];
  return {
    id: room.id,
    name: room.name,
    timeAgo: lastGroup?.date ?? '',
    message: lastMsg?.text ?? '',
    age: 0, // API 연동 시 실제 나이 데이터로 교체
    resonance: room.resonance,
    isOnline: room.isOnline,
    avatarLetter: room.avatarLetter,
    gradientColors: room.avatarGradient,
  };
});

export default function MatchingChatList() {
  const { colors } = useThemeColors();

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Active Conversations</Text>
        <Text style={styles.slotsText}>2 Slots</Text>
      </View>

      {/* List */}
      <View style={styles.listContainer}>
        {MOCK_CHATS.map((chat) => (
          <MatchingChatItem key={chat.id} data={chat} />
        ))}
      </View>
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
