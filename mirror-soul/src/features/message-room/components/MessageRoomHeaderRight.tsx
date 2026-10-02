import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Radii, Spacing } from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';

interface MessageRoomHeaderRightProps {
  onOpenPanel: () => void;
  onCallPress: () => void;
}

export function MessageRoomHeaderRight({ onOpenPanel, onCallPress }: MessageRoomHeaderRightProps) {
  const { colors } = useThemeColors();

  return (
    <View style={styles.headerActions}>
      <Pressable
        style={[styles.headerActionBtn, { backgroundColor: colors.background.glass, borderColor: colors.border.primary }]}
        accessibilityLabel="통화하기"
        accessibilityRole="button"
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        onPress={onCallPress}
      >
        <Feather name="phone" size={16} color={colors.text.primary} />
      </Pressable>
      <Pressable
        style={[styles.headerActionBtn, { backgroundColor: colors.background.glass, borderColor: colors.border.primary }]}
        onPress={onOpenPanel}
        accessibilityLabel="더보기"
        accessibilityRole="button"
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Feather name="more-vertical" size={16} color={colors.text.primary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  headerActionBtn: {
    width: 36,
    height: 36,
    borderRadius: Radii.full,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
