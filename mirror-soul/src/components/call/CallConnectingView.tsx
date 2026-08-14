import { BlurView } from 'expo-blur';
import React, { useEffect, useRef } from 'react';
import { AccessibilityInfo, Animated, Easing, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import AIOrb from './AIOrb';
import CallScreenBackground from './CallScreenBackground';
import type { CallStatus } from '@/src/hooks/useAICallFlow';

interface CallConnectingViewProps {
  callStatus: CallStatus;
  onCancel: () => void;
}

interface StepConfig {
  statuses: CallStatus[];
  label: string;
}

const STEPS: StepConfig[] = [
  { statuses: ['idle', 'initiating'], label: '통화를 준비하는 중...' },
  { statuses: ['joining'], label: '서버에 연결하는 중...' },
  { statuses: ['inviting'], label: 'AI 트윈을 호출하는 중...' },
  { statuses: ['connecting'], label: '영상을 연결하는 중...' },
];

const getStepIndex = (callStatus: CallStatus) => {
  const index = STEPS.findIndex((step) => step.statuses.includes(callStatus));
  return index === -1 ? 0 : index;
};

/** 동심원으로 퍼지며 사라지는 펄스 링 하나 */
function PulseRing({ delay, color }: { delay: number; color: string }) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(progress, {
          toValue: 1,
          duration: 2200,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(progress, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [delay, progress]);

  const scale = progress.interpolate({ inputRange: [0, 1], outputRange: [1, 1.9] });
  const opacity = progress.interpolate({ inputRange: [0, 0.15, 1], outputRange: [0, 0.55, 0] });

  return (
    <Animated.View
      style={[styles.pulseRing, { borderColor: color, opacity, transform: [{ scale }] }]}
    />
  );
}

/**
 * 트윈 시뮬레이션 통화 연결 대기 화면 — 앱 진입 시부터 WebRTC 연결 완료 전까지 보여준다.
 * 동심원 펄스 오브 + 하단 스텝 인디케이터로 지금 어느 단계인지(권한/서버/AI 호출/영상 연결)를
 * 시각적으로 드러내고, 상태 텍스트는 바뀔 때마다 크로스페이드된다.
 */
const CANCELLING_LABEL = '연결을 취소하는 중...';

export default function CallConnectingView({ callStatus, onCancel }: CallConnectingViewProps) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useThemeColors();
  const isCancelling = callStatus === 'ending' || callStatus === 'ended';

  // 취소 중(ending/ended)엔 STEPS에 대응하는 실제 단계가 없다 — getStepIndex가 0으로 리셋시켜
  // 진행 바가 뒤로 튀어보이는 걸 막기 위해, 취소 직전 마지막 실제 단계를 그대로 고정해서 보여준다.
  const rawStepIndex = getStepIndex(callStatus);
  const lastRealStepIndexRef = useRef(rawStepIndex);
  useEffect(() => {
    if (!isCancelling) lastRealStepIndexRef.current = rawStepIndex;
  }, [rawStepIndex, isCancelling]);
  const stepIndex = isCancelling ? lastRealStepIndexRef.current : rawStepIndex;

  const label = isCancelling ? CANCELLING_LABEL : STEPS[stepIndex].label;
  const textOpacity = useRef(new Animated.Value(1)).current;
  const prevLabelRef = useRef(label);

  useEffect(() => {
    if (prevLabelRef.current === label) return;
    prevLabelRef.current = label;
    textOpacity.setValue(0);
    Animated.timing(textOpacity, {
      toValue: 1,
      duration: 320,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
    // 시각적 크로스페이드만으로는 스크린리더 사용자에게 진행 단계가 안 전달되므로 명령형으로 알린다.
    AccessibilityInfo.announceForAccessibility(label);
  }, [label, textOpacity]);

  return (
    <CallScreenBackground>
      <View style={styles.center}>
        <Text style={styles.eyebrow}>TWIN SIMULATION</Text>

        <View style={styles.orbWrapper}>
          <PulseRing delay={0} color={Colors.primary.electricCyan} />
          <PulseRing delay={700} color={Colors.primary.vividPurple} />
          <PulseRing delay={1400} color={Colors.primary.electricCyan} />

          <AIOrb size={ORB_CORE_SIZE} />
        </View>

        <Animated.Text
          style={[styles.statusText, { color: colors.text.primary, opacity: textOpacity }]}
          accessibilityLiveRegion="polite"
          accessibilityRole="text"
        >
          {label}
        </Animated.Text>
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.xl }]}>
        <BlurView
          intensity={isDark ? 40 : 60}
          tint={isDark ? 'dark' : 'light'}
          style={[styles.stepPill, { borderColor: colors.border.primary }]}
        >
          <View style={styles.stepRow}>
            {STEPS.map((step, index) => (
              <View
                key={step.label}
                style={[
                  styles.stepSegment,
                  { backgroundColor: colors.border.primary },
                  index <= stepIndex && styles.stepSegmentActive,
                ]}
              />
            ))}
          </View>
        </BlurView>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={onCancel}
          disabled={isCancelling}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="통화 연결 취소"
          accessibilityState={{ disabled: isCancelling }}
        >
          <Text
            style={[styles.cancelText, { color: colors.text.muted }, isCancelling && styles.cancelTextDisabled]}
          >
            취소
          </Text>
        </TouchableOpacity>
      </View>
    </CallScreenBackground>
  );
}

const ORB_CORE_SIZE = 120;
const RING_SIZE = 120;

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.giant,
  },
  eyebrow: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.black,
    letterSpacing: 3,
    textTransform: 'uppercase',
    color: Colors.glass.cyan30_d3,
  },
  orbWrapper: {
    width: RING_SIZE * 1.9,
    height: RING_SIZE * 1.9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    borderWidth: 1.5,
  },
  statusText: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
    gap: Spacing.xl,
    paddingHorizontal: Spacing.xxxl,
  },
  stepPill: {
    width: '100%',
    borderRadius: Radii.full,
    borderWidth: 1,
    overflow: 'hidden',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
  },
  stepRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  stepSegment: {
    flex: 1,
    height: 4,
    borderRadius: Radii.full,
  },
  stepSegmentActive: {
    backgroundColor: Colors.primary.electricCyan,
  },
  cancelButton: {
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.md,
  },
  cancelText: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    textDecorationLine: 'underline',
  },
  cancelTextDisabled: {
    opacity: 0.4,
  },
});
