import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/src/constants/theme';
import { DirectionConfig } from '../types/faceScan';
import { SCAN_DIRECTIONS } from '../constants/faceScanConfig';

interface FaceGuideOverlayProps {
  currentDirection: DirectionConfig;
  currentDirectionIndex: number;
  completedDirections: boolean[];
  isDirectionMatching: boolean;
}

/**
 * 얼굴 가이드 오버레이 컴포넌트
 *
 * 카메라 위에 오버레이되어 사용자에게 얼굴 방향을 안내합니다.
 * - 중앙 원형 가이드 테두리
 * - 방향 안내 메시지
 * - 하단 방향 진행 dots
 */
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
      {/* 방향 안내 메시지 */}
      <Text style={styles.guideMessage}>{currentDirection.guideMessage}</Text>

      {/* 중앙 원형 가이드 */}
      <View
        style={[
          styles.guideCircle,
          { borderColor: guideBorderColor },
          isDirectionMatching && styles.guideCircleMatching,
        ]}
      >
        {/* 방향 라벨 */}
        <Text
          style={[
            styles.directionLabel,
            isDirectionMatching && styles.directionLabelMatching,
          ]}
        >
          {currentDirection.label}
        </Text>
      </View>

      {/* 하단 진행 dots */}
      <View style={styles.dotsContainer}>
        {SCAN_DIRECTIONS.map((dir, index) => {
          const isCompleted = completedDirections[index];
          const isCurrent = index === currentDirectionIndex;

          return (
            <View
              key={dir.direction}
              style={[
                styles.dot,
                isCompleted && styles.dotCompleted,
                isCurrent && !isCompleted && styles.dotCurrent,
              ]}
            />
          );
        })}
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
