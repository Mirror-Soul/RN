import { Colors, Radii } from '@/src/constants/theme';
import { useAnimatedTheme } from '@/src/hooks/useAnimatedTheme';
import Animated from 'react-native-reanimated';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface HistoryStatCardProps {
  count: number | string;
  label: string;
  countColor?: string;
}

/**
 * 통계 수치를 보여주는 카드(SRP)
 */
export default function HistoryStatCard({
  count,
  label,
  countColor,
}: HistoryStatCardProps) {
  const theme = useAnimatedTheme();

  return (
    <Animated.View style={[styles.container, theme.animatedGlassBackground]}>
      <View style={styles.countWrapper}>
        <Animated.Text style={[styles.countText, countColor ? { color: countColor } : theme.animatedText]}>{count}</Animated.Text>
      </View>
      <View style={styles.labelWrapper}>
        <Animated.Text style={[styles.labelText, theme.animatedTextSecondary]}>{label}</Animated.Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, // 3등분
    height: 85,
    paddingTop: 16.6,
    paddingHorizontal: 16.6,
    paddingBottom: 0.6,
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 4,
    borderRadius: Radii.lg,
    borderWidth: 0.612,
  },
  countWrapper: {
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    fontFamily: 'Inter',
    fontSize: 24,
    fontWeight: '400',
    lineHeight: 32, // 133.333%
    letterSpacing: 0.07,
    textAlign: 'center',
  },
  labelWrapper: {
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelText: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16, // 133.333%
    textAlign: 'center',
  },
});
