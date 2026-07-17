import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {Colors, FontSize, FontWeight, Spacing} from '@/src/constants/theme';

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
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    color: Colors.neutral.darkGray,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.regular,
    lineHeight: 16,
    textAlign: 'center',
  },
});
