import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Radii, Spacing } from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';

interface CallDetailHeaderRightProps {
  onCallPress: () => void;
  onMorePress: () => void;
}

/**
 * 통화 상세 헤더 우측 슬롯 — 통화/더보기 버튼.
 * MessageRoomHeaderRight.tsx와 동일한 구조(공용 Header의 rightElement로 전달).
 * 핸들러는 부모(call-detail.tsx)가 주입 — 실제 기능이 아직 없으면 "곧 제공" 안내로 연결한다.
 */
export default function CallDetailHeaderRight({ onCallPress, onMorePress }: CallDetailHeaderRightProps) {
  const { colors } = useThemeColors();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.iconButton, { backgroundColor: colors.background.glass, borderColor: colors.border.primary }]}
        onPress={onCallPress}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="통화"
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Feather name="phone" size={16} color={colors.text.primary} />
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.iconButton, { backgroundColor: colors.background.glass, borderColor: colors.border.primary }]}
        onPress={onMorePress}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="더보기"
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Feather name="more-vertical" size={16} color={colors.text.primary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: Radii.full,
    borderWidth: 0.612,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
