import { Feather } from '@expo/vector-icons';
import { Colors, FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useThemeColors } from '@/src/hooks/useThemeColors';

interface LocationFilterBarProps {
  selectedLocations: string[];
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  onPress?: () => void;
}

/**
 * LocationFilterBar 컴포넌트 (SRP)
 * 현재 선택된 지역 요약 텍스트 + 지역 선택 모달 오픈 버튼을 렌더링합니다.
 * 모달 오픈/닫힘 상태는 부모(index.tsx)가 소유합니다.
 */
export default function LocationFilterBar({
  selectedLocations,
  isLoading,
  isError,
  onRetry,
  onPress,
}: LocationFilterBarProps) {
  const { colors } = useThemeColors();
  const summary = isLoading
    ? '조회 중...'
    : isError
      ? '지역 조회 실패 · 재시도'
      : selectedLocations.length > 0
        ? selectedLocations.join(', ')
        : '전체 지역';

  return (
    <View style={styles.row}>
      <TouchableOpacity
        style={[
          styles.locationButton,
          { backgroundColor: colors.background.glass, borderColor: colors.border.primary },
          isLoading && styles.locationButtonDisabled,
        ]}
        onPress={isLoading ? undefined : isError ? onRetry : onPress}
        disabled={isLoading}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={isError ? '탐색 지역 다시 조회' : '탐색 지역 설정'}
        accessibilityState={{ disabled: Boolean(isLoading) }}
      >
        <View style={styles.left}>
          <View style={[styles.iconWrapper, { backgroundColor: Colors.glass.cyan10_d3 }]}>
            <Feather name="map-pin" size={16} color={Colors.primary.electricCyan} />
          </View>
          <View>
            <Text style={[styles.label, { color: colors.text.muted }]}>탐색 지역</Text>
            <Text
              style={[
                styles.value,
                { color: isError ? colors.state.danger : colors.text.secondary },
                isError && styles.valueError,
              ]}
            >
              {summary}
            </Text>
          </View>
        </View>
        <Feather name="chevron-down" size={16} color={colors.text.muted} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignSelf: 'stretch',
  },
  locationButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderRadius: Radii.xxl,
    borderWidth: 1,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: Radii.md2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontFamily: FontFamily.sans,
    fontSize: 9,
    fontWeight: FontWeight.black,
    letterSpacing: 1.07,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  value: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    letterSpacing: -0.15,
  },
  valueError: {
    textDecorationLine: 'underline',
  },
  locationButtonDisabled: {
    opacity: 0.6,
  },
});
