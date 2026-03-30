import React from 'react';
import { View, StyleSheet, Platform, KeyboardAvoidingView, ScrollView, Linking } from 'react-native';
import { Colors } from '@/src/constants/theme';
import { useRouter } from 'expo-router';

// Step 4 Components
import InterviewHeader from '@/src/components/signup/steps/Step4_Interview/interview/InterviewHeader';
import InterviewAvatar from '@/src/components/signup/steps/Step4_Interview/interview/InterviewAvatar';
import InterviewAIBox from '@/src/components/signup/steps/Step4_Interview/interview/InterviewAIBox';
import InterviewAnswerBox from '@/src/components/signup/steps/Step4_Interview/interview/InterviewAnswerBox';
import InterviewControls from '@/src/components/signup/steps/Step4_Interview/interview/InterviewControls';
import InterviewFooter from '@/src/components/signup/steps/Step4_Interview/interview/InterviewFooter';

import { useInterviewSpeech } from '@/src/components/signup/steps/Step4_Interview/hooks/useInterviewSpeech';
import { useInterviewSTT } from '@/src/components/signup/steps/Step4_Interview/hooks/useInterviewSTT';
import MicPermissionModal from '@/src/components/signup/steps/Step4_Interview/interview/parts/MicPermissionModal';
import { AudioModule } from 'expo-audio';

export default function InterviewScreen() {
  const router = useRouter();
  const {
    isRecording,
    recordingUri,
    hasPermission,
    startRecording,
    stopRecording,
  } = useInterviewSpeech();

  const { transcript, startListening, stopListening } = useInterviewSTT('ko-KR');

  const [showPermissionModal, setShowPermissionModal] = React.useState(false);

  const handleRecordPress = async () => {
    // 권한이 없으면 모달 표시
    if (hasPermission === false) {
      setShowPermissionModal(true);
      return;
    }

    if (isRecording) {
      await stopRecording();
      stopListening();
    } else {
      await startRecording();
      await startListening();
    }
  };

  const handleRequestPermission = async () => {
    const status = await AudioModule.requestRecordingPermissionsAsync();
    if (status.granted) {
      setShowPermissionModal(false);
    } else {
      // iOS는 한 번 거부하면 시스템 다이얼로그를 다시 표시하지 않으므로
      // 설정 화면으로 자동 이동시킵니다.
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
              question="금요일 저녁입니다. 활기찬 파티에 초대받았지만, 이번 주는 정말 힘들었어요. 사람들을 만나며 에너지를 충전하시나요, 아니면 집에서 혼자 쉬며 재충전하시나요?"
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
