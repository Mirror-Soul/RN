import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Colors } from '@/src/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';

interface Props {
  mbti: string;
}

export default function MbtiBadge({ mbti }: Props) {
  return (
    <LinearGradient
      colors={['rgba(0, 211, 243, 0.20)', 'rgba(194, 122, 255, 0.20)']}
      start={{ x: 0, y: 0.5 }}
      end={{ x: 1, y: 0.5 }}
      style={styles.container}
    >
      <Text style={styles.text}>{mbti}</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 100,
    borderWidth: 0.612,
    borderColor: 'rgba(0, 211, 243, 0.30)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#00D3F3',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 18,
    fontWeight: '400',
    lineHeight: 28,
  }
});
