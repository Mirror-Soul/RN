import { Colors, Layout } from '@/src/constants/theme';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Alert, KeyboardAvoidingView, Linking, Platform, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';

// Step 4 Components
import InterviewAIBox from '@/src/components/signup/steps/Step4_Interview/components/InterviewAIBox';
import InterviewAnswerBox from '@/src/components/signup/steps/Step4_Interview/components/InterviewAnswerBox';
import InterviewAvatar from '@/src/components/signup/steps/Step4_Interview/components/InterviewAvatar';
import InterviewControls from '@/src/components/signup/steps/Step4_Interview/components/InterviewControls';
import InterviewFooter from '@/src/components/signup/steps/Step4_Interview/components/InterviewFooter';
import InterviewHeader from '@/src/components/signup/steps/Step4_Interview/components/InterviewHeader';

import { useInterviewSpeech } from '@/src/components/signup/steps/Step4_Interview/hooks/useInterviewSpeech';
import { useSTT } from '@/src/hooks/useSTT';
import { useInterviewQuestions } from '@/src/components/signup/steps/Step4_Interview/hooks/useInterviewQuestions';
import MicPermissionModal from '@/src/components/signup/steps/Step4_Interview/components/parts/MicPermissionModal';

export default function InterviewScreen() {
  const { width: windowWidth } = useWindowDimensions();
  const containerWidth = Math.min(windowWidth - 32, Layout.MAX_CONTENT_WIDTH);
  const router = useRouter();
  const {
    isRecording,
    recordingUri,
    hasPermission,
    requestPermission, // 통합 권한 요청 함수 추가
    startRecording,
    stopRecording,
  } = useInterviewSpeech();

  const { transcript, startListening, stopListening, resetTranscript } = useSTT('ko-KR');
  const { currentQuestion, currentQuestionIndex, totalQuestions, isLastQuestion, goToNextQuestion } = useInterviewQuestions();

  const [showPermissionModal, setShowPermissionModal] = React.useState(false);

  // [의견 반영] 인덱스가 변경될 때마다(질문이 넘어갈 때마다) 일관되게 텍스트를 초기화하는 상태 동기화 처리
  useEffect(() => {
    resetTranscript();
  }, [currentQuestionIndex, resetTranscript]);

  const handleRecordPress = async () => {
    // 권한이 없거나 아직 확인되지 않았으면 모달 표시
    if (!hasPermission) {
      setShowPermissionModal(true);
      return;
    }

    try {
      if (isRecording) {
        stopListening(); // STT를 먼저 중단
        await stopRecording();
      } else {
        await startRecording();
        startListening();
      }
    } catch (error) {
      console.error('녹음 제어 오류:', error);
      Alert.alert('녹음 오류', error instanceof Error ? error.message : '오디오 시스템에 문제가 발생했습니다.');
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

  const handleNextPress = async () => {
    try {
      // 1. 녹음 중이면 안전하게 중단 대기
      if (isRecording) {
        stopListening();
        await stopRecording();
      }

      // 2. 서버로 전송 대기
      // TODO: 실제 서버 전송 로직 구현 필요 (예: await submitAnswer(currentQuestion.id, transcript, recordingUri))

      // 3. 마지막 단계 확인 및 다음 로직
      if (isLastQuestion) {
        // 마지막 단계이면 다음 페이지로 이동
        router.push('/signup/face-scan');
        console.log('인터뷰 완료! 페이스 스캔 화면으로 이동합니다.');
      } else {
        goToNextQuestion();
      }
    } catch (error) {
      console.error('다음 단계 이동 중 오류:', error);
      Alert.alert('오류 발생', '답변을 처리하는 중 문제가 발생했습니다. 다시 시도해주세요.');
    }
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
        <View style={[styles.container, { width: containerWidth }]}>
          <View style={styles.headerWrapper}>
            <InterviewHeader
              currentQuestion={currentQuestionIndex + 1}
              totalQuestions={totalQuestions}
            />
          </View>

          {/* 3D Avatar Model */}
          <InterviewAvatar />

          <View style={styles.body}>
            <InterviewAIBox
              category={currentQuestion.category}
              question={currentQuestion.question}
            />

            <View style={styles.answerWrapper}>
              <InterviewAnswerBox isRecording={isRecording} transcript={transcript} />
            </View>

            <View style={styles.controlsWrapper}>
              <InterviewControls
                isRecording={isRecording}
                isLastQuestion={isLastQuestion}
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
    maxWidth: Layout.MAX_CONTENT_WIDTH,
    alignItems: 'center',
    marginTop: 25,
  },

  headerWrapper: {
    marginBottom: 40,
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
