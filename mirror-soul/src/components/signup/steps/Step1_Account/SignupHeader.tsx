import { Colors } from '@/src/constants/theme';
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
    gap: 8,
    marginTop: 40,
  },
  title: {
    color: Colors.neutral.pureWhite,
    fontSize: 30,
    fontWeight: '500',
    lineHeight: 36,
    letterSpacing: 0.396,
  },
  subtitle: {
    color: Colors.neutral.lightGray,
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    letterSpacing: -0.15,
  }
});
