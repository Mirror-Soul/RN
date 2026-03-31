import React from 'react';
import { View, StyleSheet, Platform, KeyboardAvoidingView, ScrollView, Linking, Alert } from 'react-native';
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
import { ExpoSpeechRecognitionModule } from 'expo-speech-recognition';

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
    // 권한 확인 중인 경우 안내 표시
    if (hasPermission === null) {
      Alert.alert('권한 확인 중', '마이크 및 음성 인식 권한을 확인하고 있습니다. 잠시만 기다려 주세요.');
      return;
    }

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
    const [audioStatus, sttStatus] = await Promise.all([
      AudioModule.requestRecordingPermissionsAsync(),
      ExpoSpeechRecognitionModule.requestPermissionsAsync(),
    ]);

    if (audioStatus.granted && sttStatus.granted) {
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
