import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';
import { useProfileRefresh } from '@/src/features/profile/hooks/useProfileRefresh';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { Header } from '@/src/components/common/Header';
import { ScreenLayout } from '@/src/components/common/ScreenLayout';
import { useNotificationSettings } from './hooks/useNotificationSettings';
import { NotificationItem } from './components/NotificationItem';
import { NotificationPermissionCard } from './components/NotificationPermissionCard';
import { ChatNotificationSheet } from './components/ChatNotificationSheet';

export function NotificationScreen() {
  const router = useRouter();
  const { colors } = useThemeColors();
  const [roomsOpen, setRoomsOpen] = useState(false);
  const { data, timeLimitAlert, missedCallAlert, handleToggleTimeLimit, handleToggleMissedCall, isLoading, isError, isSaving, savingField, isFetching, refetch } = useNotificationSettings();
  useProfileRefresh(useCallback(() => refetch(), [refetch]));
  const disabled = !data || isSaving;
  const card = [styles.card, { backgroundColor: colors.background.card, borderColor: colors.border.primary }];
  return (
    <ScreenLayout withScroll>
      <Header title="알림 설정" delay={0} onBackPress={() => router.canGoBack() ? router.back() : router.replace('/(main)/profile')} />
      <View style={styles.content}>
        <Text style={[styles.intro, { color: colors.text.secondary }]}>내게 필요한 소식만 받아보세요.</Text>
        {isError && <View style={[styles.error, { backgroundColor: colors.background.card, borderColor: colors.border.primary }]}><Text accessibilityRole="alert" style={[styles.copy, { color: colors.state.danger }]}>알림 설정을 불러오지 못했어요.</Text><Pressable disabled={isFetching} onPress={() => { void refetch(); }} accessibilityRole="button" accessibilityLabel="알림 설정 다시 불러오기" style={styles.retry}>{isFetching ? <ActivityIndicator color={colors.brand.accent} /> : <Text style={[styles.copy, { color: colors.brand.accent }]}>다시 불러오기</Text>}</Pressable></View>}
        <View style={styles.section}>
          <Text accessibilityRole="header" style={[styles.sectionTitle, { color: colors.text.primary }]}>대화와 통화</Text>
          <View style={card}>
            <Pressable onPress={() => setRoomsOpen(true)} accessibilityRole="button" accessibilityLabel="대화방별 메시지 알림 관리" style={[styles.messageRow, { borderBottomColor: colors.border.primary }]}>
              <View style={styles.messageCopy}><Text style={[styles.rowTitle, { color: colors.text.primary }]}>메시지 알림</Text><Text style={[styles.linkText, { color: colors.brand.accent }]}>대화방별 관리</Text></View><Feather name="chevron-right" size={21} color={colors.text.secondary} />
            </Pressable>
            <NotificationItem title="부재중 통화" description="받지 못한 통화가 있을 때 알려드려요." value={data ? missedCallAlert : null} onToggle={handleToggleMissedCall} disabled={disabled} isSaving={savingField === 'missedCallNotificationEnabled'} isLoading={isLoading} />
            <View style={styles.plannedRow}>
              <View style={styles.plannedHeading}><Text style={[styles.rowTitle, { color: colors.text.primary }]}>내 트윈 통화 알림</Text><Text style={[styles.plannedBadge, { color: colors.text.secondary, backgroundColor: colors.background.glass }]}>준비 중</Text></View>
              <Text style={[styles.copy, { color: colors.text.secondary }]}>누군가 내 트윈과 대화하면 알려드릴 예정이에요.</Text>
            </View>
          </View>
        </View>
        <View style={styles.section}>
          <Text accessibilityRole="header" style={[styles.sectionTitle, { color: colors.text.primary }]}>대화 시간 안내</Text>
          <View style={card}><NotificationItem title="남은 대화 시간" description="대화 시간이 얼마 남지 않았을 때 알려드려요." value={data ? timeLimitAlert : null} onToggle={handleToggleTimeLimit} disabled={disabled} isSaving={savingField === 'lowTimeNotificationEnabled'} isLoading={isLoading} isLast /></View>
        </View>
        <NotificationPermissionCard />
      </View>
      <ChatNotificationSheet visible={roomsOpen} onClose={() => setRoomsOpen(false)} />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: Spacing.xl, gap: Spacing.md },
  intro: { fontFamily: FontFamily.sans, fontSize: FontSize.sm, lineHeight: 20 },
  section: { gap: Spacing.xs },
  sectionTitle: { fontFamily: FontFamily.sans, fontSize: FontSize.base, fontWeight: FontWeight.semibold, lineHeight: 24, paddingHorizontal: Spacing.xs },
  card: { borderWidth: 1, borderRadius: Radii.lg, overflow: 'hidden' },
  messageRow: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, flexDirection: 'row', gap: Spacing.sm, alignItems: 'center', borderBottomWidth: 1, minHeight: 48 },
  messageCopy: { flex: 1, gap: Spacing.xs },
  rowTitle: { fontFamily: FontFamily.sans, fontSize: FontSize.base, fontWeight: FontWeight.semibold, lineHeight: 23 },
  copy: { fontFamily: FontFamily.sans, fontSize: FontSize.sm, lineHeight: 20 },
  linkText: { fontFamily: FontFamily.sans, fontSize: FontSize.sm, fontWeight: FontWeight.medium, lineHeight: 20 },
  plannedRow: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, gap: Spacing.xs },
  plannedHeading: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: Spacing.sm },
  plannedBadge: { fontFamily: FontFamily.sans, fontSize: FontSize.sm, lineHeight: 20, paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: Radii.sm },
  error: { padding: Spacing.lg, borderWidth: 1, borderRadius: Radii.lg },
  retry: { minHeight: 48, justifyContent: 'center', alignSelf: 'flex-start' },
});
