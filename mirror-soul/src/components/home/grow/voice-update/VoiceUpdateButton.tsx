import CompleteIcon from '@/assets/images/common/evlove/voice-update/voice_update_complete.svg';
import StopIcon from '@/assets/images/common/evlove/voice-update/voice_update_stop.svg';
import VoiceIcon from '@/assets/images/common/Voice_icon_white.svg';
import {Colors, Radii, FontFamily, FontSize, FontWeight, Spacing} from '@/src/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { useThemeColors } from '@/src/hooks/useThemeColors';

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
  const { colors } = useThemeColors();
  
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
            <Text style={[styles.statusText, { color: colors.text.primary }]}>녹음 시작</Text>
            <Text style={[styles.footerText, { color: colors.text.secondary }]}>마이크 버튼을 눌러 녹음을 시작하세요</Text>
          </View>
        )}

        {isRecording && (
          <View style={styles.recordingInfo}>
            <View style={styles.recordingStatusRow}>
              <View style={styles.recordingDot} />
              <Text style={[styles.statusText, { color: colors.text.primary }]}>녹음 중...</Text>
            </View>
            <Text style={[styles.elapsedText, { color: colors.text.secondary }]}>{elapsedTime}초</Text>
          </View>
        )}

        {isAnalyzing && (
          <View style={styles.doneInfo}>
            <Text style={[styles.statusText, { color: Colors.primary.successGreen, fontWeight: FontWeight.semibold }]}>
              목소리 분석 중...
            </Text>
            <Text style={[styles.footerText, { color: colors.text.secondary }]}>인공지능이 당신의 말투를 학습하고 있습니다</Text>
          </View>
        )}

        {isDone && (
          /* 최종 액션 유도 영역 - 미니멀 리팩토링 */
          <View style={styles.finalActionArea}>
            <View style={styles.actionRow}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={onRetry}
                style={[styles.actionChip, { backgroundColor: colors.background.glass, borderColor: colors.border.primary }]}
              >
                <Text style={[styles.actionChipText, { color: colors.text.secondary }]}>다른 문장 읽어보기</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => router.back()}
                style={[styles.actionChip, styles.primaryChip]}
              >
                <Text style={[styles.actionChipText, styles.primaryChipText]}>완료하기</Text>
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
    gap: Spacing.xxl,
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
    gap: Spacing.lg,
  },
  recordingInfo: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  recordingStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
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
    gap: Spacing.sm,
  },
  statusText: {
    textAlign: 'center',
    fontFamily: FontFamily.sans,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.regular,
    lineHeight: 24,
    letterSpacing: -0.312,
  },
  elapsedText: {
    textAlign: 'center',
    fontFamily: FontFamily.sans,
    fontSize: FontSize.base,
    fontWeight: FontWeight.regular,
    lineHeight: 20,
    letterSpacing: -0.15,
  },
  footerText: {
    textAlign: 'center',
    fontFamily: FontFamily.sans,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.regular,
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
    gap: Spacing.md,
    alignItems: 'center',
  },
  actionChip: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xxl,
    borderRadius: Radii.full,
    borderWidth: 0.6,
  },
  actionChipText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    letterSpacing: -0.3,
  },
  primaryChip: {
    backgroundColor: 'rgba(0, 211, 243, 0.15)',
    borderColor: 'rgba(0, 211, 243, 0.3)',
  },
  primaryChipText: {
    color: Colors.primary.electricCyan,
    fontWeight: FontWeight.semibold,
  },
});

