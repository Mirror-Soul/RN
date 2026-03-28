import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/src/constants/theme';

export default function InterviewHeader() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>The Soul Capture</Text>
      <Text style={styles.subtitle}>Question 1 of 5</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 40,
    marginBottom: 24, // spacing to the avatar
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
  },
});
