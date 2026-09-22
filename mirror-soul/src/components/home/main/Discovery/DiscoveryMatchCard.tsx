import { Feather } from '@expo/vector-icons';
import { Colors, FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { formatRegion } from '@/src/utils/formatRegion';
import { JOB_LABEL } from '@/src/constants/jobLabels';
import type { Recommendation } from '@/src/types/api/home';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming, runOnJS, WithSpringConfig } from 'react-native-reanimated';
import PhotoLightbox from './PhotoLightbox';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_DISTANCE_THRESHOLD = SCREEN_WIDTH * 0.3;
const SWIPE_VELOCITY_THRESHOLD = 500;

// 헤더 매칭 스위치(MainHeader.tsx)와 동일한 톤 — 기본 스프링보다 감쇠를 늘리고
// 강성을 낮춰 원위치로 돌아올 때 덜 튕기고 더 유연하게 움직이게 한다.
const CARD_SPRING_CONFIG: WithSpringConfig = {
  damping: 20,
  stiffness: 100,
  mass: 1,
};

interface DiscoveryMatchCardProps {
  match: Recommendation;
  onOpenDetail?: (match: Recommendation) => void;
  onPass: () => void;
  onConnect: () => void;
}

/**
 * DiscoveryMatchCard 컴포넌트 (SRP)
 * 발견 탭 추천 카드 UI를 담당하는 프레젠테이션 컴포넌트입니다.
 * 패스는 버튼이 아니라 카드를 좌우로 스와이프하는 제스처로 처리한다(방향과 무관하게
 * 다음 후보로 넘어감). 카드 배경/이름/메타/태그 영역을 탭하면 상세 모달이 열리고,
 * 사진을 탭하면 사진만 크게 보는 라이트박스가, 한줄소개 "더보기"는 모달이 아니라
 * 카드 안에서 텍스트를 펼치는 인라인 확장으로 각각 분리되어 있다. 통화하기만 남은
 * 명시적 버튼이다.
 */
