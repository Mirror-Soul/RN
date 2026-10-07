import React, { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomSheet } from '@/src/components/common/BottomSheet/BottomSheet';
import { BrowseText as Text } from '@/src/components/home/common/BrowseText';
import { BrowseIcon } from '@/src/components/home/common/BrowseIcon';
import { MatchActionButton } from '@/src/features/match/components/MatchActionButton';
import { useMatchingDesign } from '@/src/features/match/components/MatchingDesign';
import { TIME_REFILL_OPTIONS } from '../constants/timeRefillOptions';
import { TimeRefillOption } from './TimeRefillOption';
import { TimeRefillTerms } from './TimeRefillTerms';
import { useTimeStatusQuery } from '../hooks/useTimeStatusQuery';
import { useBuyTimeMutation } from '../hooks/useBuyTimeMutation';
import { formatCallTime } from '@/src/utils/formatCallTime';
import { getErrorDisplayMessage } from '@/src/utils/apiErrorCode';
import { useToast } from '@/src/components/common/Toast/ToastProvider';

export function TimeRefillBottomSheet({ isOpen, onClose, embedded = false }: {
  isOpen: boolean;
  onClose: () => void;
  embedded?: boolean;
}) {
  const { colors, palette } = useMatchingDesign();
  const insets = useSafeAreaInsets();
  const { height, fontScale } = useWindowDimensions();
  const { data, isLoading, isError, refetch } = useTimeStatusQuery(isOpen);
  const remainingTimeText = isError ? '다시 확인' : isLoading || !data ? '확인 중…' : formatCallTime(data.remainingTalkTime);
  const buyTimeMutation = useBuyTimeMutation();
  const { showToast } = useToast();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [purchasing, setPurchasing] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const purchaseInFlightRef = useRef(false);
  const mounted = useRef(true);
  const presentation = useRef(0);
  const openRef = useRef(isOpen);
  openRef.current = isOpen;
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);
  useEffect(() => {
    presentation.current += 1;
    if (isOpen) {
      setShowTerms(false);
      if (!purchaseInFlightRef.current) setSelectedId(null);
    }
  }, [isOpen]);

  const selected = TIME_REFILL_OPTIONS.find(option => option.id === selectedId);
  const handleConfirm = async () => {
    // A radio tap only selects. Guard the actual non-idempotent POST synchronously.
    if (!selected || !openRef.current || purchaseInFlightRef.current) return;
    purchaseInFlightRef.current = true;
    const currentPresentation = presentation.current;
    setPurchasing(true);
    try {
      await buyTimeMutation.mutateAsync(selected.seconds);
      // A late result must not dismiss a newly reopened sheet or an unmounted profile.
      if (mounted.current && openRef.current && presentation.current === currentPresentation) {
        showToast(`${selected.addedTime}을 충전했어요. 결제는 발생하지 않았어요.`, 'success');
        onClose();
      }
    } catch (error) {
      if (mounted.current && openRef.current && presentation.current === currentPresentation) {
        showToast(getErrorDisplayMessage(error, '시간 충전에 실패했어요. 남은 시간을 확인한 뒤 다시 시도해주세요.'), 'error');
        void refetch();
      }
    } finally {
      purchaseInFlightRef.current = false;
      if (mounted.current) setPurchasing(false);
    }
  };

  const availableHeight = Math.max(1, height - insets.top - 12);
  const inlineFooter = availableHeight < 400 || fontScale > 1.6;
  const horizontalInsets = { paddingLeft: 20 + insets.left, paddingRight: 20 + insets.right };
  const footer = <View testID="refill-confirmation" style={[styles.footer, !inlineFooter && horizontalInsets, { borderTopColor: colors.border.primary, paddingBottom: Math.max(insets.bottom, 12) }]}>
    <MatchActionButton primary label={selected ? `${selected.addedTime} 테스트 충전하기` : '시간을 선택해주세요'}
      onPress={handleConfirm} busy={purchasing} disabled={!selected} icon={color => <BrowseIcon name="plus-circle" color={color} />} />
    <Text style={[styles.footerNote, { color: colors.text.secondary }]}>돈이 청구되지 않아요</Text>
  </View>;

  return <BottomSheet isOpen={isOpen} onClose={onClose} embedded={embedded} dragFromHandleOnly height={Math.min(720, availableHeight)}>
    <ScrollView key={showTerms ? 'terms' : 'options'} style={styles.scroll}
      contentContainerStyle={[styles.content, horizontalInsets, { paddingBottom: showTerms ? Math.max(insets.bottom, 20) : 16 }]}>
      <View style={styles.header}>
        <Text variant="heading" accessibilityRole="header" style={[styles.title, { color: colors.text.primary }]}>
          {showTerms ? '충전 이용약관' : '대화 시간 채우기'}
        </Text>
        <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="충전 창 닫기" style={styles.close}>
          <BrowseIcon name="x" size={22} color={colors.text.secondary} />
        </Pressable>
      </View>
      {showTerms ? <>
        <Pressable accessibilityRole="button" accessibilityLabel="충전으로 돌아가기" onPress={() => setShowTerms(false)} style={styles.back}>
          <BrowseIcon name="caret-left" color={palette.cyanInk} />
          <Text style={[styles.backLabel, { color: palette.cyanInk }]}>충전으로 돌아가기</Text>
        </Pressable>
        <TimeRefillTerms />
      </> : <>
        <Pressable disabled={!isError} onPress={() => { void refetch(); }} accessibilityRole={isError ? 'button' : undefined}
          accessibilityLabel={isError ? '남은 시간 다시 조회' : `남은 시간 ${remainingTimeText}`} style={styles.balance}>
          <BrowseIcon name={isError ? 'arrows-clockwise' : 'clock'} color={palette.cyanInk} />
          <Text style={[styles.balanceLabel, { color: colors.text.secondary }]}>남은 시간</Text>
          <Text style={[styles.balanceValue, { color: isError ? colors.state.danger : palette.cyanInk }]}>{remainingTimeText}</Text>
        </Pressable>
        <View style={[styles.notice, { backgroundColor: palette.coolTint }]}>
          <BrowseIcon name="info" color={palette.cyanInk} />
          <Text style={[styles.noticeText, { color: colors.text.primary }]}>현재는 결제 없이 시간을 채우는 테스트 기능이에요. 표시 가격은 예시입니다.</Text>
        </View>
        <View accessibilityRole="radiogroup" style={styles.options}>
          {TIME_REFILL_OPTIONS.map(option => <TimeRefillOption key={option.id} option={option} selected={option.id === selectedId}
            disabled={purchasing} onPress={() => setSelectedId(option.id)} />)}
        </View>
        <Text style={[styles.comparisonNote, { color: colors.text.muted }]}>취소선은 같은 시간을 30분 예시 상품으로 채웠을 때의 비교 가격이에요. 과거 판매가가 아니며, 절약률은 반올림한 값입니다.</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="충전 이용약관 보기" onPress={() => setShowTerms(true)} style={[styles.termsLink, { borderColor: colors.border.primary }]}>
          <BrowseIcon name="file-text" color={palette.accentInk} />
          <Text style={[styles.termsLabel, { color: colors.text.secondary }]}>충전 이용약관 · 검토용 초안</Text>
          <BrowseIcon name="caret-right" size={18} color={colors.text.muted} />
        </Pressable>
        {inlineFooter && footer}
      </>}
    </ScrollView>
    {!showTerms && !inlineFooter && footer}
  </BottomSheet>;
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingTop: 0, gap: 12 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  title: { flex: 1, minWidth: 0, fontSize: 22, lineHeight: 30, fontWeight: '600' },
  close: { minWidth: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  balance: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8, minHeight: 36 },
  balanceLabel: { fontSize: 13, lineHeight: 20 },
  balanceValue: { fontSize: 15, lineHeight: 22, fontWeight: '600', fontVariant: ['tabular-nums'] },
  notice: { padding: 12, borderRadius: 14, flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  noticeText: { flex: 1, minWidth: 0, fontSize: 13, lineHeight: 20 },
  options: { gap: 10 },
  comparisonNote: { fontSize: 12, lineHeight: 19 },
  termsLink: { minHeight: 48, borderWidth: 1, borderRadius: 14, flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12 },
  termsLabel: { flex: 1, minWidth: 0, fontSize: 13, lineHeight: 20 },
  footer: { paddingTop: 12, gap: 6, borderTopWidth: StyleSheet.hairlineWidth },
  footerNote: { fontSize: 12, lineHeight: 18, textAlign: 'center' },
  back: { flexDirection: 'row', alignItems: 'center', minHeight: 48, gap: 6 },
  backLabel: { flex: 1, fontSize: 14, lineHeight: 22 },
});
