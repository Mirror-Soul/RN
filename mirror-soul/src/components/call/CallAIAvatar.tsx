import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { Colors } from '@/src/constants/theme';
import AIOrb from './AIOrb';
import type { CallStatus } from '@/src/hooks/useAICallFlow';

interface CallAIAvatarProps {
  callStatus: CallStatus;
}

/**
 * AI 트윈 아바타 컴포넌트
 * - 연결 전: 정적 원형 아바타
 * - 통화 중: 펄스 애니메이션으로 음성 활성 표현
 */
export default function CallAIAvatar({ callStatus }: CallAIAvatarProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const isConnected = callStatus === 'connected';

  useEffect(() => {
    if (isConnected) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }

    return () => {
      pulseAnim.stopAnimation();
    };
  }, [isConnected, pulseAnim]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.outerRing, { transform: [{ scale: pulseAnim }] }]}>
        <AIOrb size={160} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outerRing: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 2,
    borderColor: Colors.primary.electricCyan,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
