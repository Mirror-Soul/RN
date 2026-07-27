import { Ionicons } from '@expo/vector-icons';
import { Colors, FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useThemeColors } from '@/src/hooks/useThemeColors';

interface GrowthHeroSectionProps {
  similarityPercent: number;
  isVerified: boolean;
  onVerifyPress?: () => void;
}

/**
 * GrowthHeroSection 컴포넌트 (SRP)
 * 트윈 유사도 헤드라인 + 인증 배지/버튼 + 진행바만 렌더링하는 순수 표시 컴포넌트입니다.
 * 인증 모달 오픈 상태는 부모(grow.tsx)가 소유합니다.
 */
export default function GrowthHeroSection({
  similarityPercent,
  isVerified,
  onVerifyPress,
}: GrowthHeroSectionProps) {
  const { colors } = useThemeColors();
  const safePercent = Math.min(100, Math.max(0, similarityPercent));
  const distancePercent = parseFloat((100 - safePercent).toFixed(1));

  return (
    <View style={styles.container}>
      <View style={styles.headlineRow}>
        <Text style={[styles.headline, { color: colors.text.primary }]}>
          당신과 트윈의 거리는{'\n'}지금 <Text style={styles.percentHighlight}>{distancePercent}%</Text> 입니다.
        </Text>

        {isVerified ? (
          <View style={styles.verifiedBadge}>
            <Ionicons name="shield-checkmark-outline" size={14} color={Colors.primary.electricCyan} />
            <Text style={styles.verifiedText}>Verified</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.verifyButton, { backgroundColor: colors.background.glass, borderColor: colors.border.primary }]}
            onPress={onVerifyPress}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="프로필 인증하기"
          >
            <Ionicons name="shield-checkmark-outline" size={20} color={colors.text.muted} />
          </TouchableOpacity>
        )}
      </View>

      <Text style={[styles.subCopy, { color: colors.text.muted }]}>
        더 닮아갈수록, 당신을 완벽히 이해하는{'\n'}최적의 인연을 만날 확률이 높아집니다.
      </Text>

      <View style={[styles.progressTrack, { backgroundColor: colors.background.glass }]}>
        <LinearGradient
          colors={Colors.gradient.cyanBluePurple}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={[styles.progressFill, { width: `${safePercent}%` }]}
        />
      </View>
      <View style={styles.progressLabelRow}>
        <Text style={[styles.progressLabel, { color: colors.text.muted }]}>Similarity Sync</Text>
        <Text style={styles.progressLabelAccent}>{safePercent}% Complete</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
    gap: Spacing.lg,
  },
  headlineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headline: {
    flex: 1,
    fontFamily: FontFamily.sans,
    fontSize: FontSize.display,
    fontWeight: FontWeight.black,
    letterSpacing: -1.43,
    lineHeight: 40,
  },
  percentHighlight: {
    color: Colors.primary.electricCyan,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radii.full,
    backgroundColor: Colors.glass.cyan10_d3,
    borderWidth: 1,
    borderColor: Colors.glass.cyan20_d3,
  },
  verifiedText: {
    fontFamily: FontFamily.sans,
    fontSize: 9,
    fontWeight: FontWeight.black,
    letterSpacing: -0.1,
    textTransform: 'uppercase',
    color: Colors.primary.electricCyan,
  },
  verifyButton: {
    width: 40,
    height: 40,
    borderRadius: Radii.lg,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subCopy: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    lineHeight: 23,
  },
  progressTrack: {
    height: 6,
    borderRadius: Radii.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: Radii.full,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    fontFamily: FontFamily.sans,
    fontSize: 9,
    fontWeight: FontWeight.black,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  progressLabelAccent: {
    fontFamily: FontFamily.sans,
    fontSize: 9,
    fontWeight: FontWeight.black,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: Colors.primary.electricCyan,
  },
});
