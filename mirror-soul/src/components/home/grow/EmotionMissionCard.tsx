import { Feather } from '@expo/vector-icons';
import { Colors, FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useThemeColors } from '@/src/hooks/useThemeColors';

interface EmotionMissionCardProps {
  onPress?: () => void;
}

/**
 * EmotionMissionCard 컴포넌트 (SRP)
 * 오늘의 감정 기록 미션 진입 카드입니다. 감정 기록 모달 오픈은 부모가 소유합니다.
 */
export default function EmotionMissionCard({ onPress }: EmotionMissionCardProps) {
  const { colors } = useThemeColors();

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.background.glass, borderColor: colors.border.primary }]}
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel="감정 조각 미션"
    >
      <View style={styles.iconWrapper}>
        <Feather name="smile" size={24} color={Colors.gradient.matchingStart[0]} />
      </View>

      <View>
        <Text style={[styles.title, { color: colors.text.primary }]}>감정 조각</Text>
        <Text style={[styles.subtitle, { color: colors.text.muted }]}>오늘 하루의 분위기 기록</Text>
        <Text style={[styles.boostText, { color: colors.text.muted }]}>+ 0.2% Boost</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: Radii.xxl,
    borderWidth: 1,
    padding: Spacing.xl,
    justifyContent: 'space-between',
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: Radii.lg,
    backgroundColor: Colors.glass.pink20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.base,
    fontWeight: FontWeight.black,
  },
  subtitle: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    marginTop: 4,
  },
  boostText: {
    fontFamily: FontFamily.sans,
    fontSize: 8,
    fontWeight: FontWeight.black,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: Spacing.md,
  },
});
