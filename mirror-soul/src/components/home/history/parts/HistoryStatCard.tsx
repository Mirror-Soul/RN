import { Colors, Radii } from '@/src/constants/theme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

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
  countColor = Colors.neutral.pureWhite,
}: HistoryStatCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.countWrapper}>
        <Text style={[styles.countText, { color: countColor }]}>{count}</Text>
      </View>
      <View style={styles.labelWrapper}>
        <Text style={styles.labelText}>{label}</Text>
      </View>
    </View>
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
    borderColor: Colors.glass.white10,
    backgroundColor: Colors.glass.white5,
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
    color: Colors.neutral.lightGray,
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16, // 133.333%
    textAlign: 'center',
  },
});
