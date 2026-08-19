import { BottomSheet } from '@/src/components/common/BottomSheet/BottomSheet';
import FloatingNotice from '@/src/components/home/common/FloatingNotice';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';
import { useValueBalanceQuestionQuery } from '@/src/features/growth/hooks/useValueBalanceQuestionQuery';
import { useSubmitValueBalanceAnswerMutation } from '@/src/features/growth/hooks/useSubmitValueBalanceAnswerMutation';
import { useFloatingNotice } from '@/src/hooks/useFloatingNotice';
import { getErrorDisplayMessage, getErrorCode } from '@/src/utils/apiErrorCode';
import { VALUE_BALANCE_AXIS_LABELS } from '@/src/constants/valueBalanceAxis';
import type {
  ValueBalanceAnswerResult,
  ValueBalanceAxis,
  ValueBalanceChosenSide,
  ValueBalanceQuestionResult,
} from '@/src/types/api/evolve';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useThemeColors } from '@/src/hooks/useThemeColors';

interface ValueBalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

type AnswerableQuestion = ValueBalanceQuestionResult & {
  questionId: number;
  axis: ValueBalanceAxis;
  leftLabel: string;
  rightLabel: string;
};

/** quota 소진 시 questionId 등이 null인 채로 오므로, 실제로 답변 가능한 질문인지 타입 단에서 좁혀준다. */
function isAnswerableQuestion(
  question: ValueBalanceQuestionResult | undefined
): question is AnswerableQuestion {
  return question != null && question.questionId != null;
}

/**
 * ValueBalanceModal 컴포넌트 (SRP)
 * 가치관 밸런스 게임 바텀시트입니다. GET /evolve/value-balance는 한 번에 질문 1개만 주므로,
 * 연속 질문 흐름은 "답변 제출 성공 → 쿼리 무효화 → 다음 질문 자동 refetch"로 구현합니다.
 * 진행률(N of dailyLimit)은 GET 응답의 answeredCount/dailyLimit을 기본값으로 쓰고, 방금
 * 답변을 제출했다면(POST 응답이 GET refetch보다 먼저 도착하는 짧은 순간) lastAnswer로
 * 덮어써서 최신값을 보여줍니다 — 오늘 이미 답변한 뒤 모달을 다시 열어도 진행률이 0%로
 * 보이지 않습니다.
 */
