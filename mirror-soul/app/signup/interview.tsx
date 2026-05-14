import { Colors, Layout } from '@/src/constants/theme';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Alert, KeyboardAvoidingView, Linking, Platform, ScrollView, StyleSheet, View, useWindowDimensions, ActivityIndicator } from 'react-native';

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
import { useInterviewUpload } from '@/src/components/signup/steps/Step4_Interview/hooks/useInterviewUpload';
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
    resetRecording,
  } = useInterviewSpeech();

  const { transcript, startListening, stopListening, resetTranscript } = useSTT('ko-KR');
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

  // [의견 반영] 인덱스가 변경될 때마다(질문이 넘어갈 때마다) 일관되게 텍스트 및 녹음 데이터를 초기화하는 상태 동기화 처리
  useEffect(() => {
    resetTranscript();
    resetRecording();
  }, [currentQuestionIndex, resetTranscript, resetRecording]);

  // [에러 처리] 질문 데이터를 불러오지 못했을 때 재시도 팝업 노출
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

  // [로딩 처리] 질문 목록을 가져오는 동안 스피너 노출
  if (isLoading) {
    return (
      <View style={[styles.keyboardView, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={Colors.primary.electricCyan} />
      </View>
    );
  }

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
    // 0. 업로드 중이면 중복 클릭 방지
    if (isUploading) return;

    try {
      // [버그 수정] 녹음 데이터의 최신성을 보장하기 위해 현재 인덱스를 캡처
      const targetQuestionId = currentQuestion.id;
      let finalUri = recordingUri;

      // 1. 녹음 중이면 안전하게 중단 및 URI 확보
      if (isRecording) {
        stopListening();
        finalUri = await stopRecording();
      }

      // 2. 녹음 파일 존재 여부 확인 (Q1 및 후속 질문 모두 강제)
      // resetRecording()이 정상 동작했다면, 녹음하지 않은 상태에서 finalUri는 null이어야 함
      if (!finalUri) {
        Alert.alert('알림', '답변 녹음을 완료한 후 다음 단계로 진행해주세요.');
        return;
      }

      // 3. 서버로 전송 (Step 4 & 5 연동)
      // uploadInterviewAudio 내부에서 텍스트 검증(5자 이상)을 수행합니다.
      const isSuccess = await uploadInterviewAudio(finalUri, targetQuestionId, transcript);

      if (!isSuccess) return; // 검증 실패 시 중단 (재녹음 유도)

      // 4. 마지막 단계 확인 및 다음 로직
      if (isLastQuestion) {
        router.push('/signup/face-scan');
      } else {
        goToNextQuestion();
      }
    } catch (error: any) {
      console.error('다음 단계 이동 중 오류:', error);
      
      // [AUTH_4030] 전처리: 유저 상태가 ONBOARD_C가 아닌 경우
      if (error?.code === 'AUTH_4030') {
        Alert.alert(
          '접근 권한 없음', 
          '이전 단계(성격 유형 설정)가 정상적으로 완료되지 않았습니다. 다시 시도해 주세요.'
        );
      } else {
        Alert.alert('오류 발생', '답변을 처리하는 중 문제가 발생했습니다. 다시 시도해주세요.');
      }
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
              // category={currentQuestion.category} // 백엔드 연동 준비 중 (잠시 주석 처리)
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
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
