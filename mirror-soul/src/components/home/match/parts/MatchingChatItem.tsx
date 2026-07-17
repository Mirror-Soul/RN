import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import {Colors, FontFamily, Radii, FontSize, FontWeight, Spacing} from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export interface MatchingChatData {
  id: string;
  name: string;
  timeAgo: string;
  message: string;
  age: number;
  resonance: number;
  isOnline: boolean;
  avatarLetter: string;
  gradientColors: [string, string];
}

interface MatchingChatItemProps {
  data: MatchingChatData;
  onPress?: () => void;
}

export default function MatchingChatItem({ data, onPress }: MatchingChatItemProps) {
  const { colors } = useThemeColors();

  return (
    <Pressable 
      style={[styles.container, { backgroundColor: colors.background.glass, borderColor: colors.border.primary }]}
      onPress={onPress}
    >
      {/* 아바타 영역 */}
      <View style={styles.avatarContainer}>
        <LinearGradient
          colors={data.gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.avatarGradient, { borderColor: colors.border.primary }]}
        >
          <Text style={styles.avatarText}>{data.avatarLetter}</Text>
        </LinearGradient>
        {/* 온라인 상태 닷 */}
        {data.isOnline && (
          <View style={[styles.onlineDot, { borderColor: colors.background.card, backgroundColor: colors.state.success }]} />
        )}
      </View>

      {/* 정보 영역 */}
      <View style={styles.infoContainer}>
        {/* 이름 & 시간 */}
        <View style={styles.headerRow}>
          <Text style={[styles.nameText, { color: colors.text.primary }]}>{data.name}</Text>
          <Text style={[styles.timeText, { color: colors.text.muted }]}>{data.timeAgo}</Text>
        </View>

        {/* 마지막 메시지 */}
        <Text style={[styles.messageText, { color: colors.text.muted }]} numberOfLines={1}>
          {data.message}
        </Text>

        {/* 하단 메타 데이터 */}
        <View style={styles.metaRow}>
          <Text style={[styles.metaText, { color: colors.text.secondary }]}>
            {data.age}y • Resonance {data.resonance}%
          </Text>
        </View>
      </View>

      {/* 우측 화살표 아이콘 */}
      <View style={[styles.actionIconContainer, { backgroundColor: Colors.glass.white05, borderColor: colors.border.primary }]}>
        <Ionicons name="chevron-forward" size={16} color={colors.text.secondary} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg, // 기존 xl에서 lg로 약간 줄여서 슬림한 카드 UI 달성
    gap: Spacing.lg,
    borderWidth: 1,
    borderRadius: Radii.lg2, 
    marginBottom: Spacing.md,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    position: 'relative',
  },
  avatarGradient: {
    width: '100%',
    height: '100%',
    borderRadius: Radii.xl,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.black,
    fontSize: FontSize.xl,
    letterSpacing: -0.45,
    color: Colors.neutral.pureWhite,
  },
  onlineDot: {
    position: 'absolute',
    width: 16,
    height: 16,
    right: -2,
    bottom: -2,
    borderRadius: Radii.full,
    borderWidth: 3,
  },
  infoContainer: {
    flex: 1,
    gap: Spacing.xs, // 하드코딩 6 대신 디자인 시스템 토큰 사용
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  nameText: {
    flex: 1, // 이름이 길어질 경우 말줄임표시를 위해
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.black,
    fontSize: FontSize.lg,
    letterSpacing: -0.71,
  },
  timeText: {
    fontFamily: FontFamily.mono,
    fontWeight: FontWeight.regular,
    fontSize: FontSize.xs,
    flexShrink: 0, // 시간이 줄어들지 않도록
  },
  messageText: {
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.medium,
    fontSize: FontSize.base,
    letterSpacing: -0.15,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xxs,
  },
  metaText: {
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.bold,
    fontSize: FontSize.xs,
    letterSpacing: 0.11,
  },
  actionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: Radii.full,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
