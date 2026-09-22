import BottomSheetModal from '@/src/components/home/common/BottomSheetModal';
import { Colors, FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface QuickActionRow {
  key: string;
  label: string;
  iconName: keyof typeof Feather.glyphMap;
  onPress: () => void;
  destructive?: boolean;
}

interface ProfileQuickActionSheetProps {
  visible: boolean;
  onClose: () => void;
  onViewProfile: () => void;
  onOpenSettings: () => void;
  onLogout: () => void;
}

/**
 * ProfileQuickActionSheet 컴포넌트 (SRP)
 * 발견 탭 헤더 아바타 탭 시 뜨는 퀵액션시트 UI만 담당한다.
 * 실제 이동/로그아웃 로직은 index.tsx가 콜백으로 넘겨준다(RefillModal과 동일한 컨벤션).
 */
export default function ProfileQuickActionSheet({
  visible,
  onClose,
  onViewProfile,
  onOpenSettings,
  onLogout,
}: ProfileQuickActionSheetProps) {
  const { colors } = useThemeColors();

  const rows: QuickActionRow[] = [
    { key: 'profile', label: '내 프로필 보기', iconName: 'user', onPress: onViewProfile },
    { key: 'settings', label: '설정', iconName: 'settings', onPress: onOpenSettings },
    { key: 'logout', label: '로그아웃', iconName: 'log-out', onPress: onLogout, destructive: true },
  ];

  const handlePress = (row: QuickActionRow) => {
    onClose();
    row.onPress();
  };

  return (
    <BottomSheetModal visible={visible} onClose={onClose}>
      <View style={styles.list}>
        {rows.map((row) => (
          <Pressable
            key={row.key}
            style={[styles.row, { borderColor: colors.border.primary }]}
            onPress={() => handlePress(row)}
            accessibilityRole="button"
            accessibilityLabel={row.label}
          >
            <View style={[styles.iconWrapper, { backgroundColor: colors.background.glass }]}>
              <Feather
                name={row.iconName}
                size={18}
                color={row.destructive ? Colors.primary.activeRedText : colors.text.primary}
              />
            </View>
            <Text
              style={[
                styles.label,
                { color: row.destructive ? Colors.primary.activeRedText : colors.text.primary },
              ]}
            >
              {row.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radii.xl,
    borderWidth: 1,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: Radii.md2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
  },
});
