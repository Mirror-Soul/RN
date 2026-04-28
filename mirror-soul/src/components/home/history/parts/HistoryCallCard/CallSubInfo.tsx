import HistoryIcon from '@/assets/images/common/bottomNavbar/History_button.svg';
import PurpleHeartIcon from '@/assets/images/common/history/purpleHeart.svg';
import { Colors, Radii } from '@/src/constants/theme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export interface CallSubInfoProps {
  durationLabel: string; // ex) "8분 23초"
  twinMatchLabel: string; // ex) "상대 Twin 92%"
}

export default function CallSubInfo({
  durationLabel,
  twinMatchLabel,
}: CallSubInfoProps) {
  return (
    <View style={styles.container}>
      {/* Time */}
      <View style={styles.chip}>
        <HistoryIcon width={16} height={16} color={Colors.neutral.lightGrayText} />
        <Text style={styles.chipText}>{durationLabel}</Text>
      </View>

      {/* Twin Match */}
      <View style={styles.chip}>
        <PurpleHeartIcon width={16} height={16} />
        <Text style={styles.chipText}>{twinMatchLabel}</Text>
      </View>
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
    backgroundColor: Colors.glass.white5,
  },
  chipText: {
    color: Colors.neutral.lightGrayText, // #D1D5DC
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16, // 133.333%
  },
});
