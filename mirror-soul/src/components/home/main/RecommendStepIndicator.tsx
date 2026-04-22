import { Colors, Radii } from '@/src/constants/theme';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface RecommendStepIndicatorProps {
  total: number;
  activeIndex: number;
}

/**
 * RecommendStepIndicator 컴포넌트 (SRP)
 * 추천 카드 페이지 위치를 나타내는 도트 인디케이터입니다.
 * 활성 도트는 cyan, 비활성 도트는 반투명 흰색입니다.
 */
export default function RecommendStepIndicator({ total, activeIndex }: RecommendStepIndicatorProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: total }).map((_, index) => {
        const isActive = index === activeIndex;
        return (
          <View
            key={index}
            style={[
              styles.dot,
              isActive ? styles.dotActive : styles.dotInactive,
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'stretch',
    height: 4,
  },
  dot: {
    height: 4,
    borderRadius: Radii.full,
  },
  dotActive: {
    width: 24,
    backgroundColor: Colors.primary.electricCyan,
  },
  dotInactive: {
    width: 6,
    backgroundColor: Colors.glass.white20,
  },
});
