import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useLayoutEffect, useState } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import type { MediaStream } from 'react-native-webrtc';
import { RTCView } from 'react-native-webrtc';
import { Colors, Radii } from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { BrowseText as Text } from '@/src/components/home/common/BrowseText';
import { fitCallPreview, previewCorner } from './callPreviewGeometry';


type CornerId = 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';

export interface CallLocalPreviewSafeArea {
  /** 헤더 아래(화면 좌표) — 이 값보다 위로는 배치하지 않는다. */
  top: number;
  /** 컨트롤 위(화면 좌표) — 이 값보다 아래로는 배치하지 않는다. */
  bottom: number;
  left: number;
  right: number;
}

interface CallLocalPreviewProps {
  isCameraOn: boolean;
  /** useAICallFlow의 localCameraStream — 아직 트랙이 안 붙었으면(토글 직후 등) null. */
  localStream: MediaStream | null;
  /** 헤더/컨트롤 오버레이를 피해서 드래그할 수 있는 영역(화면 좌표). */
  safeArea: CallLocalPreviewSafeArea;
}

/** 주어진 모서리 + 크기에서, safeArea 안에 들어가는 실제 좌상단 좌표를 계산한다. */
function cornerPosition(
  corner: CornerId,
  size: { width: number; height: number },
  safeArea: CallLocalPreviewSafeArea
) {
  'worklet';
  const isLeft = corner === 'topLeft' || corner === 'bottomLeft';
  const isTop = corner === 'topLeft' || corner === 'topRight';
  return previewCorner(isLeft, isTop, size, safeArea);
}

/** 박스 중심 좌표를 기준으로 safeArea를 4분할해서 가장 가까운 모서리를 고른다. */
function nearestCorner(centerX: number, centerY: number, safeArea: CallLocalPreviewSafeArea): CornerId {
  'worklet';
  const midX = (safeArea.left + safeArea.right) / 2;
  const midY = (safeArea.top + safeArea.bottom) / 2;
  const isLeft = centerX < midX;
  const isTop = centerY < midY;
  if (isTop) return isLeft ? 'topLeft' : 'topRight';
  return isLeft ? 'bottomLeft' : 'bottomRight';
}

/**
 * 내 카메라 셀프뷰 PIP — 드래그로 네 모서리 중 가까운 곳에 스냅되고, 탭하면 커졌다 작아졌다
 * 토글된다(FaceTime류 영상통화 앱의 셀프뷰 패턴). 위치/확대 상태는 통화마다 초기화되며
 * 저장하지 않는다.
 *
 * 카메라가 켜져 있고 스트림이 준비됐으면 실제 RTCView를 그리고, 그 외(꺼짐/스트림 획득 중)에는
 * 기존 자리표시자를 보여준다. 배경은 CallScreenBackground/AIOrb와 동일한 브랜드 그라디언트 톤으로 맞춘다.
 */
