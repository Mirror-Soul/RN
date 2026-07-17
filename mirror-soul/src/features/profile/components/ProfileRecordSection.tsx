import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {Colors, FontFamily, FontSize, FontWeight, Radii, Spacing} from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';

interface ProfileRecordSectionProps {
  bio: string;
  delay?: number;
}

export const ProfileRecordSection = ({
  bio,
  delay = 280,
}: ProfileRecordSectionProps) => {
  const { colors, isDark } = useThemeColors();

  const cardBgColors: readonly [string, string] = isDark
    ? ['rgba(255, 255, 255, 0.03)', 'rgba(0, 0, 0, 0)']
    : ['rgba(0, 0, 0, 0.03)', 'rgba(255, 255, 255, 0)'];

  return (
    <Animated.View
      entering={FadeInDown.delay(delay).duration(550).springify()}
      style={styles.container}
    >
      {/* 섹션 헤딩 + 구분선 */}
      <View style={styles.headingRow}>
        <Text style={[styles.headingText, { color: colors.text.muted }]}>나의 기록</Text>
        <View style={[styles.divider, { backgroundColor: colors.border.primary }]} />
      </View>

      {/* 자기소개 카드 */}
      <LinearGradient
        colors={cardBgColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.card, { borderColor: colors.border.primary }]}
      >
        <Text style={[styles.bioText, { color: colors.text.primary }]}>{bio}</Text>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.xxl,
  },

  // 헤딩 + 구분선
  headingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  headingText: {
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.black,
    fontSize: FontSize.xs,
    lineHeight: 15,
    letterSpacing: 2.12,
    textTransform: 'uppercase',
  },
  divider: {
    flex: 1,
    height: 1,
  },

  // 자기소개 카드
  card: {
    padding: Spacing.xxl,
    borderWidth: 1,
    borderRadius: Radii.xxl,
  },
  bioText: {
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.medium,
    fontSize: FontSize.xl,
    lineHeight: 25,
    letterSpacing: -0.44,
  },
});
