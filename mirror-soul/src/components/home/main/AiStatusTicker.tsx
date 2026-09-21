import { Colors, FontFamily, FontSize, FontWeight, Spacing } from '@/src/constants/theme';
import { useRotatingMessages } from '@/src/hooks/useRotatingMessages';
import React from 'react';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { StyleSheet, Text, View } from 'react-native';
import { useThemeColors } from '@/src/hooks/useThemeColors';

const SEARCHING_MESSAGES = [
  '가장 잘 어울리는 소울을 탐색 중입니다...',
  '관심사 데이터를 분석 중입니다...',
  '음악 취향 공명 대상 발견',
  '최적의 매칭 확률 계산 중...',
  '새로운 페르소나를 확인했습니다',
];

const PAUSED_MESSAGES = ['매칭이 중단되어 있어요. 다시 시작하면 탐색을 재개합니다.'];

const ROTATE_INTERVAL_MS = 4000;

interface AiStatusTickerProps {
  /** null이면 매칭 상태 조회 전 — 이 경우도 탐색 중 문구를 기본값으로 보여준다. */
  isMatchingEnabled?: boolean | null;
}

/**
 * AiStatusTicker 컴포넌트 (SRP)
 * AI 분석 상태 문구를 점 인디케이터와 함께 순환 표시합니다.
 * 매칭이 꺼져 있으면 탐색 문구 대신 중단 안내로 전환해, 매칭 상태와 모순되지 않게 한다.
 */
export default function AiStatusTicker({ isMatchingEnabled }: AiStatusTickerProps) {
  const { colors } = useThemeColors();
  const isPaused = isMatchingEnabled === false;
  const message = useRotatingMessages(isPaused ? PAUSED_MESSAGES : SEARCHING_MESSAGES, ROTATE_INTERVAL_MS);

  return (
    <View style={styles.container}>
      <View style={[styles.dot, isPaused && styles.dotPaused]} />
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
  dotPaused: {
    backgroundColor: Colors.neutral.darkGray,
  },
  text: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    letterSpacing: -0.13,
  },
});
