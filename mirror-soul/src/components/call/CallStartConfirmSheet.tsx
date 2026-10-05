import { BrowseIcon } from '@/src/components/home/common/BrowseIcon';
import { Feather } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BrowseText as Text } from '@/src/components/home/common/BrowseText';
import { MatchActionButton } from '@/src/features/match/components/MatchActionButton';
import { useMatchingDesign } from '@/src/features/match/components/MatchingDesign';
import { useLayout } from '@/src/hooks/useLayout';
import { BottomSheet } from '@/src/components/common/BottomSheet/BottomSheet';
import { FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';
import { useTimeStatusQuery } from '@/src/features/profile/hooks/useTimeStatusQuery';
import { formatCallTime } from '@/src/utils/formatCallTime';
import { isMockRecommendationUuid } from '@/src/components/home/main/Discovery/mockRecommendations';

/** 통화 시작 확인에 필요한 최소 상대 정보. 발견 추천과 채팅방 상대가 모두 이 형태를 만족한다. */
export interface CallTarget {
  userUuid: string;
  name: string;
}

interface CallStartConfirmSheetProps {
  ownTwin?: boolean;
  embedded?: boolean;
  target: CallTarget | null;
  isOpen: boolean;
  onClose: () => void;
  /** 실제 추천은 통화 API 화면으로, 목업은 서버 연결 없는 UI 미리보기 화면으로 보낸다. */
  onStart: (target: CallTarget, isPreview: boolean, remainingSeconds?: number) => void;
  /** 잔여 시간이 없을 때, 시트를 닫고 시간 충전 흐름으로 전환한다. */
  onRefill: () => void;
}

/**
 * 발견 탭의 통화 시작 전 확인 시트.
 *
 * 실제 추천은 최신 잔여 시간을 다시 조회한 뒤에만 진입을 허용한다. 목업 추천은 의도적으로
 * 어떤 API나 권한도 요청하지 않고, 통화 화면의 UI를 검토하는 미리보기 모드로만 진입한다.
 */
export default function CallStartConfirmSheet({ target, isOpen, onClose, onStart, onRefill, embedded = false, ownTwin = false }: CallStartConfirmSheetProps) {
  const { colors, palette } = useMatchingDesign();
  const insets = useSafeAreaInsets();
  const { height: screenHeight, fontScale } = useWindowDimensions();
  const { contentContainerStyle, cardWidth } = useLayout();
  const [bodyHeight, setBodyHeight] = useState(280);
  const [footerHeight, setFooterHeight] = useState(80);
  const maximumHeight = Math.max(0, screenHeight - insets.top - 12);
  const inlineAction = maximumHeight < 360 || fontScale > 1.8;
  // The common sheet handle takes 36px. Measure actual wrapped text and actions.
  const sheetHeight = Math.min(maximumHeight, bodyHeight + (inlineAction ? 0 : footerHeight) + 36);
  const showHeroIcon = cardWidth >= 320 && fontScale <= 1.3;
  const startInFlightRef = useRef(false);
  const [isStarting, setIsStarting] = useState(false);
  const [hasFreshTimeCheck, setHasFreshTimeCheck] = useState(false);
  const isPreview = !ownTwin && isMockRecommendationUuid(target?.userUuid);
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
    const finishCheck = () => { if (isActive) setHasFreshTimeCheck(true); };
    void refetch().then(finishCheck, finishCheck);
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
    if (!target || startInFlightRef.current) return;
    if (!isPreview && (!hasFreshTimeCheck || isFetching || isError)) return;

    // 0초일 때는 막힌 버튼을 남기지 않는다. 사용자가 다음에 해야 할 행동(충전)을
    // 같은 주 CTA로 제시해, 시간 카드까지 다시 찾아갈 필요가 없게 한다.
    if (!isPreview && !hasRemainingTime) {
      startInFlightRef.current = true;
      setIsStarting(true);
      onRefill();
      return;
    }

    startInFlightRef.current = true;
    setIsStarting(true);
    onStart(target, isPreview, isPreview ? undefined : remainingSeconds);
  };

  if (!target) return null;

  const isCheckingTime = !hasFreshTimeCheck || isFetching;
  const timeLabel = isCheckingTime ? '확인 중...' : isError ? '확인하지 못했어요' : formatCallTime(remainingSeconds);
  const shouldPromptRefill = !isPreview && !isCheckingTime && !isError && !hasRemainingTime;
  const startDisabled = !isPreview && (isCheckingTime || isError);

  const primaryLabel = isPreview ? '통화 화면 미리보기' : shouldPromptRefill ? '대화 시간 충전하기' : ownTwin ? '대화 시작' : '통화 시작';
  const action = <View testID="call-start-actions" onLayout={event => setFooterHeight(event.nativeEvent.layout.height)}
    style={[styles.footer, { paddingBottom: Math.max(insets.bottom, Spacing.md), borderTopColor: colors.border.primary }]}>
    <MatchActionButton label={primaryLabel} onPress={handlePrimaryAction} primary disabled={startDisabled} busy={isStarting} />
  </View>;

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} height={sheetHeight} dragFromHandleOnly embedded={embedded}>
      <View style={[contentContainerStyle, styles.container, {
        paddingLeft: Math.max(insets.left, Spacing.lg), paddingRight: Math.max(insets.right, Spacing.lg),
      }]}>
        <ScrollView testID="call-start-scroll" style={styles.scroll} showsVerticalScrollIndicator={false}
          automaticallyAdjustContentInsets={false} contentInsetAdjustmentBehavior="never"
          onContentSizeChange={(_width, measuredHeight) => setBodyHeight(measuredHeight)}>
          <View style={styles.body}>
            <View style={styles.heroRow}>
              {showHeroIcon && <View style={[styles.avatar, { backgroundColor: palette.coolTint }]}>
                {isPreview ? <Feather name="eye" size={20} color={palette.cyanInk} /> : <BrowseIcon name="phone-call" size={20} color={palette.cyanInk} />}
              </View>}
              <View style={styles.heroCopy}>
                <Text variant="heading" accessibilityRole="header" style={[styles.title, { color: colors.text.primary }]}>
                  {ownTwin ? '내 트윈과 대화할까요?' : isPreview ? `${target.name}님 통화 화면 미리보기` : `${target.name}님의 AI 트윈과 통화할까요?`}
                </Text>
              </View>
              <TouchableOpacity onPress={onClose} accessibilityRole="button" accessibilityLabel="통화 확인 닫기" style={styles.close}>
                <Feather name="x" size={20} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>

            {ownTwin && <Text style={[styles.copy, { color: colors.text.secondary }]}>영상통화로 나를 닮은 얼굴과 목소리, 반응을 만나보세요.</Text>}

            {isPreview ? (
              <View style={[styles.notice, { backgroundColor: palette.tint, borderColor: palette.softBorder }]}>
                <Text style={[styles.copy, { color: colors.text.secondary }]}>실제 통화 연결과 권한 요청 없이 화면만 확인할 수 있어요.</Text>
              </View>
            ) : (
              <View style={[styles.timeCard, { backgroundColor: colors.background.glass, borderColor: colors.border.primary }]}>
                <View style={styles.timeLabelRow}>
                  <BrowseIcon name="clock" size={16} color={palette.cyanInk} />
                  <Text style={[styles.caption, { color: colors.text.secondary }]}>남은 대화 시간</Text>
                </View>
                <View style={styles.timeValueRow}>
                  {isCheckingTime && <ActivityIndicator size="small" color={palette.cyanInk} />}
                  <Text style={[styles.timeValue, { color: isError || shouldPromptRefill ? colors.state.danger : colors.text.primary }]}>{timeLabel}</Text>
                </View>
                {isError ? <TouchableOpacity onPress={() => { void refetch(); }} disabled={isFetching}
                  accessibilityRole="button" accessibilityLabel="남은 대화 시간 다시 확인" style={styles.retry}>
                  <Text style={[styles.copy, { color: palette.accentInk }]}>다시 확인하기</Text>
                </TouchableOpacity> : shouldPromptRefill && <Text style={[styles.copy, { color: colors.text.secondary }]}>대화 시간을 충전하면 통화를 시작할 수 있어요.</Text>}
                <View style={[styles.timeLimitNotice, { borderTopColor: colors.border.primary }]}>
                  <Text style={[styles.copy, { color: colors.text.secondary }]}>연결된 뒤부터 시간이 차감되고, 남은 시간이 0초가 되면 통화가 종료돼요.</Text>
                </View>
              </View>
            )}
          </View>
          {inlineAction && action}
        </ScrollView>
        {!inlineAction && action}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  body: { paddingTop: Spacing.xs, paddingBottom: Spacing.lg, gap: Spacing.md },
  heroRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  avatar: { width: 40, height: 40, borderRadius: Radii.full, alignItems: 'center', justifyContent: 'center', marginTop: Spacing.xs },
  heroCopy: { flex: 1, minWidth: 0, paddingVertical: Spacing.sm },
  title: { fontFamily: FontFamily.sans, fontSize: FontSize.xl, fontWeight: FontWeight.medium, lineHeight: 28 },
  close: { minWidth: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  timeCard: { borderWidth: 1, borderRadius: Radii.lg, padding: Spacing.md, gap: Spacing.sm },
  timeLabelRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  caption: { flex: 1, minWidth: 0, fontSize: FontSize.sm, lineHeight: 20 },
  timeValueRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  timeValue: { flexShrink: 1, fontSize: FontSize.xxl, fontWeight: FontWeight.medium, lineHeight: 30 },
  copy: { fontSize: FontSize.sm, lineHeight: 21 },
  retry: { minHeight: 48, alignSelf: 'flex-start', justifyContent: 'center', paddingHorizontal: Spacing.sm },
  timeLimitNotice: { borderTopWidth: StyleSheet.hairlineWidth, paddingTop: Spacing.sm },
  notice: { borderWidth: 1, borderRadius: Radii.lg, padding: Spacing.md },
  footer: { borderTopWidth: StyleSheet.hairlineWidth, paddingTop: Spacing.md },
});
