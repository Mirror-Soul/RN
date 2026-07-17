import VoiceUpdateButton, { VoiceUpdateStatus } from '@/src/components/home/grow/voice-update/VoiceUpdateButton';
import VoiceUpdateHeader from '@/src/components/home/grow/voice-update/VoiceUpdateHeader';
import VoiceUpdatePrompt from '@/src/components/home/grow/voice-update/VoiceUpdatePrompt';
import VoiceUpdateTranscriptBox from '@/src/components/home/grow/voice-update/VoiceUpdateTranscriptBox';
import { useSTT } from '@/src/hooks/useSTT';
import {Colors, Spacing} from '@/src/constants/theme';
import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SENTENCES = [
  "주말에는 친구들과 영화를 보러 갈 예정이에요.",
  "오늘 날씨가 정말 좋아서 산책하기 딱 좋네요.",
  "새로운 취미를 시작해보고 싶은데 추천해주실 만한 게 있나요?",
  "맛있는 음식을 먹는 것만큼 행복한 일은 없는 것 같아요.",
];

/**
 * 목소리 업데이트 화면
 * 녹음 프로세스 및 실시간 STT 인터랙션을 관리합니다.
 */
export default function VoiceUpdateScreen() {
  const [status, setStatus] = useState<VoiceUpdateStatus>('idle');
  const [elapsed, setElapsed] = useState(0);
  const [sentenceIndex, setSentenceIndex] = useState(0);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const finalizeRef = useRef<NodeJS.Timeout | null>(null);
  const transcriptRef = useRef(''); // 비동기 체크를 위한 transcript 참조용 Ref

  // STT 훅 연동
  const { transcript, isListening, startListening, stopListening, resetTranscript } = useSTT('ko-KR');

  // transcript가 변경될 때마다 Ref 업데이트
  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  // 녹음 시작/중지 핸들러
  const handlePress = () => {
    if (status === 'idle') {
      startRecording();
    } else if (status === 'recording') {
      stopRecording();
    }
  };

  const startRecording = async () => {
    try {
      setElapsed(0);
      await startListening(); // 시작 성공 보장 후 상태 전환
      setStatus('recording');

      timerRef.current = setInterval(() => {
        setElapsed((prev) => prev + 0.1);
      }, 100);
    } catch (error) {
      console.error('STT 시작 실패:', error);
      setStatus('idle');
    }
  };

  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    stopListening();
    setStatus('analyzing'); // 명시적인 분석 상태로 전환

    // 2.5초 뒤에 데이터 유무 확인 후 상태 전환
    finalizeRef.current = setTimeout(() => {
      if (!transcriptRef.current.trim()) {
        // 인식된 텍스트가 없는 경우
        setStatus('idle');
        Alert.alert('알림', '인식된 목소리가 없습니다.\n다시 시도해 주세요.');
      } else {
        // 정상 인식된 경우
        setStatus('done');
      }
    }, 2500);
  };

  const handleRetry = () => {
    if (finalizeRef.current) clearTimeout(finalizeRef.current);
    setSentenceIndex((prev) => (prev + 1) % SENTENCES.length);
    setStatus('idle');
    setElapsed(0);
    resetTranscript();
  };

  // 컴포넌트 언마운트 시 모든 타이머 정리
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (finalizeRef.current) clearTimeout(finalizeRef.current);
      stopListening();
    };
  }, [stopListening]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <VoiceUpdateHeader />
        
        <View style={styles.main}>
          <VoiceUpdatePrompt sentence={SENTENCES[sentenceIndex]} />
          
          {/* 실시간 STT 결과창: 빈 공간을 채우고 사용자에게 피드백 제공 */}
          <VoiceUpdateTranscriptBox 
            transcript={transcript} 
            isRecording={status === 'recording'} 
          />
          
          <VoiceUpdateButton
            status={status}
            elapsedTime={elapsed.toFixed(1)}
            onPress={handlePress}
            onRetry={handleRetry}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.primary.soulBlack,
  },
  container: {
    flex: 1,
    paddingHorizontal: Spacing.xxl,
  },
  main: {
    flex: 1,
    paddingVertical: Spacing.giant,
    justifyContent: 'center', // 중앙 집중형 배치
    alignItems: 'center',
    gap: Spacing.massive, // 컴포넌트 간 충분한 간격 확보
  },
});
