import React, { useRef, useState } from 'react';
import {FontFamily, FontSize, FontWeight, Spacing} from '@/src/constants/theme';

import { View, Text, StyleSheet } from 'react-native';
import { BottomSheet } from '../../../components/common/BottomSheet/BottomSheet';
import { TIME_REFILL_OPTIONS, TimeRefillOptionData } from '../constants/timeRefillOptions';
import { TimeRefillOption } from './TimeRefillOption';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { useTimeStatusQuery } from '../hooks/useTimeStatusQuery';
import { useBuyTimeMutation } from '../hooks/useBuyTimeMutation';
import { formatCallTime } from '@/src/utils/formatCallTime';
import { getErrorDisplayMessage } from '@/src/utils/apiErrorCode';
import { useToast } from '@/src/components/common/Toast/ToastProvider';

interface TimeRefillBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TimeRefillBottomSheet = ({ isOpen, onClose }: TimeRefillBottomSheetProps) => {
  const { colors } = useThemeColors();
  const { data, isLoading, isError, refetch } = useTimeStatusQuery();
  const remainingTimeText = isLoading ? '조회 중...' : isError ? '조회 실패' : formatCallTime(data?.remainingTalkTime ?? 0);
  const buyTimeMutation = useBuyTimeMutation();
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const purchaseInFlightRef = useRef(false);
  const { showToast } = useToast();

  const handleSelectOption = async (option: TimeRefillOptionData) => {
    // purchasingId/isPending은 리렌더 이후에나 반영되므로, 연속 탭에 의한 중복 결제를 막으려면 동기 락이 필요하다.
    if (purchaseInFlightRef.current) return;
    purchaseInFlightRef.current = true;
    setPurchasingId(option.id);
    try {
      await buyTimeMutation.mutateAsync(option.seconds);
      onClose();
    } catch (error) {
      showToast(getErrorDisplayMessage(error, '시간 충전에 실패했습니다. 잠시 후 다시 시도해주세요.'), 'error');
    } finally {
      purchaseInFlightRef.current = false;
      setPurchasingId(null);
    }
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} height={580}>
      <View style={styles.container}>
        
        {/* Handle mark indicator (optional extra styling, the main one is in BottomSheet) */}
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text.primary }]}>대화 시간 채우기</Text>
          {isError ? (
            <Text
              style={[styles.subtitle, styles.subtitleError, { color: colors.state.danger }]}
              onPress={() => refetch()}
              accessibilityRole="button"
              accessibilityLabel="남은 시간 다시 조회"
            >
              현재 남은 시간: {remainingTimeText} · 재시도
            </Text>
          ) : (
            <Text style={[styles.subtitle, { color: colors.text.secondary }]}>현재 남은 시간: {remainingTimeText}</Text>
          )}
        </View>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {TIME_REFILL_OPTIONS.map((option, index) => (
            <TimeRefillOption
              key={option.id}
              option={option}
              delay={index * 100} // Staggered entrance
              onPress={() => handleSelectOption(option)}
              isLoading={purchasingId === option.id}
              disabled={purchasingId !== null && purchasingId !== option.id}
            />
          ))}
        </View>

        {/* Terms footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.text.muted }]}>
            구매 시 앱스토어 계정으로 결제되며, 충전된 시간의 유효기간 및 환불 정책은{' '}
            <Text style={[styles.linkText, { color: colors.text.secondary }]} onPress={() => console.log('약관 클릭')}>
              이용 약관
            </Text>
            을 확인해 주세요.
          </Text>
        </View>
        
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.sm,
  },
  header: {
    marginBottom: Spacing.xl,
  },
  title: {
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.medium,
    fontSize: FontSize.xl,
    lineHeight: 28,
    letterSpacing: -0.44,
  },
  subtitle: {
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.regular,
    fontSize: FontSize.sm,
    lineHeight: 16,
    marginTop: Spacing.xs,
  },
  subtitleError: {
    textDecorationLine: 'underline',
  },
  optionsContainer: {
    flex: 1,
  },
  footer: {
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xxxl, // extra padding for safe area
  },
  footerText: {
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.regular,
    fontSize: FontSize.sm,
    lineHeight: 20,
    textAlign: 'center',
  },
  linkText: {
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.medium,
    fontSize: FontSize.sm, // match text size but underlined
    lineHeight: 24,
    letterSpacing: -0.31,
    textDecorationLine: 'underline',
  },
});
