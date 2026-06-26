import React from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Colors, Radii } from '@/src/constants/theme';
import type { CallStatus } from '@/src/hooks/useAICallFlow';

interface CallControlsProps {
  callStatus: CallStatus;
  onStartCall: () => void;
  onHangUp: () => void;
}

/**
 * 통화 제어 버튼 컴포넌트
 * - idle / initiating / joining / inviting: 로딩 표시 (연결 중)
 * - connected: 빨간 종료 버튼
 * - ending: 비활성화 (종료 처리 중)
 */
export default function CallControls({ callStatus, onStartCall, onHangUp }: CallControlsProps) {
  const isConnected = callStatus === 'connected';
  const isEnding = callStatus === 'ending' || callStatus === 'ended';
  const isIdle = callStatus === 'idle';
  const isPending = !isIdle && !isConnected && !isEnding;

  if (isIdle) {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.startButton} onPress={onStartCall} activeOpacity={0.8}>
          <View style={styles.startInner} />
        </TouchableOpacity>
      </View>
    );
  }

  if (isPending) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors.primary.electricCyan} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.endButton, isEnding && styles.disabledButton]}
        onPress={onHangUp}
        disabled={isEnding}
        activeOpacity={0.8}
      >
        <View style={styles.endIcon} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingBottom: 48,
  },
  startButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primary.electricCyan,
    justifyContent: 'center',
    alignItems: 'center',
  },
  startInner: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary.soulBlack,
  },
  endButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FF3B30',
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
