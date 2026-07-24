import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors, FontFamily, FontSize, FontWeight, Spacing } from '@/src/constants/theme';

/**
 * 통화 상세 유사도 힌트 배너 (SRP)
 * 유사도가 높아 대화가 잘 통할 것임을 Sparkles + cyan 글래스 배너로 안내합니다.
 */
export default function CallDetailAlert() {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Feather name="zap" size={14} color={Colors.primary.electricCyan} />
        <Text style={styles.text}>
          유사도가 높아 대화가 잘 통할 확률이 높아요
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 0.612,
    borderBottomColor: Colors.glass.cyan20_d3,
    backgroundColor: Colors.glass.cyan10_d3,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    justifyContent: 'center',
  },
  text: {
    color: Colors.primary.electricCyan,
    fontFamily: FontFamily.sans,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    lineHeight: 16,
  },
});
