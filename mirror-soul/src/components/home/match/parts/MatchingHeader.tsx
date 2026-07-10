import SettingIcon from '@/assets/images/common/Setting.svg';
import { Colors, Radii } from '@/src/constants/theme';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useAnimatedTheme } from '@/src/hooks/useAnimatedTheme';

/**
 * 매칭 화면 헤더 (뒤로가기 제거, 제목 중앙 정렬)
 */
export default function MatchingHeader() {
  const { animatedText, animatedGlassBackground, animatedBorder } = useAnimatedTheme();

  return (
    <View style={styles.header}>
      {/* 타이틀 중앙 정렬을 위한 더미 뷰 (좌측) */}
      <View style={styles.dummyView} />

      <View style={styles.titleContainer}>
        <Animated.Text style={[styles.title, animatedText]}>매칭</Animated.Text>
      </View>

      <TouchableOpacity 
        activeOpacity={0.7} 
      >
        <Animated.View style={[styles.circleButton, animatedGlassBackground, animatedBorder]}>
          <SettingIcon width={24} height={24} />
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  dummyView: {
    width: 40,
    height: 40,
  },
  circleButton: {
    width: 40,
    height: 40,
    borderRadius: Radii.full,
    borderWidth: 0.612,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Inter',
    fontSize: 18,
    fontWeight: '500',
    lineHeight: 28,
    letterSpacing: -0.439,
  },
});
