import { Feather } from '@expo/vector-icons';
import { Colors, FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';
import GrowDoneActionRow from '@/src/components/home/grow/GrowDoneActionRow';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FaceDataCapturePhase } from './types/faceData';

interface FaceDataCaptureButtonProps {
  phase: FaceDataCapturePhase;
  onStart: () => void;
  onRetry: () => void;
}

/**
 * FaceDataCaptureButton 컴포넌트 (SRP)
 * 회원가입 얼굴 스캔의 FaceScanButton(풀와이드 그라디언트 CTA, 상태별 아이콘+텍스트가
 * 버튼 안에 함께 표시)과 동일한 패턴을 사용해 "촬영 시작" 액션을 명확하게 드러낸다.
 * done 상태만 VoiceUpdateButton과 동일한 2버튼(다시 촬영/완료) 푸터로 전환한다.
 */
export default function FaceDataCaptureButton({ phase, onStart, onRetry }: FaceDataCaptureButtonProps) {
  if (phase === 'done') {
    return (
      <View style={styles.doneContainer}>
        <GrowDoneActionRow retryLabel="다시 촬영하기" onRetry={onRetry} showCompleteIcon />
      </View>
    );
  }

  const isIdle = phase === 'idle';
  const isRecording = phase === 'recording';
  const isProcessing = phase === 'processing';
  const isDisabled = !isIdle;

  const gradientColors = isRecording
    ? Colors.gradient.recording
    : isProcessing
      ? Colors.gradient.done
      : Colors.gradient.cyanToPurple;

  const label = isRecording ? '촬영 진행 중...' : isProcessing ? '표정 데이터 저장 중...' : '촬영 시작하기';

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={isIdle ? onStart : undefined}
      disabled={isDisabled}
      style={[styles.container, isDisabled && styles.disabledContainer]}
    >
      <LinearGradient colors={gradientColors} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={styles.gradient}>
        {isIdle && <Feather name="camera" size={22} color={Colors.primary.soulBlack} />}
        {isRecording && <View style={styles.recordingDot} />}
        {isProcessing && <ActivityIndicator color={Colors.primary.soulBlack} />}
        <Text style={styles.text}>{label}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 56,
    borderRadius: Radii.lg,
    overflow: 'hidden',
  },
  disabledContainer: {
    opacity: 0.85,
  },
  gradient: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: Radii.full,
    backgroundColor: Colors.primary.soulBlack,
  },
  text: {
    color: Colors.primary.soulBlack,
    textAlign: 'center',
    fontFamily: FontFamily.sans,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.medium,
    lineHeight: 24,
    letterSpacing: -0.312,
  },
  doneContainer: {
    width: '100%',
    alignItems: 'center',
  },
});
