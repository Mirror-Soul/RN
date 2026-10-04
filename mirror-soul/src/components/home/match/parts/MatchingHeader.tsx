import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Radii } from '@/src/constants/theme';
import { MainTabHeader } from '@/src/components/home/common/MainTabHeader';
import { useThemeColors } from '@/src/hooks/useThemeColors';

export default function MatchingHeader({
  onRefresh,
  isRefreshing,
}: {
  onRefresh: () => void;
  isRefreshing: boolean;
}) {
  const { colors } = useThemeColors();
  return (
    <MainTabHeader
      title="매칭"
      action={
        <Pressable
          onPress={onRefresh}
          disabled={isRefreshing}
          accessibilityRole="button"
          accessibilityLabel="매칭 목록 새로고침"
          accessibilityState={{ disabled: isRefreshing, busy: isRefreshing }}
          style={[
            styles.action,
            {
              backgroundColor: colors.background.card,
              borderColor: colors.border.primary,
            },
          ]}
        >
          {isRefreshing ? (
            <ActivityIndicator color={colors.brand.accent} />
          ) : (
            <Feather
              name="refresh-cw"
              size={20}
              color={colors.text.secondary}
            />
          )}
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
