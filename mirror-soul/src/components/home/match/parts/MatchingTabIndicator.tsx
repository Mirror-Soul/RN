import { Colors, Radii } from '@/src/constants/theme';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useThemeColors } from '@/src/hooks/useThemeColors';

interface MatchingTabIndicatorProps {
  activeIndex: number;
  total: number;
  activeColor?: string;
}

/**
 * 매칭 화면 탭 인디케이터 (색상 가변 바 + 회색 점)
 */
export default function MatchingTabIndicator({ 
  activeIndex, 
  total, 
  activeColor = Colors.primary.mirrorOrange 
}: MatchingTabIndicatorProps) {
  const { colors } = useThemeColors();

  return (
    <View style={styles.container}>
      {Array.from({ length: total }).map((_, index) => (
        <View 
          key={index} 
          style={[
            index === activeIndex ? styles.activeBar : [styles.inactiveDot, { backgroundColor: colors.background.glass, borderColor: colors.border.primary }],
            index === activeIndex && { backgroundColor: activeColor }
          ]} 
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
    backgroundColor: Colors.primary.mirrorOrange,
  },
  inactiveDot: {
    width: 6,
    height: 6,
    borderRadius: Radii.full,
  },
});
