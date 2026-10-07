import React, { useCallback, useRef, useState } from 'react';
import { BackHandler, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';
import { useLayout } from '@/src/hooks/useLayout';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { useAuthStore } from '@/src/store/useAuthStore';
import { performLogout } from '@/src/services/authService';
import { getErrorDisplayMessage } from '@/src/utils/apiErrorCode';
import LoginHeader from '@/src/components/login/LoginHeader';
import { getOnboardingStage } from '../onboardingResume';
import { AuthActionButton } from './AuthActionButton';

/** Only authenticated server status decides the next stage. No password or draft is retained. */
export default function OnboardingResumeScreen() {
  const { colors } = useThemeColors();
  const { contentContainerStyle, screenPadding } = useLayout();
  const userStatus = useAuthStore(state => state.userStatus);
  const isLoggedIn = useAuthStore(state => state.isLoggedIn);
  const stage = getOnboardingStage(userStatus);
  const lock = useRef(false);
  const [leaving, setLeaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const leave = useCallback(async () => {
    if (lock.current) return;
    lock.current = true;
    setLeaving(true);
    setError(null);
    try { await performLogout(); }
    catch (error) {
      setError(getErrorDisplayMessage(error, '로그인 화면으로 돌아가지 못했어요. 다시 눌러주세요.'));
      lock.current = false;
      setLeaving(false);
    }
  }, []);
  useFocusEffect(useCallback(() => {
    if (!isLoggedIn || !stage) return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => { void leave(); return true; });
    return () => subscription.remove();
  }, [leave, isLoggedIn, stage]));
  if (!isLoggedIn || !stage) return null;
  const completed = stage.step - 1;
  return <ScrollView style={styles.screen} automaticallyAdjustContentInsets={false} contentInsetAdjustmentBehavior="never" showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
    <View style={[contentContainerStyle, styles.content, { paddingHorizontal: screenPadding }]}>
      <LoginHeader compact />
      <View style={styles.intro}>
        <Text accessibilityRole="header" style={[styles.title, { color: colors.text.primary }]}>가입을 이어가볼까요?</Text>
        <Text style={[styles.copy, { color: colors.text.secondary }]}>완료한 단계는 저장되어 있어요. 남은 과정만 이어가세요.</Text>
      </View>
      <View style={[styles.card, { backgroundColor: colors.background.card, borderColor: colors.border.primary }]}>
        <View style={styles.row}>
          <Feather accessible={false} name="check-circle" size={18} color={colors.brand.accent} />
          <Text style={[styles.copy, { color: colors.text.secondary }]}>5단계 중 {completed}단계 완료</Text>
        </View>
        <View accessible accessibilityRole="progressbar" accessibilityLabel="저장된 가입 진행" accessibilityValue={{ min: 0, max: 5, now: completed, text: `${completed}단계 완료, 다음은 ${stage.title}` }} style={styles.progress}>
          {Array.from({ length: 5 }, (_, index) => <View key={index} style={[styles.segment, { backgroundColor: index < completed ? colors.brand.accent : colors.border.primary }]} />)}
        </View>
        <View style={styles.intro}>
          <Text style={[styles.caption, { color: colors.text.secondary }]}>다음 단계</Text>
          <Text style={[styles.stageTitle, { color: colors.text.primary }]}>{stage.title}</Text>
          <Text style={[styles.copy, { color: colors.text.secondary }]}>{stage.description}</Text>
        </View>
      </View>
      <Text style={[styles.caption, { color: colors.text.secondary }]}>
        {userStatus === 'ONBOARD_C' ? '음성 인터뷰는 첫 질문부터 다시 진행해요.' : '아직 저장하지 않은 입력이나 촬영은 다시 진행해야 해요.'}
      </Text>
      {error && <Text accessibilityRole="alert" style={[styles.copy, { color: colors.state.danger }]}>{error}</Text>}
      <View style={styles.actions}>
        <AuthActionButton primary title="이어서 가입하기" disabled={leaving} onPress={() => {
          if (lock.current) return;
          lock.current = true;
          useAuthStore.getState().continueOnboarding();
        }} />
        <AuthActionButton title={leaving ? '로그인 화면으로 돌아가는 중…' : '나중에 이어하기'} busy={leaving} onPress={() => void leave()} />
      </View>
    </View>
  </ScrollView>;
}
const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', paddingVertical: Spacing.xxl },
  content: { gap: Spacing.xl },
  intro: { gap: Spacing.sm },
  title: { fontFamily: FontFamily.sans, fontSize: FontSize.xxxl, fontWeight: FontWeight.bold, lineHeight: 33, letterSpacing: -0.5 },
  stageTitle: { fontFamily: FontFamily.sans, fontSize: FontSize.xxl, fontWeight: FontWeight.bold, lineHeight: 28 },
  copy: { flexShrink: 1, fontFamily: FontFamily.sans, fontSize: FontSize.base, lineHeight: 23 },
  caption: { fontFamily: FontFamily.sans, fontSize: FontSize.sm, lineHeight: 20 },
  card: { borderWidth: 1, borderRadius: Radii.xl, padding: Spacing.lg, gap: Spacing.lg },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  progress: { flexDirection: 'row', gap: Spacing.xs },
  segment: { flex: 1, height: 5, borderRadius: Radii.full },
  actions: { gap: Spacing.sm },
});
