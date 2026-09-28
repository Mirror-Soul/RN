import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { Recommendation } from '@/src/types/api/home';
import { BottomSheet } from '@/src/components/common/BottomSheet/BottomSheet';
import { Colors, FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { useTimeStatusQuery } from '@/src/features/profile/hooks/useTimeStatusQuery';
import { formatCallTime } from '@/src/utils/formatCallTime';
import { isMockRecommendationUuid } from '@/src/components/home/main/Discovery/mockRecommendations';

interface CallStartConfirmSheetProps {
  match: Recommendation | null;
  isOpen: boolean;
  onClose: () => void;
  /** 실제 추천은 통화 API 화면으로, 목업은 서버 연결 없는 UI 미리보기 화면으로 보낸다. */
  onStart: (match: Recommendation, isPreview: boolean, remainingSeconds?: number) => void;
  /** 잔여 시간이 없을 때, 시트를 닫고 시간 충전 흐름으로 전환한다. */
  onRefill: () => void;
}

/**
 * 발견 탭의 통화 시작 전 확인 시트.
 *
 * 실제 추천은 최신 잔여 시간을 다시 조회한 뒤에만 진입을 허용한다. 목업 추천은 의도적으로
 * 어떤 API나 권한도 요청하지 않고, 통화 화면의 UI를 검토하는 미리보기 모드로만 진입한다.
 */
export default function CallStartConfirmSheet({ match, isOpen, onClose, onStart, onRefill }: CallStartConfirmSheetProps) {
  const { colors } = useThemeColors();
  const startInFlightRef = useRef(false);
  const [isStarting, setIsStarting] = useState(false);
  const [hasFreshTimeCheck, setHasFreshTimeCheck] = useState(false);
  const isPreview = isMockRecommendationUuid(match?.userUuid);
  // 목업 미리보기와 닫힌 시트는 잔액을 확인할 이유가 없다. 실제 통화 확인 단계에서만
  // GET /my-page/buy-time을 활성화해 목업 버튼이 어떤 API도 유발하지 않게 한다.
  const shouldQueryTime = isOpen && !isPreview;
  const { data: timeStatus, isFetching, isError, refetch } = useTimeStatusQuery(shouldQueryTime);
  const remainingSeconds = timeStatus?.remainingTalkTime ?? 0;
  const hasRemainingTime = remainingSeconds > 0;

  // 카드에 표시된 캐시 잔액이 아니라, 버튼을 누른 바로 그 시점의 잔액으로 판단한다.
  useEffect(() => {
    if (!isOpen) {
      setHasFreshTimeCheck(false);
      return;
    }

    if (isPreview) {
      setHasFreshTimeCheck(true);
      return;
    }

    let isActive = true;
    setHasFreshTimeCheck(false);
    refetch().finally(() => {
      if (isActive) setHasFreshTimeCheck(true);
    });
    return () => {
      isActive = false;
    };
  }, [isOpen, isPreview, refetch]);

  useEffect(() => {
    if (!isOpen) {
      startInFlightRef.current = false;
      setIsStarting(false);
    }
  }, [isOpen]);

  const handlePrimaryAction = () => {
    if (!match || startInFlightRef.current) return;
    if (!isPreview && (!hasFreshTimeCheck || isFetching || isError)) return;

    // 0초일 때는 막힌 버튼을 남기지 않는다. 사용자가 다음에 해야 할 행동(충전)을
    // 같은 주 CTA로 제시해, 시간 카드까지 다시 찾아갈 필요가 없게 한다.
    if (!isPreview && !hasRemainingTime) {
      onRefill();
      return;
    }

    startInFlightRef.current = true;
    setIsStarting(true);
    onStart(match, isPreview, isPreview ? undefined : remainingSeconds);
  };

  if (!match) return null;

  const isCheckingTime = !hasFreshTimeCheck || isFetching;
  const timeLabel = isCheckingTime ? '확인 중...' : isError ? '확인하지 못했어요' : formatCallTime(remainingSeconds);
  const shouldPromptRefill = !isPreview && !isCheckingTime && !isError && !hasRemainingTime;
  const startDisabled = !isPreview && (isCheckingTime || isError);

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} height={420}>
      <View style={styles.container}>
        <View style={styles.heroRow}>
          <View style={styles.avatar}>
            <Feather name={isPreview ? 'eye' : 'phone-call'} size={22} color={Colors.primary.electricCyan} />
          </View>
          <View style={styles.heroCopy}>
            <Text style={[styles.title, { color: colors.text.primary }]}>
              {isPreview ? `${match.name}님 통화 화면 미리보기` : `${match.name}님의 AI 트윈과 통화할까요?`}
            </Text>
            <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
              {isPreview ? '서버 연결과 권한 요청 없이 UI만 보여드려요.' : '통화 시간은 연결된 뒤부터 기록됩니다.'}
            </Text>
          </View>
        </View>

        {isPreview ? (
          <View style={[styles.previewNotice, { backgroundColor: colors.background.glass, borderColor: colors.border.primary }]}>
            <Feather name="info" size={16} color={colors.text.muted} />
            <Text style={[styles.previewNoticeText, { color: colors.text.secondary }]}>목업 데이터는 실제 통화를 연결하지 않아요.</Text>
          </View>
        ) : (
          <View style={[styles.timeCard, { backgroundColor: colors.background.glass, borderColor: colors.border.primary }]}>
            <View style={styles.timeLabelRow}>
              <Feather name="clock" size={16} color={Colors.primary.electricCyan} />
              <Text style={[styles.timeLabel, { color: colors.text.muted }]}>현재 남은 대화 시간</Text>
            </View>
            <View style={styles.timeValueRow}>
              {isCheckingTime ? <ActivityIndicator size="small" color={Colors.primary.electricCyan} /> : null}
              <Text style={[styles.timeValue, { color: isError || !hasRemainingTime ? colors.state.danger : colors.text.primary }]}>
                {timeLabel}
              </Text>
            </View>
            {isError ? (
              <TouchableOpacity onPress={() => refetch()} accessibilityRole="button" accessibilityLabel="남은 대화 시간 다시 확인">
                <Text style={[styles.timeHint, styles.retryText, { color: colors.state.danger }]}>다시 확인하기</Text>
              </TouchableOpacity>
            ) : !isCheckingTime && !hasRemainingTime ? (
              <Text style={[styles.timeHint, { color: colors.state.danger }]}>지금 충전하면 바로 AI 트윈과 대화를 시작할 수 있어요.</Text>
            ) : (
              <Text style={[styles.timeHint, { color: colors.text.muted }]}>남은 시간이 있을 때만 통화를 시작할 수 있어요.</Text>
            )}
            <View style={[styles.timeLimitNotice, { borderTopColor: colors.border.primary }]}>
              <Feather name="info" size={14} color={Colors.primary.electricCyan} />
              <Text style={[styles.timeLimitNoticeText, { color: colors.text.secondary }]}>통화는 연결된 순간부터 시간이 차감되며, 남은 시간이 0초가 되면 자동으로 종료돼요.</Text>
            </View>
          </View>
        )}

        <TouchableOpacity
          onPress={handlePrimaryAction}
          disabled={startDisabled || isStarting}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={isPreview ? '통화 화면 미리보기 시작' : shouldPromptRefill ? '대화 시간 충전하기' : '통화 시작'}
          accessibilityState={{ disabled: startDisabled || isStarting }}
          style={[styles.startButtonWrapper, (startDisabled || isStarting) && styles.startButtonDisabled]}
        >
          <LinearGradient
            colors={[Colors.primary.electricCyan, Colors.primary.vividPurple]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.startButton}
          >
            {isStarting ? (
              <ActivityIndicator size="small" color={Colors.neutral.pureWhite} />
            ) : (
              <Feather name={shouldPromptRefill ? 'credit-card' : 'phone'} size={18} color={Colors.neutral.pureWhite} />
            )}
            <Text style={styles.startButtonText}>{isPreview ? '미리보기 시작' : shouldPromptRefill ? '대화 시간 충전하기' : '통화 시작'}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xxxl,
    gap: Spacing.xl,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: Radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.glass.cyan10_d3,
    borderWidth: 1,
    borderColor: Colors.glass.cyan20_d3,
  },
  heroCopy: {
    flex: 1,
  },
  title: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.black,
  },
  subtitle: {
    marginTop: Spacing.xs,
    fontFamily: FontFamily.sans,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.regular,
  },
  timeCard: {
    borderWidth: 1,
    borderRadius: Radii.lg,
    padding: Spacing.lg,
  },
  timeLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  timeLabel: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },
  timeValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  timeValue: {
    fontFamily: FontFamily.mono,
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.black,
  },
  timeHint: {
    marginTop: Spacing.xs,
    fontFamily: FontFamily.sans,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.regular,
  },
  retryText: {
    textDecorationLine: 'underline',
  },
  timeLimitNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    borderTopWidth: 1,
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
  },
  timeLimitNoticeText: {
    flex: 1,
    fontFamily: FontFamily.sans,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.regular,
    lineHeight: 16,
  },
  previewNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderRadius: Radii.lg,
    padding: Spacing.lg,
  },
  previewNoticeText: {
    flex: 1,
    fontFamily: FontFamily.sans,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.regular,
  },
  startButtonWrapper: {
    overflow: 'hidden',
    borderRadius: Radii.lg,
    marginTop: 'auto',
  },
  startButtonDisabled: {
    opacity: 0.45,
  },
  startButton: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  startButtonText: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.md,
    fontWeight: FontWeight.black,
    color: Colors.neutral.pureWhite,
  },
});
