import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Keyboard, KeyboardAvoidingView, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';
import { useLayout } from '@/src/hooks/useLayout';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { useAuthStore } from '@/src/store/useAuthStore';
import { performLogout } from '@/src/services/authService';
import InterviewAIBox from '@/src/components/signup/steps/Step4_Interview/components/InterviewAIBox';
import InterviewAnswerBox from '@/src/components/signup/steps/Step4_Interview/components/InterviewAnswerBox';
import InterviewControls from '@/src/components/signup/steps/Step4_Interview/components/InterviewControls';
import InterviewFooter from '@/src/components/signup/steps/Step4_Interview/components/InterviewFooter';
import InterviewHeader from '@/src/components/signup/steps/Step4_Interview/components/InterviewHeader';
import MicPermissionModal from '@/src/components/signup/steps/Step4_Interview/components/parts/MicPermissionModal';
import { useInterviewQuestions } from '@/src/components/signup/steps/Step4_Interview/hooks/useInterviewQuestions';
import { useInterviewFlow } from '@/src/components/signup/steps/Step4_Interview/hooks/useInterviewFlow';

export default function InterviewScreen() {
  const { contentContainerStyle, screenPadding } = useLayout();
  const { colors } = useThemeColors();
  const { top } = useSafeAreaInsets();
  const router = useRouter();
  const scroll = useRef<ScrollView>(null);
  const questions = useInterviewQuestions();
  const { isLastQuestion, goToNextQuestion } = questions;
  const onSaved = useCallback(async () => {
    if (isLastQuestion) {
      await useAuthStore.getState().updateUserStatus('ONBOARD_D');
      router.replace('/signup/face-scan');
    } else {
      goToNextQuestion();
      scroll.current?.scrollTo({ y: 0, animated: true });
    }
  }, [isLastQuestion, goToNextQuestion, router]);
  const flow = useInterviewFlow(questions.currentQuestion?.id, onSaved);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [permissionBusy, setPermissionBusy] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const permissionLock = useRef(false);
  const [checkingLogin, setCheckingLogin] = useState(false);
  const loginLock = useRef(false);
  useEffect(() => {
    if (flow.error) scroll.current?.scrollToEnd({ animated: true });
  }, [flow.error]);

  const handleRecord = () => {
    Keyboard.dismiss();
    if (flow.isBusy || checkingLogin) return;
    if (flow.phase === 'recording') { void flow.finishRecording(); return; }
    if (!flow.hasPermission) { setShowPermissionModal(true); return; }
    void flow.beginRecording();
  };
  const requestPermission = async () => {
    if (permissionLock.current) return;
    permissionLock.current = true;
    setPermissionBusy(true);
    setPermissionError(null);
    try {
      const granted = await flow.requestPermission();
      if (granted) {
        setShowPermissionModal(false);
        await flow.beginRecording();
      } else {
        setPermissionError('녹음하려면 마이크와 음성 인식 권한이 필요해요. 다시 허용하거나 휴대폰 설정을 확인해주세요.');
      }
    } catch { setPermissionError('권한을 확인하지 못했어요. 잠시 후 다시 눌러주세요.'); }
    finally { permissionLock.current = false; setPermissionBusy(false); }
  };
  const checkLogin = async () => {
    if (loginLock.current) return;
    loginLock.current = true;
    setCheckingLogin(true);
    try { await performLogout(); router.replace('/login'); }
    catch { Alert.alert('진행 상태를 확인하지 못했어요', '잠시 후 다시 눌러주세요.'); }
    finally { loginLock.current = false; setCheckingLogin(false); }
  };
  const review = flow.draft && ['review', 'saving'].includes(flow.phase) ? flow.draft : null;
  const busyLabel = flow.phase === 'starting' ? '녹음을 준비하고 있어요…'
    : flow.phase === 'stopping' ? '말씀하신 내용을 정리하고 있어요…'
    : flow.saveStage === 'address' ? '녹음 전송을 준비하고 있어요…'
    : flow.saveStage === 'upload' ? flow.uploadProgress == null ? '녹음을 전송하고 있어요…' : `녹음 전송 ${Math.round(flow.uploadProgress * 100)}%`
    : '답변을 저장하고 있어요…';
  const canAnswer = !questions.isLoading && !questions.isError && !!questions.currentQuestion;
  return <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={top} style={[styles.screen, { backgroundColor: colors.background.primary }]}>
    <ScrollView ref={scroll} contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" showsVerticalScrollIndicator={false}>
      <View style={[contentContainerStyle, styles.content, { paddingHorizontal: screenPadding }]}>
        {questions.isLoading ? <View style={styles.empty}>
          <ActivityIndicator color={colors.brand.accent} size="large" />
          <Text style={[styles.copy, { color: colors.text.secondary }]}>나눌 이야기를 준비하고 있어요…</Text>
        </View> : questions.isError || !questions.currentQuestion ? <View style={styles.empty}>
          <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>질문을 불러오지 못했어요</Text>
          <Text style={[styles.copy, { color: colors.text.secondary }]}>연결 상태를 확인하고 다시 불러와주세요.</Text>
          <Pressable accessibilityRole="button" onPress={() => void questions.refetch()} style={[styles.retry, { borderColor: colors.border.strong }]}>
            <Text style={[styles.copy, { color: colors.text.primary }]}>질문 다시 불러오기</Text>
          </Pressable>
        </View> : <>
          <InterviewHeader currentQuestion={questions.currentQuestionIndex + 1} totalQuestions={questions.totalQuestions} />
          <InterviewAIBox key={questions.currentQuestion.id} question={questions.currentQuestion.question} />
          {flow.phase === 'recording' ? <InterviewAnswerBox
            key="recording" isRecording isBusy={false} isListening={flow.isListening} transcript={flow.transcript}
            durationMs={flow.durationMs} metering={flow.metering} onChangeText={flow.changeText}
          /> : review ? <InterviewAnswerBox
            key={review.uri} isRecording={false} isBusy={flow.isBusy || checkingLogin} isListening={false} transcript={review.transcript}
            recordingUri={review.uri} durationMs={review.durationMs} recognitionIssue={review.notice} onChangeText={flow.changeText}
          /> : flow.phase === 'ready' ? <Text style={[styles.copy, { color: colors.text.secondary }]}>
            조용한 곳에서 휴대폰을 가까이 두고 말해주세요. 주변 대화가 함께 들어가지 않도록 해주세요.
          </Text> : null}
          {flow.error && <View accessibilityRole="alert" accessibilityLiveRegion="polite" style={[styles.notice, { backgroundColor: colors.background.card, borderColor: colors.border.primary }]}>
            <Text style={[styles.copy, { color: colors.text.primary }]}>{flow.error}</Text>
            {flow.needsLoginCheck && <Pressable accessibilityRole="button" disabled={checkingLogin} onPress={() => void checkLogin()} style={styles.retry}>
              <Text style={[styles.copy, { color: colors.text.primary }]}>{checkingLogin ? '진행 상태 확인을 준비하고 있어요…' : '로그인으로 진행 상태 확인'}</Text>
            </Pressable>}
          </View>}
          <InterviewFooter />
        </>}
      </View>
    </ScrollView>
    {canAnswer && <View style={[styles.actionBar, { backgroundColor: colors.background.primary, borderColor: colors.border.primary }]}>
      <View style={[contentContainerStyle, styles.actionContent, { paddingHorizontal: screenPadding }]}>
        <InterviewControls
          isRecording={flow.phase === 'recording' || flow.phase === 'stopping'} hasRecording={!!review}
          isBusy={flow.isBusy || checkingLogin} isNextDisabled={!review?.transcript.trim() || flow.needsLoginCheck}
          isRecordDisabled={flow.needsLoginCheck}
          isLastQuestion={questions.isLastQuestion} busyLabel={busyLabel} needsConfirmation={!!review?.notice}
          onRecordPress={handleRecord} onNextPress={() => { Keyboard.dismiss(); void flow.saveAnswer(); }}
        />
        {flow.saveStage === 'upload' && flow.uploadProgress != null && <View accessibilityRole="progressbar" accessibilityLabel="녹음 전송" accessibilityValue={{ min: 0, max: 100, now: Math.round(flow.uploadProgress * 100) }} style={[styles.track, { backgroundColor: colors.border.primary }]}>
          <View style={[styles.fill, { backgroundColor: colors.brand.accent, width: `${flow.uploadProgress * 100}%` }]} />
        </View>}
      </View>
    </View>}
    <MicPermissionModal
      visible={showPermissionModal} canAskAgain={flow.canAskAgain} isBusy={permissionBusy}
      onRequestPermission={() => void requestPermission()}
      onOpenSettings={() => {
        setShowPermissionModal(false);
        void Linking.openSettings().catch(() => {
          setPermissionError('휴대폰 설정을 열지 못했어요. 설정에서 마이크와 음성 인식을 허용해주세요.');
          setShowPermissionModal(true);
        });
      }}
      onClose={() => { if (!permissionLock.current) setShowPermissionModal(false); }}
      error={permissionError}
    />
  </KeyboardAvoidingView>;
}
const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { flexGrow: 1, paddingBottom: Spacing.xxl },
  content: { paddingTop: Spacing.lg, gap: Spacing.xl },
  actionBar: { borderTopWidth: 1, paddingVertical: Spacing.md },
  actionContent: { gap: Spacing.sm },
  copy: { fontFamily: FontFamily.sans, fontSize: FontSize.base, lineHeight: 22 },
  empty: { minHeight: 240, alignItems: 'center', justifyContent: 'center', gap: Spacing.lg },
  emptyTitle: { fontFamily: FontFamily.sans, fontSize: FontSize.xl, fontWeight: FontWeight.semibold, lineHeight: 28, textAlign: 'center' },
  retry: { minHeight: 44, justifyContent: 'center', alignItems: 'center', padding: Spacing.md, borderWidth: 1, borderRadius: Radii.md },
  notice: { borderWidth: 1, padding: Spacing.lg, borderRadius: Radii.lg, gap: Spacing.md },
  track: { height: 4, borderRadius: 2, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 2 },
});
