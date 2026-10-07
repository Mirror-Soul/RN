import {Colors, Radii, FontSize, FontWeight} from '@/src/constants/theme';
import React, { useEffect, useRef } from 'react';
import { BrowseText as Text } from '@/src/components/home/common/BrowseText';
import { Animated, StyleSheet, View } from 'react-native';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { MIN_READING_SIMILARITY } from './readingSimilarity';

interface VoiceUpdateTranscriptBoxProps {
  transcript: string;
  isRecording: boolean;
  similarity?: number;
}

/**
 * 목소리 업데이트 실시간 STT 표시 컴포넌트 (SRP)
 * 사용자가 말하는 내용을 실시간으로 텍스트화하여 보여줍니다.
 */
export default function VoiceUpdateTranscriptBox({
  transcript,
  isRecording,
  similarity,
}: VoiceUpdateTranscriptBoxProps) {
  const blinkAnim = useRef(new Animated.Value(0.8)).current;
  const { colors } = useThemeColors();
  const belowThreshold = similarity !== undefined && similarity < MIN_READING_SIMILARITY;

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
    <View style={[styles.container, { borderColor: colors.border.primary, backgroundColor: colors.background.card }]}>
      <View style={styles.header}>
        {isRecording && (
          <View style={styles.recordingIndicator}>
            <Animated.View style={[styles.redDot, { opacity: blinkAnim }]} />
            <Text style={styles.recordingText}>말한 내용을 받아 적고 있어요</Text>
          </View>
        )}
        {!isRecording && <Text style={[styles.recordingText, { color: colors.text.secondary }]}>인식된 문장</Text>}
      </View>
      <View style={styles.content}>
        {transcript ? (
          <Text style={[styles.transcriptText, { color: colors.text.primary }]}>{transcript}</Text>
        ) : (
          <Text style={[styles.placeholderText, { color: colors.text.secondary }]}>
            {isRecording ? '위 문장을 읽으면 여기에 보여요.' : '녹음한 내용이 여기에 보여요.'}
          </Text>
        )}
      </View>
      {!isRecording && similarity !== undefined && <View style={styles.feedback} accessibilityLiveRegion="polite">
        <Text style={[styles.matchText, { color: belowThreshold ? colors.state.danger : colors.text.secondary }]}>문장 일치도 {Math.floor(similarity * 100)}% · {Math.round(MIN_READING_SIMILARITY * 100)}% 이상 필요</Text>
        {belowThreshold && <Text style={[styles.matchHint, { color: colors.text.secondary }]}>녹음은 보내지 않았어요. 조용한 곳에서 위 문장을 끝까지 다시 읽어주세요.</Text>}
      </View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: 14,
    borderRadius: Radii.lg2,
    borderWidth: 0.612,
    gap: 8,
  },
  header: {
    minHeight: 20,
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
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    lineHeight: 21,
    flexShrink: 1,
  },
  content: {
    justifyContent: 'center',
  },
  transcriptText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.regular,
    lineHeight: 24,
    textAlign: 'left',
  },
  placeholderText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.regular,
    lineHeight: 24,
    textAlign: 'left',
  },
  feedback: { gap: 4 },
  matchText: { fontSize: 13, lineHeight: 20, fontWeight: '500' },
  matchHint: { fontSize: 13, lineHeight: 20 },
});
