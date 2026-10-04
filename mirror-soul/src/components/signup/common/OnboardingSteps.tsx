import { Feather } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Keyboard, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';

const STEPS = ['계정 생성', '기본 프로필', '성격 유형', '음성 인터뷰', '얼굴 스캔'];

export default function OnboardingSteps({ currentStep = 1 }: { currentStep?: number }) {
  const { colors } = useThemeColors();
  const step = Number.isFinite(currentStep) ? Math.max(1, Math.min(STEPS.length, Math.floor(currentStep))) : 1;
  const [expanded, setExpanded] = useState(false);
  useEffect(() => { setExpanded(false); }, [step]);
  useEffect(() => {
    const subscription = Keyboard.addListener('keyboardDidShow', () => setExpanded(false));
    return () => subscription.remove();
  }, []);
  return <View style={styles.container}>
    <View style={styles.heading}>
      <View style={styles.current}>
        <Text style={[styles.counter, { color: colors.brand.accent }]}>{step} / {STEPS.length}</Text>
        <Text style={[styles.title, { color: colors.text.primary }]}>{STEPS[step - 1]}</Text>
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel="가입 순서" accessibilityState={{ expanded }} onPress={() => { Keyboard.dismiss(); setExpanded(value => !value); }} style={styles.toggle}>
        <Text style={[styles.copy, { color: colors.text.secondary }]}>가입 순서</Text>
        <Feather name={expanded ? 'chevron-up' : 'chevron-down'} size={16} color={colors.text.secondary} />
      </Pressable>
    </View>
    <View accessible accessibilityRole="progressbar" accessibilityLabel="회원가입 진행" accessibilityValue={{ min: 0, max: STEPS.length, now: step - 1, text: `${STEPS.length}단계 중 ${step}단계 진행 중, ${step - 1}단계 완료` }} style={styles.track}>
      {STEPS.map((label, index) => <View key={label} style={[styles.segment, {
        backgroundColor: index < step - 1 ? colors.brand.accent : colors.border.primary,
        borderColor: index === step - 1 ? colors.brand.accent : 'transparent',
      }]}>{index === step - 1 && <View style={[styles.dot, { backgroundColor: colors.brand.accent }]} />}</View>)}
    </View>
    {expanded ? <ScrollView style={styles.details} nestedScrollEnabled showsVerticalScrollIndicator={false}>
      {STEPS.map((label, index) => <View key={label} style={styles.detailRow}>
        <Text style={[styles.copy, { color: index === step - 1 ? colors.text.primary : colors.text.secondary, flex: 1 }]}>{index + 1}. {label}</Text>
        <Text style={[styles.copy, { color: index <= step - 1 ? colors.brand.accent : colors.text.muted }]}>{index < step - 1 ? '완료' : index === step - 1 ? '진행 중' : '예정'}</Text>
      </View>)}
    </ScrollView> : <Text style={[styles.next, { color: colors.text.secondary }]}>{step < STEPS.length ? `다음 단계 · ${STEPS[step]}` : '가입의 마지막 단계예요'}</Text>}
  </View>;
}

const styles = StyleSheet.create({
  container: { width: '100%', gap: Spacing.sm },
  heading: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', columnGap: Spacing.md },
  current: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: Spacing.sm },
  counter: { fontFamily: FontFamily.sans, fontSize: FontSize.base, fontWeight: FontWeight.semibold, lineHeight: 22 },
  title: { fontFamily: FontFamily.sans, fontSize: FontSize.base, fontWeight: FontWeight.semibold, lineHeight: 22 },
  toggle: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  copy: { fontFamily: FontFamily.sans, fontSize: FontSize.base, lineHeight: 22 },
  track: { flexDirection: 'row', gap: Spacing.xs },
  segment: { flex: 1, height: 6, borderRadius: Radii.full, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  dot: { width: 3, height: 3, borderRadius: Radii.full },
  next: { fontFamily: FontFamily.sans, fontSize: FontSize.sm, lineHeight: 18 },
  details: { maxHeight: 160 },
  detailRow: { flexDirection: 'row', gap: Spacing.sm, paddingVertical: Spacing.xs },
});
