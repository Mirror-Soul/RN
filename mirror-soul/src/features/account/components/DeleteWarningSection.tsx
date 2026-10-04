import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';

export const DeleteWarningSection = () => {
  const { colors } = useThemeColors();
  return <View style={styles.content}>
    <Text accessibilityRole="header" style={[styles.title, { color: colors.text.primary }]}>탈퇴 전에 확인해 주세요</Text>
    <Text style={[styles.copy, { color: colors.text.secondary }]}>계정에 어떤 변화가 생기는지 안내해 드릴게요.</Text>
    <View style={[styles.card, { backgroundColor: colors.background.card, borderColor: colors.border.primary }]}>
      {[
        ['계정 이용이 중단돼요', '탈퇴하면 계정이 즉시 비활성화되고 로그아웃돼요.'],
        ['30일 이내에 복구할 수 있어요', '탈퇴 후 30일이 지나기 전에 기존 이메일과 비밀번호로 로그인하면 계정이 복구돼요.'],
        ['복구 기간이 지나면 되돌릴 수 없어요', '이름·이메일 등 계정 정보가 비식별 처리되어 기존 계정으로 로그인하거나 복구할 수 없어요.'],
      ].map(([title, description], index) => <View key={title} style={styles.row}><Feather name={index === 2 ? 'alert-circle' : 'info'} size={20} color={index === 2 ? colors.state.danger : colors.brand.accent} /><View style={styles.rowCopy}><Text style={[styles.rowTitle, { color: colors.text.primary }]}>{title}</Text><Text style={[styles.copy, { color: colors.text.secondary }]}>{description}</Text></View></View>)}
    </View>
  </View>;
};
const styles = StyleSheet.create({
  content: { paddingHorizontal: Spacing.xl, gap: Spacing.md, marginBottom: Spacing.xl },
  title: { fontFamily: FontFamily.sans, fontSize: FontSize.xxl, fontWeight: FontWeight.semibold, lineHeight: 29 },
  copy: { fontFamily: FontFamily.sans, fontSize: FontSize.base, lineHeight: 23 },
  card: { padding: Spacing.lg, borderWidth: 1, borderRadius: Radii.lg, gap: Spacing.xl },
  row: { flexDirection: 'row', gap: Spacing.md, alignItems: 'flex-start' },
  rowCopy: { flex: 1, gap: Spacing.sm },
  rowTitle: { fontFamily: FontFamily.sans, fontSize: FontSize.lg, fontWeight: FontWeight.medium, lineHeight: 25 },
});
