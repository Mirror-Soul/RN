import { BottomSheet } from '@/src/components/common/BottomSheet/BottomSheet';
import { useToast } from '@/src/components/common/Toast/ToastProvider';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';
import { useValueBalanceQuestionQuery } from '@/src/features/growth/hooks/useValueBalanceQuestionQuery';
import { useSubmitValueBalanceAnswerMutation } from '@/src/features/growth/hooks/useSubmitValueBalanceAnswerMutation';
import { getErrorDisplayMessage, getErrorCode } from '@/src/utils/apiErrorCode';
import { VALUE_BALANCE_AXIS_LABELS } from '@/src/constants/valueBalanceAxis';
import type {
  ValueBalanceAnswerResult,
  ValueBalanceAxis,
  ValueBalanceChosenSide,
  ValueBalanceQuestionResult,
} from '@/src/types/api/evolve';
import React, { useEffect, useRef, useState } from 'react';
import { BrowseText as Text } from '@/src/components/home/common/BrowseText';
import { valueBalanceUnlockLabel } from '../valueBalanceCopy';
import { useLayout } from '@/src/hooks/useLayout';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { useThemeColors } from '@/src/hooks/useThemeColors';

interface ValueBalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AnswerableQuestion = ValueBalanceQuestionResult & {
  questionId: number;
  axis: ValueBalanceAxis;
  leftLabel: string;
  rightLabel: string;
};

/** 세트 분석 대기/전체 완료 시 일부 필드가 null이므로, 실제 답변 가능 여부를 타입 단에서 좁혀준다. */
function isAnswerableQuestion(
  question: ValueBalanceQuestionResult | undefined
): question is AnswerableQuestion {
  return question != null
    && question.questionId != null
    && question.axis != null
    && question.leftLabel != null
    && question.rightLabel != null;
}

/**
 * ValueBalanceModal 컴포넌트 (SRP)
 * 가치관 밸런스 게임 바텀시트입니다. GET /evolve/value-balance는 한 번에 질문 1개만 주므로,
 * 연속 질문 흐름은 "답변 제출 성공 → 쿼리 무효화 → 다음 질문 자동 refetch"로 구현합니다.
 * 진행률(현재 세트의 N of setSize)은 GET 응답의 answeredInSet/setSize를 기본값으로 쓰고, 방금
 * 답변을 제출했다면(POST 응답이 GET refetch보다 먼저 도착하는 짧은 순간) lastAnswer로
 * 덮어써서 최신값을 보여줍니다 — 오늘 이미 답변한 뒤 모달을 다시 열어도 진행률이 0%로
 * 보이지 않습니다.
 */
