import SecurityFooter from '@/src/components/home/SecurityFooter';
import PrimaryButton from '@/src/components/signup/common/PrimaryButton';
import { SIGNUP_ROUTES } from '@/src/constants/routes/signupRoutes';
import { useRouter } from 'expo-router';
import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';

// Step 2 Specific Parts
import JobVerificationSection from './components/JobVerificationSection';
import LocationSection from './components/LocationSection';
import NicknameSection from './components/NicknameSection';
import Step2Header from './components/Step2Header';
import { useStep2Form } from './hooks/useStep2Form';

/**
 * Step2BasicProfileContainer 컴포넌트
 * 회원가입 2단계의 모든 요소를 조립합니다. (SRP 오케스트레이터)
 */
export default function Step2BasicProfileContainer() {
  const router = useRouter();
  const {
    state,
    updateState,
    handleNicknameCheck,
    handleJobVerify,
    isFormValid,
  } = useStep2Form();

  const handleContinue = () => {
    if (isFormValid) {
      router.push(SIGNUP_ROUTES.EXPRESS);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardView}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          {/* Header Section */}
          <View style={styles.headerWrapper}>
            <Step2Header />
          </View>

          {/* Form Body */}
          <View style={styles.formContainer}>
            {/* Nickname Section */}
            <NicknameSection
              state={state}
              onChange={updateState}
              onCheck={handleNicknameCheck}
            />

            {/* Location Section */}
            <LocationSection
              state={state}
              onChange={updateState}
            />

            {/* Job Verification Section */}
            <JobVerificationSection
              state={state}
              onChange={updateState}
              onVerify={handleJobVerify}
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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingBottom: 40,
  },
  container: {
    width: 344.94,
    alignItems: 'center',
    marginTop: 25,
  },
  headerWrapper: {
    marginBottom: 40,
  },
  formContainer: {
    width: '100%',
    gap: 10, // Reduced from 40 for a more compact layout per user request
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

