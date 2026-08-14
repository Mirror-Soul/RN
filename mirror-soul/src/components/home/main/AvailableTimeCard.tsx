import { Feather } from '@expo/vector-icons';
import { Colors, FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { useTimeStatusQuery } from '@/src/features/profile/hooks/useTimeStatusQuery';
import { formatCallTime } from '@/src/utils/formatCallTime';

interface AvailableTimeCardProps {
  /** 지정하지 않으면 서버에서 조회한 남은 시간을 사용합니다. */
  timeDisplay?: string;
  onRefillPress?: () => void;
}

/**
 * AvailableTimeCard 컴포넌트 (SRP)
 * 잔여 대화 시간 표시와 "Refill" 트리거 버튼만 담당합니다.
 * 충전 바텀시트의 열림 상태는 부모(index.tsx)가 소유합니다.
 */
export default function AvailableTimeCard({
  timeDisplay,
  onRefillPress,
}: AvailableTimeCardProps) {
  const { colors } = useThemeColors();
  const { data, isLoading, isError, refetch } = useTimeStatusQuery();
  const displayValue =
    timeDisplay ?? (isLoading ? '--:--:--' : isError ? '조회 실패 · 재시도' : formatCallTime(data?.remainingTalkTime ?? 0));

  return (
    <View style={[styles.container, { backgroundColor: colors.background.glass, borderColor: colors.border.primary }]}>
      <View style={styles.left}>
        <View style={styles.iconWrapper}>
          <Feather name="clock" size={20} color={Colors.primary.electricCyan} />
        </View>
        <View>
          <Text style={[styles.label, { color: colors.text.muted }]}>Available Time</Text>
          {isError && !timeDisplay ? (
            <TouchableOpacity onPress={() => refetch()} accessibilityRole="button" accessibilityLabel="남은 시간 다시 조회">
              <Text style={[styles.value, styles.valueError, { color: colors.state.danger }]}>{displayValue}</Text>
            </TouchableOpacity>
          ) : (
            <Text style={[styles.value, { color: colors.text.primary }]}>{displayValue}</Text>
          )}
        </View>
      </View>

      <TouchableOpacity
        style={styles.refillButton}
        onPress={onRefillPress}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="시간 충전하기"
      >
        <Text style={styles.refillText}>Refill</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    alignSelf: 'stretch',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderRadius: Radii.xxl,
    borderWidth: 1,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: Radii.md2,
    backgroundColor: Colors.glass.cyan10_d3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.black,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  value: {
    fontFamily: FontFamily.mono,
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.black,
    letterSpacing: -0.45,
  },
  valueError: {
    fontSize: FontSize.sm,
    textDecorationLine: 'underline',
  },
  refillButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radii.md2,
    backgroundColor: Colors.primary.electricCyan,
  },
  refillText: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.black,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: Colors.primary.soulBlack,
  },
});
