import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import {
  Colors,
  FontFamily,
  FontSize,
  FontWeight,
  Radii,
  Spacing,
} from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { useTimeStatusQuery } from '@/src/features/profile/hooks/useTimeStatusQuery';
import { formatCallTime } from '@/src/utils/formatCallTime';

export default function AvailableTimeCard({
  timeDisplay,
  onRefillPress,
}: {
  timeDisplay?: string;
  onRefillPress?: () => void;
}) {
  const { colors } = useThemeColors();
  const { data, isLoading, isError, refetch } = useTimeStatusQuery();
  const failed = isError && !timeDisplay;
  const display =
    timeDisplay ??
    (failed
      ? '다시 확인'
      : isLoading || !data
        ? '--:--:--'
        : formatCallTime(data.remainingTalkTime));
  return (
    <Pressable
      onPress={
        failed
          ? () => {
              void refetch();
            }
          : onRefillPress
      }
      accessibilityRole="button"
      accessibilityLabel={failed ? '남은 시간 다시 조회' : '시간 충전하기'}
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
        <Feather name="clock" size={20} color={colors.brand.accent} />
      </View>
      <View style={styles.copy}>
        <Text style={[styles.label, { color: colors.text.secondary }]}>
          남은 시간
        </Text>
        <Text
          style={[
            styles.value,
            { color: failed ? colors.state.danger : colors.text.primary },
          ]}
        >
          {display}
        </Text>
      </View>
      <View style={styles.action}>
        <Feather
          name={failed ? 'refresh-cw' : 'plus'}
          size={16}
          color={colors.text.secondary}
        />
        {!failed && (
          <Text style={[styles.label, { color: colors.text.secondary }]}>
            충전
          </Text>
        )}
      </View>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  card: {
    minHeight: 72,
    borderRadius: Radii.xxl,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: Radii.md,
    backgroundColor: Colors.glass.cyan10_d3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: { flex: 1, minWidth: 0, gap: Spacing.xs },
  label: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    lineHeight: 18,
  },
  value: {
    fontFamily: FontFamily.mono,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.semibold,
    lineHeight: 26,
    flexShrink: 1,
  },
  action: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xxs,
    maxWidth: 64,
  },
});
