import React, { useRef } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import GradientButton from '@/src/components/common/GradientButton';
import AuthInput from '@/src/components/login/parts/AuthInput';
import { Colors, FontFamily } from '@/src/constants/theme';
import { useLoginForm } from '@/src/features/auth/hooks/useLoginForm';
import { useThemeColors } from '@/src/hooks/useThemeColors';

/**
 * LoginTabView 컴포넌트
 * 로그인 탭의 순수 UI 컴포넌트. 로직은 useLoginForm 훅에서 위임받음. (SRP)
 *
 * - 이메일 → 비밀번호 자동 포커스 (forwardRef)
 * - 인라인 에러 메시지 표시 (Alert 미사용)
 * - 비밀번호 returnKeyType='done' → 로그인 실행
 * - 탭 진입 시 FadeIn 애니메이션
 */
export default function LoginTabView() {
  const passwordRef = useRef<TextInput>(null);
  const { state, setEmail, setPassword, handleLogin, handleForgotPassword } = useLoginForm();
  const { colors } = useThemeColors();

  return (
    <Animated.View entering={FadeIn.duration(220)} style={styles.container}>
      {/* 이메일 입력 */}
      <View style={styles.fieldGroup}>
        <AuthInput
          type="email"
          value={state.email}
          onChangeText={setEmail}
          placeholder="이메일"
          hasError={!!state.emailError}
          returnKeyType="next"
          onSubmitEditing={() => passwordRef.current?.focus()}
        />
        {!!state.emailError && (
          <Text style={styles.errorText} accessibilityRole="alert">
            {state.emailError}
          </Text>
        )}
      </View>

      {/* 비밀번호 입력 */}
      <View style={styles.fieldGroup}>
        <AuthInput
          ref={passwordRef}
          type="password"
          value={state.password}
          onChangeText={setPassword}
          placeholder="비밀번호"
          hasError={!!state.passwordError}
          returnKeyType="done"
          onSubmitEditing={handleLogin}
        />
        {!!state.passwordError && (
          <Text style={styles.errorText} accessibilityRole="alert">
            {state.passwordError}
          </Text>
        )}
      </View>

      {/* 서버 / 일반 에러 메시지 */}
      {!!state.generalError && (
        <View style={styles.generalErrorBox}>
          <Text style={styles.generalErrorText} accessibilityRole="alert">
            {state.generalError}
          </Text>
        </View>
      )}

      {/* 로그인 버튼 */}
      <GradientButton
        title="로그인"
        onPress={handleLogin}
        disabled={state.isSubmitting}
        isLoading={state.isSubmitting}
        variant="full"
        style={styles.loginButton}
      />

      {/* 비밀번호 찾기 */}
      <TouchableOpacity
        style={styles.forgotButton}
        onPress={handleForgotPassword}
        accessibilityRole="button"
        accessibilityLabel="비밀번호 찾기"
      >
        <Text style={[styles.forgotText, { color: colors.text.secondary }]}>비밀번호를 잊으셨나요?</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 12,
  },
  fieldGroup: {
    width: '100%',
    gap: 6,
  },
  errorText: {
    fontFamily: FontFamily.sans,
    fontSize: 12,
    fontWeight: '400',
    color: Colors.primary.activeRedText,
    paddingLeft: 4,
  },
  generalErrorBox: {
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: 'rgba(251, 44, 54, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(251, 44, 54, 0.20)',
  },
  generalErrorText: {
    fontFamily: FontFamily.sans,
    fontSize: 13,
    fontWeight: '400',
    color: Colors.primary.activeRedText,
    textAlign: 'center',
    lineHeight: 18,
  },
  loginButton: {
    marginTop: 4,
  },
  forgotButton: {
    marginTop: 8,
    alignSelf: 'center',
    paddingVertical: 4,
  },
  forgotText: {
    fontFamily: FontFamily.sans,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    letterSpacing: -0.15,
    textAlign: 'center',
  },
});
