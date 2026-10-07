import { PROFILE_PHOTO_MAX_WIDTH } from '@/src/features/profile/photo/profilePhotoPresentation';
import { Radii } from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import type { Recommendation } from '@/src/types/api/home';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useState } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import { useLayout } from '@/src/hooks/useLayout';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  WithSpringConfig,
  SharedValue,
  useSharedValue,
  cancelAnimation,
  ReduceMotion,
} from 'react-native-reanimated';
import DiscoveryCardContent from './DiscoveryCardContent';
import PhotoLightbox from './PhotoLightbox';

// DiscoveryStackPeek도 같은 값을 기준으로 "드래그가 얼마나 진행됐는지"를 계산하므로 export한다.
export const SWIPE_DISTANCE_RATIO = 0.3;
const SWIPE_VELOCITY_THRESHOLD = 500;

// 헤더 매칭 스위치(MainHeader.tsx)와 동일한 톤 — 기본 스프링보다 감쇠를 늘리고
// 강성을 낮춰 원위치로 돌아올 때 덜 튕기고 더 유연하게 움직이게 한다.
const CARD_SPRING_CONFIG: WithSpringConfig = {
  damping: 20,
  stiffness: 100,
  mass: 1,
  reduceMotion: ReduceMotion.System,
};

interface DiscoveryMatchCardProps {
  match: Recommendation;
  onOpenDetail?: (match: Recommendation) => void;
  /** 왼쪽으로 스와이프 — 다음 후보로 (PASS 기록). */
  onPass: () => void;
  /** 오른쪽으로 스와이프 — 이전 후보로 돌아가기. 서버 기록 없이 로컬 위치만 되돌린다. */
  onGoBack: () => void;
  /** 첫 번째 후보라면 이전 후보 방향(오른쪽) 이동을 막는다. */
  canGoBack: boolean;
  onConnect: () => void;
  /** 부모가 보관하고, 버튼으로 후보가 바뀔 때도 드래그 위치를 초기화한다. */
  translateX: SharedValue<number>;
  onReloadPhoto?: () => Promise<unknown>;
}

/**
 * DiscoveryMatchCard 컴포넌트 (SRP)
 * 발견 탭 추천 카드의 제스처/변환/라이트박스 셸만 담당합니다 — 실제 정보 표시(사진/
 * 이름/메타/한줄소개/칩/버튼)는 DiscoveryCardContent가 맡고, 이 컴포넌트는 그걸
 * 감싸서 인터랙션(콜백)을 연결합니다. 왼쪽 스와이프는 다음 후보로,
 * 오른쪽 스와이프는 이전 후보로 이동하며 하단 이전·다음 버튼도 함께 제공합니다.
 */
export default function DiscoveryMatchCard({
  match,
  onOpenDetail,
  onPass,
  onGoBack,
  canGoBack,
  onConnect,
  translateX,
  onReloadPhoto,
}: DiscoveryMatchCardProps) {
  const { colors } = useThemeColors();
  const { width } = useWindowDimensions();
  const { cardWidth } = useLayout();
  const [measuredWidth, setMeasuredWidth] = useState(cardWidth);
  const [isLightboxVisible, setIsLightboxVisible] = useState(false);
  const exiting = useSharedValue(false);

  useEffect(() => {
    cancelAnimation(translateX);
    translateX.value = 0;
    exiting.value = false;
    return () => { cancelAnimation(translateX); };
  }, [match.userUuid, width, translateX, exiting]);

  const triggerSwipeHaptic = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
  };

  // 스와이프 제스처 밖(수직 ScrollView)과 충돌하지 않도록 수평 이동이 확실할 때만
  // 이 제스처가 가져가고, 수직으로 더 많이 움직이면 스크롤에 양보한다.
  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .failOffsetY([-15, 15])
    .onUpdate((event) => {
      if (exiting.value) return;
      // 첫 번째 카드에서는 오른쪽(이전) 드래그를 막고 왼쪽(다음)만 허용한다.
      translateX.value = canGoBack
        ? event.translationX
        : Math.min(0, event.translationX);
    })
    .onEnd((event) => {
      if (exiting.value) return;
      const distance = Math.abs(event.translationX);
      // A tiny high-velocity flick, or a drag reversing direction, should return home.
      const intentionalFlick = distance >= 24 &&
        Math.abs(event.velocityX) > SWIPE_VELOCITY_THRESHOLD &&
        event.translationX * event.velocityX > 0;
      const passedThreshold =
        distance > Math.min(120, Math.max(48, measuredWidth * SWIPE_DISTANCE_RATIO)) || intentionalFlick;
      const isNextSwipe = (event.translationX || event.velocityX) < 0;
      // 후보가 없는 이전 방향으로 카드를 화면 밖에 보내지 않는다.
      const canCommit = isNextSwipe || canGoBack;

      if (passedThreshold && canCommit) {
        exiting.value = true;
        const direction = isNextSwipe ? -1 : 1;
        runOnJS(triggerSwipeHaptic)();
        translateX.value = withTiming(
          direction * width,
          { duration: 200, reduceMotion: ReduceMotion.System },
          (finished) => {
            if (!finished) { exiting.value = false; return; }
            if (isNextSwipe) {
              runOnJS(onPass)();
            } else {
              runOnJS(onGoBack)();
            }
          },
        );
      } else {
        translateX.value = withSpring(0, CARD_SPRING_CONFIG);
      }
    })
    .onFinalize((_event, completed) => {
      if (!completed && !exiting.value) translateX.value = withSpring(0, CARD_SPRING_CONFIG);
    });

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
    ],
  }));

  return (
    <>
      <GestureDetector gesture={panGesture}>
        <Animated.View
          onLayout={event => setMeasuredWidth(event.nativeEvent.layout.width)}
          style={[
            styles.card,
            cardAnimatedStyle,
            {
              backgroundColor: colors.background.card,
              borderColor: colors.border.primary,
            },
          ]}
        >
          <DiscoveryCardContent
            match={match}
            showPhotoOverlays
            summaryExpandable
            onPhotoPress={() => setIsLightboxVisible(true)}
            onContentPress={() => onOpenDetail?.(match)}
            onConnectPress={onConnect}
            onReloadPhoto={onReloadPhoto}
          />
        </Animated.View>
      </GestureDetector>

      <PhotoLightbox
        visible={isLightboxVisible}
        imageUrl={match.profileImageUrl ?? ''}
        onReload={onReloadPhoto}
        onClose={() => setIsLightboxVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    maxWidth: PROFILE_PHOTO_MAX_WIDTH,
    alignSelf: 'center',
    borderRadius: Radii.lg,
    overflow: 'hidden',
    borderWidth: 1,
  },
});
