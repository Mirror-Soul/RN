import HistoryIcon from '@/assets/images/common/bottomNavbar/History_button.svg';
import PurpleHeartIcon from '@/assets/images/common/history/purpleHeart.svg';
import { Colors, Radii } from '@/src/constants/theme';
import { useAnimatedTheme } from '@/src/hooks/useAnimatedTheme';
import Animated from 'react-native-reanimated';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export interface CallSubInfoProps {
  durationLabel: string; // ex) "8분 23초"
  twinMatchLabel: string; // ex) "상대 Twin 92%"
}

export default function CallSubInfo({
  durationLabel,
  twinMatchLabel,
}: CallSubInfoProps) {
  const theme = useAnimatedTheme();

  return (
    <View style={styles.container}>
      {/* Time */}
      <Animated.View style={[styles.chip, theme.animatedGlassBackground]}>
        <HistoryIcon width={16} height={16} color={theme.colors.text.muted} />
        <Animated.Text style={[styles.chipText, theme.animatedTextMuted]}>{durationLabel}</Animated.Text>
      </Animated.View>

      {/* Twin Match */}
      <Animated.View style={[styles.chip, theme.animatedGlassBackground]}>
        <PurpleHeartIcon width={16} height={16} />
        <Animated.Text style={[styles.chipText, theme.animatedTextMuted]}>{twinMatchLabel}</Animated.Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12, // 11.992px
    alignSelf: 'stretch',
  },
  chip: {
    flex: 1, // 균등 분할
    flexDirection: 'row',
    height: 32, // 31.988px
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 8,
    borderRadius: Radii.smmd, // 10px (스펙에서 새로 추가함)
  },
  chipText: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16, // 133.333%
  },
});
