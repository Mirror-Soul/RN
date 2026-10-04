import React from 'react';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
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
import type { MeetingRequestItem } from '@/src/types/api/meeting';
import { formatRelativeTime } from '@/src/utils/formatRelativeTime';
import { MatchAvatar } from './MatchAvatar';
import { MatchActionButton } from './MatchActionButton';

export function MeetingRequestCard({
  request,
  onDetails,
  onAccept,
  disabled,
  accepting,
}: {
  request: MeetingRequestItem;
  onDetails: () => void;
  onAccept: () => void;
  disabled: boolean;
  accepting: boolean;
}) {
  const { colors, palette } = useMatchingDesign();
  const { width, fontScale } = useWindowDimensions();
  const stacked = width < 360 || fontScale > 1.15;
  const name = request.name || '상대방';
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.background.card,
          borderColor: colors.border.primary,
        },
      ]}
    >
      <Pressable
        onPress={onDetails}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={`${name}님의 신청 자세히 보기`}
        style={styles.heading}
      >
        <MatchAvatar name={name} url={request.profileImageUrl} size={64} />
        <View style={styles.person}>
          <Text style={[styles.name, { color: colors.text.primary }]}>
            {name}
          </Text>
          <Text style={[styles.copy, { color: colors.text.secondary }]}>
            {request.age != null ? `${request.age}세 · ` : ''}
            {formatRelativeTime(request.requestedAt)}
          </Text>
        </View>
        <Feather name="chevron-right" size={20} color={colors.text.secondary} />
      </Pressable>
      <View style={[styles.messageBubble, { backgroundColor: palette.tint }]}>
        <Feather name="message-circle" size={16} color={palette.tintText} />
        <Text
          style={[styles.message, { color: colors.text.primary }]}
          numberOfLines={3}
        >
          {request.message}
        </Text>
      </View>
      {request.twinSimilarity != null && (
        <View style={styles.meta}>
          <Feather name="heart" size={13} color={colors.brand.accent} />
          <Text style={[styles.copy, { color: colors.text.secondary }]}>
            AI 대화 공감도 {request.twinSimilarity}%
          </Text>
        </View>
      )}
      <View style={[styles.actions, stacked && styles.stacked]}>
        <View style={!stacked && styles.primaryAction}>
          <MatchActionButton
            label="수락하고 대화하기"
            onPress={onAccept}
            primary
            disabled={disabled}
            busy={accepting}
          />
        </View>
        <Pressable
          onPress={onDetails}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel={`${name}님의 메시지와 대화 요약 보기`}
          style={[styles.details, { borderColor: colors.border.primary }]}
        >
          <Text style={[styles.copy, { color: colors.brand.accent }]}>
            자세히 보기
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  card: {
    padding: Spacing.xl,
    borderWidth: 1,
    borderRadius: Radii.xxl,
    gap: Spacing.md,
  },
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    minHeight: 56,
  },
  person: { flex: 1, minWidth: 0, gap: Spacing.xs },
  name: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.semibold,
    lineHeight: 29,
  },
  copy: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.base,
    lineHeight: 21,
    flexShrink: 1,
  },
  messageBubble: {
    borderRadius: Radii.lg2,
    borderTopLeftRadius: Radii.bubble,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  message: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.md,
    lineHeight: 25,
  },
  meta: { gap: Spacing.sm, flexDirection: 'row', alignItems: 'center' },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'stretch',
    marginTop: Spacing.xs,
  },
  stacked: { flexDirection: 'column' },
  primaryAction: { flex: 1 },
  details: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: Radii.full,
    padding: Spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
