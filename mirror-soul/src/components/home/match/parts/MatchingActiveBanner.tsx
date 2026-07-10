import { Colors, Radii } from '@/src/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef, useState } from 'react';
import { Animated as RNAnimated, StyleSheet, TouchableOpacity, useWindowDimensions, View, Text } from 'react-native';
import { useThemeColors } from '@/src/hooks/useThemeColors';

/**
 * 매칭 활성화 상태 배너 (상태 토글 및 페이드 애니메이션 적용)
 */
export default function MatchingActiveBanner() {
  const { width } = useWindowDimensions();
  const [isActive, setIsActive] = useState(true);
  const { colors } = useThemeColors();

  // 페이드 애니메이션을 위한 값 (0: 비활성, 1: 활성)
  const fadeAnim = useRef(new RNAnimated.Value(1)).current;

  // 피그마 기준 동적 높이 계산 (57.197px)
  const bannerHeight = (width * 57.197) / 392.927;

  const toggleStatus = () => {
    const toValue = isActive ? 0 : 1;

    RNAnimated.timing(fadeAnim, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setIsActive(!isActive);
    });
  };

  // 활성 상태 스타일 (Opacity)
  const activeOpacity = fadeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  // 비활성 상태 스타일 (Opacity)
  const inactiveOpacity = fadeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });

  return (
    <LinearGradient
      colors={Colors.gradient.matchingActive}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.container, { height: bannerHeight }]}
    >
      {/* 1. 상태 텍스트 영역 (도트 + 텍스트) */}
      <View style={styles.statusWrapper}>
        {/* 활성 상태 뷰 */}
        <RNAnimated.View style={[styles.statusContainer, { opacity: activeOpacity, position: isActive ? 'relative' : 'absolute' }]}>
          <View style={[styles.dot, { backgroundColor: Colors.primary.successGreen }]} />
          <Text style={[styles.statusText, { color: colors.text.primary }]}>매칭 활성</Text>
        </RNAnimated.View>

        {/* 비활성 상태 뷰 */}
        <RNAnimated.View style={[styles.statusContainer, { opacity: inactiveOpacity, position: !isActive ? 'relative' : 'absolute' }]}>
          <View style={[styles.dot, { backgroundColor: Colors.neutral.darkGray }]} />
          <Text style={[styles.statusText, { color: colors.text.primary }]}>매칭 비활성</Text>
        </RNAnimated.View>
      </View>

      {/* 2. 버튼 영역 (중지 / 시작) */}
      <View style={styles.buttonWrapper}>
        {/* 활성 시: 중지 버튼 (글래스) */}
        <RNAnimated.View style={{ opacity: activeOpacity, pointerEvents: isActive ? 'auto' : 'none' }}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={toggleStatus}
            style={styles.stopButton}
          >
            <Text style={[styles.stopButtonText, { color: colors.text.primary }]}>중지</Text>
          </TouchableOpacity>
        </RNAnimated.View>

        {/* 비활성 시: 시작 버튼 (그라디언트) */}
        <RNAnimated.View style={[StyleSheet.absoluteFill, { opacity: inactiveOpacity, pointerEvents: !isActive ? 'auto' : 'none' }]}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={toggleStatus}
            style={styles.startButton}
          >
            <LinearGradient
              colors={Colors.gradient.matchingStart}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
            <Text style={styles.startButtonText}>시작</Text>
          </TouchableOpacity>
        </RNAnimated.View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'stretch',
    borderRadius: Radii.md2,
    borderWidth: 0.612,
    borderColor: Colors.glass.pink30,
    overflow: 'hidden',
  },
  statusWrapper: {
    justifyContent: 'center',
    height: '100%',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: Radii.full,
  },
  statusText: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    letterSpacing: -0.15,
  },
  buttonWrapper: {
    width: 60, // 적절한 버튼 영역 확보
    height: 32,
    justifyContent: 'center',
  },
  stopButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: Radii.smmd,
    borderWidth: 0.612,
    borderColor: Colors.glass.white20,
    backgroundColor: Colors.glass.white10,
  },
  stopButtonText: {
    textAlign: 'center',
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    letterSpacing: -0.15,
  },
  startButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: Radii.smmd,
    overflow: 'hidden',
  },
  startButtonText: {
    color: Colors.primary.soulBlack,
    textAlign: 'center',
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    letterSpacing: -0.15,
  },
});
