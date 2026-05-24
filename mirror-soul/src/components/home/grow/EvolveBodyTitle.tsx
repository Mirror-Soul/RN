import { Colors } from '@/src/constants/theme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

/**
 * 성장 미션 섹션 타이틀 (SRP)
 */
export default function EvolveBodyTitle() {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>성장 미션</Text>
      <Text style={styles.paragraph}>
        미션을 완료하고 내 트윈을 더 나답게 만들어보세요
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    alignSelf: 'stretch',
    gap: 2,
  },
  heading: {
    color: Colors.neutral.pureWhite,
    fontFamily: 'Inter',
    fontSize: 20,
    fontWeight: '500',
    lineHeight: 30,
    letterSpacing: -0.449,
  },
  paragraph: {
    color: Colors.neutral.darkGray,
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  },
});
