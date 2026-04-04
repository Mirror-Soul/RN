import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import { Colors } from '@/src/constants/theme';
import { DirectionConfig } from '../types/faceScan';
import { SCAN_DIRECTIONS } from '../constants/faceScanConfig';

/**
 * 팝업 애니메이션이 적용된 개별 진행 Dot 컴포넌트
 */
const DotItem = ({ isCompleted, isCurrent }: { isCompleted: boolean; isCurrent: boolean }) => {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (isCompleted) {
      scale.value = withSequence(
        withSpring(1.8, { damping: 10, stiffness: 100 }),
        withSpring(1, { damping: 12, stiffness: 120 })
      );
    } else if (isCurrent) {
      scale.value = withSpring(1.3);
    } else {
      scale.value = withTiming(1);
    }
  }, [isCompleted, isCurrent, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.dot,
        isCompleted && styles.dotCompleted,
        isCurrent && !isCompleted && styles.dotCurrent,
        animatedStyle,
      ]}
    />
  );
};

interface FaceGuideOverlayProps {
  currentDirection: DirectionConfig;
  currentDirectionIndex: number;
  completedDirections: boolean[];
  isDirectionMatching: boolean;
}

export default function FaceGuideOverlay({
  currentDirection,
  currentDirectionIndex,
  completedDirections,
  isDirectionMatching,
}: FaceGuideOverlayProps) {
  const guideBorderColor = isDirectionMatching
    ? Colors.primary.electricCyan
    : Colors.glass.white30;

  return (
    <View style={styles.container}>
      {/* 방향 안내 메시지: 일치 시 "유지해주세요" 표시 */}
      <Text style={styles.guideMessage}>
        {isDirectionMatching ? '유지해주세요' : currentDirection.guideMessage}
      </Text>

      {/* 중앙 원형 가이드 (기존 디자인 복구) */}
      <View
        style={[
          styles.guideCircle,
          { borderColor: guideBorderColor },
          isDirectionMatching && styles.guideCircleMatching,
        ]}
      >
        <Text
          style={[
            styles.directionLabel,
            isDirectionMatching && styles.directionLabelMatching,
          ]}
        >
          {currentDirection.label}
        </Text>
      </View>

      {/* 하단 스텝 진행 인디케이터 (애니메이션 유지) */}
      <View style={styles.dotsContainer}>
        {SCAN_DIRECTIONS.map((dir, index) => (
          <DotItem
            key={dir.direction}
            isCompleted={completedDirections[index]}
            isCurrent={index === currentDirectionIndex}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guideMessage: {
    color: Colors.neutral.pureWhite,
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 24,
  },
  guideCircle: {
    width: 220,
    height: 280,
    borderRadius: 110,
    borderWidth: 3,
    borderColor: Colors.glass.white30,
    justifyContent: 'center',
    alignItems: 'center',
    borderStyle: 'dashed',
  },
  guideCircleMatching: {
    borderStyle: 'solid',
    shadowColor: Colors.primary.electricCyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 8,
  },
  directionLabel: {
    color: Colors.glass.white30,
    fontFamily: 'Inter',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  directionLabelMatching: {
    color: Colors.primary.electricCyan,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 32,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.glass.white20,
  },
  dotCompleted: {
    backgroundColor: Colors.primary.successGreen,
  },
  dotCurrent: {
    backgroundColor: Colors.primary.electricCyan,
  },
});

