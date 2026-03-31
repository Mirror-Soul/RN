import { Colors } from '@/src/constants/theme';
import { useRouter } from 'expo-router';
import React from 'react';
import { KeyboardAvoidingView, Linking, Platform, ScrollView, StyleSheet, View } from 'react-native';

// Step 4 Components
import InterviewAIBox from '@/src/components/signup/steps/Step4_Interview/interview/InterviewAIBox';
import InterviewAnswerBox from '@/src/components/signup/steps/Step4_Interview/interview/InterviewAnswerBox';
import InterviewAvatar from '@/src/components/signup/steps/Step4_Interview/interview/InterviewAvatar';
import InterviewControls from '@/src/components/signup/steps/Step4_Interview/interview/InterviewControls';
import InterviewFooter from '@/src/components/signup/steps/Step4_Interview/interview/InterviewFooter';
import InterviewHeader from '@/src/components/signup/steps/Step4_Interview/interview/InterviewHeader';

import { useInterviewSpeech } from '@/src/components/signup/steps/Step4_Interview/hooks/useInterviewSpeech';
import { useInterviewSTT } from '@/src/components/signup/steps/Step4_Interview/hooks/useInterviewSTT';
import MicPermissionModal from '@/src/components/signup/steps/Step4_Interview/interview/parts/MicPermissionModal';

export default function InterviewScreen() {
  const router = useRouter();
  const {
    isRecording,
    recordingUri,
    hasPermission,
    requestPermission, // 통합 권한 요청 함수 추가
    startRecording,
    stopRecording,
  } = useInterviewSpeech();

  const { transcript, startListening, stopListening } = useInterviewSTT('ko-KR');

  const [showPermissionModal, setShowPermissionModal] = React.useState(false);

  const handleRecordPress = async () => {
    // 권한이 없거나 아직 확인되지 않았으면 모달 표시
    if (!hasPermission) {
      setShowPermissionModal(true);
      return;
    }

    if (isRecording) {
      stopListening(); // STT를 먼저 중단
      await stopRecording();
    } else {
      const success = await startRecording();
      if (success) {
        startListening();
      }
    }
  };

  const handleRequestPermission = async () => {
    const granted = await requestPermission(); // 훅의 통합 함수 사용

    if (granted) {
      setShowPermissionModal(false);
    } else {
      // 권한이 거부된 경우 (iOS 등에서는 설정창 유도)
      Linking.openSettings();
      setShowPermissionModal(false);
    }
  };

  const handleNextPress = () => {
    // router.push('/signup/nextStep');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardView}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <InterviewHeader
            title="The Soul Capture"
            currentQuestion={1}
            totalQuestions={5}
          />

          {/* 3D Avatar Model */}
          <InterviewAvatar />

          <View style={styles.body}>
            <InterviewAIBox
              category="외향성 (Extraversion)"
              question="가장 소중한 사람과 의견 차이로 크게 다퉜을 때, 당신은 보통 어떻게 행동하나요?"
            />

            <View style={styles.answerWrapper}>
              <InterviewAnswerBox isRecording={isRecording} transcript={transcript} />
            </View>

            <View style={styles.controlsWrapper}>
              <InterviewControls
                isRecording={isRecording}
                onRecordPress={handleRecordPress}
                onNextPress={handleNextPress}
              />
            </View>
          </View>

          <View style={styles.footerWrapper}>
            <InterviewFooter />
          </View>

        </View>
      </ScrollView>

      {/* 마이크 권한 요청 모달 */}
      <MicPermissionModal
        visible={showPermissionModal}
        onRequestPermission={handleRequestPermission}
        onClose={() => setShowPermissionModal(false)}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    backgroundColor: Colors.primary.soulBlack,
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    paddingBottom: 50,
  },
  container: {
    flex: 1,
    width: '100%',
    maxWidth: 345, // Figma design width scale base
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  body: {
    width: '100%',
    alignItems: 'center',
  },
  answerWrapper: {
    width: '100%',
    marginTop: 16,
  },
  controlsWrapper: {
    width: '100%',
    marginTop: 16,
  },
  footerWrapper: {
    width: '100%',
    marginTop: 32,
  },
});
