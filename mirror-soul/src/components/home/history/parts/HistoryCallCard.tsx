import { Colors, Radii, Spacing } from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

import CallAvatar from './HistoryCallCard/CallProfile';
import CallMeta from './HistoryCallCard/CallSubInfo';
import type { CallHistoryResult } from '@/src/types/api/history';
import { formatDurationLabel } from '@/src/utils/formatCallTime';
import { toTimeLabel } from '@/src/utils/formatHistoryDate';

interface HistoryCallCardProps {
  data: CallHistoryResult;
  index?: number;               // stagger 애니메이션용
  onPress?: () => void;
}

/**
 * 개별 통화 기록 단위 카드 컴포넌트
 *
 * 레이아웃:
 *   [CallAvatar] [CallMeta(이름/일치도/시간/태그)] [ChevronRight]
 *
 * isNew=true 시:
 *   - electricCyan 테두리
 *   - 우상단 cyan glowing dot indicator
 */
export default function HistoryCallCard({ data, index = 0, onPress }: HistoryCallCardProps) {
  const { colors } = useThemeColors();

  // 목록 아이템의 type은 백엔드에서 항상 SENT/RECEIVED만 내려준다 (ALL은 쿼리 파라미터 전용)
  const direction = data.type as 'SENT' | 'RECEIVED';
  // matchScore가 null이면 이 통화의 CallMatchAnalysis가 아직 완료되지 않은 상태(topics도 항상 빈 배열)
  const isAnalyzing = data.matchScore === null;
  const durationLabel = formatDurationLabel(data.durationSec);
  const ageLabel = data.partner.age !== null ? `${data.partner.age}세, ` : '';
  const directionLabel = direction === 'SENT' ? '내가 건 통화' : '받은 통화';
  const accessibilityLabel = `${data.partner.name}, ${ageLabel}${directionLabel}, ${durationLabel}${data.isNew ? ', 새 기록' : ''}`;

  const borderColor = data.isNew
    ? Colors.primary.electricCyan
    : colors.border.primary;

  const backgroundColor = data.isNew
    ? Colors.glass.cyan10_d3
    : colors.background.glass;

  return (
    <Animated.View entering={FadeInDown.delay(index * 60).duration(350).springify()}>
      <TouchableOpacity
        style={[styles.container, { backgroundColor, borderColor }]}
        onPress={onPress}
        activeOpacity={0.82}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
      >
        {/* 아바타 + 방향 배지 */}
        <CallAvatar
          name={data.partner.name}
          profileImageUrl={data.partner.profileImageUrl ?? undefined}
          direction={direction}
        />

        {/* 이름 / 일치도 / 시간 / 태그 */}
        <CallMeta
          name={data.partner.name}
          age={data.partner.age}
          consistencyPercent={data.partner.twinSyncRate}
          timeStr={toTimeLabel(data.startedAt)}
          durationLabel={durationLabel}
          tags={data.topics}
          isAnalyzing={isAnalyzing}
        />

        {/* ChevronRight */}
        <Feather name="chevron-right" size={16} color={colors.text.muted} style={styles.chevron} />

        {/* NEW dot indicator (isNew=true 시에만) */}
        {data.isNew && <View style={styles.newDot} />}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    alignSelf: 'stretch',
    borderRadius: Radii.xxl,   // 32px — 레퍼런스의 rounded-3xl
    borderWidth: 0.612,
  },
  chevron: {
    flexShrink: 0,
  },
  newDot: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.xxxl,       // ChevronRight 좌측
    width: 6,
    height: 6,
    borderRadius: Radii.full,
    backgroundColor: Colors.primary.electricCyan,
  },
});
