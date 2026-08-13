import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {FontSize, FontWeight, Spacing} from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';

export default function InterviewFooter() {
  const { colors } = useThemeColors();

  return (
    <View style={styles.container}>
      <Text style={[styles.footerText, { color: colors.text.muted }]}>
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
    fontSize: FontSize.sm,
    fontWeight: FontWeight.regular,
    lineHeight: 16,
    textAlign: 'center',
  },
});
