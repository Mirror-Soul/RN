import { Feather } from '@expo/vector-icons';
import { MAIN_ROUTES } from '@/src/constants/routes/mainRoutes';
import { FontFamily, FontSize, FontWeight, Radii } from '@/src/constants/theme';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import { useThemeColors } from '@/src/hooks/useThemeColors';

interface EvolveHeaderProps {
  onSettingPress?: () => void;
}

/**
 * 성장 탭 헤더 (SRP)
 * 좌측 프로필 이동 버튼, "Growth" 타이틀, 우측 설정 버튼을 렌더링합니다.
 */
export default function EvolveHeader({ onSettingPress }: EvolveHeaderProps) {
  const { colors } = useThemeColors();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.iconButton, { backgroundColor: colors.background.glass, borderColor: colors.border.primary }]}
        onPress={() => router.push(MAIN_ROUTES.PROFILE)}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="내 트윈으로 이동"
      >
        <Feather name="user" size={20} color={colors.text.secondary} />
      </TouchableOpacity>

      <Text style={[styles.title, { color: colors.text.primary }]}>Growth</Text>

      <TouchableOpacity
        style={[styles.iconButton, { backgroundColor: colors.background.glass, borderColor: colors.border.primary }]}
        onPress={onSettingPress}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: Radii.lg,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontFamily: FontFamily.sans,
    fontStyle: 'italic',
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.black,
    letterSpacing: -1.13,
    textTransform: 'uppercase',
  },
});
