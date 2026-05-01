import VoiceUpdateButton, { VoiceUpdateStatus } from '@/src/components/home/grow/voice-update/VoiceUpdateButton';
import VoiceUpdateHeader from '@/src/components/home/grow/voice-update/VoiceUpdateHeader';
import VoiceUpdatePrompt from '@/src/components/home/grow/voice-update/VoiceUpdatePrompt';
import { Colors, Layout } from '@/src/constants/theme';
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
 * 녹음 프로세스(Idle -> Recording -> Done)를 관리합니다.
 */
export default function VoiceUpdateScreen() {
  const [status, setStatus] = useState<VoiceUpdateStatus>('idle');
  const [elapsed, setElapsed] = useState(0);
  const [sentenceIndex, setSentenceIndex] = useState(0);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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
    timerRef.current = setInterval(() => {
      setElapsed((prev) => prev + 0.1);
    }, 100);
  };

  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setStatus('done');
  };

  const handleRetry = () => {
    // 다음 문장으로 넘어가며 다시 시작 모드로 변경
    setSentenceIndex((prev) => (prev + 1) % SENTENCES.length);
    setStatus('idle');
    setElapsed(0);
  };

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <VoiceUpdateHeader />
        
        <View style={styles.main}>
          <VoiceUpdatePrompt sentence={SENTENCES[sentenceIndex]} />
          
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
    paddingVertical: 32,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 48, // 하단 여백 확보
  },
});
