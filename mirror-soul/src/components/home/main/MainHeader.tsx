import SettingIcon from '@/assets/images/common/Setting.svg';
import TimerIcon from '@/assets/images/common/main/Timer.svg';
import { Colors, Radii } from '@/src/constants/theme';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useAnimatedTheme } from '@/src/hooks/useAnimatedTheme';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

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
  const { animatedText, animatedGlassBackground } = useAnimatedTheme();

  return (
    <View style={styles.container}>
      {/* Title */}
      <Animated.Text style={[styles.title, animatedText]}>Mirror Soul</Animated.Text>

      {/* Timer + Setting */}
      <View style={styles.rightSection}>
        {/* Timer Badge */}
        <Animated.View style={[styles.timerBadge, animatedGlassBackground]}>
          <TimerIcon width={16} height={16} />
          <Animated.Text style={styles.timerText}>{timerDisplay}</Animated.Text>
        </Animated.View>

        {/* Setting Button */}
        <AnimatedTouchableOpacity
          style={[styles.settingButton, animatedGlassBackground]}
          onPress={onSettingPress}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="설정"
        >
          <SettingIcon width={21} height={21} />
        </AnimatedTouchableOpacity>
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
    fontFamily: 'Inter',
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
