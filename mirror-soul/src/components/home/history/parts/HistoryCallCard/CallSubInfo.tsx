import HistoryIcon from '@/assets/images/common/bottomNavbar/History_button.svg';
import PurpleHeartIcon from '@/assets/images/common/history/purpleHeart.svg';
import {Colors, Radii, FontFamily, FontSize, FontWeight, Spacing} from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

export interface CallSubInfoProps {
  durationLabel: string; // ex) "8분 23초"
  twinMatchLabel: string; // ex) "상대 Twin 92%"
}

export default function CallSubInfo({
  durationLabel,
  twinMatchLabel,
}: CallSubInfoProps) {
  const { colors } = useThemeColors();

  return (
    <View style={styles.container}>
      {/* Time */}
      <View style={[styles.chip, { backgroundColor: colors.background.glass, borderColor: colors.border.primary }]}>
        <HistoryIcon width={16} height={16} color={colors.text.muted} />
        <Text style={[styles.chipText, { color: colors.text.muted }]}>{durationLabel}</Text>
      </View>

      {/* Twin Match */}
      <View style={[styles.chip, { backgroundColor: colors.background.glass, borderColor: colors.border.primary }]}>
        <PurpleHeartIcon width={16} height={16} />
        <Text style={[styles.chipText, { color: colors.text.muted }]}>{twinMatchLabel}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md, // 11.992px
    alignSelf: 'stretch',
  },
  chip: {
    flex: 1, // 균등 분할
    flexDirection: 'row',
    height: 32, // 31.988px
    paddingHorizontal: Spacing.sm,
    alignItems: 'center',
    gap: Spacing.sm,
    borderRadius: Radii.smmd, // 10px (스펙에서 새로 추가함)
  },
  chipText: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.regular,
    lineHeight: 16, // 133.333%
  },
});
