import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Colors, Radii, Spacing } from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import type { CallStatus } from '@/src/hooks/useAICallFlow';

interface CallControlsProps {
  callStatus: CallStatus;
  onHangUp: () => void;
  /** 아래 세 토글은 현재 레이아웃/자리표시자용 — 실제 오디오 라우팅/카메라 연동은 후속 작업 */
  isMuted: boolean;
  onToggleMute: () => void;
  isSpeakerOn: boolean;
  onToggleSpeaker: () => void;
  isCameraOn: boolean;
  onToggleCamera: () => void;
}

/**
 * 통화 제어 버튼 컴포넌트
 * - idle / initiating / joining / inviting: 로딩 표시 (연결 중 — idle은 화면 진입 즉시
 *   자동으로 통화가 걸리므로 사용자가 실제로 보는 경우는 아주 짧은 순간뿐이다)
 * - connected: 음소거/스피커/카메라 토글 + 빨간 종료 버튼
 * - ending: 비활성화 (종료 처리 중)
 */
export default function CallControls({
  callStatus,
  onHangUp,
  isMuted,
  onToggleMute,
  isSpeakerOn,
  onToggleSpeaker,
  isCameraOn,
  onToggleCamera,
}: CallControlsProps) {
  const { colors, isDark } = useThemeColors();
  const isConnected = callStatus === 'connected';
  const isEnding = callStatus === 'ending' || callStatus === 'ended';
  const isPending = !isConnected && !isEnding;
  const blurTint = isDark ? 'dark' : 'light';
  const blurIntensity = isDark ? 40 : 60;
  const iconColor = colors.text.primary;

  if (isPending) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors.primary.electricCyan} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.toggleRow}>
        <BlurView
          intensity={blurIntensity}
          tint={blurTint}
          style={[styles.toggleButton, { borderColor: colors.border.primary }, isMuted && styles.toggleButtonActiveBorder]}
        >
          <View
            style={[styles.toggleButtonTint, { backgroundColor: colors.background.glass }, isMuted && styles.toggleButtonTintActive]}
            pointerEvents="none"
          />
          <TouchableOpacity
            style={styles.toggleButtonPressable}
            onPress={onToggleMute}
            disabled={isEnding}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={isMuted ? '음소거 해제' : '음소거'}
            accessibilityState={{ selected: isMuted }}
          >
            <Ionicons name={isMuted ? 'mic-off' : 'mic'} size={22} color={iconColor} />
          </TouchableOpacity>
        </BlurView>

        <BlurView
          intensity={blurIntensity}
          tint={blurTint}
          style={[styles.toggleButton, { borderColor: colors.border.primary }, isSpeakerOn && styles.toggleButtonActiveBorder]}
        >
          <View
            style={[
              styles.toggleButtonTint,
              { backgroundColor: colors.background.glass },
              isSpeakerOn && styles.toggleButtonTintActive,
            ]}
            pointerEvents="none"
          />
          <TouchableOpacity
            style={styles.toggleButtonPressable}
            onPress={onToggleSpeaker}
            disabled={isEnding}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={isSpeakerOn ? '스피커 끄기' : '스피커로 통화 (한뼘통화)'}
            accessibilityState={{ selected: isSpeakerOn }}
          >
            <Ionicons name={isSpeakerOn ? 'volume-high' : 'volume-mute'} size={22} color={iconColor} />
          </TouchableOpacity>
        </BlurView>

        <BlurView
          intensity={blurIntensity}
          tint={blurTint}
          style={[styles.toggleButton, { borderColor: colors.border.primary }, !isCameraOn && styles.toggleButtonActiveBorder]}
        >
          <View
            style={[
              styles.toggleButtonTint,
              { backgroundColor: colors.background.glass },
              !isCameraOn && styles.toggleButtonTintActive,
            ]}
            pointerEvents="none"
          />
          <TouchableOpacity
            style={styles.toggleButtonPressable}
            onPress={onToggleCamera}
            disabled={isEnding}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={isCameraOn ? '카메라 끄기' : '카메라 켜기'}
            accessibilityState={{ selected: !isCameraOn }}
          >
            <Ionicons name={isCameraOn ? 'videocam' : 'videocam-off'} size={22} color={iconColor} />
          </TouchableOpacity>
        </BlurView>
      </View>

      <TouchableOpacity
        style={[styles.endButton, isEnding && styles.disabledButton]}
        onPress={onHangUp}
        disabled={isEnding}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="통화 종료"
        accessibilityHint="진행 중인 통화를 종료합니다."
        accessibilityState={{ disabled: isEnding }}
      >
        <View style={styles.endIcon} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: Spacing.xxl,
    paddingBottom: Spacing.massive,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: Spacing.xl,
  },
  toggleButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    overflow: 'hidden',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleButtonActiveBorder: {
    borderColor: Colors.glass.cyan30_d3,
  },
  toggleButtonTint: {
    ...StyleSheet.absoluteFillObject,
  },
  toggleButtonTintActive: {
    backgroundColor: Colors.glass.purple20,
  },
  toggleButtonPressable: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  endButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primary.recordingRed,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  endIcon: {
    width: 28,
    height: 6,
    borderRadius: Radii.sm,
    backgroundColor: Colors.neutral.pureWhite,
  },
});
