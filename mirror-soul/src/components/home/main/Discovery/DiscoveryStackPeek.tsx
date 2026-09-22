import { Feather } from '@expo/vector-icons';
import { Colors, FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { formatRegion } from '@/src/utils/formatRegion';
import { JOB_LABEL } from '@/src/constants/jobLabels';
import type { Recommendation } from '@/src/types/api/home';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, SharedValue } from 'react-native-reanimated';

interface DiscoveryStackPeekProps {
  match: Recommendation;
  /** 위 카드(DiscoveryMatchCard)와 공유하는 같은 드래그 값 — 평소엔 0이라 이 카드가
      거의 안 보이다가, 위 카드를 드래그한 만큼만 실시간으로 드러난다. */
  translateX: SharedValue<number>;
  swipeThreshold: number;
}

/**
 * DiscoveryStackPeek 컴포넌트 (SRP)
 * 다음 후보 카드 — 평소(드래그 안 할 때)엔 뒤에 숨어 거의 안 보이다가, 위 카드를
 * 옆으로 미는 만큼만 살짝 드러난다(항상 뚜렷하게 보이는 정적 스택이 아님).
 * DiscoveryMatchCard와 같은 뼈대(사진 + 이름/나이 + 지역·직업 + 한줄소개 1줄)를
 * 재현하되, MBTI/해시태그 칩과 버튼처럼 가장 무거운 요소는 뺀다 — 장식 레이어가
 * 실제 카드보다 시각적으로 무거워지면(특히 앞 카드를 가리는 느낌) 안 되기 때문에,
 * 내용 범위(칩/버튼 제외)와 최대 노출 강도(opacity/scale 상한을 앞 카드보다 낮게)
 * 둘 다로 "이건 미리보기일 뿐"이라는 느낌을 유지한다. 인터랙션 없음(pointerEvents="none").
 */
export default function DiscoveryStackPeek({ match, translateX, swipeThreshold }: DiscoveryStackPeekProps) {
  const { colors } = useThemeColors();
  const [imageFailed, setImageFailed] = useState(false);

  const animatedStyle = useAnimatedStyle(() => {
    // 0(안 건드림) ~ 1(커밋 임계값에 도달) 사이로 드래그 진행도를 계산
    const progress = Math.min(Math.abs(translateX.value) / swipeThreshold, 1);
    return {
      // 내용이 늘어난 만큼, 최대 노출 강도는 오히려 낮춰서(0.9→0.75, 0.98→0.96) 앞
      // 카드보다 항상 옅게 유지한다 — 다 드러나도 "배경"으로 읽히게.
      opacity: progress * 0.75,
      transform: [{ scale: 0.88 + progress * 0.08 }, { translateY: (1 - progress) * 16 }],
    };
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.card, animatedStyle, { backgroundColor: colors.background.glass, borderColor: colors.border.primary }]}
    >
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
            onError={() => setImageFailed(true)}
          />
        )}
      </View>

      <View style={styles.infoStrip}>
        <Text style={[styles.nameText, { color: colors.text.primary }]} numberOfLines={1}>
          {match.name}
          {match.age !== null ? <Text style={styles.ageText}> {match.age}</Text> : null}
        </Text>

        <View style={styles.metaRow}>
          <Feather name="map-pin" size={12} color={colors.text.muted} />
          <Text style={[styles.metaText, { color: colors.text.muted }]} numberOfLines={1}>
            {formatRegion(match.residence)}
          </Text>
          <View style={[styles.metaDivider, { backgroundColor: colors.border.primary }]} />
          <Feather name="briefcase" size={12} color={colors.text.muted} />
          <Text style={[styles.metaText, { color: colors.text.muted }]} numberOfLines={1}>
            {JOB_LABEL[match.job]}
          </Text>
        </View>

        <Text style={[styles.summaryText, { color: colors.text.secondary }]} numberOfLines={1} ellipsizeMode="tail">
          &quot;{match.selfIntroduction}&quot;
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    ...StyleSheet.absoluteFillObject,
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
  infoStrip: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
    gap: Spacing.xs,
  },
  nameText: {
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
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
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
});
