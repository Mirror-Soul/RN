import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { BrowseIcon } from '@/src/components/home/common/BrowseIcon';
import { useRouter } from 'expo-router';
import {
  FontFamily,
  FontSize,
  FontWeight,
  Radii,
  Spacing,
} from '@/src/constants/theme';
import {
  useMatchingDesign,
  MatchingText as Text,
} from '@/src/features/match/components/MatchingDesign';
import { formatRelativeTime } from '@/src/utils/formatRelativeTime';
import { MatchAvatar } from '@/src/features/match/components/MatchAvatar';
import type { ChatRoomSummary } from '@/src/types/api/chat';

export default function MatchingChatItem({
  data,
  onPress,
}: {
  data: ChatRoomSummary;
  onPress?: () => void;
}) {
  const { colors, palette } = useMatchingDesign();
  const router = useRouter();
  const { partner, lastMessage, unreadCount } = data;
  const name = partner.name || '상대방';
  const unread = unreadCount > 0;
  return (
    <Pressable
      onPress={onPress ?? (() => router.push(`/chat/${data.chatRoomId}`))}
      accessibilityRole="button"
      accessibilityLabel={`${name}님과의 대화${unread ? `, 읽지 않은 메시지 ${unreadCount}개` : ''}, ${lastMessage?.content || '첫 메시지를 보내보세요'}`}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.background.card,
          borderColor: colors.border.primary,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      <MatchAvatar name={name} url={partner.profileImageUrl} size={48} />
      <View style={styles.copy}>
        <View style={styles.heading}>
          <Text variant="heading" style={[styles.name, { color: colors.text.primary }]}>
            {name}
          </Text>
          {unread && (
            <Text
              style={[
                styles.badge,
                {
                  color: palette.accentInk,
                  backgroundColor: palette.tint,
                },
              ]}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Text>
          )}
        </View>
        <Text
          style={[
            styles.message,
            {
              color: unread ? colors.text.primary : colors.text.secondary,
              fontWeight: unread ? FontWeight.medium : FontWeight.regular,
            },
          ]}
          numberOfLines={2}
        >
          {lastMessage?.content || '첫 메시지를 보내보세요'}
        </Text>
        <View style={styles.meta}>
          {lastMessage && (
            <Text style={[styles.note, { color: colors.text.secondary }]}>
              {formatRelativeTime(lastMessage.createdAt)}
            </Text>
          )}
          {!data.notificationEnabled && (
            <View style={styles.quiet}>
              <BrowseIcon
                name="bell-slash"
                size={12}
                color={colors.text.secondary}
              />
              <Text style={[styles.note, { color: colors.text.secondary }]}>
                알림 꺼짐
              </Text>
            </View>
          )}
        </View>
      </View>
      <BrowseIcon name="caret-right" size={18} color={colors.text.secondary} />
    </Pressable>
  );
}
const styles = StyleSheet.create({
  card: {
    padding: Spacing.lg,
    borderWidth: 1,
    borderRadius: Radii.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  copy: { flex: 1, minWidth: 0, gap: Spacing.xs },
  heading: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: Spacing.sm },
  name: {
    flex: 1,
    minWidth: 0,
    fontFamily: FontFamily.sans,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    lineHeight: 24,
  },
  badge: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    lineHeight: 20,
    paddingHorizontal: Spacing.xs,
    minWidth: 22,
    textAlign: 'center',
    borderRadius: Radii.full,
  },
  message: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.base,
    lineHeight: 23,
  },
  meta: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  note: { fontFamily: FontFamily.sans, fontSize: FontSize.sm, lineHeight: 20 },
  quiet: { maxWidth: '100%', flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
});
