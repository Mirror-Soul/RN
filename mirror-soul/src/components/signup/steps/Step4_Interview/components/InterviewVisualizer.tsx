import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useThemeColors } from '@/src/hooks/useThemeColors';

export default function InterviewVisualizer({ isRecording, metering }: { isRecording: boolean; metering?: number }) {
  const { colors } = useThemeColors();
  // Metering is dBFS. Missing samples stay quiet instead of simulating a voice.
  const level = isRecording && metering != null && Number.isFinite(metering) ? Math.max(0, Math.min(1, (metering + 60) / 60)) : 0;
  return (
    <View accessible={false} style={styles.container}>
      {[0.35, 0.6, 0.85, 1, 0.85, 0.6, 0.35].map((weight, index) => (
        <View key={index} style={[styles.bar, { height: 4 + level * weight * 26, backgroundColor: isRecording ? colors.brand.accent : colors.text.muted }]} />
      ))}
    </View>
  );
}
const styles = StyleSheet.create({
  container: { height: 34, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
  bar: { width: 4, borderRadius: 2 },
});
