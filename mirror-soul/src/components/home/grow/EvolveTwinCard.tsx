import EvolveHighIcon from '@/assets/images/common/evlove/EvolveHigh.svg';
import { Colors, Radii } from '@/src/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import useAnimatedTheme from '@/src/hooks/useAnimatedTheme';

interface EvolveTwinCardProps {
  completionPercent: number;
}

/**
 * 내 트윈 완성도 카드 (SRP)
 * 진행 바와 상태 정보를 렌더링합니다.
 */
export default function EvolveTwinCard({ completionPercent }: EvolveTwinCardProps) {
  // 데이터 정규화: 0~100 사이의 유효한 값으로 보정 (Defensive Programming)
  const safeCompletion = Number.isFinite(completionPercent)
    ? Math.min(100, Math.max(0, completionPercent))
    : 0;

  // 단일 소스 원칙: completion을 기반으로 남은 퍼센트 자동 계산
  const safeRemaining = 100 - safeCompletion;

  const { animatedText, animatedTextSecondary } = useAnimatedTheme();

  return (
    <LinearGradient
      colors={[Colors.glass.purple20, Colors.glass.cyan20]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      {/* 상단 정보 영역 */}
      <View style={styles.topRow}>
        <View style={styles.percentageInfo}>
          <Animated.Text style={[styles.label, animatedTextSecondary]}>내 트윈 완성도</Animated.Text>
          <Animated.Text style={[styles.percentText, animatedText]}>{safeCompletion}%</Animated.Text>
        </View>
        
        {/* 아이콘 배지 */}
        <LinearGradient
          colors={[Colors.glass.purple30, Colors.glass.cyan30]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.iconBadge}
        >
          <EvolveHighIcon width={24} height={24} />
        </LinearGradient>
      </View>

      {/* 중앙 프로그레스 바 */}
      <View style={styles.progressBarBg}>
        <LinearGradient
          colors={Colors.gradient.cyanBluePurple}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={[styles.progressBarDetail, { width: `${safeCompletion}%` }]}
        />
      </View>

      {/* 하단 안내 문구 */}
      <View style={styles.bottomRow}>
        <Text style={styles.bottomText}>
          <Text style={styles.highlightText}>100%</Text>
          <Animated.Text style={[styles.neutralText, animatedTextSecondary]}> 완성까지 {safeRemaining}% 남았어요!</Animated.Text>
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 20, // 시각적 균형을 위해 약간 조정
    borderRadius: Radii.lg,
    borderWidth: 0.612,
    borderColor: Colors.glass.purple30,
    alignSelf: 'stretch',
    gap: 16,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  percentageInfo: {
    gap: 4,
  },
  label: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  },
  percentText: {
    fontFamily: 'Inter',
    fontSize: 24,
    fontWeight: '400',
    lineHeight: 32,
    letterSpacing: 0.07,
  },
  iconBadge: {
    width: 48,
    height: 48,
    borderRadius: 24, // 원형
    borderWidth: 0.612,
    borderColor: Colors.glass.white20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: Colors.glass.white10,
    borderRadius: Radii.full,
    overflow: 'hidden',
    alignSelf: 'stretch',
  },
  progressBarDetail: {
    height: '100%',
    borderRadius: Radii.full,
  },
  bottomRow: {
    alignSelf: 'stretch',
  },
  bottomText: {
    fontSize: 12,
    fontFamily: 'Inter',
    lineHeight: 16,
  },
  highlightText: {
    color: Colors.primary.electricCyan,
  },
  neutralText: {
  },
});
