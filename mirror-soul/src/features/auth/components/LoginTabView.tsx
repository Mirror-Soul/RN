import React, { useRef } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';
import AuthInput from '@/src/components/login/parts/AuthInput';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { useLoginForm } from '@/src/features/auth/hooks/useLoginForm';
import { AuthActionButton } from './AuthActionButton';

export default function LoginTabView({ initialEmail = '', notice, hasInterruptedSignup = false, onSignup }: {
  initialEmail?: string; notice?: string; hasInterruptedSignup?: boolean; onSignup: (email: string) => void;
}) {
  const passwordRef = useRef<TextInput>(null);
  const { state, setEmail, setPassword, handleLogin, handleForgotPassword } = useLoginForm(initialEmail);
  const { colors } = useThemeColors();
  const contextualNotice = state.email.trim() === initialEmail ? notice : undefined;
  const noticeTitle = contextualNotice === 'password-reset' ? '비밀번호를 바꿨어요' : contextualNotice === 'existing-account' ? '이 이메일로 만든 계정이 있어요' : hasInterruptedSignup ? '가입을 이어갈 수 있어요' : null;
  const noticeCopy = contextualNotice === 'password-reset' ? '새 비밀번호로 로그인해주세요.' : '로그인하면 가입 상태를 확인하고, 남은 단계부터 이어갈 수 있어요.';
  return <View style={styles.container}>
    {noticeTitle && <View accessibilityLiveRegion="polite" style={[styles.notice, { backgroundColor: colors.background.glass, borderColor: colors.border.primary }]}>
      <Text style={[styles.noticeTitle, { color: colors.text.primary }]}>{noticeTitle}</Text>
      <Text style={[styles.copy, { color: colors.text.secondary }]}>{noticeCopy}</Text>
    </View>}
    <View style={[styles.fields, { backgroundColor: colors.background.card, borderColor: colors.border.primary }]}>
      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.text.secondary }]}>이메일</Text>
        <AuthInput appearance="plain" type="email" value={state.email} onChangeText={setEmail} placeholder="name@example.com" hasError={!!state.emailError} editable={!state.isSubmitting} returnKeyType="next" onSubmitEditing={() => passwordRef.current?.focus()} />
        {!!state.emailError && <Text accessibilityRole="alert" style={[styles.copy, { color: colors.state.danger }]}>{state.emailError}</Text>}
      </View>
      <View style={[styles.divider, { backgroundColor: colors.border.primary }]} />
      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.text.secondary }]}>비밀번호</Text>
        <AuthInput appearance="plain" ref={passwordRef} type="password" value={state.password} onChangeText={setPassword} placeholder="비밀번호를 입력해주세요" hasError={!!state.passwordError} editable={!state.isSubmitting} returnKeyType="done" onSubmitEditing={() => void handleLogin()} />
        {!!state.passwordError && <Text accessibilityRole="alert" style={[styles.copy, { color: colors.state.danger }]}>{state.passwordError}</Text>}
      </View>
    </View>
    <Pressable accessibilityRole="button" accessibilityLabel="비밀번호 찾기" accessibilityState={{ disabled: state.isSubmitting }} disabled={state.isSubmitting} onPress={handleForgotPassword} style={styles.recovery}>
      <Text style={[styles.recoveryText, { color: colors.text.secondary }]}>비밀번호 찾기</Text>
    </Pressable>
    {!!state.generalError && <View accessibilityRole="alert" accessibilityLiveRegion="polite" style={[styles.notice, { borderColor: colors.state.danger, backgroundColor: colors.background.card }]}>
      <Text style={[styles.copy, { color: colors.state.danger }]}>{state.generalError}</Text>
    </View>}
    <AuthActionButton primary title={state.isSubmitting ? '로그인하고 있어요…' : '로그인'} onPress={() => void handleLogin()} busy={state.isSubmitting} />
    <View style={styles.join}>
      <Text style={[styles.copy, { color: colors.text.secondary }]}>처음 오셨나요?</Text>
      <Pressable accessibilityRole="button" accessibilityLabel="회원가입 시작하기" accessibilityState={{ disabled: state.isSubmitting }}
        disabled={state.isSubmitting} onPress={() => onSignup(state.email.trim())} style={({ pressed }) => [styles.joinAction, (pressed || state.isSubmitting) && { opacity: 0.6 }]}>
        <Text style={[styles.joinText, { color: colors.text.primary }]}>회원가입</Text>
        <Feather accessible={false} name="arrow-up-right" size={15} color={colors.text.primary} />
      </Pressable>
    </View>
    {!noticeTitle && <Text style={[styles.hint, { color: colors.text.secondary }]}>
      가입을 중단했어도,{'\n'}같은 이메일로 로그인하면 이어갈 수 있어요.
    </Text>}
  </View>;
}
const styles = StyleSheet.create({
  container: { gap: Spacing.md },
  fields: { borderWidth: 1, borderRadius: Radii.xl },
  field: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm, paddingBottom: Spacing.sm, gap: Spacing.xs },
  divider: { height: StyleSheet.hairlineWidth, marginHorizontal: Spacing.lg },
  label: { fontFamily: FontFamily.sans, fontSize: FontSize.base, fontWeight: FontWeight.medium, lineHeight: 22 },
  copy: { fontFamily: FontFamily.sans, fontSize: FontSize.base, lineHeight: 22 },
  notice: { borderWidth: 1, borderRadius: Radii.md, padding: Spacing.md, gap: Spacing.xs },
  noticeTitle: { fontFamily: FontFamily.sans, fontSize: FontSize.base, fontWeight: FontWeight.semibold, lineHeight: 22 },
  recovery: { alignSelf: 'flex-end', minHeight: 48, justifyContent: 'center', paddingHorizontal: Spacing.sm },
  recoveryText: { fontFamily: FontFamily.sans, fontSize: FontSize.base, fontWeight: FontWeight.medium, lineHeight: 22 },
  join: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: Spacing.xs },
  joinAction: { minHeight: 48, paddingHorizontal: Spacing.sm, flexDirection: 'row', flexShrink: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.xs },
  joinText: { flexShrink: 1, fontFamily: FontFamily.sans, fontSize: FontSize.base, fontWeight: FontWeight.semibold, lineHeight: 22 },
  hint: { fontFamily: FontFamily.sans, fontSize: FontSize.sm, lineHeight: 20, textAlign: 'center' },
});
