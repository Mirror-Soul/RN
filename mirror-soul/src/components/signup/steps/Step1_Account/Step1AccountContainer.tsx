import SecurityFooter from '@/src/components/home/SecurityFooter';
import GradientButton from '@/src/components/common/GradientButton';
import { SIGNUP_ROUTES } from '@/src/constants/routes/signupRoutes';
import {Colors, Layout, FontFamily} from '@/src/constants/theme';
import { createBasicProfile } from '@/src/services/authService';

import { useAuthStore } from '@/src/store/useAuthStore';
import { useRouter } from 'expo-router';
import React from 'react';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

// Step 1 Specific Parts
import AgreementSection from './components/AgreementSection';
import EmailSection from './components/EmailSection';
import IdentityVerificationSection from './components/IdentityVerificationSection';
import PasswordSection from './components/PasswordSection';
import Step1Header from './components/Step1Header';
import { useStep1Form } from './hooks/useStep1Form';

/**
 * Step1AccountContainer 컴포넌트
 * 회원가입 1단계의 모든 요소를 조립합니다. (SRP 오케스트레이터)
 */
export default function Step1AccountContainer() {
  const router = useRouter();
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

      const response = await createBasicProfile({
        email: state.email,
        password: state.password,
        gender: null,     // PASS 인증 미구현 → null
        birthDate: null,  // PASS 인증 미구현 → null
        termsAgreed: state.agreedToTerms,
      });


      // 발급받은 토큰 및 상태를 AuthStore에 저장하여 로그인 상태로 전환
      await useAuthStore.getState().login({
        accessToken: response.result.accessToken,
        refreshToken: response.result.refreshToken,
        userUuid: response.result.userUuid,
        userStatus: response.result.userStatus,
      });

      // 성공: Step2로 이동
      router.push(SIGNUP_ROUTES.PROFILE);
    } catch (error: any) {
      Alert.alert(
        '계정 생성 실패',
        error?.message || '잠시 후 다시 시도해주세요.'
      );
    } finally {
      overlayOpacity.value = withTiming(0, { duration: 200 });
      updateState({ isLoading: false });
    }
  };

  return (
    <>
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.container}>
        {/* Progress Steps (상위 레이아웃에서 렌더링하므로 여기서는 삭제) */}

        {/* Header Section */}
        <View style={styles.headerWrapper}>
          <Step1Header />
        </View>

        {/* Form Body */}
        <View style={styles.formContainer}>
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
        </View>

        {/* Footer */}
        <View style={styles.footerContainer}>
          <SecurityFooter />
        </View>
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
    width: '100%',
    maxWidth: Layout.MAX_CONTENT_WIDTH,
    alignSelf: 'center',
    alignItems: 'center',
    paddingBottom: 40,
  },
  container: {
    width: '100%',
    alignItems: 'center',
    marginTop: 25,
  },
  headerWrapper: {
    // marginTop: 40,
    marginBottom: 40,
  },
  formContainer: {
    width: '100%',
    gap: 40,
  },
  buttonWrapper: {
    marginTop: 8,
    width: '100%',
  },
  footerContainer: {
    marginTop: 40,
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
    gap: 16,
  },
  loadingText: {
    fontFamily: FontFamily.sans,
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: -0.312,
  },
});
