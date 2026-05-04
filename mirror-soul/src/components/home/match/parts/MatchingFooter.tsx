import { Colors, Radii } from '@/src/constants/theme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

/**
 * 매칭 화면 하단 안내 배너
 */
export default function MatchingFooter() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>상대방이 직접 당신과 통화하고 싶어해요</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 44,
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'stretch',
    borderRadius: Radii.md2,
    borderWidth: 0.612,
    borderColor: Colors.glass.white10,
    backgroundColor: Colors.glass.white05,
  },
  text: {
    color: Colors.neutral.lightGray,
    textAlign: 'center',
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 19.5,
  },
});
