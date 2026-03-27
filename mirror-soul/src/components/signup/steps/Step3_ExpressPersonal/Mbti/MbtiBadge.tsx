import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Colors } from '@/src/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';

// StyleSheet 바깥에서 Platform 분기 → React Compiler 호환
const monospaceFont = Platform.OS === 'ios' ? 'Menlo' : 'monospace';

interface Props {
  mbti: string;
}

export default function MbtiBadge({ mbti }: Props) {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.glass.cyan20, Colors.glass.purple20]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <Text style={styles.text}>{mbti}</Text>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 1.225,
    borderRadius: 8,
    backgroundColor: Colors.glass.white10,
    alignSelf: 'center',
  },
  gradient: {
    paddingVertical: 4,
    paddingHorizontal: 16,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: Colors.primary.electricCyan,
    fontFamily: monospaceFont,
    fontSize: 18,
    fontWeight: '400',
    lineHeight: 28,
    letterSpacing: 2,
  },
});
