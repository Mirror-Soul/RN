import { Radii } from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import type { Recommendation } from '@/src/types/api/home';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  WithSpringConfig,
  SharedValue,
} from 'react-native-reanimated';
import DiscoveryCardContent from './DiscoveryCardContent';
import PhotoLightbox from './PhotoLightbox';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
// DiscoveryStackPeek도 같은 값을 기준으로 "드래그가 얼마나 진행됐는지"를 계산하므로 export한다.
export const SWIPE_DISTANCE_THRESHOLD = SCREEN_WIDTH * 0.3;
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
  /** 오른쪽으로 스와이프 — 다음 후보로 (기존 "패스"와 동일하게 서버에 스와이프 기록). */
  onPass: () => void;
  /** 왼쪽으로 스와이프 — 이전 후보로 돌아가기. 서버 기록 없이 로컬 위치만 되돌린다. */
  onGoBack: () => void;
  /** false면 이미 첫 번째 후보라 더 되돌아갈 곳이 없다는 뜻 — 왼쪽 스와이프를 커밋하지 않는다. */
  canGoBack: boolean;
  onConnect: () => void;
  /** 부모(DiscoveryMatchSection)가 소유 — DiscoveryStackPeek도 같은 값을 봐야 드래그
      진행 정도에 맞춰 뒤 카드가 반응할 수 있어서, 이 카드 안에서 만들지 않고 받는다. */
  translateX: SharedValue<number>;
}

/**
 * DiscoveryMatchCard 컴포넌트 (SRP)
 * 발견 탭 추천 카드의 제스처/변환/라이트박스 셸만 담당합니다 — 실제 정보 표시(사진/
 * 이름/메타/한줄소개/칩/버튼)는 DiscoveryCardContent가 맡고, 이 컴포넌트는 그걸
 * 감싸서 인터랙션(콜백)을 연결하기만 합니다(DiscoveryStackPeek과 내용을 공유하기
 * 위한 분리 — DiscoveryCardContent 자체 주석 참고).
 * 패스는 버튼이 아니라 카드를 좌우로 스와이프하는 제스처로 처리한다 — 오른쪽은 다음
 * 후보로, 왼쪽은 이전 후보로 돌아간다(방향에 따라 의미가 다름).
 */
export default function DiscoveryMatchCard({ match, onOpenDetail, onPass, onGoBack, canGoBack, onConnect, translateX }: DiscoveryMatchCardProps) {
  const { colors } = useThemeColors();
  const [isLightboxVisible, setIsLightboxVisible] = useState(false);

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
      const isRightSwipe = event.translationX > 0;
      // 왼쪽 스와이프인데 더 돌아갈 후보가 없으면(첫 카드) 커밋하지 않고 원위치로 되돌린다 —
      // 그대로 날아가게 두면 currentIndex가 안 바뀌어(0에서 클램프) 같은 카드가 다시 안
      // 마운트되고, 이미 화면 밖으로 이동한 상태로 멈춰 빈 화면처럼 보이게 된다.
      const canCommit = isRightSwipe || canGoBack;

      if (passedThreshold && canCommit) {
        const direction = isRightSwipe ? 1 : -1;
        runOnJS(triggerSwipeHaptic)();
        translateX.value = withTiming(direction * SCREEN_WIDTH * 1.5, { duration: 220 }, (finished) => {
          if (!finished) return;
          if (isRightSwipe) {
            runOnJS(onPass)();
          } else {
            runOnJS(onGoBack)();
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
      <DiscoveryCardContent
        match={match}
        showPhotoOverlays
        summaryExpandable
        onPhotoPress={() => setIsLightboxVisible(true)}
        onContentPress={() => onOpenDetail?.(match)}
        onConnectPress={onConnect}
      />
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
});
