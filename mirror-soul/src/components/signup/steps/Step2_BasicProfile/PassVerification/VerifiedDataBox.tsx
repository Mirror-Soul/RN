import React from 'react';
import { View, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { Colors } from '@/src/constants/theme';

interface Props {
  label: string;
  value: string;
  style?: StyleProp<ViewStyle>;
}

export default function VerifiedDataBox({ label, value, style }: Props) {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 69.2,
    paddingTop: 12.6,
    paddingHorizontal: 12.6,
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 4,
    borderRadius: 14,
    borderWidth: 0.612,
    borderColor: Colors.glass.white10,
    backgroundColor: Colors.glass.white5,
  },
  label: {
    color: Colors.neutral.darkGray,
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  },
  value: {
    color: Colors.neutral.pureWhite,
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    letterSpacing: -0.312,
  }
});
