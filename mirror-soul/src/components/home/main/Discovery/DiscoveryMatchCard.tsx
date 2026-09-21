import { Feather } from '@expo/vector-icons';
import { Colors, FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { formatRegion } from '@/src/utils/formatRegion';
import { JOB_LABEL } from '@/src/constants/jobLabels';
import type { Recommendation } from '@/src/types/api/home';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface DiscoveryMatchCardProps {
  match: Recommendation;
  onOpenDetail?: (match: Recommendation) => void;
  onPass: () => void;
  onConnect: () => void;
}

/**
 * DiscoveryMatchCard 컴포넌트 (SRP)
 * 발견 탭 추천 카드 UI를 담당하는 프레젠테이션 컴포넌트입니다.
 * 패스/통화하기 액션은 별도 푸터가 아니라 카드 하단에 통합되어 있다 — 얇은
 * 구분선만 두어 "하나의 카드"로 읽히면서도 정보 영역과 액션 영역이 구분되게 한다.
 */
export default function DiscoveryMatchCard({ match, onOpenDetail, onPass, onConnect }: DiscoveryMatchCardProps) {
  const { colors } = useThemeColors();
  const [imageFailed, setImageFailed] = useState(false);
  const isScoreKnown = Number.isFinite(match.recommendationScore);

  return (
    <View style={[styles.card, { backgroundColor: colors.background.glass, borderColor: colors.border.primary }]}>
      {/* 상단: 고정 비율 사진 박스 (풀블리드 아님) */}
      <View style={styles.photoBox}>
        {imageFailed ? (
          <LinearGradient colors={Colors.gradient.avatarPlaceholder} style={styles.photo}>
            <Text style={styles.photoFallbackText}>{match.name.charAt(0).toUpperCase()}</Text>
          </LinearGradient>
        ) : (
          <Image
            source={{ uri: match.profileImageUrl }}
            style={styles.photo}
            contentFit="cover"
            cachePolicy="disk"
            transition={150}
            onError={() => setImageFailed(true)}
          />
        )}

        <TouchableOpacity
          style={styles.detailButton}
          onPress={() => onOpenDetail?.(match)}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="상세 프로필 보기"
        >
          <Feather name="chevron-right" size={20} color={Colors.neutral.pureWhite} />
        </TouchableOpacity>

        {isScoreKnown && (
          <View style={styles.scoreBadge}>
            <Feather name="zap" size={11} color={Colors.primary.soulBlack} />
            <Text style={styles.scoreBadgeText}>매칭적합도 {match.recommendationScore}%</Text>
          </View>
        )}
      </View>

      {/* 하단: 글래스 카드 정보 섹션 */}
      <View style={styles.content}>
        <View style={styles.nameRow}>
          <Text style={[styles.nameText, { color: colors.text.primary }]} numberOfLines={1}>
            {match.name}
            {match.age !== null ? <Text style={styles.ageText}> {match.age}</Text> : null}
          </Text>
          {match.jobCertificationSubmitted ? (
            <Feather name="check-circle" size={18} color={Colors.primary.electricCyan} />
          ) : null}
        </View>

        <View style={styles.metaRow}>
          <Feather name="map-pin" size={13} color={colors.text.muted} />
          <Text style={[styles.metaText, { color: colors.text.muted }]} numberOfLines={1}>
            {formatRegion(match.residence)}
          </Text>
          <View style={[styles.metaDivider, { backgroundColor: colors.border.primary }]} />
          <Feather name="briefcase" size={13} color={colors.text.muted} />
          <Text style={[styles.metaText, { color: colors.text.muted }]} numberOfLines={1}>
            {JOB_LABEL[match.job]}
          </Text>
        </View>

        <Text style={[styles.summaryText, { color: colors.text.secondary }]} numberOfLines={2} ellipsizeMode="tail">
          &quot;{match.selfIntroduction}&quot;
        </Text>

        <View style={styles.tagRow}>
          <View style={styles.mbtiChip}>
            <Text style={styles.mbtiChipText}>{match.mbti}</Text>
          </View>
          {match.hashtags.slice(0, 2).map((tag) => (
            <View key={tag} style={[styles.tagChip, { backgroundColor: colors.background.card, borderColor: colors.border.primary }]}>
              <Text style={[styles.tagChipText, { color: colors.text.secondary }]}>#{tag}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 카드 안으로 통합된 액션 영역 — 얇은 구분선만으로 정보 영역과 나눠 하나의 카드처럼 보이게 한다 */}
      <View style={[styles.buttonRow, { borderTopColor: colors.border.primary }]}>
        <TouchableOpacity
          style={[styles.passButton, { backgroundColor: colors.background.glass, borderColor: colors.border.primary }]}
          onPress={onPass}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="패스"
        >
          <Feather name="x" size={16} color={colors.text.secondary} />
          <Text style={[styles.buttonText, { color: colors.text.secondary }]}>패스</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.connectButtonWrapper} onPress={onConnect} activeOpacity={0.85} accessibilityRole="button" accessibilityLabel="통화하기">
          <LinearGradient
            colors={[Colors.primary.electricCyan, Colors.primary.vividPurple]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.connectButton}
          >
            <Feather name="phone" size={14} color={Colors.primary.soulBlack} />
            <Text style={[styles.buttonText, styles.connectButtonText]}>통화하기</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: Radii.xxl,
    overflow: 'hidden',
    borderWidth: 1,
  },
  photoBox: {
    width: '100%',
    aspectRatio: 4 / 3,
  },
  photo: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoFallbackText: {
    fontFamily: FontFamily.sans,
    fontSize: 64,
    fontWeight: FontWeight.black,
    color: Colors.neutral.pureWhite,
  },
  detailButton: {
    position: 'absolute',
    top: Spacing.lg,
    right: Spacing.lg,
    width: 40,
    height: 40,
    borderRadius: Radii.full,
    backgroundColor: Colors.glass.black40,
    borderWidth: 1,
    borderColor: Colors.glass.white20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreBadge: {
    position: 'absolute',
    left: Spacing.lg,
    bottom: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xxs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radii.full,
    backgroundColor: Colors.primary.electricCyan,
  },
  scoreBadgeText: {
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.black,
    fontSize: 10,
    letterSpacing: 0.2,
    color: Colors.primary.soulBlack,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  nameText: {
    flex: 1,
    fontFamily: FontFamily.sans,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.black,
    letterSpacing: -0.3,
  },
  ageText: {
    fontWeight: FontWeight.regular,
    color: Colors.neutral.darkGray,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  metaText: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    flexShrink: 1,
  },
  metaDivider: {
    width: 1,
    height: 10,
    marginHorizontal: Spacing.xxs,
  },
  summaryText: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    lineHeight: 20,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  mbtiChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xxs,
    borderRadius: Radii.full,
    backgroundColor: Colors.glass.white10,
    borderWidth: 1,
    borderColor: Colors.glass.white20,
  },
  mbtiChipText: {
    fontFamily: FontFamily.sans,
    fontSize: 10,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.3,
    color: Colors.neutral.pureWhite,
  },
  tagChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xxs,
    borderRadius: Radii.full,
    borderWidth: 1,
  },
  tagChipText: {
    fontFamily: FontFamily.sans,
    fontSize: 10,
    fontWeight: FontWeight.bold,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    borderTopWidth: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  passButton: {
    width: 56,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xxs,
    borderWidth: 1,
    borderRadius: Radii.xl,
  },
  connectButtonWrapper: {
    flex: 1,
    height: 56,
    borderRadius: Radii.xl,
    shadowColor: Colors.primary.electricCyan,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 2,
  },
  connectButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    borderRadius: Radii.xl,
  },
  buttonText: {
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.bold,
    fontSize: FontSize.sm,
    letterSpacing: 0.2,
  },
  connectButtonText: {
    color: Colors.primary.soulBlack,
  },
});
