import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated from 'react-native-reanimated';
import {Colors, FontFamily, Radii, FontSize, FontWeight, Spacing} from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { usePulse } from '@/src/animations/core/usePulse';

export default function MatchingActiveStatus() {
  const { colors } = useThemeColors();
  const [isMatching, setIsMatching] = useState(true);
  
  // 중앙화된 애니메이션 훅 사용 (매칭 중일 때만 동작)
  const { animatedStyle: animatedPulseStyle } = usePulse(1000);

  const toggleMatching = () => {
    setIsMatching(prev => !prev);
  };

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
            {isMatching ? "디지털 자아 매칭 중" : "매칭 일시 중단됨"}
          </Text>
        </View>

        {/* STOP / START 버튼 */}
        <Pressable 
          onPress={toggleMatching}
          style={[
            styles.actionButton, 
            isMatching 
              ? { backgroundColor: colors.background.glass, borderColor: colors.border.primary, borderWidth: 1 }
              : { backgroundColor: Colors.primary.electricCyan, borderWidth: 0, shadowColor: Colors.primary.electricCyan, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 15, elevation: 5 }
          ]}
        >
          <Text style={[styles.actionText, { color: isMatching ? colors.text.muted : Colors.primary.soulBlack }]}>
            {isMatching ? "STOP" : "START"}
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
  actionText: {
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.black,
    fontSize: FontSize.sm,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
});
