import { BlurView } from 'expo-blur';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { Colors, FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import type { CallStatus } from '@/src/hooks/useAICallFlow';

interface CallHeaderProps {
  callStatus: CallStatus;
}

const STATUS_TEXT: Record<CallStatus, string> = {
  idle: '연결 준비 중...',
  initiating: '통화를 시작하는 중...',
  joining: '서버에 연결 중...',
  inviting: 'AI 트윈에게 연결 중...',
  connecting: 'WebRTC 연결 중...',
  connected: 'AI 트윈과 대화 중',
  ending: '통화를 종료하는 중...',
  ended: '통화가 종료되었습니다',
};

/**
 * 통화 상단 상태 배지. 연결 전 단계는 CallConnectingView가 대신 보여주므로
 * 이 컴포넌트는 실제로 connected/ending/ended에서만 렌더링된다.
 * TwinSimulationCard의 "Live Call" 뱃지와 톤을 맞춘 글래스 필 + 펄스 점으로,
 * 연결 중일 때만 살아있는 느낌의 점 애니메이션을 준다.
 */
export default function CallHeader({ callStatus }: CallHeaderProps) {
  const { colors, isDark } = useThemeColors();
  const isConnected = callStatus === 'connected';
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!isConnected) {
      pulse.stopAnimation();
      pulse.setValue(1);
      return;
    }
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.3, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [isConnected, pulse]);

  return (
    <View style={styles.container}>
      <BlurView
        intensity={isDark ? 40 : 60}
        tint={isDark ? 'dark' : 'light'}
        style={[styles.pill, { borderColor: isConnected ? Colors.glass.cyan20_d3 : colors.border.primary }]}
      >
        <Animated.View
          style={[
            styles.dot,
            {
              backgroundColor: isConnected ? Colors.primary.electricCyan : colors.text.muted,
              opacity: pulse,
            },
          ]}
        />
        <Text style={[styles.statusText, { color: colors.text.muted }, isConnected && styles.connectedText]}>
          {STATUS_TEXT[callStatus]}
        </Text>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingTop: Spacing.lg,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radii.full,
    borderWidth: 1,
    overflow: 'hidden',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },
  connectedText: {
    color: Colors.primary.electricCyan,
  },
});
