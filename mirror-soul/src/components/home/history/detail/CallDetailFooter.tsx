import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors, FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';

/**
 * 통화 상세 하단 푸터 (SRP)
 * Twin 학습 반영 안내 문구를 pill 배지 형태로 표시합니다.
 */
export default function CallDetailFooter() {
  return (
    <View style={styles.container}>
      <View style={styles.badge}>
        <Feather name="zap" size={12} color={Colors.primary.electricCyan} />
        <Text style={styles.text}>수정된 답변은 Twin의 학습에 반영됩니다</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.lg,
    borderTopWidth: 0.612,
    borderTopColor: Colors.glass.white10,
    backgroundColor: Colors.glass.black40,
    alignItems: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radii.full,
    backgroundColor: Colors.glass.cyan10_d3,
    borderWidth: 0.612,
    borderColor: Colors.glass.cyan20_d3,
  },
  text: {
    color: Colors.primary.electricCyan,
    fontFamily: FontFamily.sans,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    lineHeight: 16,
  },
});
