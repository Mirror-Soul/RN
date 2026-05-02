import { Colors, Radii } from '@/src/constants/theme';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

interface VoiceUpdateTranscriptBoxProps {
  transcript: string;
  isRecording: boolean;
}

/**
 * 목소리 업데이트 실시간 STT 표시 컴포넌트 (SRP)
 * 사용자가 말하는 내용을 실시간으로 텍스트화하여 보여줍니다.
 */
export default function VoiceUpdateTranscriptBox({
  transcript,
  isRecording,
}: VoiceUpdateTranscriptBoxProps) {
  const blinkAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    let animation: Animated.CompositeAnimation | null = null;
    
    if (isRecording) {
      animation = Animated.loop(
        Animated.sequence([
          Animated.timing(blinkAnim, {
            toValue: 0.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(blinkAnim, {
            toValue: 0.8,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
    } else {
      blinkAnim.setValue(0.8);
    }

    return () => {
      if (animation) animation.stop();
    };
  }, [isRecording, blinkAnim]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {isRecording && (
          <View style={styles.recordingIndicator}>
            <Animated.View style={[styles.redDot, { opacity: blinkAnim }]} />
            <Text style={styles.recordingText}>실시간 음성 인식 중 ...</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        {transcript ? (
          <Text style={styles.transcriptText}>{transcript}</Text>
        ) : (
          <Text style={styles.placeholderText}>
            {isRecording ? '말씀해 주세요...' : '녹음 버튼을 눌러 문장을 읽어주세요'}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    minHeight: 120,
    padding: 20,
    borderRadius: Radii.lg2,
    borderWidth: 0.612,
    borderColor: Colors.glass.white10,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    gap: 12,
  },
  header: {
    height: 20,
    justifyContent: 'center',
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  redDot: {
    width: 8,
    height: 8,
    borderRadius: Radii.full,
    backgroundColor: Colors.primary.recordingRed,
  },
  recordingText: {
    color: Colors.primary.activeRedText,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  transcriptText: {
    color: Colors.neutral.pureWhite,
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    textAlign: 'center',
  },
  placeholderText: {
    color: Colors.neutral.darkGray,
    fontSize: 15,
    fontStyle: 'italic',
    fontWeight: '400',
    lineHeight: 24,
    textAlign: 'center',
  },
});
