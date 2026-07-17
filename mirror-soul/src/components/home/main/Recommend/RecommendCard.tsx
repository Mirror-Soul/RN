import CancelIcon from '@/assets/images/common/Cancel.svg';
import LocationIcon from '@/assets/images/common/Location.svg';
import HeartIcon from '@/assets/images/common/main/Heart.svg';
import InfoIcon from '@/assets/images/common/main/Info.svg';
import SimilarityIcon from '@/assets/images/common/main/Similarity.svg';
import {Colors, Radii, FontFamily, FontSize, FontWeight, Spacing} from '@/src/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useThemeColors } from '@/src/hooks/useThemeColors';

export interface RecommendCardData {
  id: string;
  name: string;
  age: number;
  location: string;
  description: string;
  similarityPercent: number;
}

interface RecommendCardProps {
  data: RecommendCardData;
  onPass?: (id: string) => void;
  onLike?: (id: string) => void;
  onInfo?: (id: string) => void;
}

/**
 * RecommendCard 컴포넌트 (SRP)
 * 추천 사용자 카드 UI를 렌더링합니다.
 * — 상단: Info 버튼, 유사도 배지
 * — 하단: 이름/나이, 지역, 소개, 패스/관심 버튼
 */
export default function RecommendCard({ data, onPass, onLike, onInfo }: RecommendCardProps) {
  const { colors, isDark } = useThemeColors();

  return (
    <View style={[styles.card, { backgroundColor: colors.background.card, borderColor: colors.border.primary }]}>
      {/* 카드 상단 배지 영역 */}
      <View style={styles.badgeRow}>
        {/* Info 버튼 */}
        <TouchableOpacity
          style={[styles.iconButton, { backgroundColor: colors.background.card, borderColor: colors.border.primary }]}
          onPress={() => onInfo?.(data.id)}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="상세 정보 보기"
        >
          <InfoIcon width={16} height={16} />
        </TouchableOpacity>

        {/* 유사도 배지 */}
        <View style={[styles.similarityBadge, { backgroundColor: colors.background.card, borderColor: colors.border.primary }]}>
          <SimilarityIcon width={14} height={14} />
          <Text style={[styles.similarityText, { color: colors.text.primary }]}>{data.similarityPercent}%</Text>
        </View>
      </View>

      {/* 카드 하단 정보 영역 (그라디언트 오버레이) */}
      <LinearGradient
        colors={['transparent', isDark ? (Colors.glass.black80 as string) : 'rgba(255,255,255,0.95)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.infoGradient}
      >
        {/* 이름 + 나이 */}
        <Text style={[styles.nameText, { color: colors.text.primary }]}>{data.name}, {data.age}</Text>

        {/* 지역 */}
        <View style={styles.locationRow}>
          <LocationIcon width={14} height={14} />
          <Text style={[styles.locationText, { color: colors.text.secondary }]}>{data.location}</Text>
        </View>

        {/* 소개 */}
        <Text style={[styles.descriptionText, { color: colors.text.secondary }]} numberOfLines={3}>{data.description}</Text>

        {/* 버튼 영역 */}
        <View style={styles.actionRow}>
          {/* 패스 버튼 */}
          <TouchableOpacity
            style={[styles.passButton, { backgroundColor: colors.background.card, borderColor: colors.border.primary }]}
            onPress={() => onPass?.(data.id)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="패스"
          >
            <CancelIcon width={16} height={16} />
            <Text style={[styles.passText, { color: colors.text.secondary }]}>패스</Text>
          </TouchableOpacity>

          {/* 관심 버튼 */}
          <LinearGradient
            colors={[Colors.glass.cyan20, Colors.glass.purple20]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.likeButtonGradient}
          >
            <TouchableOpacity
              style={styles.likeButton}
              onPress={() => onLike?.(data.id)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="관심"
            >
              <HeartIcon width={16} height={16} />
              <Text style={styles.likeText}>관심</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignSelf: 'stretch',
    height: 480,
    borderRadius: Radii.xl,
    borderWidth: 0.612,
    overflow: 'hidden',
    justifyContent: 'space-between',
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: Spacing.lg,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: Radii.full,
    borderWidth: 0.612,
    justifyContent: 'center',
    alignItems: 'center',
  },
  similarityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingLeft: Spacing.md,
    paddingRight: Spacing.sm,
    height: 34,
    borderRadius: Radii.full,
    borderWidth: 0.612,
  },
  similarityText: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.base,
    fontWeight: FontWeight.medium,
    lineHeight: 20,
    letterSpacing: -0.15,
  },
  infoGradient: {
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  nameText: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.medium,
    lineHeight: 32,
    letterSpacing: 0.07,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  locationText: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.base,
    fontWeight: FontWeight.regular,
    lineHeight: 20,
    letterSpacing: -0.15,
  },
  descriptionText: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.base,
    fontWeight: FontWeight.regular,
    lineHeight: 20,
    letterSpacing: -0.15,
    width: '100%',
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  passButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
    height: 46,
    borderRadius: Radii.md2,
    borderWidth: 0.612,
  },
  passText: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.base,
    fontWeight: FontWeight.medium,
    lineHeight: 20,
    letterSpacing: -0.15,
    textAlign: 'center',
  },
  likeButtonGradient: {
    flex: 1,
    borderRadius: Radii.md2,
    borderWidth: 0.612,
    borderColor: Colors.glass.cyan30_d3,
    overflow: 'hidden',
  },
  likeButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
    height: 46,
  },
  likeText: {
    color: Colors.primary.electricCyan,
    fontFamily: FontFamily.sans,
    fontSize: FontSize.base,
    fontWeight: FontWeight.medium,
    lineHeight: 20,
    letterSpacing: -0.15,
    textAlign: 'center',
  },
});
