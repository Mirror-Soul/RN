import React, { useCallback, useState } from 'react';
import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
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
import { useMatchingStatus } from '@/src/features/home/hooks/useMatchingStatus';
import { useProfileRefresh } from '@/src/features/profile/hooks/useProfileRefresh';
import { NotificationToggle } from '@/src/features/notification/components/NotificationToggle';

export default function MatchingActiveStatus({
  compact = false,
}: {
  compact?: boolean;
}) {
  const { colors } = useMatchingDesign();
  const [showInfo, setShowInfo] = useState(false);
  const { width, fontScale } = useWindowDimensions();
  const {
    matchingEnabled,
    handleToggle,
    isLoading,
    isToggling,
    isError,
    isFetching,
    refetch,
  } = useMatchingStatus();
  useProfileRefresh(useCallback(() => refetch(), [refetch]));
  const missing = isError && matchingEnabled === null;
  const stacked = width < 360 || fontScale > 1.3;
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: 'transparent',
          borderColor: 'transparent',
        },
      ]}
    >
      <View style={[styles.row, stacked && styles.stacked]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="추천 노출 설정 안내"
          accessibilityState={{ expanded: showInfo }}
          onPress={() => setShowInfo((value) => !value)}
          style={[styles.info, stacked && { flex: 0 }]}
        >
          <Text style={[styles.title, { color: colors.text.primary }]}>
            추천에 나를 소개하기
          </Text>
          <Feather name="info" size={14} color={colors.text.secondary} />
        </Pressable>
        {missing ? (
          <Pressable
            disabled={isFetching}
            onPress={() => {
              void refetch();
            }}
            accessibilityRole="button"
            accessibilityLabel="추천 노출 상태 다시 확인"
            style={styles.retry}
          >
            <Text style={[styles.copy, { color: colors.brand.accent }]}>
              {isFetching ? '확인 중…' : '다시 확인'}
            </Text>
          </Pressable>
        ) : (
          <NotificationToggle
            accentColor={colors.brand.accent}
            value={matchingEnabled}
            label="추천 목록에 나를 보여주기"
            onToggle={handleToggle}
            isLoading={isLoading}
            isSaving={isToggling}
          />
        )}
      </View>
      {(!compact || missing || showInfo) && (
        <Text
          style={[
            styles.copy,
            { color: missing ? colors.state.danger : colors.text.secondary },
          ]}
        >
          {missing
            ? '추천 노출 설정을 불러오지 못했어요.'
            : matchingEnabled === null
              ? '추천 노출 여부를 확인하고 있어요.'
              : matchingEnabled === false
                ? '내 프로필 추천과 내 트윈으로 걸려오는 새 통화를 잠시 쉬어요. 기존 신청과 메시지는 확인할 수 있어요.'
                : '상대가 내 트윈과 먼저 이야기할 수 있어요.'}
        </Text>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  card: {
    paddingHorizontal: Spacing.xs,
    paddingBottom: Spacing.sm,
    borderRadius: Radii.lg,
    gap: Spacing.xxs,
  },
  row: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'center' },
  info: {
    flex: 1,
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  stacked: { flexDirection: 'column', alignItems: 'stretch' },
  title: {
    flex: 1,
    fontFamily: FontFamily.sans,
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    lineHeight: 23,
  },
  copy: { fontFamily: FontFamily.sans, fontSize: FontSize.sm, lineHeight: 21 },
  retry: { minHeight: 48, justifyContent: 'center' },
});
