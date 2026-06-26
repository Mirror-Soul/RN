import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { Colors, Radii } from '@/src/constants/theme';
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
  }, [isConnected, pulseAnim]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.outerRing, { transform: [{ scale: pulseAnim }] }]}>
        <View style={styles.avatar}>
          {/* 추후 AI 트윈 프로필 이미지로 교체 */}
          <View style={styles.avatarInner} />
        </View>
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
  avatar: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: Colors.glass.slate95,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.glass.purple30,
  },
});
