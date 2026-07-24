import { Ionicons } from '@expo/vector-icons';
import { Colors, FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useThemeColors } from '@/src/hooks/useThemeColors';

interface ValueBalanceMissionCardProps {
  onPress?: () => void;
}

/**
 * ValueBalanceMissionCard 컴포넌트 (SRP)
 * 가치관 밸런스 게임 미션 진입 카드입니다. 게임 모달 오픈은 부모가 소유합니다.
 */
export default function ValueBalanceMissionCard({ onPress }: ValueBalanceMissionCardProps) {
  const { colors } = useThemeColors();

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.background.glass, borderColor: colors.border.primary }]}
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel="가치관 밸런스 게임 미션"
    >
      <View style={styles.left}>
        <View style={styles.iconWrapper}>
          <Ionicons name="game-controller-outline" size={28} color={Colors.primary.vividPurple} />
        </View>
        <View style={styles.textArea}>
          <Text style={[styles.title, { color: colors.text.primary }]}>가치관 밸런스 게임</Text>
          <Text style={[styles.subtitle, { color: colors.text.muted }]}>트윈의 의사결정 알고리즘을 정교하게 다듬기</Text>
        </View>
      </View>

      <View style={[styles.deepBadge, { backgroundColor: colors.background.card, borderColor: colors.border.primary }]}>
        <Text style={styles.deepBadgeText}>DEEP</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: Radii.xxl,
    borderWidth: 1,
    padding: Spacing.xl,
    alignSelf: 'stretch',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    flex: 1,
  },
  iconWrapper: {
    width: 56,
    height: 56,
    borderRadius: Radii.xl,
    backgroundColor: Colors.glass.purple20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textArea: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.md,
    fontWeight: FontWeight.black,
  },
  subtitle: {
    fontFamily: FontFamily.sans,
    fontSize: 11,
    fontWeight: FontWeight.medium,
  },
  deepBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radii.full,
    borderWidth: 1,
  },
  deepBadgeText: {
    fontFamily: FontFamily.sans,
    fontSize: 9,
    fontWeight: FontWeight.black,
    color: Colors.primary.vividPurple,
  },
});
