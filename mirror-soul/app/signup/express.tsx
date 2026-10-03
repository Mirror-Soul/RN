import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import SignupFormScreen from '@/src/components/signup/common/SignupFormScreen';
import Step3Header from '@/src/components/signup/steps/Step3_ExpressPersonal/components/Step3Header';
import SelfDescriptionInput from '@/src/components/signup/steps/Step3_ExpressPersonal/Description/SelfDescriptionInput';
import MbtiSelector from '@/src/components/signup/steps/Step3_ExpressPersonal/Mbti/MbtiSelector';
import { SIGNUP_ROUTES } from '@/src/constants/routes/signupRoutes';
import { useStep3Form } from '@/src/components/signup/steps/Step3_ExpressPersonal/hooks/useStep3Form';

export default function ExpressYourselfScreen() {
  const router = useRouter();
  const form = useStep3Form();
  const [sliding, setSliding] = useState(false);
  const selected = form.mbti.replace(/-/g, '').length;
  const hint = selected < 4 ? `성향 ${selected} / 4 선택 · 각 항목에서 가까운 쪽을 골라주세요.`
    : !form.description.trim() ? '나를 소개하는 한두 문장을 적어주세요.'
    : '다음은 내 이야기를 들려주는 음성 인터뷰예요.';
  return <SignupFormScreen title="소개 저장하고 계속" hint={hint} disabled={!form.isFormValid} isSubmitting={form.isSubmitting} submittingLabel="내 소개를 저장하고 있어요…" scrollEnabled={!sliding}
    onContinue={() => void form.handleSubmit(() => router.replace(SIGNUP_ROUTES.INTERVIEW))}>
    <Step3Header />
    <MbtiSelector onMbtiChange={form.setMbti} onScoresChange={form.setScores} disabled={form.isSubmitting} onDragStart={() => setSliding(true)} onDragEnd={() => setSliding(false)} />
    <SelfDescriptionInput value={form.description} onChangeText={form.setDescription} disabled={form.isSubmitting} />
  </SignupFormScreen>;
}
