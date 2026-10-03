import React, { useRef, useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SIGNUP_ROUTES } from '@/src/constants/routes/signupRoutes';
import { getErrorDisplayMessage } from '@/src/utils/apiErrorCode';
import SignupFormScreen from '@/src/components/signup/common/SignupFormScreen';
import SignupSection from '@/src/components/signup/common/SignupSection';
import JobVerificationSection from './components/JobVerificationSection';
import LocationSection from './components/LocationSection';
import NicknameSection from './components/NicknameSection';
import Step2Header from './components/Step2Header';
import { useStep2Form } from './hooks/useStep2Form';
import { saveProfile } from '@/src/services/onboardingService';
import { useAuthStore } from '@/src/store/useAuthStore';
import { JobEnum } from '@/src/types/api/onboarding';
import { jobCategories } from './Professional/jobData';
import { ProfilePhotoManager } from '@/src/features/profile/photo/ProfilePhotoManager';

export default function Step2BasicProfileContainer() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const savingLock = useRef(false);
  const { state, updateState, handleNicknameCheck, handleJobVerify, isFormValid, sigunguCache, eupmyeondongCache } = useStep2Form();
  const hint = state.isJobVerifying ? '직업 서류를 올리고 있어요. 잠시만 기다려주세요.'
    : !state.isNicknameVerified ? '닉네임을 입력하고 중복 확인을 해주세요.'
    : !state.sidoName || !state.sigunguName || !state.eupmyeondongName ? '살고 있는 지역을 선택해주세요.'
    : !state.jobCategory ? '직군을 선택해주세요. 상세 설명과 서류는 선택이에요.'
    : '사진과 직업 서류 없이도 계속할 수 있어요.';

  const handleContinue = async () => {
    const validJob = jobCategories.some(job => job.value === state.jobCategory);
    if (!isFormValid || !validJob || state.isJobVerifying || savingLock.current) return;
    savingLock.current = true;
    setIsSaving(true);
    try {
      const response = await saveProfile(state.jobCategory as JobEnum, {
        nickname: state.nickname.trim(), sidoName: state.sidoName, sigunguName: state.sigunguName,
        eupmyeondongName: state.eupmyeondongName, jobDescription: state.jobTitle.trim(),
        jobCertificationObjectKey: state.jobCertificationObjectKey,
      });
      if (!response.isSuccess) throw new Error(response.message || '프로필을 저장하지 못했어요.');
      await useAuthStore.getState().updateUserStatus('ONBOARD_B');
      router.replace(SIGNUP_ROUTES.EXPRESS);
    } catch (error) {
      Alert.alert('프로필을 저장하지 못했어요', getErrorDisplayMessage(error, '입력한 내용은 그대로 있어요. 다시 시도해주세요.'));
    } finally {
      savingLock.current = false;
      setIsSaving(false);
    }
  };

  return <SignupFormScreen title="프로필 저장하고 계속" hint={hint} disabled={!isFormValid || state.isJobVerifying} isSubmitting={isSaving} submittingLabel="프로필을 저장하고 있어요…" onContinue={() => void handleContinue()}>
    <Step2Header />
    <SignupSection title="상대에게 보여줄 기본 정보">
      <NicknameSection state={state} onChange={updateState} onCheck={handleNicknameCheck} isChecking={state.isNicknameChecking} />
      <LocationSection state={state} onChange={updateState} sigunguCache={sigunguCache} eupmyeondongCache={eupmyeondongCache} />
    </SignupSection>
    <SignupSection title="어떤 일을 하고 있나요?">
      <JobVerificationSection state={state} onChange={updateState} onVerify={handleJobVerify} />
    </SignupSection>
    <ProfilePhotoManager signup name={state.nickname} disabled={isSaving} />
  </SignupFormScreen>;
}