export default function CallLocalPreview({ isCameraOn, localStream, safeArea }: CallLocalPreviewProps) {
  const { colors, isDark } = useThemeColors();
  const { fontScale } = useWindowDimensions();
  const [corner, setCorner] = useState<CornerId>('topRight');
  const [isEnlarged, setIsEnlarged] = useState(false);

  const size = fitCallPreview(safeArea, isEnlarged);

  const translateX = useSharedValue(cornerPosition(corner, size, safeArea).x);
  const translateY = useSharedValue(cornerPosition(corner, size, safeArea).y);
  const boxWidth = useSharedValue(size.width);
  const boxHeight = useSharedValue(size.height);

  // corner(드래그 종료 스냅)나 isEnlarged(탭 토글), safeArea(레이아웃 변화)가 바뀔 때마다
  // 목표 위치/크기를 즉시 적용한다. 드래그 도중엔 이 effect가 아니라 pan의 onUpdate가
  // 손가락을 직접 따라가므로 여기서 건드리지 않는다.
  useLayoutEffect(() => {
    const target = cornerPosition(corner, size, safeArea);
    translateX.value = target.x;
    translateY.value = target.y;
    boxWidth.value = size.width;
    boxHeight.value = size.height;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [corner, isEnlarged, safeArea.top, safeArea.bottom, safeArea.left, safeArea.right, size.width, size.height]);

  const toggleEnlarged = useCallback(() => setIsEnlarged((prev) => !prev), []);

  // Pan 콜백은 UI 스레드 worklet으로 실행되므로, 시작 좌표 역시 공유값으로 관리한다.
  // React ref는 JS 스레드 상태라 worklet 간 드래그 시작점으로 쓰면 일관성이 보장되지 않는다.
  const dragStartX = useSharedValue(0);
  const dragStartY = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      dragStartX.value = translateX.value;
      dragStartY.value = translateY.value;
    })
    .onUpdate((event) => {
      const nextX = dragStartX.value + event.translationX;
      const nextY = dragStartY.value + event.translationY;
      // 손가락을 따라가되 safeArea 밖으로는 못 나가게 막는다(헤더/컨트롤과 겹치지 않도록).
      translateX.value = Math.min(Math.max(nextX, safeArea.left), safeArea.right - boxWidth.value);
      translateY.value = Math.min(Math.max(nextY, safeArea.top), safeArea.bottom - boxHeight.value);
    })
    .onEnd(() => {
      const centerX = translateX.value + boxWidth.value / 2;
      const centerY = translateY.value + boxHeight.value / 2;
      const next = nearestCorner(centerX, centerY, safeArea);
      // Snap immediately even if the chosen corner did not change in React state.
      const target = cornerPosition(next, { width: boxWidth.value, height: boxHeight.value }, safeArea);
      translateX.value = target.x;
      translateY.value = target.y;
      runOnJS(setCorner)(next);
    });

  // 기본 minDistance(약 10pt 이동)를 그대로 써서, 순수 탭은 pan을 활성화시키지 않고
  // tapGesture로만 넘어가게 한다 — Gesture.Race가 먼저 활성화되는 쪽을 택한다.
  const tapGesture = Gesture.Tap().onEnd(() => {
    runOnJS(toggleEnlarged)();
  });

  const composedGesture = Gesture.Race(panGesture, tapGesture);

  const animatedContainerStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    left: translateX.value,
    top: translateY.value,
    width: boxWidth.value,
    height: boxHeight.value,
  }));

  if (!isCameraOn || size.width < 48 || size.height < 64) return null;
  return (
    <GestureDetector gesture={composedGesture}>
      <Animated.View accessible accessibilityRole="button" accessibilityLabel={isEnlarged ? '내 모습 작게 보기' : '내 모습 크게 보기'} accessibilityHint="나에게만 보이는 카메라 화면이에요. 드래그로 위치를 바꿀 수 있어요."
        accessibilityActions={[{ name: 'activate' }]} onAccessibilityAction={event => { if (event.nativeEvent.actionName === 'activate') toggleEnlarged(); }} style={[styles.container, animatedContainerStyle]}>
        {isCameraOn && localStream ? (
          <RTCView
            streamURL={localStream.toURL()}
            style={styles.placeholder}
            objectFit="cover"
            mirror // 전면 카메라 셀프뷰는 좌우 반전이 자연스럽다(실제 거울처럼 보이도록)
            zOrder={1}
          />
        ) : isCameraOn ? (
          <LinearGradient
            colors={Colors.gradient.avatarPlaceholder}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.placeholder}
          >
            {/* 카메라 스트림을 아직 받아오는 중일 때만 잠깐 보이는 자리표시자 */}
            <Ionicons name="person" size={26} color={Colors.primary.electricCyan} />
          </LinearGradient>
        ) : (
          <BlurView intensity={isDark ? 40 : 60} tint={isDark ? 'dark' : 'light'} style={styles.placeholder}>
            <Ionicons name="videocam-off" size={20} color={colors.text.muted} />
          </BlurView>
        )}
        {fontScale <= 1.4 && <Text style={styles.privateLabel}>나에게만</Text>}
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: Radii.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.glass.cyan20_d3,
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  privateLabel: { position: 'absolute', bottom: 5, left: 4, right: 4, paddingVertical: 2, borderRadius: 5, fontSize: 10, lineHeight: 16, textAlign: 'center', color: Colors.neutral.pureWhite, backgroundColor: 'rgba(0,0,0,0.55)' },
});
