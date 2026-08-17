import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors, FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { useWeeklySummaryQuery } from '@/src/features/history/hooks/useWeeklySummaryQuery';

/**
 * HistoryStatsRow 컴포넌트 (SRP)
 * GET /history/weekly-summary를 조회해 주간 통화 요약을 단일 통합 카드로 표시합니다.
 *
 * 레이아웃:
 *   [Weekly Summary 레이블]  [증감 배지 — 전주 비교 불가 시 숨김]
 *   [누적 대화 시간]  |  [받음 카운트(cyan) / 보냄 카운트(purple)]
 */
export default function HistoryStatsRow() {
  const { colors } = useThemeColors();
  const { data, isLoading, isError, refetch } = useWeeklySummaryQuery();

  if (isError) {
    return (
      <TouchableOpacity
        style={[styles.card, styles.retryCard, { backgroundColor: colors.background.glass, borderColor: colors.border.primary }]}
        onPress={() => refetch()}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="주간 통계 다시 조회"
      >
        <Feather name="refresh-cw" size={14} color={colors.text.muted} />
        <Text style={[styles.retryText, { color: colors.text.muted }]}>주간 통계 조회 실패 · 탭하여 재시도</Text>
      </TouchableOpacity>
    );
  }

  const totalHours = data ? Math.round((data.totalTalkTimeSec / 3600) * 10) / 10 : null;
  const trend =
    data && data.comparable && data.changeRate !== null && data.trend !== 'NO_DATA'
      ? {
          icon:
            data.trend === 'UP' ? ('trending-up' as const) : data.trend === 'DOWN' ? ('trending-down' as const) : ('minus' as const),
          color: data.trend === 'UP' ? Colors.primary.successGreen : data.trend === 'DOWN' ? colors.state.danger : colors.text.muted,
          label: data.trend === 'UP' ? `+${data.changeRate}%` : `${data.changeRate}%`,
        }
      : null;

  return (
    <View style={[styles.card, { backgroundColor: colors.background.glass, borderColor: colors.border.primary }]}>
      {/* 상단: 레이블 + 증가율 */}
      <View style={styles.topRow}>
        <Text style={[styles.sectionLabel, { color: Colors.primary.electricCyan }]}>
          WEEKLY SUMMARY
        </Text>
        {trend && (
          <View style={styles.growthBadge}>
            <Feather name={trend.icon} size={10} color={trend.color} />
            <Text style={[styles.growthText, { color: trend.color }]}>{trend.label}</Text>
          </View>
        )}
      </View>

      {/* 하단: 시간 + 구분선 + 카운트 */}
      <View style={styles.bottomRow}>
        {/* 누적 대화 시간 */}
        <View style={styles.hoursBlock}>
          <View style={styles.hoursValueRow}>
            <Text style={[styles.hoursNumber, { color: colors.text.primary }]}>
              {isLoading || totalHours === null ? '--' : totalHours}
            </Text>
            <Text style={[styles.hoursUnit, { color: colors.text.muted }]}>시간</Text>
          </View>
          <Text style={[styles.hoursLabel, { color: colors.text.muted }]}>누적 대화 시간</Text>
        </View>

        {/* 수직 구분선 */}
        <View style={[styles.verticalDivider, { backgroundColor: colors.border.primary }]} />

        {/* 받음/보냄 카운트 */}
        <View style={styles.countsBlock}>
          {/* 받음 */}
          <View style={styles.countItem}>
            <View style={styles.countValueRow}>
              <Feather name="arrow-down-left" size={12} color={Colors.primary.electricCyan} />
              <Text style={[styles.countNumber, { color: Colors.primary.electricCyan }]}>
                {isLoading || !data ? '--' : String(data.receivedCallCount).padStart(2, '0')}
              </Text>
            </View>
            <Text style={[styles.countLabel, { color: colors.text.muted }]}>받음</Text>
          </View>

          {/* 보냄 */}
          <View style={styles.countItem}>
            <View style={styles.countValueRow}>
              <Feather name="arrow-up-right" size={12} color={Colors.primary.vividPurple} />
              <Text style={[styles.countNumber, { color: Colors.primary.vividPurple }]}>
                {isLoading || !data ? '--' : String(data.sentCallCount).padStart(2, '0')}
              </Text>
            </View>
            <Text style={[styles.countLabel, { color: colors.text.muted }]}>보냄</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignSelf: 'stretch',
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radii.xxl,
    borderWidth: 0.612,
    gap: Spacing.md,
  },
  retryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  retryText: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionLabel: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.black as any,
    letterSpacing: 2.1,
    textTransform: 'uppercase',
  },
  growthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xxs,
  },
  growthText: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.xl,
  },
  hoursBlock: {
    flex: 1,
    flexDirection: 'column',
    gap: Spacing.xxs,
  },
  hoursValueRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.xs,
  },
  hoursNumber: {
    fontFamily: FontFamily.sans,
    fontSize: 30,
    fontWeight: FontWeight.black as any,
    letterSpacing: -1,
    lineHeight: 34,
  },
  hoursUnit: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.regular,
    marginBottom: 2,
  },
  hoursLabel: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  verticalDivider: {
    width: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
  },
  countsBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xl,
    paddingLeft: Spacing.sm,
  },
  countItem: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: Spacing.xxs,
  },
  countValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xxs,
  },
  countNumber: {
    fontFamily: FontFamily.mono,
    fontSize: FontSize.base,
    fontWeight: FontWeight.black as any,
  },
  countLabel: {
    fontFamily: FontFamily.sans,
    fontSize: 8,
    fontWeight: FontWeight.black as any,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
