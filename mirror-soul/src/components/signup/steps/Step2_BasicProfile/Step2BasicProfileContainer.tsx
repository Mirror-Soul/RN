import React, { useEffect, useRef, useState } from 'react';
import { Alert, Keyboard, View } from 'react-native';
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
import { submitEvidenceDraft, syncEvidenceDraft, useEvidenceDraft } from '@/src/features/job-verification/evidenceDraft';

export default function Step2BasicProfileContainer() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const savingLock = useRef(false);
  const { state, updateState, handleNicknameCheck, isFormValid, sigunguCache, eupmyeondongCache } = useStep2Form();
  const owner = useAuthStore(s => s.userUuid);
  const draft = useEvidenceDraft();
  const profileSaved = useRef(false);
  const [saved, setSaved] = useState(false);
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  const currentSession = () => !!owner && useAuthStore.getState().isLoggedIn && useAuthStore.getState().userUuid === owner;
  const finish = async () => { if (currentSession()) { await useAuthStore.getState().updateUserStatus('ONBOARD_B'); if (currentSession()) router.replace(SIGNUP_ROUTES.EXPRESS); } };
  const hint = draft.busy ? draft.phase
    : !state.isNicknameVerified ? '닉네임을 입력하고 중복 확인을 해주세요.'
    : !state.sidoName || !state.sigunguName || !state.eupmyeondongName ? '살고 있는 지역을 선택해주세요.'
    : !state.jobCategory ? '직군을 선택해주세요. 상세 설명과 서류는 선택이에요.'
    : '사진과 직업 서류 없이도 계속할 수 있어요.';

  const handleContinue = async () => {
    const validJob = jobCategories.some(job => job.value === state.jobCategory);
    if (!isFormValid || !validJob || draft.busy || savingLock.current || !currentSession()) return;
    savingLock.current = true; setIsSaving(true); Keyboard.dismiss();
    try {
      syncEvidenceDraft(owner, state.jobCategory as JobEnum);
      if (!profileSaved.current) {
        const response = await saveProfile(state.jobCategory as JobEnum, {
          nickname: state.nickname.trim(), sidoName: state.sidoName, sigunguName: state.sigunguName,
          eupmyeondongName: state.eupmyeondongName, jobDescription: state.jobTitle.trim(),
        });
        if (!currentSession()) return;
        if (!response.isSuccess) throw new Error(response.message || '프로필을 저장하지 못했어요.');
        profileSaved.current = true;
        if (mounted.current) setSaved(true);
      }
      const evidence = useEvidenceDraft.getState();
      if (evidence.owner === owner && evidence.photos.length) await submitEvidenceDraft();
      await finish();
    } catch (error) {
      if (!currentSession()) return;
      if (profileSaved.current) {
        Alert.alert('프로필은 저장됐어요', '직업 서류 신청은 완료하지 못했어요. 같은 사진으로 다시 시도하거나 가입 후 성장 탭에서 이어서 제출할 수 있어요.', [
          { text: '가입 먼저 계속', onPress: () => { void finish(); } },
          { text: '서류 다시 제출', onPress: () => { void handleContinue(); } },
        ]);
      } else Alert.alert('프로필을 저장하지 못했어요', getErrorDisplayMessage(error, '입력한 내용은 그대로 있어요. 다시 시도해주세요.'));
    } finally {
      savingLock.current = false;
      if (mounted.current) setIsSaving(false);
    }
  };

  return <SignupFormScreen title="프로필 저장하고 계속" hint={hint} disabled={!isFormValid || draft.busy} isSubmitting={isSaving} submittingLabel={draft.busy ? draft.phase : saved ? "서류를 확인하고 있어요…" : "프로필을 저장하고 있어요…"} onContinue={() => void handleContinue()}>
    <View pointerEvents={isSaving || saved ? 'none' : 'auto'}><Step2Header />
    <SignupSection title="상대에게 보여줄 기본 정보">
      <NicknameSection state={state} onChange={updateState} onCheck={handleNicknameCheck} isChecking={state.isNicknameChecking} />
      <LocationSection state={state} onChange={updateState} sigunguCache={sigunguCache} eupmyeondongCache={eupmyeondongCache} />
    </SignupSection>
    <SignupSection title="어떤 일을 하고 있나요?">
      <JobVerificationSection state={state} onChange={updateState} disabled={isSaving || saved} />
    </SignupSection>
    </View><ProfilePhotoManager signup name={state.nickname} disabled={isSaving || saved} />
  </SignupFormScreen>;
}
