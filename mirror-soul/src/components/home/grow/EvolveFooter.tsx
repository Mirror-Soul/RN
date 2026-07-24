import { Feather } from '@expo/vector-icons';
import { Colors, FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';
import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useThemeColors } from '@/src/hooks/useThemeColors';

/**
 * 성장 탭 하단 안내 카드 (SRP)
 * 학습 데이터 안전/개인정보 보호 안내를 렌더링합니다.
 */
export default function EvolveFooter() {
  const { colors } = useThemeColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.background.glass, borderColor: colors.border.primary }]}>
      <View style={styles.iconWrapper}>
        <Feather name="lock" size={16} color={Colors.glass.cyan30_d3} />
      </View>
      <View style={styles.textArea}>
        <Text style={[styles.title, { color: colors.text.muted }]}>Safety & Privacy</Text>
        <Text style={[styles.subTitle, { color: colors.text.muted }]}>
          모든 학습 데이터는 End-to-End 암호화로 보호되며 오직 당신의 디지털 페르소나 정교화에만 사용됩니다.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: Spacing.lg,
    borderRadius: Radii.xl,
    borderWidth: 1,
    alignSelf: 'stretch',
    gap: Spacing.md,
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: Radii.md2,
    backgroundColor: Colors.glass.cyan10_d3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textArea: {
    flex: 1,
    gap: Spacing.xs,
  },
  title: {
    fontFamily: FontFamily.sans,
    fontStyle: 'italic',
    fontSize: FontSize.xs,
    fontWeight: FontWeight.black,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  subTitle: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    lineHeight: 16,
  },
});
