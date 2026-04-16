import { Colors, Radii } from '@/src/constants/theme';
import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

const monospaceFont = Platform.OS === 'ios' ? 'Menlo' : 'monospace';

interface Props {
  leftChar: string;
  leftLabel: string;
  rightChar: string;
  rightLabel: string;
  value: number;
  percentageText: string;
}

export default function MbtiLabels({
  leftChar,
  leftLabel,
  rightChar,
  rightLabel,
  value,
  percentageText,
}: Props) {
  return (
    <View style={styles.header}>
      <View style={styles.labelGroup}>
        <View style={[styles.charBox, value < 50 && styles.charBoxActiveLeft]}>
          <Text style={styles.charText}>{leftChar}</Text>
        </View>
        <Text style={styles.labelText}>{leftLabel}</Text>
      </View>

      <Text style={styles.percentageText}>{percentageText}</Text>

      <View style={styles.labelGroup}>
        <Text style={styles.labelText}>{rightLabel}</Text>
        <View style={[styles.charBox, value > 50 && styles.charBoxActiveRight]}>
          <Text style={styles.charText}>{rightChar}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  labelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  charBox: {
    width: 32,
    height: 32,
    borderRadius: Radii.full,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.612,
    borderColor: Colors.glass.white10,
    backgroundColor: Colors.glass.white5,
  },
  charBoxActiveLeft: {
    borderColor: Colors.glass.purple80,
    backgroundColor: Colors.glass.purple30_mbti,
  },
  charBoxActiveRight: {
    borderColor: Colors.glass.cyan80,
    backgroundColor: Colors.glass.cyan30,
  },
  charText: {
    color: Colors.neutral.pureWhite,
    fontFamily: monospaceFont,
    fontSize: 14,
  },
  labelText: {
    color: Colors.neutral.lightGray,
    fontSize: 14,
    letterSpacing: -0.15,
  },
  percentageText: {
    color: Colors.neutral.darkGray,
    textAlign: 'center',
    fontSize: 12,
    flex: 1,
  },
});