export default function ValueBalanceModal({ isOpen, onClose }: ValueBalanceModalProps) {
  const { colors } = useThemeColors();
  const insets = useSafeAreaInsets();
  const { contentContainerStyle } = useLayout();
  const { height, fontScale } = useWindowDimensions();
  const selectionLock = useRef(false);
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  const { data: question, isLoading, isError, isFetching, refetch } = useValueBalanceQuestionQuery();
  const submitMutation = useSubmitValueBalanceAnswerMutation();
  // 방금 제출한 답변 결과를 잠깐 보관한다 — GET이 무효화→refetch로 최신 카운트를 받아오기
  // 전까지의 짧은 틈을 메워, 진행률 표시가 답변 직후 한 박자 늦게 갱신되지 않도록 한다.
  const [lastAnswer, setLastAnswer] = useState<ValueBalanceAnswerResult | null>(null);
  // 방금 탭한 선택지를 잠깐 하이라이트해서 "내가 뭘 눌렀는지" 시각 피드백을 준다.
  const [selectedSide, setSelectedSide] = useState<ValueBalanceChosenSide | null>(null);
  const { showToast } = useToast();

  // 새 질문으로 바뀌면(답변 성공/자동 복구 refetch 등) 이전 질문에 남아있던 하이라이트를 지운다.
  useEffect(() => {
    setSelectedSide(null);
    setLastAnswer(null);
  }, [question?.questionId]);

  const isBusy = submitMutation.isPending || isFetching;

  const handleSelect = async (chosenSide: ValueBalanceChosenSide) => {
    const questionId = question?.questionId;
    if (!isOpen || questionId == null || isBusy || selectionLock.current) return;
    selectionLock.current = true;
    setSelectedSide(chosenSide);
    try {
      const response = await submitMutation.mutateAsync({ questionId, chosenSide });
      if (mounted.current) setLastAnswer(response.result);
    } catch (error) {
      if (!mounted.current) return;
      setSelectedSide(null);
      showToast(getErrorDisplayMessage(error, '답변을 저장하지 못했어요. 다시 선택해주세요.'), 'error');
      // 이미 답한 질문이거나(레이스) 질문이 만료된 경우, 화면엔 여전히 낡은 질문이 남아있어
      // 사용자가 같은 버튼을 다시 눌러도 같은 에러가 반복된다 — 새 질문으로 자동 복구한다.
      const code = getErrorCode(error);
      if (
        code === 'VALUE_BALANCE_ALREADY_ANSWERED'
        || code === 'VALUE_BALANCE_QUESTION_NOT_FOUND'
        || code === 'VALUE_BALANCE_SET_LOCKED'
        || code === 'VALUE_BALANCE_COMPLETED'
      ) {
        void refetch();
      }
    } finally { selectionLock.current = false; }
  };

  // lastAnswer(방금 제출한 POST 응답)가 있으면 그걸 우선 쓰고, 없으면 GET 응답의
  // answeredInSet/setSize를 기본값으로 쓴다.
  const progressStats = lastAnswer
    ? {
        answeredInSet: lastAnswer.answeredInSet,
        setSize: lastAnswer.setSize,
        currentSet: lastAnswer.currentSet,
        totalSets: lastAnswer.totalSets,
      }
    : question
      ? {
          answeredInSet: question.answeredInSet,
          setSize: question.setSize,
          currentSet: question.currentSet,
          totalSets: question.totalSets,
        }
      : null;
  const safeSetSize = progressStats && Number.isFinite(progressStats.setSize)
    ? Math.max(1, Math.floor(progressStats.setSize))
    : 1;
  const safeAnsweredInSet = progressStats && Number.isFinite(progressStats.answeredInSet)
    ? Math.min(safeSetSize, Math.max(0, Math.floor(progressStats.answeredInSet)))
    : 0;
  const latest = lastAnswer ?? question;
  const isFinished = !isLoading && !isError && latest?.completed === true;
  const isLocked = !isLoading && !isError && latest?.locked === true && !isFinished;
  const displayedAnswered = isLocked || isFinished ? safeSetSize : safeAnsweredInSet;
  const progress = progressStats ? (displayedAnswered / safeSetSize) * 100 : 0;
  const unlock = valueBalanceUnlockLabel(latest?.lockedUntil);
  const close = () => { if (!selectionLock.current && !submitMutation.isPending) onClose(); };

  return (
    <BottomSheet isOpen={isOpen} onClose={close} height={Math.min(isLocked ? 320 * Math.max(1, fontScale) + insets.bottom : 640, Math.max(0, height - insets.top - 12))} dragFromHandleOnly>
      <View style={[styles.closeRow, contentContainerStyle]}><TouchableOpacity onPress={close} disabled={submitMutation.isPending} accessibilityRole="button" accessibilityLabel="가치관 게임 닫기" style={styles.closeButton}><Feather name="x" size={22} color={colors.text.secondary} /></TouchableOpacity></View>
      <ScrollView style={styles.scroll} contentContainerStyle={[styles.container, contentContainerStyle, { paddingLeft: 20 + insets.left, paddingRight: 20 + insets.right, paddingBottom: 24 + insets.bottom }]} keyboardShouldPersistTaps="handled">
        <View
          style={[styles.progressTrack, { backgroundColor: colors.background.glass }]}
          accessible
          accessibilityLabel="이번 세트 답변 진행"
          accessibilityRole="progressbar"
          accessibilityValue={
            progressStats
              ? { min: 0, max: safeSetSize, now: displayedAnswered }
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
            <Text style={[styles.title, { color: colors.text.primary }]}>답변을 모두 마쳤어요</Text>
            <Text style={[styles.subtitle, { color: colors.text.muted }]}
            >
              선택한 답변을 모두 저장했어요. 분석 결과가 트윈에 반영되기까지 시간이 걸릴 수 있어요.
            </Text>
          </View>
        ) : isLocked ? (
          <TouchableOpacity
            style={[styles.finishing, styles.lockedState]}
            onPress={() => refetch()}
            disabled={isFetching}
            accessibilityRole="button"
            accessibilityLabel="다음 가치관 질문 다시 확인"
            accessibilityHint={unlock ? `다음 질문 ${unlock}, 한국 시간 기준` : '다음 질문이 열리면 이어서 할 수 있어요.'}
            accessibilityState={{ busy: isFetching }}
          >
            {isFetching ? (
              <ActivityIndicator color={Colors.primary.electricCyan} />
            ) : (
              <>
                <View style={[styles.finishingBadge, styles.lockedBadge]}>
                  <MaterialCommunityIcons name="gamepad-variant-outline" size={28} color={Colors.primary.electricCyan} />
                </View>
                <Text style={[styles.title, styles.lockedTitle, { color: colors.text.primary }]}>이번 세트에 답했어요</Text>
                {unlock ? <View style={styles.unlock}><Text style={[styles.unlockValue, { color: colors.text.primary }]}>다음 질문 {unlock}</Text></View> : <Text style={[styles.subtitle, { color: colors.text.muted }]}>다음 질문을 기다리고 있어요.</Text>}
                {!!unlock && <Text style={[styles.unlockLabel, { color: colors.text.muted }]}>한국 시간 기준</Text>}
              </>
            )}
          </TouchableOpacity>
        ) : (
          isAnswerableQuestion(question) && (
            <>
              <View style={styles.header}>
                <View>
                  <Text style={[styles.eyebrow, { color: colors.text.secondary }]}>정답 없는 선택</Text>
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
                  <Text style={[styles.question, { color: colors.text.primary }]}>평소 나에게 가까운 쪽은?</Text>
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
                <Text style={[styles.stepText, { color: colors.text.muted }]}
                >
                  세트 {progressStats.currentSet} / {progressStats.totalSets} · 답변 {safeAnsweredInSet} / {safeSetSize}
                </Text>
              )}
            </>
          )
        )}
      </ScrollView>

    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  closeRow: { alignItems: 'flex-end', paddingHorizontal: 16 },
  closeButton: { minWidth: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  scroll: { flex: 1 },
  container: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xxl,
  },
  progressTrack: {
    height: 4,
    borderRadius: Radii.full,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
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
    fontWeight: FontWeight.semibold,
    letterSpacing: 1.5,
    color: Colors.glass.cyan30_d3,
  },
  title: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.semibold,
    letterSpacing: -0.5,
    marginTop: 4,
  },
  questionArea: {
    paddingTop: Spacing.xl,
    gap: Spacing.lg,
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
    fontWeight: FontWeight.semibold,
    textTransform: 'uppercase',
  },
  question: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.semibold,
    letterSpacing: -0.3,
  },
  choices: {
    gap: Spacing.md,
  },
  choiceButton: {
    padding: Spacing.lg,
    minHeight: 52,
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
    fontWeight: FontWeight.semibold,
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
    fontWeight: FontWeight.semibold,
  },
  stepText: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  finishing: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  lockedState: { flex: 0, gap: 10, paddingVertical: 4 },
  lockedBadge: { width: 48, height: 48 },
  lockedTitle: { alignSelf: 'stretch', textAlign: 'center', fontSize: 20, lineHeight: 28, marginTop: 0 },
  unlock: { alignSelf: 'stretch', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 16, backgroundColor: Colors.glass.cyan10_d3 },
  unlockLabel: { alignSelf: 'stretch', fontSize: 11, lineHeight: 17, textAlign: 'center' },
  unlockValue: { alignSelf: 'stretch', fontSize: 16, lineHeight: 25, fontWeight: '600', textAlign: 'center' },
  finishingBadge: {
    width: 64,
    height: 64,
    borderRadius: Radii.full,
    backgroundColor: Colors.glass.cyan20_d3,
    borderWidth: 1,
    borderColor: Colors.glass.cyan30_d3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subtitle: {
    alignSelf: 'stretch',
    lineHeight: 23,
    fontFamily: FontFamily.sans,
    fontSize: FontSize.base,
    fontWeight: FontWeight.medium,
    textAlign: 'center',
  },
});
