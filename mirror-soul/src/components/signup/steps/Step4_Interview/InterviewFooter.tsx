import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/src/constants/theme';

export default function InterviewFooter() {
  return (
    <View style={styles.container}>
      <Text style={styles.footerText}>
        음성 데이터는 기기 내에서만 처리되며 안전하게 보호됩니다
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    color: Colors.neutral.darkGray,
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
    textAlign: 'center',
  },
});
