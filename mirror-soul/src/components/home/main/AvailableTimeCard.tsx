import React from 'react';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import {
  FontFamily,
  FontSize,
  FontWeight,
  Radii,
  Spacing,
} from '@/src/constants/theme';
import { BrowseText as Text } from '@/src/components/home/common/BrowseText';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { useTimeStatusQuery } from '@/src/features/profile/hooks/useTimeStatusQuery';
import { formatCallTime } from '@/src/utils/formatCallTime';
import { useMatchingDesign } from '@/src/features/match/components/MatchingDesign';

export default function AvailableTimeCard({
  timeDisplay,
  onRefillPress,
}: {
  timeDisplay?: string;
  onRefillPress?: () => void;
}) {
  const { colors } = useThemeColors();
  const { fontScale } = useWindowDimensions();
  const stack = fontScale > 1.3;
  const { palette } = useMatchingDesign();
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
        stack && styles.stacked,
        {
          backgroundColor: colors.background.card,
          borderColor: colors.border.primary,
        },
        pressed && { opacity: 0.8 },
      ]}
    >
      <View style={styles.icon}>
        <Feather name="clock" size={18} color={palette.cyanInk} />
      </View>
      <View style={styles.copy}>
        <Text style={[styles.label, { color: colors.text.secondary }]}>
          남은 시간
        </Text>
        <Text
          variant="heading"
          style={[
            styles.value,
            { color: failed ? colors.state.danger : palette.cyanInk },
          ]}
        >
          {display}
        </Text>
      </View>
      <View style={[styles.action, stack && styles.stackedAction]}>
        <Feather name={failed ? 'refresh-cw' : 'plus'} size={16} color={colors.text.secondary} />
        <Text style={[styles.actionLabel, { color: colors.text.secondary }]}>{failed ? '재시도' : '충전'}</Text>
      </View>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  card: { minHeight: 80, borderRadius: Radii.md, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: Spacing.lg, paddingVertical: 12 },
  stacked: { flexWrap: 'wrap' },
  icon: { width: 24, alignItems: 'center' },
  copy: { flex: 1, minWidth: 0, gap: 2 },
  label: { fontFamily: FontFamily.sans, fontSize: 13, fontWeight: FontWeight.medium, lineHeight: 19 },
  value: { fontFamily: FontFamily.sans, fontSize: 22, fontWeight: FontWeight.semibold, lineHeight: 29, fontVariant: ['tabular-nums'] },
  action: { minHeight: 44, paddingHorizontal: 4, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
  stackedAction: { width: '100%', justifyContent: 'flex-end' },
  actionLabel: { fontFamily: FontFamily.sans, fontSize: FontSize.base, fontWeight: FontWeight.medium, lineHeight: 21, flexShrink: 1 },
});
