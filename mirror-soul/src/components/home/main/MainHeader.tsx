import SettingIcon from '@/assets/images/common/Setting.svg';
import TimerIcon from '@/assets/images/common/main/Timer.svg';
import {Colors, Radii, FontFamily} from '@/src/constants/theme';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useThemeColors } from '@/src/hooks/useThemeColors';

interface MainHeaderProps {
  timerDisplay?: string;
  onSettingPress?: () => void;
}

/**
 * MainHeader 컴포넌트 (SRP)
 * "Mirror Soul" 타이틀, 타이머 배지, 설정 버튼을 렌더링합니다.
 */
export default function MainHeader({
  timerDisplay = '23 : 44 : 59',
  onSettingPress,
}: MainHeaderProps) {
  const { colors } = useThemeColors();

  return (
    <View style={styles.container}>
      {/* Title */}
      <Text style={[styles.title, { color: colors.text.primary }]}>Mirror Soul</Text>

      {/* Timer + Setting */}
      <View style={styles.rightSection}>
        {/* Timer Badge */}
        <View style={[styles.timerBadge, { backgroundColor: colors.background.glass, borderColor: colors.border.primary }]}>
          <TimerIcon width={16} height={16} />
          <Text style={styles.timerText}>{timerDisplay}</Text>
        </View>

        {/* Setting Button */}
        <TouchableOpacity
          style={[styles.settingButton, { backgroundColor: colors.background.glass, borderColor: colors.border.primary }]}
          onPress={onSettingPress}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="설정"
        >
          <SettingIcon width={21} height={21} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 48,
    alignSelf: 'stretch',
  },
  title: {
    fontFamily: FontFamily.sans,
    fontSize: 24,
    fontWeight: '500',
    lineHeight: 32,
    letterSpacing: 0.07,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    height: 30,
    borderRadius: Radii.full,
    borderWidth: 0.612,
  },
  timerText: {
    color: Colors.primary.electricCyan,
    fontFamily: 'Menlo',
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
    letterSpacing: 0.6,
    textAlign: 'center',
  },
  settingButton: {
    width: 40,
    height: 40,
    borderRadius: Radii.full,
    borderWidth: 0.612,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
