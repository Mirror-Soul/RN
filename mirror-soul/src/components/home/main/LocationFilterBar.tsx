import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import {
  FontFamily,
  FontWeight,
  Radii,
  Spacing,
} from '@/src/constants/theme';
import { BrowseText as Text } from '@/src/components/home/common/BrowseText';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { useMatchingDesign } from '@/src/features/match/components/MatchingDesign';

export default function LocationFilterBar({
  selectedLocations,
  nearbyCount,
  isLoading,
  isError,
  onRetry,
  onPress,
}: {
  selectedLocations: string[];
  nearbyCount?: number;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  onPress?: () => void;
}) {
  const { colors } = useThemeColors();
  const { palette } = useMatchingDesign();
  const neighbors =
    typeof nearbyCount === 'number' && Number.isFinite(nearbyCount)
      ? Math.max(0, Math.floor(nearbyCount) - 1)
      : 0;
  const summary = isLoading
    ? '확인 중…'
    : isError
      ? '다시 확인'
      : selectedLocations.length
        ? `${selectedLocations.join(', ')}${neighbors > 0 ? ` 외 ${neighbors}개 동` : ''}`
        : '전체 지역';
  return (
    <Pressable
      disabled={isLoading}
      onPress={isError ? onRetry : onPress}
      accessibilityRole="button"
      accessibilityLabel={isError ? '탐색 지역 다시 조회' : '탐색 지역 설정'}
      accessibilityState={{ disabled: !!isLoading }}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.background.card,
          borderColor: colors.border.primary,
        },
        pressed && { opacity: 0.8 },
      ]}
    >
      <View style={styles.icon}>
        <Feather name="map-pin" size={18} color={palette.accentInk} />
      </View>
      <View style={styles.copy}>
        <Text style={[styles.label, { color: colors.text.secondary }]}>
          탐색 지역
        </Text>
        <Text
          variant="heading"
          style={[
            styles.value,
            { color: isError ? colors.state.danger : colors.text.primary },
          ]}
        >
          {summary}
        </Text>
      </View>
      <Feather
        name={isError ? 'refresh-cw' : 'chevron-right'}
        size={18}
        color={colors.text.secondary}
      />
    </Pressable>
  );
}
const styles = StyleSheet.create({
  card: { minHeight: 80, borderRadius: Radii.md, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: Spacing.lg, paddingVertical: 12 },
  icon: { width: 24, alignItems: 'center' },
  copy: { flex: 1, minWidth: 0, gap: 2 },
  label: { fontFamily: FontFamily.sans, fontSize: 13, fontWeight: FontWeight.medium, lineHeight: 19 },
  value: { fontFamily: FontFamily.sans, fontSize: 17, fontWeight: FontWeight.medium, lineHeight: 25 },
});
