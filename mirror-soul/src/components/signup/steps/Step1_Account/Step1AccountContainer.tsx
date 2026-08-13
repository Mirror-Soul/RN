import SecurityFooter from '@/src/components/home/SecurityFooter';
import GradientButton from '@/src/components/common/GradientButton';
import { SIGNUP_ROUTES } from '@/src/constants/routes/signupRoutes';
import {Colors, FontFamily, FontSize, FontWeight, Spacing} from '@/src/constants/theme';
import { getErrorDisplayMessage, isConflictError } from '@/src/utils/apiErrorCode';

import { useRouter } from 'expo-router';
import React from 'react';
import { useLayout } from '@/src/hooks/useLayout';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

// Step 1 Specific Parts
import AgeVerificationSection from './components/AgeVerificationSection';
import AgreementSection from './components/AgreementSection';
import EmailSection from './components/EmailSection';
import IdentityVerificationSection from './components/IdentityVerificationSection';
import PasswordSection from './components/PasswordSection';
import Step1Header from './components/Step1Header';
import { useStep1Form } from './hooks/useStep1Form';
import { useCreateAccountMutation } from './hooks/useCreateAccountMutation';

/**
 * Step1AccountContainer 컴포넌트
 * 회원가입 1단계의 모든 요소를 조립합니다. (SRP 오케스트레이터)
 */
export default function Step1AccountContainer() {
  const router = useRouter();
  const { contentContainerStyle, screenPadding } = useLayout();
  const { colors } = useThemeColors();

  const {
    state,
    updateState,
    isModalVisible,
    setIsModalVisible,
    handleSendEmailCode,
    handleVerifyEmail,
    handlePassVerification,
    isFormValid,
    timeLeft,
    isTimerActive,
    formattedTime,
    handleResendCode,
    isEmailActionLoading,
  } = useStep1Form();

  const createAccountMutation = useCreateAccountMutation();

  // 로딩 오버레이 애니메이션
  const overlayOpacity = useSharedValue(0);
  const overlayAnimatedStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const handleContinue = async () => {
    if (!isFormValid || state.isLoading) return;

    try {
      updateState({ isLoading: true });
      overlayOpacity.value = withTiming(1, { duration: 200 });

      // AuthStore 저장(로그인 상태 전환)은 useCreateAccountMutation.onSuccess가 처리
      await createAccountMutation.mutateAsync({
        email: state.email,
        password: state.password,
        gender: null,     // PASS 인증 미구현 → null
        birthDate: null,  // PASS 인증 미구현 → null
        // 백엔드는 단일 termsAgreed 필드만 받으므로, FE에서 분리한 이용약관/개인정보처리방침
        // 두 체크박스를 여기서 합산해서 보낸다 (isFormValid가 이미 둘 다 필수로 강제).
        termsAgreed: state.agreedToTerms && state.agreedToPrivacy,
      });

      // 성공: Step2로 이동
      router.push(SIGNUP_ROUTES.PROFILE);
    } catch (error) {
      if (isConflictError(error)) {
        // 이메일 인증 이후 최종 제출 사이에 같은 이메일로 가입이 완료된 드문 레이스 케이스 — 최후 방어선
        // isEmailVerified도 함께 해제해야 에러 문구가 보이고 이메일 입력창이 다시 편집 가능해진다 (EmailSection 조건 참고)
        updateState({
          emailError: getErrorDisplayMessage(error, '이미 가입된 이메일입니다.'),
          isEmailVerified: false,
        });
      } else {
        Alert.alert(
          '계정 생성 실패',
          getErrorDisplayMessage(error, '잠시 후 다시 시도해주세요.')
        );
      }
    } finally {
      overlayOpacity.value = withTiming(0, { duration: 200 });
      updateState({ isLoading: false });
    }
  };

  return (
    <>
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.container, { paddingHorizontal: screenPadding }]}>
        {/* Progress Steps (상위 레이아웃에서 렌더링하므로 여기서는 삭제) */}

        {/* Header Section */}
        <Animated.View entering={FadeInDown.delay(0).duration(400).springify()} style={styles.headerWrapper}>
          <Step1Header />
        </Animated.View>

        {/* Form Body */}
        <Animated.View entering={FadeInDown.delay(100).duration(400).springify()} style={styles.formContainer}>
          {/* Email Section */}
          <EmailSection
            state={state}
            onChange={updateState}
            isModalVisible={isModalVisible}
            setIsModalVisible={setIsModalVisible}
            onSendCode={handleSendEmailCode}
            onVerify={handleVerifyEmail}
            timeLeft={timeLeft}
            isTimerActive={isTimerActive}
            formattedTime={formattedTime}
            onResendCode={handleResendCode}
            isLoading={isEmailActionLoading}
          />

          {/* Password Section */}
          <PasswordSection
            state={state}
            onChange={updateState}
          />

          {/* Identity Verification Section */}
          <IdentityVerificationSection
            state={state}
            onVerify={handlePassVerification}
          />

          {/* Age Verification Section */}
          <AgeVerificationSection
            state={state}
            onChange={updateState}
          />

          {/* Agreement Section */}
          <AgreementSection
            state={state}
            onChange={updateState}
          />

          {/* Continue Button */}
          <View style={styles.buttonWrapper}>
            <GradientButton
              title="다음"
              disabled={!isFormValid}
              isLoading={state.isLoading}
              onPress={handleContinue}
              variant="full"
            />
          </View>
        </Animated.View>

        {/* Footer */}
        <Animated.View entering={FadeInDown.delay(200).duration(400).springify()} style={styles.footerContainer}>
          <SecurityFooter />
        </Animated.View>
      </View>
    </ScrollView>

    {/* 로딩 오버레이 (전체 화면 블러 효과) */}
    {state.isLoading && (
      <Animated.View
        style={[styles.loadingOverlay, overlayAnimatedStyle, { backgroundColor: colors.background.overlay || 'rgba(0,0,0,0.7)' }]}
        pointerEvents="auto"
      >
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color={Colors.primary.electricCyan} />
          <Text style={[styles.loadingText, { color: colors.text.primary }]}>계정을 생성하고 있습니다...</Text>
        </View>
      </Animated.View>
    )}
    </>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingBottom: Spacing.giant,
  },
  container: {
    width: '100%',
    alignItems: 'center',
    marginTop: 25,
  },
  headerWrapper: {
    // marginTop: Spacing.giant,
    marginBottom: Spacing.giant,
  },
  formContainer: {
    width: '100%',
    gap: Spacing.xxl,
  },
  buttonWrapper: {
    marginTop: Spacing.sm,
    width: '100%',
  },
  footerContainer: {
    marginTop: Spacing.giant,
    width: '100%',
    alignItems: 'center',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  loadingContent: {
    alignItems: 'center',
    gap: Spacing.lg,
  },
  loadingText: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.medium,
    letterSpacing: -0.312,
  },
});
