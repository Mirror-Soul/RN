import React, { useState } from 'react';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BrowseText as Text } from '@/src/components/home/common/BrowseText';
import { Radii, Spacing } from '@/src/constants/theme';
import { useMatchingDesign } from '@/src/features/match/components/MatchingDesign';
import { useTimeStatusQuery } from '@/src/features/profile/hooks/useTimeStatusQuery';
import { useLayout } from '@/src/hooks/useLayout';
import { formatCallTime } from '@/src/utils/formatCallTime';

interface DiscoverySettingsBarProps {
  regionName?: string | null;
  nearbyCount?: number;
  isRegionLoading: boolean;
  isRegionError: boolean;
  onRegionRetry: () => void;
  onRegionPress: () => void;
  onRefillPress: () => void;
}

/** Two independent actions in one surface; each failed query retries only its own domain. */
export default function DiscoverySettingsBar({ regionName, nearbyCount, isRegionLoading, isRegionError, onRegionRetry, onRegionPress, onRefillPress }: DiscoverySettingsBarProps) {
  const { colors, palette } = useMatchingDesign();
  const { data, isLoading, isError, refetch } = useTimeStatusQuery();
  const { contentWidth, screenPadding } = useLayout();
  const insets = useSafeAreaInsets();
  const { fontScale } = useWindowDimensions();
  const [measuredWidth, setMeasuredWidth] = useState<number | null>(null);
  const timeKnown = !isLoading && data && Number.isSafeInteger(data.remainingTalkTime) && data.remainingTalkTime >= 0;
  const timeDisplay = isError ? '다시 확인' : timeKnown ? formatCallTime(data.remainingTalkTime) : '--:--:--';
  const neighbors = typeof nearbyCount === 'number' && Number.isFinite(nearbyCount) ? Math.max(0, Math.floor(nearbyCount) - 1) : 0;
  const regionDisplay = isRegionError ? '다시 확인' : isRegionLoading ? '확인 중…' : regionName ? `${regionName}${neighbors > 0 ? ' 주변' : ''}` : '전체 지역';
  const regionDescription = regionName ? `${regionName}${neighbors > 0 ? ` 외 ${neighbors}개 동` : ''}` : '전체 지역';
  const availableWidth = measuredWidth ?? contentWidth - 2 * screenPadding - insets.left - insets.right;
  const stacked = fontScale > 1.3 || availableWidth < Math.max(300, timeDisplay.length * 10 * fontScale + 66 + 130 * fontScale + 8);
  const timeLabel = isError ? '남은 시간 다시 조회' : timeKnown
    ? `남은 대화 시간 ${Math.floor(data.remainingTalkTime / 3600)}시간 ${Math.floor((data.remainingTalkTime % 3600) / 60)}분 ${data.remainingTalkTime % 60}초, 충전하기`
    : '남은 대화 시간 확인 중, 충전하기';

  return <View testID="discovery-settings-bar" onLayout={event => setMeasuredWidth(event.nativeEvent.layout.width)} style={[styles.bar, stacked && styles.stacked, { backgroundColor: colors.background.card, borderColor: colors.border.primary }]}>
    <Pressable onPress={isError ? () => { void refetch(); } : onRefillPress} accessibilityRole="button" accessibilityLabel={timeLabel}
      style={({ pressed }) => [styles.action, styles.timeAction, stacked && styles.stackedAction, pressed && { backgroundColor: palette.coolTint }]}>
      <Feather name="clock" size={18} color={palette.cyanInk} />
      <Text variant="heading" numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.5} style={[styles.time, { color: isError ? colors.state.danger : palette.cyanInk }]}>{timeDisplay}</Text>
      <Feather name={isError ? 'refresh-cw' : 'plus'} size={16} color={colors.text.secondary} />
    </Pressable>
    <View pointerEvents="none" style={[styles.divider, stacked && styles.horizontalDivider, { backgroundColor: colors.border.primary }]} />
    <Pressable onPress={isRegionError ? onRegionRetry : onRegionPress} disabled={isRegionLoading} accessibilityRole="button"
      accessibilityLabel={isRegionError ? '탐색 지역 다시 조회' : isRegionLoading ? '탐색 지역 확인 중' : `탐색 지역 ${regionDescription}, 지역 설정`}
      accessibilityState={{ disabled: isRegionLoading }} style={({ pressed }) => [styles.action, styles.regionAction, stacked && styles.stackedAction, pressed && { backgroundColor: palette.coolTint }]}>
      <Feather name="map-pin" size={18} color={palette.accentInk} />
      <Text numberOfLines={stacked ? undefined : 1} ellipsizeMode="tail" style={[styles.region, { color: isRegionError ? colors.state.danger : colors.text.primary }]}>{regionDisplay}</Text>
      <Feather name={isRegionError ? 'refresh-cw' : 'chevron-down'} size={16} color={colors.text.secondary} />
    </Pressable>
  </View>;
}

const styles = StyleSheet.create({
  bar: { minHeight: 56, borderWidth: 1, borderRadius: Radii.lg, padding: 3, flexDirection: 'row', alignItems: 'center' },
  stacked: { flexDirection: 'column', alignItems: 'stretch' },
  action: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 8, borderRadius: Radii.md },
  timeAction: { flexShrink: 0 },
  regionAction: { flex: 1, minWidth: 0 },
  stackedAction: { flex: 0, width: '100%' },
  time: { minWidth: 0, flexShrink: 1, fontSize: 16, lineHeight: 24, fontWeight: '600', fontVariant: ['tabular-nums'] },
  region: { flex: 1, minWidth: 0, fontSize: 15, lineHeight: 23, fontWeight: '500' },
  divider: { width: StyleSheet.hairlineWidth, height: 24 },
  horizontalDivider: { width: 'auto', height: StyleSheet.hairlineWidth, marginHorizontal: Spacing.sm },
});
