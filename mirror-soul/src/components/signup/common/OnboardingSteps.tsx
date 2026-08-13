import { Colors, FontFamily, FontSize, FontWeight, Spacing } from '@/src/constants/theme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useThemeColors } from '@/src/hooks/useThemeColors';

const STEPS = [
  { id: 1, label: '계정 설정' },
  { id: 2, label: '프로필 설정' },
  { id: 3, label: '자기 소개' },
  { id: 4, label: '인터뷰' },
  { id: 5, label: '얼굴 인식' },
];

interface OnboardingStepsProps {
  currentStep?: number;
}

/**
 * 회원가입 상단 스텝 진행도 인디케이터
 * 세그먼트형 프로그레스 바 + 현재 단계 텍스트로 구성된 미니멀 버전.
 */
export default function OnboardingSteps({ currentStep = 1 }: OnboardingStepsProps) {
  const { colors } = useThemeColors();
  const currentLabel = STEPS.find((step) => step.id === currentStep)?.label ?? '';

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={[styles.counterText, { color: colors.text.muted }]}>{currentStep} / {STEPS.length}</Text>
        <Text style={styles.currentLabelText}>{currentLabel}</Text>
      </View>
      <View style={styles.track}>
        {STEPS.map((step) => (
          <View
            key={step.id}
            style={[styles.segment, { backgroundColor: colors.border.primary }, step.id <= currentStep && styles.segmentFilled]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: Spacing.sm,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  counterText: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.regular,
    letterSpacing: 0.2,
  },
  currentLabelText: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.primary.electricCyan,
  },
  track: {
    flexDirection: 'row',
    gap: 4,
  },
  segment: {
    flex: 1,
    height: 3,
    borderRadius: 2,
  },
  segmentFilled: {
    backgroundColor: Colors.primary.electricCyan,
  },
});
