import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { FontFamily, FontSize, FontWeight, Spacing } from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';

export default function InterviewHeader({ currentQuestion, totalQuestions }: {
  currentQuestion: number;
  totalQuestions: number;
}) {
  const { colors } = useThemeColors();
  const minutes = Math.max(1, Math.round(totalQuestions * 0.4));
  return (
    <View style={styles.container}>
      <Text style={[styles.eyebrow, { color: colors.text.secondary }]}>내 이야기를 들려주는 시간</Text>
      <Text style={[styles.title, { color: colors.text.primary }]}>
        {currentQuestion === 1 ? '트윈에게 내 이야기를' : '조금 더 알아가 볼까요?'}
      </Text>
      {currentQuestion === 1 && <Text style={[styles.description, { color: colors.text.secondary }]}>
        평소 내 모습에 가까운 답이면 충분해요. 짧은 경험과 그때의 생각을 편하게 들려주세요.
      </Text>}
      <View style={styles.progressRow}>
        <Text style={[styles.progressText, { color: colors.text.primary }]}>질문 {currentQuestion} / {totalQuestions}</Text>
        <Text style={[styles.timeText, { color: colors.text.secondary }]}>전체 약 {minutes}~{minutes + 1}분</Text>
      </View>
      <View accessibilityRole="progressbar" accessibilityLabel="저장한 답변" accessibilityValue={{ min: 0, max: totalQuestions, now: currentQuestion - 1 }} style={[styles.track, { backgroundColor: colors.border.primary }]}>
        <View style={[styles.fill, { backgroundColor: colors.brand.accent, width: `${((currentQuestion - 1) / totalQuestions) * 100}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', gap: Spacing.md },
  eyebrow: { fontFamily: FontFamily.sans, fontSize: FontSize.base, fontWeight: FontWeight.medium },
  title: { fontFamily: FontFamily.sans, fontSize: FontSize.xxxl, fontWeight: FontWeight.semibold, lineHeight: 34, letterSpacing: -0.5 },
  description: { fontFamily: FontFamily.sans, fontSize: FontSize.md, lineHeight: 24 },
  progressRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.sm, marginTop: Spacing.sm },
  progressText: { fontFamily: FontFamily.sans, fontSize: FontSize.base, fontWeight: FontWeight.semibold },
  timeText: { fontFamily: FontFamily.sans, fontSize: FontSize.base },
  track: { height: 4, borderRadius: 2, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 2 },
});
