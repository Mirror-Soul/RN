import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';
import { useChatNotificationSettings } from '@/src/features/chat/hooks/useChatNotificationSettings';
import { NotificationItem } from '@/src/features/notification/components/NotificationItem';
import { useThemeColors } from '@/src/hooks/useThemeColors';

export function OptionsSettingsSection({ roomId, isActive }: { roomId: number; isActive: boolean }) {
  const { enabled, handleToggle, isLoading, isSaving, isError, refetch, saveError } = useChatNotificationSettings(roomId, isActive);
  const { colors } = useThemeColors();
  return (
    <View>
      <Text style={[styles.sectionLabel, { color: colors.text.secondary }]}>대화 설정</Text>
      <View style={[styles.card, { backgroundColor: colors.background.glass }]}>
        <NotificationItem title="메시지 알림" description="이 대화방의 새 메시지가 오면 알려드려요." value={enabled} onToggle={handleToggle} disabled={!isActive || isLoading || isSaving || enabled === null} isSaving={isSaving} isLoading={isLoading} isLast />
        {saveError && <Text accessibilityRole="alert" style={[styles.error, styles.copy, { color: colors.state.danger }]}>{saveError}</Text>}
        {isError && <View style={styles.error}><Text accessibilityRole="alert" style={[styles.copy, { color: colors.state.danger }]}>설정을 불러오지 못했어요.</Text><Pressable onPress={() => { void refetch(); }} accessibilityRole="button" accessibilityLabel="알림 설정 다시 불러오기" style={styles.retry}><Text style={[styles.copy, { color: colors.brand.accent }]}>다시 불러오기</Text></Pressable></View>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionLabel: { fontFamily: FontFamily.sans, fontWeight: FontWeight.bold, fontSize: FontSize.xs, lineHeight: 18, paddingHorizontal: Spacing.xs },
  card: { marginTop: Spacing.md, borderRadius: Radii.lg },
  error: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.sm },
  copy: { fontFamily: FontFamily.sans, fontSize: FontSize.sm, lineHeight: 21 },
  retry: { minHeight: 48, justifyContent: 'center' },
});
