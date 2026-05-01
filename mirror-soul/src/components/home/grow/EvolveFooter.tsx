import { Colors, Radii } from '@/src/constants/theme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

/**
 * 성장 탭 하단 안내 카드 (SRP)
 */
export default function EvolveFooter() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>완성도가 높을수록 좋은 이유</Text>
      <Text style={styles.subTitle}>
        트윈이 나를 더 잘 이해할수록 나와 잘 맞는 사람을 찾아주고, 더 자연스러운 대화를 나눌 수 있어요.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: Radii.md2,
    borderWidth: 0.612,
    borderColor: Colors.glass.white10,
    backgroundColor: Colors.glass.white5,
    alignSelf: 'stretch',
    gap: 8,
  },
  title: {
    color: Colors.neutral.pureWhite,
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
  subTitle: {
    color: Colors.neutral.lightGray,
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 19.5,
  },
});
