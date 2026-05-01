import CompleteIcon from '@/assets/images/common/evlove/voice-update/voice_update_complete.svg';
import StopIcon from '@/assets/images/common/evlove/voice-update/voice_update_stop.svg';
import VoiceIcon from '@/assets/images/common/Voice_icon_white.svg';
import { Colors, Radii } from '@/src/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export type VoiceUpdateStatus = 'idle' | 'recording' | 'done';

interface VoiceUpdateButtonProps {
  status: VoiceUpdateStatus;
  elapsedTime?: string;
  onPress: () => void;
  onRetry?: () => void;
}

/**
 * 목소리 업데이트 버튼 (SRP)
 * 상태(idle, recording, done)에 따라 UI를 동적으로 변경합니다.
 */
export default function VoiceUpdateButton({
  status,
  elapsedTime,
  onPress,
  onRetry,
}: VoiceUpdateButtonProps) {
  const isIdle = status === 'idle';
  const isRecording = status === 'recording';
  const isDone = status === 'done';

  // 상태별 그라디언트 및 그림자 스타일 결정
  const gradientColors = isIdle
    ? Colors.gradient.voiceStart
    : isRecording
    ? Colors.gradient.recording
    : Colors.gradient.done;

  const shadowStyle = isIdle
    ? Colors.shadow.voiceStart
    : isRecording
    ? Colors.shadow.recording
    : Colors.shadow.done;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        style={[styles.buttonWrapper, shadowStyle]}
        disabled={isDone} // 완료 상태에서는 버튼 자체는 비활성화 (아래 재시도 버튼 사용)
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.button}
        >
          {isIdle && <VoiceIcon width={32} height={32} />}
          {isRecording && <StopIcon width={32} height={32} />}
          {isDone && <CompleteIcon width={32} height={32} />}
        </LinearGradient>
      </TouchableOpacity>

      {/* 상태 텍스트 영역 */}
      <View style={styles.infoArea}>
        {isIdle && (
          <View style={styles.idleInfo}>
            <Text style={styles.statusText}>녹음 시작</Text>
            <Text style={styles.footerText}>마이크 버튼을 눌러 녹음을 시작하세요</Text>
          </View>
        )}

        {isRecording && (
          <View style={styles.recordingInfo}>
            <View style={styles.recordingStatusRow}>
              <View style={styles.recordingDot} />
              <Text style={styles.statusText}>녹음 중...</Text>
            </View>
            <Text style={styles.elapsedText}>{elapsedTime}초</Text>
          </View>
        )}

        {isDone && (
          <View style={styles.doneInfo}>
            <Text style={[styles.statusText, { fontWeight: '500' }]}>완료 !</Text>
            <Text style={styles.doneSubText}>목소리가 업데이트되었습니다</Text>
            
            {/* 방안 C: 다른 문장 말해보기 (재시도) */}
            <TouchableOpacity onPress={onRetry} style={styles.retryButton}>
              <Text style={styles.retryText}>다른 문장 읽어보기</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 24,
    alignSelf: 'stretch',
  },
  buttonWrapper: {
    width: 96,
    height: 96,
    borderRadius: Radii.full,
  },
  button: {
    flex: 1,
    borderRadius: Radii.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoArea: {
    alignItems: 'center',
    height: 80, // 고정 높이로 레이아웃 흔들림 방지
  },
  idleInfo: {
    alignItems: 'center',
    gap: 16,
  },
  recordingInfo: {
    alignItems: 'center',
    gap: 8,
  },
  recordingStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: Radii.full,
    backgroundColor: Colors.primary.recordingRed,
    opacity: 0.8,
  },
  doneInfo: {
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    color: Colors.neutral.pureWhite,
    textAlign: 'center',
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    letterSpacing: -0.312,
  },
  elapsedText: {
    color: Colors.neutral.lightGray,
    textAlign: 'center',
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    letterSpacing: -0.15,
  },
  doneSubText: {
    color: Colors.primary.successGreen,
    textAlign: 'center',
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    letterSpacing: -0.15,
    marginBottom: 12,
  },
  footerText: {
    color: Colors.neutral.darkGray,
    textAlign: 'center',
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  },
  retryButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: Radii.sm,
    backgroundColor: Colors.glass.white10,
    marginTop: 8,
  },
  retryText: {
    color: Colors.neutral.lightGray,
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '500',
  },
});
