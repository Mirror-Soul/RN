import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated from 'react-native-reanimated';
import {Colors, FontFamily, Radii, FontSize, FontWeight, Spacing} from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { usePulse } from '@/src/animations/core/usePulse';
import { useMatchingStatus } from '@/src/features/home/hooks/useMatchingStatus';

export default function MatchingActiveStatus() {
  const { colors } = useThemeColors();
  const { matchingEnabled, handleToggle, isLoading, isToggling, isError, refetch } = useMatchingStatus();
  // 조회 전(null)에는 켜진 것도 꺼진 것도 아닌 "확인 중" 상태로 보여준다(임의 기본값으로 단정하지 않음).
  const isMatching = matchingEnabled ?? false;
  // 조회 자체가 실패했을 때는 On/Off 토글 대신 재시도 버튼을 보여준다 — 실패 시에도 토글을
  // 그대로 두면 handleToggle이 데이터 없어서 조용히 no-op 처리되어, 눌러도 반응 없는
  // 버튼처럼 보인다(눌리는 것처럼 보이는데 실제로는 아무 일도 안 일어남).
  const isDisabled = isError ? false : isLoading || isToggling || matchingEnabled === null;

  // 중앙화된 애니메이션 훅 사용 (매칭 중일 때만 동작)
  const { animatedStyle: animatedPulseStyle } = usePulse(1000);

  return (
    <View style={[styles.outerContainer, { backgroundColor: colors.background.glass, borderColor: colors.border.primary }]}>
      <View style={styles.innerContainer}>
        {/* 상태 표시 영역 */}
        <View style={styles.statusRow}>
          {/* Glowing Dot */}
          <View style={styles.dotContainer}>
            {isMatching ? (
              <>
                <Animated.View style={[styles.pulseDot, animatedPulseStyle]} />
                <View style={[styles.coreDot, { backgroundColor: Colors.primary.electricCyan, shadowColor: Colors.primary.electricCyan }]} />
              </>
            ) : (
              <View style={[styles.coreDot, { backgroundColor: Colors.neutral.darkGray, shadowOpacity: 0 }]} />
            )}
          </View>
          <Text style={[styles.statusText, { color: isMatching ? colors.text.secondary : Colors.neutral.lightGrayText }]}>
            {isError ? "매칭 상태를 불러오지 못했어요" : matchingEnabled === null ? "매칭 상태 확인 중" : isMatching ? "디지털 자아 매칭 중" : "매칭 일시 중단됨"}
          </Text>
        </View>

        {/* STOP / START 버튼 — 조회 실패 시에는 재시도 버튼으로 바뀐다 */}
        <Pressable
          onPress={isError ? () => refetch() : handleToggle}
          disabled={isDisabled}
          accessibilityRole="button"
          accessibilityLabel={isError ? "다시 시도" : isMatching ? "매칭 중단" : "매칭 시작"}
          style={[
            styles.actionButton,
            isMatching || isError
              ? { backgroundColor: colors.background.glass, borderColor: colors.border.primary, borderWidth: 1 }
              : { backgroundColor: Colors.primary.electricCyan, borderWidth: 0, shadowColor: Colors.primary.electricCyan, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 15, elevation: 5 },
            isDisabled && styles.actionButtonDisabled,
          ]}
        >
          <Text style={[styles.actionText, { color: isMatching || isError ? colors.text.muted : Colors.primary.soulBlack }]}>
            {isError ? "재시도" : isMatching ? "중단" : "시작"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    marginTop: Spacing.xxxl,
    borderWidth: 1,
    borderRadius: Radii.xxl,
    padding: Spacing.xs,
  },
  innerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.lg,
    height: 66,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  dotContainer: {
    width: 12,
    height: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coreDot: {
    width: 12,
    height: 12,
    borderRadius: Radii.full,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
    position: 'absolute',
  },
  pulseDot: {
    width: 12,
    height: 12,
    borderRadius: Radii.full,
    backgroundColor: Colors.primary.electricCyan,
    position: 'absolute',
  },
  statusText: {
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.bold,
    fontSize: FontSize.base,
    letterSpacing: -0.5,
  },
  actionButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radii.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonDisabled: {
    opacity: 0.6,
  },
  actionText: {
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.black,
    fontSize: FontSize.sm,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
});
