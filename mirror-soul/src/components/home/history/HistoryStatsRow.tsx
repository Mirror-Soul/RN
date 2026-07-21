import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';

interface WeeklyStats {
  totalHours: number;
  received: number;
  sent: number;
  weeklyGrowthPercent: number;
}

interface HistoryStatsRowProps {
  stats: WeeklyStats;
}

/**
 * HistoryStatsRow 컴포넌트 (SRP)
 * 주간 통화 요약을 단일 통합 카드로 표시합니다.
 *
 * 레이아웃:
 *   [Weekly Summary 레이블]  [+N% 증가율 배지]
 *   [누적 대화 시간]  |  [받음 카운트(cyan) / 보냄 카운트(purple)]
 */
export default function HistoryStatsRow({ stats }: HistoryStatsRowProps) {
  const { colors } = useThemeColors();

  return (
    <View style={[styles.card, { backgroundColor: colors.background.glass, borderColor: colors.border.primary }]}>
      {/* 상단: 레이블 + 증가율 */}
      <View style={styles.topRow}>
        <Text style={[styles.sectionLabel, { color: Colors.primary.electricCyan }]}>
          WEEKLY SUMMARY
        </Text>
        <View style={styles.growthBadge}>
          <Feather name="trending-up" size={10} color={Colors.primary.successGreen} />
          <Text style={styles.growthText}>+{stats.weeklyGrowthPercent}%</Text>
        </View>
      </View>

      {/* 하단: 시간 + 구분선 + 카운트 */}
      <View style={styles.bottomRow}>
        {/* 누적 대화 시간 */}
        <View style={styles.hoursBlock}>
          <View style={styles.hoursValueRow}>
            <Text style={[styles.hoursNumber, { color: colors.text.primary }]}>
              {stats.totalHours}
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
                {String(stats.received).padStart(2, '0')}
              </Text>
            </View>
            <Text style={[styles.countLabel, { color: colors.text.muted }]}>받음</Text>
          </View>

          {/* 보냄 */}
          <View style={styles.countItem}>
            <View style={styles.countValueRow}>
              <Feather name="arrow-up-right" size={12} color={Colors.primary.vividPurple} />
              <Text style={[styles.countNumber, { color: Colors.primary.vividPurple }]}>
                {String(stats.sent).padStart(2, '0')}
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
    color: Colors.primary.successGreen,
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
