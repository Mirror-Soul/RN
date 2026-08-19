import { Feather, Ionicons } from '@expo/vector-icons';
import { Colors, FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { ExpressionId, ExpressionPrompt } from './types/faceData';

const EXPRESSION_ICON: Record<ExpressionId, { render: (color: string) => React.ReactNode }> = {
  neutral: { render: (c) => <Feather name="meh" size={28} color={c} /> },
  smile: { render: (c) => <Feather name="smile" size={28} color={c} /> },
  surprised: { render: (c) => <Ionicons name="sparkles-outline" size={28} color={c} /> },
  sad: { render: (c) => <Feather name="frown" size={28} color={c} /> },
  angry: { render: (c) => <Ionicons name="flame-outline" size={28} color={c} /> },
};

interface FaceDataPromptCardProps {
  prompt: ExpressionPrompt;
  stepIndex: number;
  totalSteps: number;
  isRecording: boolean;
  isFaceDetected: boolean;
  isSmiling: boolean;
  onConfirm: () => void;
}

/**
 * FaceDataPromptCard 컴포넌트 (SRP)
 * 현재 표정 프롬프트 안내 + 진행 방식(auto-smile 감지 상태 or manual 확인 버튼)을 함께 보여준다.
 * VoiceUpdatePrompt와 동일한 언어(eyebrow + 그라디언트 카드)를 얼굴 데이터 캡처용으로 적용했다.
 */
export default function FaceDataPromptCard({
  prompt,
  stepIndex,
  totalSteps,
  isRecording,
  isFaceDetected,
  isSmiling,
  onConfirm,
}: FaceDataPromptCardProps) {
  const { colors } = useThemeColors();

  const subTitle = !isRecording
    ? '촬영을 시작하면 순서대로 안내해 드려요'
    : !isFaceDetected
      ? '얼굴을 화면 중앙에 맞춰주세요'
      : prompt.mode === 'auto-smile'
        ? isSmiling
          ? '좋아요! 그대로 유지해 주세요'
          : '미소가 감지되면 자동으로 다음으로 넘어가요'
        : '표정을 지은 뒤 아래 버튼을 눌러주세요';

  return (
    <View style={styles.container}>
      <View style={styles.head}>
        <Text style={styles.eyebrow}>단계 {stepIndex + 1} / {totalSteps}</Text>
        <Text style={[styles.title, { color: colors.text.primary }]}>{prompt.guideMessage}</Text>
        <Text style={[styles.subTitle, { color: colors.text.secondary }]}>{subTitle}</Text>
      </View>

      <LinearGradient
        colors={[Colors.glass.cyan10_d3, Colors.glass.blue20]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.badge, isRecording && prompt.mode === 'auto-smile' && isSmiling && styles.badgeActive]}
      >
        {EXPRESSION_ICON[prompt.id].render(Colors.primary.electricCyan)}
      </LinearGradient>

      {isRecording && prompt.mode === 'manual' && (
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onConfirm}
          disabled={!isFaceDetected}
          style={[styles.confirmButton, !isFaceDetected && styles.confirmButtonDisabled]}
          accessibilityRole="button"
          accessibilityLabel="표정 캡처 완료"
        >
          <Feather name="check-circle" size={16} color={Colors.primary.soulBlack} />
          <Text style={styles.confirmButtonText}>표정 캡처 완료</Text>
        </TouchableOpacity>
      )}

      <View style={styles.stepDots}>
        {Array.from({ length: totalSteps }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              { backgroundColor: colors.background.glass, borderColor: colors.border.primary },
              index < stepIndex && styles.dotDone,
              index === stepIndex && isRecording && styles.dotActive,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
    alignItems: 'center',
    gap: Spacing.xl,
  },
  head: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  eyebrow: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.black,
    letterSpacing: 1.5,
    color: Colors.primary.electricCyan,
  },
  title: {
    textAlign: 'center',
    fontFamily: FontFamily.sans,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.medium,
    lineHeight: 28,
    letterSpacing: -0.439,
  },
  subTitle: {
    textAlign: 'center',
    fontFamily: FontFamily.sans,
    fontSize: FontSize.base,
    fontWeight: FontWeight.regular,
    lineHeight: 20,
    letterSpacing: -0.15,
  },
  badge: {
    width: 72,
    height: 72,
    borderRadius: Radii.xxl,
    borderWidth: 0.612,
    borderColor: Colors.glass.cyan20_d3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeActive: {
    borderColor: Colors.primary.electricCyan,
    borderWidth: 2,
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xxl,
    borderRadius: Radii.full,
    backgroundColor: Colors.primary.electricCyan,
  },
  confirmButtonDisabled: {
    opacity: 0.4,
  },
  confirmButtonText: {
    color: Colors.primary.soulBlack,
    fontFamily: FontFamily.sans,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.black,
  },
  stepDots: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: Radii.full,
    borderWidth: 0.612,
  },
  dotDone: {
    backgroundColor: Colors.primary.electricCyan,
    borderColor: Colors.primary.electricCyan,
  },
  dotActive: {
    backgroundColor: Colors.primary.electricCyan,
    borderColor: Colors.primary.electricCyan,
  },
});