export default function ValueBalanceModal({ isOpen, onClose, onComplete }: ValueBalanceModalProps) {
  const { colors } = useThemeColors();
  const { data: question, isLoading, isError, isFetching, refetch } = useValueBalanceQuestionQuery();
  const submitMutation = useSubmitValueBalanceAnswerMutation();
  // 방금 제출한 답변 결과를 잠깐 보관한다 — GET이 무효화→refetch로 최신 카운트를 받아오기
  // 전까지의 짧은 틈을 메워, 진행률 표시가 답변 직후 한 박자 늦게 갱신되지 않도록 한다.
  const [lastAnswer, setLastAnswer] = useState<ValueBalanceAnswerResult | null>(null);
  // 방금 탭한 선택지를 잠깐 하이라이트해서 "내가 뭘 눌렀는지" 시각 피드백을 준다.
  const [selectedSide, setSelectedSide] = useState<ValueBalanceChosenSide | null>(null);
  const { message: noticeMessage, opacity: noticeOpacity, flash: flashNotice } = useFloatingNotice();

  // 새 질문으로 바뀌면(답변 성공/자동 복구 refetch 등) 이전 질문에 남아있던 하이라이트를 지운다.
  useEffect(() => {
    setSelectedSide(null);
  }, [question?.questionId]);

  useEffect(() => {
    // 방금 답변해서 quota를 다 썼는지(questionId가 null로 바뀌었는지) 감지되면 완료 콜백을 알린다.
    if (isOpen && lastAnswer && question?.questionId == null) {
      onComplete();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, question]);

  const isBusy = submitMutation.isPending || isFetching;

  const handleSelect = async (chosenSide: ValueBalanceChosenSide) => {
    const questionId = question?.questionId;
    if (questionId == null || isBusy) return;
    setSelectedSide(chosenSide);
    try {
      const response = await submitMutation.mutateAsync({ questionId, chosenSide });
      setLastAnswer(response.result);
    } catch (error) {
      setSelectedSide(null);
      flashNotice(getErrorDisplayMessage(error, '답변 제출에 실패했습니다. 잠시 후 다시 시도해주세요.'));
      // 이미 답한 질문이거나(레이스) 질문이 만료된 경우, 화면엔 여전히 낡은 질문이 남아있어
      // 사용자가 같은 버튼을 다시 눌러도 같은 에러가 반복된다 — 새 질문으로 자동 복구한다.
      const code = getErrorCode(error);
      if (code === 'VALUE_BALANCE_ALREADY_ANSWERED' || code === 'VALUE_BALANCE_QUESTION_NOT_FOUND') {
        refetch();
      }
    }
  };

  // lastAnswer(방금 제출한 POST 응답)가 있으면 그걸 우선 쓰고, 없으면 GET 응답의
  // answeredCount/dailyLimit을 기본값으로 쓴다 — 화면 진입 직후에도 오늘 이미 답변한
  // 개수를 정확히 반영한다.
  const progressStats = lastAnswer
    ? { answeredCount: lastAnswer.answeredCount, dailyLimit: lastAnswer.dailyLimit }
    : question
      ? { answeredCount: question.answeredCount, dailyLimit: question.dailyLimit }
      : null;
  const progress = progressStats ? (progressStats.answeredCount / progressStats.dailyLimit) * 100 : 0;
  const isFinished = !isLoading && !isError && question?.questionId == null;

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} height={460}>
      <View style={styles.container}>
        <View
          style={[styles.progressTrack, { backgroundColor: colors.background.glass }]}
          accessibilityRole="progressbar"
          accessibilityValue={
            progressStats
              ? { min: 0, max: progressStats.dailyLimit, now: progressStats.answeredCount }
              : { min: 0, max: 1, now: 0 }
          }
        >
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>

        {isLoading ? (
          <View style={styles.centerState}>
            <ActivityIndicator color={Colors.primary.electricCyan} />
          </View>
        ) : isError ? (
          <TouchableOpacity
            style={styles.centerState}
            onPress={() => refetch()}
            disabled={isFetching}
            accessibilityRole="button"
            accessibilityLabel="질문 다시 조회"
            accessibilityState={{ busy: isFetching }}
          >
            {isFetching ? (
              <ActivityIndicator color={colors.state.danger} />
            ) : (
              <Text style={[styles.errorText, { color: colors.state.danger }]}>
                질문을 불러오지 못했습니다. 탭하여 다시 시도해주세요.
              </Text>
            )}
          </TouchableOpacity>
        ) : isFinished ? (
          <View style={styles.finishing}>
            <View style={styles.finishingBadge}>
              <Ionicons name="sparkles-outline" size={40} color={Colors.primary.electricCyan} />
            </View>
            <Text style={[styles.title, { color: colors.text.primary }]}>분석 완료</Text>
            <Text style={[styles.subtitle, { color: colors.text.muted }]}>
              오늘의 가치관 밸런스 질문을 모두 완료했어요. 내일 다시 만나요.
            </Text>
          </View>
        ) : (
          isAnswerableQuestion(question) && (
            <>
              <View style={styles.header}>
                <View>
                  <Text style={styles.eyebrow}>미니게임</Text>
                  <Text style={[styles.title, { color: colors.text.primary }]}>가치관 밸런스</Text>
                </View>
              </View>

              <View style={styles.questionArea}>
                <View style={styles.categoryWrapper}>
                  <View style={[styles.categoryBadge, { backgroundColor: colors.background.glass, borderColor: colors.border.primary }]}>
                    <Text style={[styles.categoryText, { color: colors.text.muted }]}>
                      {VALUE_BALANCE_AXIS_LABELS[question.axis]}
                    </Text>
                  </View>
                  <Text style={[styles.question, { color: colors.text.primary }]}>당신은 어떤 쪽인가요?</Text>
                </View>

                <View style={styles.choices}>
                  <TouchableOpacity
                    style={[
                      styles.choiceButton,
                      { backgroundColor: colors.background.glass, borderColor: colors.border.primary },
                      selectedSide === 'LEFT' && styles.choiceButtonSelected,
                      isBusy && selectedSide !== 'LEFT' && styles.choiceButtonDisabled,
                    ]}
                    onPress={() => handleSelect('LEFT')}
                    disabled={isBusy}
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    accessibilityLabel={question.leftLabel}
                    accessibilityState={{ selected: selectedSide === 'LEFT' }}
                  >
                    <Text
                      style={[
                        styles.choiceText,
                        { color: selectedSide === 'LEFT' ? Colors.primary.soulBlack : colors.text.secondary },
                      ]}
                    >
                      {question.leftLabel}
                    </Text>
                  </TouchableOpacity>

                  <View style={styles.vsWrapper}>
                    {isBusy ? (
                      <ActivityIndicator color={Colors.primary.electricCyan} />
                    ) : (
                      <View style={[styles.vsBadge, { backgroundColor: colors.background.glass, borderColor: colors.border.primary }]}>
                        <Text style={[styles.vsText, { color: colors.text.muted }]}>대</Text>
                      </View>
                    )}
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.choiceButton,
                      { backgroundColor: colors.background.glass, borderColor: colors.border.primary },
                      selectedSide === 'RIGHT' && styles.choiceButtonSelected,
                      isBusy && selectedSide !== 'RIGHT' && styles.choiceButtonDisabled,
                    ]}
                    onPress={() => handleSelect('RIGHT')}
                    disabled={isBusy}
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    accessibilityLabel={question.rightLabel}
                    accessibilityState={{ selected: selectedSide === 'RIGHT' }}
                  >
                    <Text
                      style={[
                        styles.choiceText,
                        { color: selectedSide === 'RIGHT' ? Colors.primary.soulBlack : colors.text.secondary },
                      ]}
                    >
                      {question.rightLabel}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {progressStats && (
                <Text style={[styles.stepText, { color: colors.text.muted }]}>
                  질문 {progressStats.answeredCount + 1} / {progressStats.dailyLimit}
                </Text>
              )}
            </>
          )
        )}
      </View>

      <FloatingNotice message={noticeMessage} opacity={noticeOpacity} bottom={24} />
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.xxl,
  },
  progressTrack: {
    height: 4,
    borderRadius: Radii.full,
    overflow: 'hidden',
    marginBottom: Spacing.xxl,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary.electricCyan,
  },
  centerState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  errorText: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    textAlign: 'center',
  },
  header: {
    marginBottom: Spacing.lg,
  },
  eyebrow: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.black,
    letterSpacing: 1.5,
    color: Colors.glass.cyan30_d3,
  },
  title: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.black,
    letterSpacing: -0.5,
    marginTop: 4,
  },
  questionArea: {
    paddingTop: Spacing.xl,
    gap: Spacing.xxxl,
  },
  categoryWrapper: {
    alignItems: 'center',
    gap: Spacing.md,
  },
  categoryBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radii.md,
    borderWidth: 1,
  },
  categoryText: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.black,
    textTransform: 'uppercase',
  },
  question: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.black,
    letterSpacing: -0.3,
  },
  choices: {
    gap: Spacing.md,
  },
  choiceButton: {
    padding: Spacing.xl,
    borderRadius: Radii.xxl,
    borderWidth: 1,
  },
  choiceButtonDisabled: {
    opacity: 0.5,
  },
  choiceButtonSelected: {
    backgroundColor: Colors.primary.electricCyan,
    borderColor: Colors.primary.electricCyan,
  },
  choiceText: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.black,
  },
  vsWrapper: {
    alignItems: 'center',
    minHeight: 32,
    justifyContent: 'center',
  },
  vsBadge: {
    width: 32,
    height: 32,
    borderRadius: Radii.full,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vsText: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.black,
  },
  stepText: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.black,
    letterSpacing: 1.1,
    textAlign: 'center',
    marginBottom: Spacing.xxl,
  },
  finishing: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  finishingBadge: {
    width: 96,
    height: 96,
    borderRadius: Radii.full,
    backgroundColor: Colors.glass.cyan20_d3,
    borderWidth: 1,
    borderColor: Colors.glass.cyan30_d3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subtitle: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.base,
    fontWeight: FontWeight.medium,
    textAlign: 'center',
  },
});
