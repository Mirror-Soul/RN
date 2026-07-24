import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';

/**
 * HistoryHeader 컴포넌트 (SRP)
 * 기록 화면 상단 3-slot 헤더를 렌더링합니다.
 *
 * [아바타 버튼] [History 타이틀] [설정 버튼]
 */
export default function HistoryHeader() {
  const { colors } = useThemeColors();
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* 좌측: 아바타/프로필 버튼 */}
      <TouchableOpacity
        style={[styles.iconButton, { backgroundColor: colors.background.glass, borderColor: colors.border.primary }]}
        onPress={() => router.push('/profile')}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="내 프로필"
      >
        <Feather name="user" size={20} color={colors.text.secondary} />
      </TouchableOpacity>

      {/* 중앙: 타이틀 */}
      <Text style={[styles.title, { color: colors.text.primary }]}>History</Text>

      {/* 우측: 설정 버튼 */}
      <TouchableOpacity
        style={[styles.iconButton, { backgroundColor: colors.background.glass, borderColor: colors.border.primary }]}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="설정"
      >
        <Feather name="settings" size={20} color={colors.text.secondary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 52,
    alignSelf: 'stretch',
    paddingTop: Spacing.sm,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: Radii.lg,
    borderWidth: 0.612,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.black as any,
    letterSpacing: -1.13,
    lineHeight: 32,
  },
});
