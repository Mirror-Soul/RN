import { Colors, Radii } from '@/src/constants/theme';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface MatchingTabIndicatorProps {
  activeIndex: number;
  total: number;
}

/**
 * 매칭 화면 탭 인디케이터 (오렌지 바 + 회색 점)
 */
export default function MatchingTabIndicator({ activeIndex, total }: MatchingTabIndicatorProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: total }).map((_, index) => (
        <View 
          key={index} 
          style={index === activeIndex ? styles.activeBar : styles.inactiveDot} 
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 6,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'stretch',
  },
  activeBar: {
    width: 24,
    height: 6,
    borderRadius: Radii.full,
    backgroundColor: '#FF8904',
  },
  inactiveDot: {
    width: 6,
    height: 6,
    borderRadius: Radii.full,
    backgroundColor: Colors.glass.white20,
  },
});
