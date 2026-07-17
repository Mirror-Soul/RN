import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {FontFamily, FontSize, FontWeight, Spacing} from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import MatchingChatItem, { MatchingChatData } from './MatchingChatItem';
import { Colors } from '@/src/constants/theme';

const MOCK_CHATS: MatchingChatData[] = [
  {
    id: 'c1',
    name: 'Jessica',
    timeAgo: '어제',
    message: 'Twin이 전해준 제 이야기는 어떠셨나요?',
    age: 29,
    resonance: 92,
    isOnline: true,
    avatarLetter: 'J',
    gradientColors: ['rgba(194, 122, 255, 0.2)', 'rgba(230, 0, 118, 0.2)'],
  },
  {
    id: 'c2',
    name: 'Mia',
    timeAgo: '2일 전',
    message: '반가워요! 우리 Twin들이 먼저 친해졌네요.',
    age: 27,
    resonance: 87,
    isOnline: false,
    avatarLetter: 'M',
    gradientColors: ['rgba(194, 122, 255, 0.2)', 'rgba(230, 0, 118, 0.2)'],
  },
];

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
