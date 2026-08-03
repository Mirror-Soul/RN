import { Ionicons } from '@expo/vector-icons';
import { Colors, FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { getSyncCopy } from './growthSyncCopy';

interface GrowthHeroSectionProps {
  /** 서버에서 아직 못 받아온 상태(로딩/에러)면 null. */
  similarityPercent: number | null;
  isLoading: boolean;
  isError: boolean;
  onRetry?: () => void;
  isVerified: boolean;
  onVerifyPress?: () => void;
}

/**
 * GrowthHeroSection 컴포넌트 (SRP)
 * 트윈 유사도 헤드라인 + 인증 배지/버튼 + 진행바만 렌더링하는 순수 표시 컴포넌트입니다.
 * 인증 모달 오픈 상태와 GET /evolve 조회는 부모(grow.tsx)가 소유하고, 이 컴포넌트는
 * 로딩/에러/성공 상태에 따른 표시만 담당한다 (AvailableTimeCard와 동일한 원칙).
 *
 * 실제 % 숫자는 진행바 라벨(Similarity Sync N% Complete) 한 곳에서만 보여준다 —
 * 예전엔 헤드라인에 "거리 100%"(=100-싱크율), 아래엔 "0% Complete"(=싱크율)로
 * 같은 값을 반대로 두 번 보여줘서 계산이 틀린 것처럼 보였다. 헤드라인은 구간별
 * 자연스러운 문구(growthSyncCopy)로 대체해 숫자 중복 없이 뉘앙스만 전달한다.
 */
export default function GrowthHeroSection({
  similarityPercent,
  isLoading,
  isError,
  onRetry,
  isVerified,
  onVerifyPress,
}: GrowthHeroSectionProps) {
  const { colors } = useThemeColors();
  const hasValue = similarityPercent !== null;
  const safePercent = hasValue ? Math.min(100, Math.max(0, similarityPercent)) : 0;
  const syncCopy = hasValue ? getSyncCopy(safePercent) : null;

  const progressValueText = isLoading ? '측정 중...' : isError ? '조회 실패' : `${safePercent}% Complete`;

  return (
    <View style={styles.container}>
      <View style={styles.headlineRow}>
        {isError ? (
          <TouchableOpacity
            style={styles.headlineTouchable}
            onPress={onRetry}
            accessibilityRole="button"
            accessibilityLabel="트윈 유사도 다시 조회"
          >
            <Text style={[styles.headline, { color: colors.state.danger }]}>
              유사도 정보를 불러오지 못했어요.{'\n'}탭해서 다시 시도해주세요.
            </Text>
          </TouchableOpacity>
        ) : (
          <Text style={[styles.headline, { color: colors.text.primary }]}>
            {isLoading ? '트윈과의 싱크를\n확인하고 있어요.' : syncCopy!.headline}
          </Text>
        )}

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

      {!isError && (
        <Text style={[styles.subCopy, { color: colors.text.muted }]}>
          {isLoading ? '잠시만 기다려 주세요.' : syncCopy!.subCopy}
        </Text>
      )}

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
        <Text style={styles.progressLabelAccent}>{progressValueText}</Text>
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
  headlineTouchable: {
    flex: 1,
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
