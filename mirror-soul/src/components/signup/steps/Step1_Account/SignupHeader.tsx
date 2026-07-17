import {Colors, FontSize, FontWeight, Spacing} from '@/src/constants/theme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

/**
 * 회원가입 헤더 (타이틀 및 부제)
 */
export default function SignupHeader() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Your Account</Text>
      <Text style={styles.subtitle}>Just the essentials. We'll gather more as we go.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginTop: Spacing.giant,
  },
  title: {
    color: Colors.neutral.pureWhite,
    fontSize: 30,
    fontWeight: FontWeight.medium,
    lineHeight: 36,
    letterSpacing: 0.396,
  },
  subtitle: {
    color: Colors.neutral.lightGray,
    fontSize: FontSize.base,
    fontWeight: FontWeight.regular,
    lineHeight: 20,
    letterSpacing: -0.15,
  }
});
