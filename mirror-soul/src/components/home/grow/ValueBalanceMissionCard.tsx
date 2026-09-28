import { Feather, Ionicons } from '@expo/vector-icons';
import { Colors, FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';
import { useValueBalanceQuestionQuery } from '@/src/features/growth/hooks/useValueBalanceQuestionQuery';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useThemeColors } from '@/src/hooks/useThemeColors';

interface ValueBalanceMissionCardProps {
  onPress?: () => void;
}

/**
 * ValueBalanceMissionCard 컴포넌트 (SRP)
 * 가치관 밸런스 게임 미션 진입 카드입니다. 게임 모달 오픈은 부모가 소유합니다.
 * 오늘의 질문을 미리 조회(prefetch)해서 quota 소진 여부를 카드에 바로 보여준다.
 */
export default function ValueBalanceMissionCard({ onPress }: ValueBalanceMissionCardProps) {
  const { colors } = useThemeColors();
  const { data: question, isLoading, isError, refetch } = useValueBalanceQuestionQuery();
  const isCompleted = !isLoading && !isError && question?.completed === true;
  const isLocked = !isLoading && !isError && question?.locked === true && !isCompleted;
  // 서버 계약이 바뀌거나 불완전한 응답이 와도 Array.from/레이아웃 값에 NaN이 들어가
  // 성장 탭 전체가 렌더 오류로 멈추지 않도록, 표시값은 먼저 안전한 정수 범위로 정규화한다.
  const rawSetSize = question?.setSize;
  const safeSetSize = typeof rawSetSize === 'number' && Number.isFinite(rawSetSize)
    ? Math.max(0, Math.floor(rawSetSize))
    : 0;
  const rawAnswered = question?.answeredInSet;
  const safeAnswered = typeof rawAnswered === 'number' && Number.isFinite(rawAnswered)
    ? Math.min(safeSetSize, Math.max(0, Math.floor(rawAnswered)))
    : 0;
  const progress = question && !isError && safeSetSize > 0
    ? { answered: safeAnswered, total: safeSetSize }
    : null;
  // 실제 상태(완료/재시도)가 있을 때만 배지 텍스트로 보여주고, 그 외(진행 중)엔 "필수" 같은
  // 지어낸 라벨 대신 화살표로 단순 이동 안내만 한다.
  const statusLabel = isError ? '재시도' : isCompleted ? '완료' : isLocked ? '분석 중' : null;

  const subtitle = isError
    ? '질문을 불러오지 못했어요. 탭하여 다시 시도해주세요.'
    : isCompleted
      ? '모든 가치관 밸런스 세트를 완료했어요.'
      : isLocked
        ? '이번 세트를 분석하고 있어요. 잠시 뒤 다시 확인해주세요.'
      : '트윈의 의사결정 알고리즘을 정교하게 다듬기';

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: colors.background.card, borderColor: colors.border.primary },
        isCompleted && styles.cardDisabled,
      ]}
      onPress={isError || isLocked ? () => refetch() : isCompleted ? undefined : onPress}
      disabled={isCompleted}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={isError || isLocked ? '가치관 밸런스 게임 상태 다시 조회' : '가치관 밸런스 게임 미션'}
      accessibilityState={{ disabled: isCompleted }}
    >
      <View style={styles.left}>
        <View style={styles.iconWrapper}>
          <Ionicons name="game-controller-outline" size={28} color={Colors.primary.vividPurple} />
        </View>
        <View style={styles.textArea}>
          <Text style={[styles.title, { color: colors.text.primary }]}>가치관 밸런스 게임</Text>
          <Text
            style={[
              styles.subtitle,
              { color: isError ? colors.state.danger : colors.text.muted },
              isError && styles.subtitleError,
            ]}
          >
            {subtitle}
          </Text>
        </View>
      </View>

      <View style={styles.statusArea}>
        {progress && (
          <View style={styles.progressDots}>
            {Array.from({ length: progress.total }).map((_, index) => (
              <View
                key={index}
                style={[
                  styles.progressDot,
                  { backgroundColor: colors.background.glass, borderColor: colors.border.primary },
                  index < progress.answered && styles.progressDotFilled,
                ]}
              />
            ))}
          </View>
        )}
        {statusLabel ? (
          <View style={[styles.statusBadge, { backgroundColor: colors.background.card, borderColor: colors.border.primary }]}>
            <Text style={styles.statusBadgeText}>{statusLabel}</Text>
          </View>
        ) : (
          <Feather name="chevron-right" size={20} color={colors.text.muted} />
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: Radii.xxl,
    borderWidth: 1,
    padding: Spacing.xl,
    alignSelf: 'stretch',
  },
  cardDisabled: {
    opacity: 0.6,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    flex: 1,
  },
  iconWrapper: {
    width: 56,
    height: 56,
    borderRadius: Radii.xl,
    backgroundColor: Colors.glass.purple20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textArea: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.md,
    fontWeight: FontWeight.black,
  },
  subtitle: {
    fontFamily: FontFamily.sans,
    fontSize: 11,
    fontWeight: FontWeight.medium,
  },
  subtitleError: {
    textDecorationLine: 'underline',
  },
  statusArea: {
    alignItems: 'center',
    gap: 4,
  },
  progressDots: {
    flexDirection: 'row',
    gap: 3,
  },
  progressDot: {
    width: 5,
    height: 5,
    borderRadius: Radii.full,
    borderWidth: 1,
  },
  progressDotFilled: {
    backgroundColor: Colors.primary.vividPurple,
    borderColor: Colors.primary.vividPurple,
  },
  statusBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radii.full,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontFamily: FontFamily.sans,
    fontSize: 9,
    fontWeight: FontWeight.black,
    color: Colors.primary.vividPurple,
  },
});
