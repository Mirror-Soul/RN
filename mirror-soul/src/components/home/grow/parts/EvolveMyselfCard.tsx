import MyselfIcon from '@/assets/images/common/evlove/evlove_myself.svg';
import { Colors, Radii } from '@/src/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated from 'react-native-reanimated';
import useAnimatedTheme from '@/src/hooks/useAnimatedTheme';

/**
 * 내 트윈과 대화하기 배너 (SRP)
 */
export default function EvolveMyselfCard() {
  const { animatedText, animatedTextSecondary } = useAnimatedTheme();

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel="내 트윈과 대화하기 미션"
      accessibilityHint="현재 학습된 트윈의 답변을 확인하기 위한 대화 화면으로 이동"
    >
      <LinearGradient
        colors={['rgba(0, 211, 243, 0.10)', 'rgba(194, 122, 255, 0.10)', 'rgba(251, 100, 182, 0.10)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.container}
      >
        <View style={styles.contentRow}>
          {/* 좌측 아이콘 */}
          <LinearGradient
            colors={[Colors.glass.cyan30, Colors.glass.purple30]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.iconBg}
          >
            <MyselfIcon width={20} height={20} />
          </LinearGradient>

          {/* 텍스트 영역 */}
          <View style={styles.textContainer}>
            <Animated.Text style={[styles.title, animatedText]}>내 트윈과 대화하기</Animated.Text>
            <Animated.Text style={[styles.subTitle, animatedTextSecondary]}>지금 어떻게 답변하는지 확인해보세요</Animated.Text>
          </View>

          {/* 우측 화살표 */}
          <Text style={styles.arrow}>→</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: Radii.md2,
    borderWidth: 0.612,
    borderColor: Colors.glass.white20,
    alignSelf: 'stretch',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBg: {
    width: 40,
    height: 40,
    borderRadius: Radii.md2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    letterSpacing: -0.15,
  },
  subTitle: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
  arrow: {
    color: Colors.primary.electricCyan,
    fontFamily: 'Inter',
    fontSize: 18,
    fontWeight: '500',
    lineHeight: 28,
    letterSpacing: -0.439,
  },
});
