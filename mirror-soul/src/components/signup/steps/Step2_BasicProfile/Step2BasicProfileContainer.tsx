import SecurityFooter from '@/src/components/home/SecurityFooter';
import PrimaryButton from '@/src/components/signup/common/PrimaryButton';
import { SIGNUP_ROUTES } from '@/src/constants/routes/signupRoutes';
import { Colors, Layout } from '@/src/constants/theme';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View, Alert, ActivityIndicator, Text } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

// Step 2 Specific Parts
import JobVerificationSection from './components/JobVerificationSection';
import LocationSection from './components/LocationSection';
import NicknameSection from './components/NicknameSection';
import Step2Header from './components/Step2Header';
import { useStep2Form } from './hooks/useStep2Form';
import { useSignupStore } from '@/src/store/useSignupStore';
import { saveProfile } from '@/src/services/onboardingService';
import { JobEnum } from '@/src/types/api/onboarding';
import { jobCategories } from './Professional/jobData';

/**
 * Step2BasicProfileContainer 컴포넌트
 * 회원가입 2단계의 모든 요소를 조립합니다. (SRP 오케스트레이터)
 */
export default function Step2BasicProfileContainer() {
  const router = useRouter();
  const userId = useSignupStore((s) => s.userId);
  const [isSaving, setIsSaving] = useState(false);

  const {
    state,
    updateState,
    handleNicknameCheck,
    handleJobVerify,
    isFormValid,
    sigunguCache,
    eupmyeondongCache,
  } = useStep2Form();

  // 로딩 오버레이 애니메이션
  const overlayOpacity = useSharedValue(0);
  const overlayAnimatedStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const handleContinue = async () => {
    // 1. 유효성 검증 (JobEnum 안전성 확보 및 방어 코드)
    const isValidJob = jobCategories.some((j) => j.value === state.jobCategory);
    if (!isFormValid || !isValidJob || isSaving) {
      if (!isValidJob && state.jobCategory !== '') {
        Alert.alert('오류', '유효하지 않은 직군입니다.');
      }
      return;
    }

    if (!userId) {
      Alert.alert('오류', '사용자 정보를 찾을 수 없습니다. 다시 시도해주세요.');
      return;
    }

    try {
      setIsSaving(true);
      overlayOpacity.value = withTiming(1, { duration: 200 });

      const response = await saveProfile(
        userId,
        state.jobCategory as JobEnum,
        {
          nickname: state.nickname.trim(),
          sidoName: state.sidoName,
          sigunguName: state.sigunguName,
          eupmyeondongName: state.eupmyeondongName,
          jobDescription: state.jobTitle.trim(),
          jobCertificationObjectKey: state.jobCertificationObjectKey,
        }
      );

      if (response.isSuccess) {
        // 성공: Step3로 이동
        router.push(SIGNUP_ROUTES.EXPRESS);
      } else {
        Alert.alert('저장 실패', response.message || '프로필 정보를 저장하지 못했습니다.');
      }
    } catch (error: any) {
      Alert.alert('오류', error?.message || '잠시 후 다시 시도해주세요.');
    } finally {
      overlayOpacity.value = withTiming(0, { duration: 200 });
      setIsSaving(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
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
            <View style={styles.headerWrapper}>
              <Step2Header />
            </View>

            <View style={styles.formContainer}>
              <NicknameSection
                state={state}
                onChange={updateState}
                onCheck={handleNicknameCheck}
                isChecking={state.isNicknameChecking}
              />

              <LocationSection
                state={state}
                onChange={updateState}
                sigunguCache={sigunguCache}
                eupmyeondongCache={eupmyeondongCache}
              />

              <JobVerificationSection
                state={state}
                onChange={updateState}
                onVerify={handleJobVerify}
              />

              <View style={styles.buttonWrapper}>
                <PrimaryButton
                  title="다음"
                  disabled={!isFormValid || isSaving}
                  isLoading={isSaving}
                  onPress={handleContinue}
                />
              </View>
            </View>

            <View style={styles.footerContainer}>
              <SecurityFooter />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* 로딩 오버레이 */}
      {isSaving && (
        <Animated.View
          style={[styles.loadingOverlay, overlayAnimatedStyle]}
          pointerEvents="auto"
        >
          <View style={styles.loadingContent}>
            <ActivityIndicator size="large" color={Colors.primary.electricCyan} />
            <Text style={styles.loadingText}>프로필을 저장하고 있습니다...</Text>
          </View>
        </Animated.View>
      )}
    </View>
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
    width: '100%',
    maxWidth: Layout.MAX_CONTENT_WIDTH,
    alignItems: 'center',
    marginTop: 25,
  },
  headerWrapper: {
    marginBottom: 40,
  },
  formContainer: {
    width: '100%',
    gap: 20, // Adjusted for spacing
  },
  buttonWrapper: {
    marginTop: 20,
    width: '100%',
  },
  footerContainer: {
    marginTop: 40,
    width: '100%',
    alignItems: 'center',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingContent: {
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
  },
});
