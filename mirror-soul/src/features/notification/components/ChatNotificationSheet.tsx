import React, { useCallback } from 'react';
import { ActivityIndicator, FlatList, Modal, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { useProfileRefresh } from '@/src/features/profile/hooks/useProfileRefresh';
import { useNotificationChatRooms } from '../hooks/useNotificationChatRooms';
import { NotificationItem } from './NotificationItem';
import { ToastViewport } from '@/src/components/common/Toast/ToastViewport';

export function ChatNotificationSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { colors } = useThemeColors();
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { data, isLoading, isError, isFetching, refetch, toggle, isSaving, savingRoomId, saveError } = useNotificationChatRooms(visible);
  useProfileRefresh(useCallback(() => refetch(), [refetch]), false, visible);
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.overlay}>
        <Pressable accessibilityRole="button" accessibilityLabel="대화방 알림 관리 닫기" onPress={onClose} style={[StyleSheet.absoluteFill, { backgroundColor: colors.background.overlay }]} />
        <View accessibilityViewIsModal style={[styles.sheet, { maxHeight: Math.min(height * 0.85, height - insets.top - Spacing.lg, 760), backgroundColor: colors.background.elevated, paddingBottom: Math.max(insets.bottom, Spacing.lg) }]}>
          <View style={styles.heading}>
            <Text accessibilityRole="header" style={[styles.title, { color: colors.text.primary }]}>대화방별 메시지 알림</Text>
            <Pressable accessibilityRole="button" accessibilityLabel="대화방 알림 관리 닫기" onPress={onClose} style={styles.close}><Feather name="x" size={22} color={colors.text.primary} /></Pressable>
          </View>
          <Text style={[styles.intro, { color: colors.text.secondary }]}>알림을 받고 싶은 대화방만 켜 주세요.{ '\n' }알림을 꺼도 메시지는 그대로 남아요.</Text>
          {saveError && <Text accessibilityRole="alert" style={[styles.saveError, styles.copy, { color: colors.state.danger }]}>{saveError}</Text>}
          {isLoading && <ActivityIndicator style={styles.loading} color={colors.brand.accent} />}
          {isError && <View style={styles.error}>
            <Text accessibilityRole="alert" style={[styles.copy, { color: colors.state.danger }]}>대화방 알림 설정을 불러오지 못했어요.</Text>
            <Pressable disabled={isFetching} onPress={() => { void refetch(); }} accessibilityRole="button" accessibilityLabel="대화방 알림 다시 불러오기" style={styles.retry}><Text style={[styles.copy, { color: colors.brand.accent }]}>{isFetching ? '불러오는 중…' : '다시 불러오기'}</Text></Pressable>
          </View>}
          {data && <FlatList
            data={data.rooms}
            keyExtractor={room => String(room.chatRoomId)}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            renderItem={({ item, index }) => <NotificationItem title={item.partner.name || '대화 상대'} description={item.notificationEnabled ? '새 메시지가 오면 알려드려요.' : '이 대화방의 새 메시지 알림을 받지 않아요.'} value={item.notificationEnabled} onToggle={() => toggle(item.chatRoomId)} disabled={isSaving} isSaving={savingRoomId === item.chatRoomId} isLast={index === data.rooms.length - 1} />}
            ListEmptyComponent={<View style={styles.empty}><Feather name="message-circle" size={28} color={colors.text.secondary} /><Text style={[styles.emptyTitle, { color: colors.text.primary }]}>아직 대화방이 없어요</Text><Text style={[styles.copy, { color: colors.text.secondary }]}>대화가 시작되면 여기에서{ '\n' }메시지 알림을 관리할 수 있어요.</Text></View>}
          />}
        </View>
        <ToastViewport active={visible} />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', alignItems: 'center' },
  sheet: { width: '100%', maxWidth: 560, borderTopLeftRadius: Radii.xxl, borderTopRightRadius: Radii.xxl, paddingTop: Spacing.md, flexShrink: 1 },
  heading: { paddingHorizontal: Spacing.xl, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  title: { flex: 1, fontFamily: FontFamily.sans, fontWeight: FontWeight.semibold, fontSize: FontSize.lg, lineHeight: 27 },
  close: { minWidth: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  intro: { paddingHorizontal: Spacing.xl, marginTop: Spacing.sm, marginBottom: Spacing.md, fontFamily: FontFamily.sans, fontSize: FontSize.sm, lineHeight: 22 },
  list: { flexGrow: 0, flexShrink: 1 },
  listContent: { paddingHorizontal: Spacing.xs },
  loading: { padding: Spacing.xxl },
  error: { paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md },
  saveError: { paddingHorizontal: Spacing.xl, marginBottom: Spacing.md },
  copy: { fontFamily: FontFamily.sans, fontSize: FontSize.sm, lineHeight: 22 },
  retry: { minHeight: 48, justifyContent: 'center' },
  empty: { padding: Spacing.xl, gap: Spacing.sm, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontFamily: FontFamily.sans, fontSize: FontSize.base, fontWeight: FontWeight.semibold, lineHeight: 24 },
});
