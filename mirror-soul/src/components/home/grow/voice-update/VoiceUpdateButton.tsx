import CompleteIcon from '@/assets/images/common/evlove/voice-update/voice_update_complete.svg';
import StopIcon from '@/assets/images/common/evlove/voice-update/voice_update_stop.svg';
import VoiceIcon from '@/assets/images/common/Voice_icon_white.svg';
import { Colors, Radii } from '@/src/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import Animated from 'react-native-reanimated';
import { useAnimatedTheme } from '@/src/hooks/useAnimatedTheme';

export type VoiceUpdateStatus = 'idle' | 'recording' | 'analyzing' | 'done';

interface VoiceUpdateButtonProps {
  status: VoiceUpdateStatus;
  elapsedTime?: string;
  onPress: () => void;
  onRetry?: () => void;
}

/**
 * 목소리 업데이트 버튼 (SRP)
 */
export default function VoiceUpdateButton({
  status,
  elapsedTime,
  onPress,
  onRetry,
}: VoiceUpdateButtonProps) {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { animatedText, animatedTextSecondary } = useAnimatedTheme();
  
  // 기기 폭에 비례하는 동적 크기 계산 (기준 393px에서 96px은 약 24.4%)
  // 너무 작아지거나 커지는 것을 방지하기 위해 clamp 적용
  const dynamicButtonSize = Math.max(80, Math.min(width * 0.244, 112));

  const isIdle = status === 'idle';
  const isRecording = status === 'recording';
  const isAnalyzing = status === 'analyzing';
  const isDone = status === 'done';

  // 상태별 그라디언트 및 그림자 스타일 결정
  const gradientColors = isIdle
    ? Colors.gradient.voiceStart
    : isRecording
      ? Colors.gradient.recording
      : Colors.gradient.done; // analyzing과 done 모두 초록색 사용

  const shadowStyle = isIdle
    ? Colors.shadow.voiceStart
    : isRecording
      ? Colors.shadow.recording
      : Colors.shadow.done;

  return (
    <View style={styles.container}>
      {/* 1. 상단 버튼 영역 (공통) */}
      {status === 'done' ? (
        // 완료 상태: 클릭 불가능한 정적 뷰로 유지
        <View 
          style={[
            styles.buttonWrapper, 
            shadowStyle, 
            { width: dynamicButtonSize, height: dynamicButtonSize }
          ]}
        >
          <LinearGradient
            colors={Colors.gradient.done}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.button}
          >
            <CompleteIcon width={32} height={32} />
          </LinearGradient>
        </View>
      ) : (
        // 그 외 상태: 인터랙션 가능한 버튼
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onPress}
          style={[
            styles.buttonWrapper, 
            shadowStyle, 
            { width: dynamicButtonSize, height: dynamicButtonSize } // 동적 사이즈 적용
          ]}
          disabled={isAnalyzing}
        >
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.button}
          >
            {isIdle && <VoiceIcon width={32} height={32} />}
            {isRecording && <StopIcon width={32} height={32} />}
            {isAnalyzing && <CompleteIcon width={32} height={32} />}
          </LinearGradient>
        </TouchableOpacity>
      )}

      {/* 2. 하단 정보 및 액션 영역 */}
      <View style={styles.infoArea}>
        {isIdle && (
          <View style={styles.idleInfo}>
            <Animated.Text style={[styles.statusText, animatedText]}>녹음 시작</Animated.Text>
            <Animated.Text style={[styles.footerText, animatedTextSecondary]}>마이크 버튼을 눌러 녹음을 시작하세요</Animated.Text>
          </View>
        )}

        {isRecording && (
          <View style={styles.recordingInfo}>
            <View style={styles.recordingStatusRow}>
              <View style={styles.recordingDot} />
              <Animated.Text style={[styles.statusText, animatedText]}>녹음 중...</Animated.Text>
            </View>
            <Animated.Text style={[styles.elapsedText, animatedTextSecondary]}>{elapsedTime}초</Animated.Text>
          </View>
        )}

        {isAnalyzing && (
          <View style={styles.doneInfo}>
            <Animated.Text style={[styles.statusText, animatedText, { color: Colors.primary.successGreen, fontWeight: '600' }]}>
              목소리 분석 중...
            </Animated.Text>
            <Animated.Text style={[styles.footerText, animatedTextSecondary]}>인공지능이 당신의 말투를 학습하고 있습니다</Animated.Text>
          </View>
        )}

        {isDone && (
          /* 최종 액션 유도 영역 - 미니멀 리팩토링 */
          <View style={styles.finalActionArea}>
            <View style={styles.actionRow}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={onRetry}
                style={styles.actionChip}
              >
                <Animated.Text style={[styles.actionChipText, animatedTextSecondary]}>다른 문장 읽어보기</Animated.Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => router.back()}
                style={[styles.actionChip, styles.primaryChip]}
              >
                <Animated.Text style={[styles.actionChipText, animatedTextSecondary, styles.primaryChipText]}>완료하기</Animated.Text>
              </TouchableOpacity>
            </View>
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
    minHeight: 180,
  },
  buttonWrapper: {
    // width와 height는 컴포넌트 내부에서 동적으로 할당됨
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
    height: 80,
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
    gap: 8,
  },
  statusText: {
    textAlign: 'center',
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    letterSpacing: -0.312,
  },
  elapsedText: {
    textAlign: 'center',
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    letterSpacing: -0.15,
  },
  footerText: {
    textAlign: 'center',
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  },
  finalActionArea: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 10,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  actionChip: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: Radii.full,
    backgroundColor: Colors.glass.white10,
    borderWidth: 0.6,
    borderColor: Colors.glass.white20,
  },
  actionChipText: {
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: -0.3,
  },
  primaryChip: {
    backgroundColor: 'rgba(0, 211, 243, 0.15)',
    borderColor: 'rgba(0, 211, 243, 0.3)',
  },
  primaryChipText: {
    color: Colors.primary.electricCyan,
    fontWeight: '600',
  },
});

