import { Feather } from '@expo/vector-icons';
import { Colors, FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';
import { useTwinSyncQuery } from '@/src/features/growth/hooks/useTwinSyncQuery';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useThemeColors } from '@/src/hooks/useThemeColors';

/** "오늘"/"어제"/"N일 전" — 히스토리 탭(toRelativeDateLabel)과 달리 날짜 표기로 전환하지 않고 계속 일 단위로 센다. */
function formatDaysAgoLabel(isoDateTime: string): string {
  const diffDays = Math.floor((Date.now() - new Date(isoDateTime).getTime()) / 86_400_000);
  if (diffDays <= 0) return '오늘';
  if (diffDays === 1) return '어제';
  return `${diffDays}일 전`;
}

/**
 * VoiceMissionCard 컴포넌트 (SRP)
 * 목소리 정밀 학습 미션 진입 카드입니다. 기존 EvolveVoiceCard의 /voice-update
 * 라우팅을 그대로 유지하고 새 디자인(전체 폭 와이드 카드)으로 리디자인했습니다.
 *
 * GrowthHeroSection이 쓰는 것과 같은 twinSync 쿼리를 재사용해 누적 학습 횟수/마지막
 * 학습일을 보여준다(react-query가 쿼리키로 캐시를 공유하므로 추가 네트워크 호출 없음).
 * 카드 폭이 좁아 한 줄에 다 못 담는 "총 N회 학습" 대신 화살표 위엔 더 짧은 최근 학습
 * 시점만 얹는다 — "필수" 같은 지어낸 상태 대신 단순 이동 안내로 남긴다.
 * 조회 실패 시엔 ValueBalanceMissionCard와 동일한 패턴(빨간 밑줄 문구 + 탭하여 재조회)을 쓴다.
 */
export default function VoiceMissionCard() {
  const { colors } = useThemeColors();
  const { data: twinSync, isLoading, isError, refetch } = useTwinSyncQuery();
  const hasTrainingHistory = !isLoading && !isError && twinSync?.lastVoiceTrainingAt != null;

  const subtitle = isError
    ? '학습 정보를 불러오지 못했어요. 탭하여 다시 시도해주세요.'
    : hasTrainingHistory
      ? `총 ${twinSync!.voiceTrainingCount}회 학습`
      : '고유의 말투와 문장 어조 시뮬레이션';
  const recencyLabel = hasTrainingHistory ? formatDaysAgoLabel(twinSync!.lastVoiceTrainingAt!) : null;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.background.card, borderColor: colors.border.primary }]}
      onPress={isError ? () => refetch() : () => router.push('/voice-update')}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={isError ? '목소리 정밀 학습 미션 다시 조회' : '목소리 정밀 학습 미션'}
      accessibilityHint={isError ? '탭하면 다시 불러옵니다' : '내 말투를 학습시키기 위한 목소리 녹음 화면으로 이동'}
    >
      <View style={styles.left}>
        <View style={styles.iconWrapper}>
          <Feather name="mic" size={28} color={Colors.primary.vividPink} />
        </View>
        <View style={styles.textArea}>
          <Text style={[styles.title, { color: colors.text.primary }]} numberOfLines={1}>목소리 정밀 학습</Text>
          <Text
            style={[
              styles.subtitle,
              { color: isError ? colors.state.danger : colors.text.muted },
              isError && styles.subtitleError,
            ]}
          >
            {subtitle}
          </Text>
        </View>
      </View>

      <View style={styles.statusArea}>
        {recencyLabel && <Text style={styles.recencyText}>{recencyLabel}</Text>}
        {isError ? (
          <View style={[styles.statusBadge, { backgroundColor: colors.background.card, borderColor: colors.border.primary }]}>
            <Text style={styles.statusBadgeText}>재시도</Text>
          </View>
        ) : (
          <Feather name="chevron-right" size={20} color={colors.text.muted} />
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: Radii.xxl,
    borderWidth: 1,
    padding: Spacing.xl,
    alignSelf: 'stretch',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    flex: 1,
  },
  iconWrapper: {
    width: 56,
    height: 56,
    borderRadius: Radii.xl,
    backgroundColor: Colors.glass.pink20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textArea: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.md,
    fontWeight: FontWeight.black,
  },
  subtitle: {
    fontFamily: FontFamily.sans,
    fontSize: 11,
    fontWeight: FontWeight.medium,
  },
  subtitleError: {
    textDecorationLine: 'underline',
  },
  statusArea: {
    alignItems: 'center',
    gap: 4,
  },
  recencyText: {
    fontFamily: FontFamily.sans,
    fontSize: 12,
    fontWeight: FontWeight.black,
    color: Colors.primary.vividPink,
  },
  statusBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radii.full,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontFamily: FontFamily.sans,
    fontSize: 9,
    fontWeight: FontWeight.black,
    color: Colors.primary.vividPink,
  },
});
