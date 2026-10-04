import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Radii } from '@/src/constants/theme';
import { MainTabHeader } from '@/src/components/home/common/MainTabHeader';
import { useThemeColors } from '@/src/hooks/useThemeColors';

export default function MainHeader({
  onAvatarPress,
}: {
  onAvatarPress?: () => void;
}) {
  const { colors } = useThemeColors();
  return (
    <MainTabHeader
      title="발견"
      action={
        <Pressable
          onPress={onAvatarPress}
          accessibilityRole="button"
          accessibilityLabel="내 계정 메뉴 열기"
          style={[
            styles.action,
            {
              backgroundColor: colors.background.card,
              borderColor: colors.border.primary,
            },
          ]}
        >
          <Feather name="user" size={20} color={colors.text.secondary} />
        </Pressable>
      }
    />
  );
}
const styles = StyleSheet.create({
  action: {
    width: 48,
    height: 48,
    borderWidth: 1,
    borderRadius: Radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
