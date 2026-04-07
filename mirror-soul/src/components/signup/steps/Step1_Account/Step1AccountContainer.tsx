import SecurityFooter from '@/src/components/home/SecurityFooter';
import PrimaryButton from '@/src/components/signup/common/PrimaryButton';
import { SIGNUP_ROUTES } from '@/src/constants/routes/signupRoutes';
import { Layout } from '@/src/constants/theme';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

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
  const {
    state,
    updateState,
    isModalVisible,
    setIsModalVisible,
    handleSendEmailCode,
    handleVerifyEmail,
    handlePassVerification,
    isFormValid,
  } = useStep1Form();

  const handleContinue = () => {
    if (isFormValid) {
      router.push(SIGNUP_ROUTES.PROFILE);
    }
  };

  return (
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
            <PrimaryButton
              title="다음"
              disabled={!isFormValid}
              onPress={handleContinue}
            />
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footerContainer}>
          <SecurityFooter />
        </View>
      </View>
    </ScrollView>
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
  }
});
