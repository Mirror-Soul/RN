import { Colors, FontFamily, FontSize, FontWeight, Spacing } from '@/src/constants/theme';
import { useRotatingMessages } from '@/src/hooks/useRotatingMessages';
import React from 'react';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { StyleSheet, Text, View } from 'react-native';
import { useThemeColors } from '@/src/hooks/useThemeColors';

const STATUS_MESSAGES = [
  '가장 잘 어울리는 소울을 탐색 중입니다...',
  '관심사 데이터를 분석 중입니다...',
  '음악 취향 공명 대상 발견',
  '최적의 매칭 확률 계산 중...',
  '새로운 페르소나를 확인했습니다',
];

const ROTATE_INTERVAL_MS = 4000;

/**
 * AiStatusTicker 컴포넌트 (SRP)
 * AI 분석 상태 문구를 점 인디케이터와 함께 순환 표시합니다.
 */
export default function AiStatusTicker() {
  const { colors } = useThemeColors();
  const message = useRotatingMessages(STATUS_MESSAGES, ROTATE_INTERVAL_MS);

  return (
    <View style={styles.container}>
      <View style={styles.dot} />
      <Animated.View key={message} entering={FadeIn.duration(200)} exiting={FadeOut.duration(150)}>
        <Text style={[styles.text, { color: colors.text.muted }]}>{message}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xxs,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.primary.electricCyan,
  },
  text: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    letterSpacing: -0.13,
  },
});
