import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors, FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';
import { AnimatedSwitch } from '@/src/components/common/AnimatedSwitch';
import { useChatNotificationSettings } from '@/src/features/chat/hooks/useChatNotificationSettings';
import { useThemeColors } from '@/src/hooks/useThemeColors';

interface OptionsSettingsSectionProps {
  roomId: number;
  isActive: boolean;
}

export function OptionsSettingsSection({ roomId, isActive }: OptionsSettingsSectionProps) {
  const { enabled, handleToggle, isLoading, isError, refetch } = useChatNotificationSettings(roomId, isActive);
  const { colors } = useThemeColors();

  return (
    <View style={styles.menuSection}>
      <Text style={[styles.sectionLabel, { color: colors.text.muted }]}>대화 설정</Text>

      <View style={[styles.settingCard, { backgroundColor: colors.background.glass, borderColor: colors.border.primary }]}>
        <View style={styles.settingRow}>
          <View style={styles.menuItemLeft}>
            <View style={[styles.iconBox, { backgroundColor: Colors.glass.cyan10_d3 }]}>
              <Feather name="bell" size={16} color={Colors.primary.electricCyan} />
            </View>
            <View style={styles.copyContainer}>
              <Text style={[styles.menuItemText, { color: colors.text.primary }]}>메시지 알림</Text>
              <Text style={[styles.menuItemDescription, { color: colors.text.secondary }]}>
                {isError ? '설정을 불러오지 못했어요.' : enabled ? '새 메시지를 바로 알려드려요.' : '이 대화방 알림이 꺼져 있어요.'}
              </Text>
            </View>
          </View>
          {isError ? (
            <Pressable
              style={[styles.retryButton, { borderColor: colors.border.strong }]}
              onPress={() => void refetch()}
              accessibilityRole="button"
              accessibilityLabel="알림 설정 다시 불러오기"
            >
              <Text style={[styles.retryText, { color: colors.brand.accent }]}>다시 시도</Text>
            </Pressable>
          ) : isLoading || !isActive ? (
            <ActivityIndicator size="small" color={Colors.primary.electricCyan} />
          ) : (
            <AnimatedSwitch value={enabled} onToggle={handleToggle} disabled={isLoading} />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  menuSection: {
    alignSelf: 'stretch',
  },
  sectionLabel: {
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.bold,
    fontSize: FontSize.xs,
    lineHeight: 15,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    paddingHorizontal: Spacing.xs,
  },
  settingCard: {
    marginTop: Spacing.md,
    borderWidth: 1,
    borderRadius: Radii.lg,
    padding: Spacing.md,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: Radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copyContainer: {
    flex: 1,
  },
  menuItemText: {
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.medium,
    fontSize: FontSize.base,
    lineHeight: 20,
    letterSpacing: -0.15,
  },
  menuItemDescription: {
    marginTop: Spacing.xxs,
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.regular,
    fontSize: FontSize.xs,
    lineHeight: 16,
  },
  retryButton: {
    borderWidth: 1,
    borderRadius: Radii.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  retryText: {
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.bold,
    fontSize: FontSize.xs,
  },
});
