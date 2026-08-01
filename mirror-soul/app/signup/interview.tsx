import {Colors, Spacing} from '@/src/constants/theme';
import { useLayout } from '@/src/hooks/useLayout';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Alert, KeyboardAvoidingView, Linking, Platform, ScrollView, StyleSheet, View, ActivityIndicator } from 'react-native';

// Step 4 Components
import InterviewAIBox from '@/src/components/signup/steps/Step4_Interview/components/InterviewAIBox';
import InterviewAnswerBox from '@/src/components/signup/steps/Step4_Interview/components/InterviewAnswerBox';
import InterviewVisualizer from '@/src/components/signup/steps/Step4_Interview/components/InterviewVisualizer';
import InterviewControls from '@/src/components/signup/steps/Step4_Interview/components/InterviewControls';
import InterviewFooter from '@/src/components/signup/steps/Step4_Interview/components/InterviewFooter';
import InterviewHeader from '@/src/components/signup/steps/Step4_Interview/components/InterviewHeader';
import MovingBackground from '@/src/components/signup/steps/Step4_Interview/components/parts/MovingBackground';

import { useInterviewSpeech } from '@/src/components/signup/steps/Step4_Interview/hooks/useInterviewSpeech';
import { useSTT } from '@/src/hooks/useSTT';
import { useInterviewQuestions } from '@/src/components/signup/steps/Step4_Interview/hooks/useInterviewQuestions';
import { useInterviewUpload } from '@/src/components/signup/steps/Step4_Interview/hooks/useInterviewUpload';
import MicPermissionModal from '@/src/components/signup/steps/Step4_Interview/components/parts/MicPermissionModal';

export default function InterviewScreen() {
  const { contentContainerStyle } = useLayout();
  const router = useRouter();
  
  const {
    isRecording,
    recordingUri,
    hasPermission,
    requestPermission,
    startRecording,
    stopRecording,
    resetRecording,
  } = useInterviewSpeech();

  const { transcript, startListening, stopListening, resetTranscript, isListening: isSTTListening } = useSTT('ko-KR');
  const { 
    currentQuestion, 
    currentQuestionIndex, 
    totalQuestions, 
    isLastQuestion, 
    goToNextQuestion,
    isLoading,
    isError,
    refetch 
  } = useInterviewQuestions();
  const { uploadInterviewAudio, isUploading } = useInterviewUpload();

  const [showPermissionModal, setShowPermissionModal] = React.useState(false);

  useEffect(() => {
    resetTranscript();
    resetRecording();
  }, [currentQuestionIndex, resetTranscript, resetRecording]);

  useEffect(() => {
    if (isError) {
      Alert.alert(
        '오류 발생',
        '데이터를 불러오지 못했습니다. 다시 시도하시겠습니까?',
        [
          { text: '취소', style: 'cancel' },
          { text: '다시 시도', onPress: () => refetch() }
        ]
      );
    }
  }, [isError, refetch]);

  if (isLoading) {
    return (
      <View style={[styles.keyboardView, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={Colors.primary.electricCyan} />
      </View>
    );
  }

  const handleRecordPress = async () => {
    if (!hasPermission) {
      setShowPermissionModal(true);
      return;
    }

    try {
      if (isRecording) {
        await stopListening();
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
    const granted = await requestPermission();
    if (granted) {
      setShowPermissionModal(false);
    } else {
      Linking.openSettings();
      setShowPermissionModal(false);
    }
  };

  const handleNextPress = async () => {
    if (isUploading) return;

    try {
      const targetQuestionId = currentQuestion.id;
      let finalUri = recordingUri;
      let finalTranscript = '';

      if (isRecording) {
        finalTranscript = await stopListening();
        finalUri = await stopRecording();
      }

      if (!finalTranscript && !transcript) {
        Alert.alert('알림', '답변 녹음을 완료한 후 다음 단계로 진행해주세요.');
        return;
      }

      const isSuccess = await uploadInterviewAudio(finalUri, targetQuestionId, finalTranscript || transcript);
      if (!isSuccess) return;

      if (isLastQuestion) {
        router.push('/signup/face-scan');
      } else {
        goToNextQuestion();
      }
    } catch (error: any) {
      console.error('다음 단계 이동 중 오류:', error);
      if (error?.code === 'AUTH_4030') {
        Alert.alert('접근 권한 없음', '이전 단계가 정상적으로 완료되지 않았습니다.');
      } else {
        Alert.alert('오류 발생', '답변을 처리하는 중 문제가 발생했습니다.');
      }
    }
  };

  return (
    <View style={styles.mainContainer}>
      <MovingBackground />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.container, contentContainerStyle]}>
            <View style={styles.headerWrapper}>
              <InterviewHeader
                currentQuestion={currentQuestionIndex + 1}
                totalQuestions={totalQuestions}
              />
            </View>

            {/* AI Visualizer (프리미엄 루핑 애니메이션) */}
            <View style={styles.visualizerWrapper}>
              <InterviewVisualizer isRecording={isRecording} />
            </View>

            <View style={styles.body}>
              <InterviewAIBox
                question={currentQuestion.question}
              />

              <View style={styles.answerWrapper}>
                <InterviewAnswerBox isRecording={isRecording} transcript={transcript} />
              </View>

              <View style={styles.controlsWrapper}>
                <InterviewControls
                  isRecording={isRecording}
                  isLastQuestion={isLastQuestion}
                  isNextDisabled={isUploading}
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

        <MicPermissionModal
          visible={showPermissionModal}
          onRequestPermission={handleRequestPermission}
          onClose={() => setShowPermissionModal(false)}
        />
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: Colors.primary.soulBlack,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    paddingBottom: 50,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  headerWrapper: {
    marginBottom: Spacing.xl,
  },
  visualizerWrapper: {
    width: '100%',
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  body: {
    width: '100%',
    alignItems: 'center',
  },
  answerWrapper: {
    width: '100%',
    marginTop: Spacing.lg,
  },
  controlsWrapper: {
    width: '100%',
    marginTop: Spacing.xl,
  },
  footerWrapper: {
    width: '100%',
    marginTop: Spacing.xxxl,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.primary.soulBlack,
  },
});
