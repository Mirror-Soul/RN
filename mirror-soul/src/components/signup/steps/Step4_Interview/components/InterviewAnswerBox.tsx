import { Colors } from '@/src/constants/theme';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import VoiceWaveform from './parts/VoiceWaveform';

interface InterviewAnswerBoxProps {
  answerText?: string;
  isRecording?: boolean;
  transcript?: string;
}

export default function InterviewAnswerBox({ answerText, isRecording = false, transcript = '' }: InterviewAnswerBoxProps) {
  // 깜빡이는 빨간 점 애니메이션
  const blinkAnim = useRef(new Animated.Value(0.6712)).current;
  const loopAnim = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (isRecording) {
      loopAnim.current = Animated.loop(
        Animated.sequence([
          Animated.timing(blinkAnim, {
            toValue: 0.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(blinkAnim, {
            toValue: 0.6712,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      loopAnim.current.start();
    } else {
      if (loopAnim.current) {
        loopAnim.current.stop();
      }
      blinkAnim.setValue(0.6712);
    }

    return () => {
      // 컴포넌트 언마운트 시 메모리 누수 방지
      if (loopAnim.current) {
        loopAnim.current.stop();
      }
    };
  }, [isRecording, blinkAnim]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titleText}>당신의 답변</Text>
        {isRecording && (
          <View style={styles.recordingIndicator}>
            <Animated.View style={[styles.redDot, { opacity: blinkAnim }]} />
            <Text style={styles.recordingText}>실시간 음성 인식 중 ...</Text>
          </View>
        )}
      </View>

      {isRecording ? (
        <View style={styles.recordingContent}>
          <VoiceWaveform />
          {transcript ? (
            <Text style={styles.transcriptText}>{transcript}</Text>
          ) : (
            <Text style={styles.transcriptPlaceholder}>말씀해 주세요...</Text>
          )}
        </View>
      ) : transcript ? (
        <Text style={styles.answerText}>{transcript}</Text>
      ) : answerText ? (
        <Text style={styles.answerText}>{answerText}</Text>
      ) : (
        <Text style={styles.guideText}>녹음 버튼을 눌러 답변을 시작하세요</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: 24.606,
    paddingBottom: 44.932,
    borderRadius: 24,
    borderWidth: 0.612,
    borderColor: Colors.glass.white10,
    backgroundColor: Colors.glass.black40,
    shadowColor: Colors.primary.soulBlack,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.10,
    shadowRadius: 15,
    elevation: 5,
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  redDot: {
    width: 7.995,
    height: 7.995,
    borderRadius: 8, // circle
    backgroundColor: Colors.primary.recordingRed,
  },
  recordingText: {
    color: Colors.primary.activeRedText,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    letterSpacing: -0.15,
  },
  titleText: {
    color: Colors.neutral.lightGray,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    letterSpacing: -0.15,
  },
  guideText: {
    color: Colors.neutral.darkGray,
    fontSize: 16,
    fontStyle: 'italic',
    fontWeight: '400',
    lineHeight: 26,
    letterSpacing: -0.312,
  },
  answerText: {
    color: Colors.neutral.pureWhite,
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 26,
    letterSpacing: -0.312,
  },
  recordingContent: {
    gap: 12,
  },
  transcriptText: {
    color: Colors.neutral.pureWhite,
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 24,
    letterSpacing: -0.2,
  },
  transcriptPlaceholder: {
    color: Colors.neutral.darkGray,
    fontSize: 15,
    fontStyle: 'italic',
    fontWeight: '400',
    lineHeight: 24,
    letterSpacing: -0.2,
  },
});

