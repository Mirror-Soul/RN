import { Feather } from '@expo/vector-icons';
import { FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

/**
 * SoulConnectTip 컴포넌트 (SRP)
 * "보낸 통화하기 기록은 기록 탭에서 확인 가능" 안내 문구만 렌더링합니다.
 */
export default function SoulConnectTip() {
  const { colors } = useThemeColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.background.glass }]}>
      <View style={[styles.iconWrapper, { backgroundColor: colors.background.card }]}>
        <Feather name="phone" size={14} color={colors.text.muted} />
      </View>
      <Text style={[styles.text, { color: colors.text.muted }]}>
        보낸 &apos;통화하기&apos; 기록은{' '}
        <Text style={{ color: colors.text.secondary }}>기록 {'>'} 보낸 요청</Text>에서{'\n'}
        실시간으로 확인할 수 있습니다.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: Radii.xl,
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: Radii.md2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    flex: 1,
    fontFamily: FontFamily.sans,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    lineHeight: 16,
  },
});
