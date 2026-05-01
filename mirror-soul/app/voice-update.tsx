import VoiceUpdateButton, { VoiceUpdateStatus } from '@/src/components/home/grow/voice-update/VoiceUpdateButton';
import VoiceUpdateHeader from '@/src/components/home/grow/voice-update/VoiceUpdateHeader';
import VoiceUpdatePrompt from '@/src/components/home/grow/voice-update/VoiceUpdatePrompt';
import VoiceUpdateTranscriptBox from '@/src/components/home/grow/voice-update/VoiceUpdateTranscriptBox';
import { useSTT } from '@/src/hooks/useSTT';
import { Colors } from '@/src/constants/theme';
import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, SafeAreaView } from 'react-native';

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

  // STT 훅 연동
  const { transcript, isListening, startListening, stopListening, resetTranscript } = useSTT('ko-KR');

  // 녹음 시작/중지 핸들러
  const handlePress = () => {
    if (status === 'idle') {
      startRecording();
    } else if (status === 'recording') {
      stopRecording();
    }
  };

  const startRecording = () => {
    setStatus('recording');
    setElapsed(0);
    startListening();
    
    timerRef.current = setInterval(() => {
      setElapsed((prev) => prev + 0.1);
    }, 100);
  };

  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    stopListening();
    setStatus('analyzing'); // 명시적인 분석 상태로 전환

    // 2.5초 뒤에 최종 완료 상태로 전환 (사용자 유도)
    finalizeRef.current = setTimeout(() => {
      setStatus('done');
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
    paddingHorizontal: 24,
  },
  main: {
    flex: 1,
    paddingVertical: 40,
    justifyContent: 'center', // 중앙 집중형 배치
    alignItems: 'center',
    gap: 48, // 컴포넌트 간 충분한 간격 확보
  },
});
