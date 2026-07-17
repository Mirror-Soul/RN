import React from 'react';
import { FontFamily } from '@/src/constants/theme';

import { View, Text, StyleSheet } from 'react-native';
import { BottomSheet } from '../../../components/common/BottomSheet/BottomSheet';
import { TIME_REFILL_OPTIONS } from '../constants/timeRefillOptions';
import { TimeRefillOption } from './TimeRefillOption';
import { useThemeColors } from '@/src/hooks/useThemeColors';

interface TimeRefillBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TimeRefillBottomSheet = ({ isOpen, onClose }: TimeRefillBottomSheetProps) => {
  const { colors } = useThemeColors();

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} height={580}>
      <View style={styles.container}>
        
        {/* Handle mark indicator (optional extra styling, the main one is in BottomSheet) */}
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text.primary }]}>대화 시간 채우기</Text>
          <Text style={[styles.subtitle, { color: colors.text.secondary }]}>현재 남은 시간: 02:30:00</Text>
        </View>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {TIME_REFILL_OPTIONS.map((option, index) => (
            <TimeRefillOption 
              key={option.id} 
              option={option} 
              delay={index * 100} // Staggered entrance
              onPress={() => {
                // handle purchase logic
                console.log('Selected:', option.id);
              }}
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
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontFamily: FontFamily.sans,
    fontWeight: '500',
    fontSize: 18,
    lineHeight: 28,
    letterSpacing: -0.44,
  },
  subtitle: {
    fontFamily: FontFamily.sans,
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
    marginTop: 4,
  },
  optionsContainer: {
    flex: 1,
  },
  footer: {
    paddingTop: 24,
    paddingBottom: 32, // extra padding for safe area
  },
  footerText: {
    fontFamily: FontFamily.sans,
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 20,
    textAlign: 'center',
  },
  linkText: {
    fontFamily: FontFamily.sans,
    fontWeight: '500',
    fontSize: 12, // match text size but underlined
    lineHeight: 24,
    letterSpacing: -0.31,
    textDecorationLine: 'underline',
  },
});