export default function DiscoveryMatchCard({ match, onOpenDetail, onPass, onConnect }: DiscoveryMatchCardProps) {
  const { colors } = useThemeColors();
  const [imageFailed, setImageFailed] = useState(false);
  const [isSummaryTruncated, setIsSummaryTruncated] = useState(false);
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);
  const [isLightboxVisible, setIsLightboxVisible] = useState(false);
  const isScoreKnown = Number.isFinite(match.recommendationScore);

  const translateX = useSharedValue(0);

  const triggerSwipeHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  // 스와이프 제스처 밖(수직 ScrollView)과 충돌하지 않도록 수평 이동이 확실할 때만
  // 이 제스처가 가져가고, 수직으로 더 많이 움직이면 스크롤에 양보한다.
  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .failOffsetY([-15, 15])
    .onUpdate((event) => {
      translateX.value = event.translationX;
    })
    .onEnd((event) => {
      const passedThreshold =
        Math.abs(event.translationX) > SWIPE_DISTANCE_THRESHOLD || Math.abs(event.velocityX) > SWIPE_VELOCITY_THRESHOLD;

      if (passedThreshold) {
        const direction = event.translationX > 0 ? 1 : -1;
        runOnJS(triggerSwipeHaptic)();
        translateX.value = withTiming(direction * SCREEN_WIDTH * 1.5, { duration: 220 }, (finished) => {
          if (finished) {
            runOnJS(onPass)();
          }
        });
      } else {
        translateX.value = withSpring(0, CARD_SPRING_CONFIG);
      }
    });

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { rotate: `${translateX.value / 20}deg` }],
  }));

  return (
    <>
    <GestureDetector gesture={panGesture}>
    <Animated.View
      style={[styles.card, cardAnimatedStyle, { backgroundColor: colors.background.glass, borderColor: colors.border.primary }]}
    >
      {/* 상단: 고정 비율 사진 박스 (풀블리드 아님) — 탭하면 라이트박스, chevron은 상세 모달(중복이지만
          "여기 누르면 뭔가 열리는구나"를 알려주는 힌트로 의도적으로 남겨둠) */}
      <TouchableOpacity
        style={styles.photoBox}
        onPress={() => !imageFailed && setIsLightboxVisible(true)}
        activeOpacity={0.95}
        disabled={imageFailed}
        accessibilityRole="button"
        accessibilityLabel="사진 크게 보기"
      >
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
      </TouchableOpacity>

      {/* 하단: 글래스 카드 정보 섹션 — 배경을 탭하면 상세 모달(더보기 토글 자체는 안쪽에서 따로 처리) */}
      <TouchableOpacity style={styles.content} onPress={() => onOpenDetail?.(match)} activeOpacity={0.95} accessibilityRole="button" accessibilityLabel="상세 프로필 보기">
        <View style={styles.nameRow}>
          <Text style={[styles.nameText, { color: colors.text.primary }]} numberOfLines={1}>
            {match.name}
          </Text>
          {match.age !== null && (
            <View style={[styles.chip, { backgroundColor: colors.background.card, borderColor: colors.border.primary }]}>
              <Text style={[styles.chipText, { color: colors.text.secondary }]}>{match.age}세</Text>
            </View>
          )}
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

        <View>
          <Text
            style={[styles.summaryText, { color: colors.text.secondary }]}
            numberOfLines={isSummaryExpanded ? undefined : 2}
            ellipsizeMode="tail"
          >
            &quot;{match.selfIntroduction}&quot;
          </Text>

          {/* 화면 밖에서 줄바꿈 제한 없이 렌더링해 실제 줄 수를 측정한다 — numberOfLines가
              걸린 위쪽 Text는 항상 최대 2줄만 보고하므로 이걸로는 잘렸는지 알 수 없다.
              폭/폰트가 위 Text와 완전히 같아야(기기·폰트 크기와 무관하게) 정확히 측정된다. */}
          <Text
            style={[styles.summaryText, styles.summaryMeasure]}
            onTextLayout={(e) => setIsSummaryTruncated(e.nativeEvent.lines.length > 2)}
            pointerEvents="none"
          >
            &quot;{match.selfIntroduction}&quot;
          </Text>

          {/* 더보기/접기는 상세 모달이 아니라 카드 안에서 텍스트만 펼치는 인라인 확장 —
              카드 배경 탭이 이미 모달을 여니, 여기서까지 같은 곳으로 보내면 중복이다. */}
          {isSummaryTruncated && (
            <TouchableOpacity
              onPress={() => setIsSummaryExpanded((prev) => !prev)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={isSummaryExpanded ? '자기소개 접기' : '자기소개 전체 보기'}
            >
              <Text style={styles.moreText}>{isSummaryExpanded ? '접기' : '더보기'}</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.tagRow}>
          <View style={[styles.chip, { backgroundColor: colors.background.card, borderColor: colors.border.primary }]}>
            <Text style={[styles.chipText, { color: Colors.primary.electricCyan }]}>{match.mbti}</Text>
          </View>
          {match.hashtags.slice(0, 2).map((tag) => (
            <View key={tag} style={[styles.chip, { backgroundColor: colors.background.card, borderColor: colors.border.primary }]}>
              <Text style={[styles.chipText, { color: colors.text.secondary }]}>#{tag}</Text>
            </View>
          ))}
        </View>
      </TouchableOpacity>

      {/* 패스 버튼은 제거됨 — 카드를 좌우로 스와이프하는 제스처가 그 역할을 대신한다.
          통화하기만 남아 카드 하단을 그대로 채운다. */}
      <View style={[styles.buttonRow, { borderTopColor: colors.border.primary }]}>
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
    </Animated.View>
    </GestureDetector>

    <PhotoLightbox
      visible={isLightboxVisible}
      imageUrl={match.profileImageUrl}
      onClose={() => setIsLightboxVisible(false)}
    />
    </>
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
    gap: Spacing.xs,
  },
  nameText: {
    flex: 1,
    fontFamily: FontFamily.sans,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.black,
    letterSpacing: -0.3,
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
  // 실제 줄 수 측정 전용 — 화면에 보이지 않고 레이아웃 흐름에도 영향을 주지 않는다.
  // left/right:0으로 위 summaryText와 폭을 맞춰야 줄바꿈 지점이 동일하게 측정된다.
  summaryMeasure: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    opacity: 0,
  },
  moreText: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    marginTop: Spacing.xxs,
    color: Colors.primary.electricCyan,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  // 나이 배지/MBTI/해시태그가 전부 이 하나의 chip 스타일을 공유한다 — 색만
  // 텍스트에서 다르게 줘서(MBTI만 accent) "같은 모양 가족, 다른 의미"로 통일한다.
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xxs,
    borderRadius: Radii.full,
    borderWidth: 1,
  },
  chipText: {
    fontFamily: FontFamily.sans,
    fontSize: 10,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.3,
  },
  buttonRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
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
