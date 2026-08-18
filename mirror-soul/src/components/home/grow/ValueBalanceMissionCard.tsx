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
  // quota 소진 시에도 result 자체는 null이 아니라 questionId 등 필드만 null인 객체로 온다
  // (백엔드 VALUE_BALANCE_DAILY_LIMIT_REACHED 응답도 result를 항상 채워 보낸다).
  const isQuotaReached = !isLoading && !isError && question?.questionId == null;
  // 에러(재조회 전 stale 데이터일 수 있음) 상태에선 진행 표시를 보여주지 않는다.
  // "N/5" 슬래시 표기는 화살표와 나란히 있으면 페이지네이션처럼 보여서, 점(dot) 진행
  // 표시로 대체한다(FaceDataPromptCard의 stepDots와 동일한 시각 언어).
  const progress = question && !isError
    ? { answered: question.answeredCount, total: question.dailyLimit }
    : null;
  // 실제 상태(완료/재시도)가 있을 때만 배지 텍스트로 보여주고, 그 외(진행 중)엔 "필수" 같은
  // 지어낸 라벨 대신 화살표로 단순 이동 안내만 한다.
  const statusLabel = isError ? '재시도' : isQuotaReached ? '완료' : null;

  const subtitle = isError
    ? '질문을 불러오지 못했어요. 탭하여 다시 시도해주세요.'
    : isQuotaReached
      ? '오늘의 질문을 모두 완료했어요. 내일 다시 도전해보세요.'
      : '트윈의 의사결정 알고리즘을 정교하게 다듬기';

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: colors.background.card, borderColor: colors.border.primary },
        isQuotaReached && styles.cardDisabled,
      ]}
      onPress={isError ? () => refetch() : isQuotaReached ? undefined : onPress}
      disabled={isQuotaReached}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={isError ? '가치관 밸런스 게임 미션 다시 조회' : '가치관 밸런스 게임 미션'}
      accessibilityState={{ disabled: isQuotaReached }}
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
