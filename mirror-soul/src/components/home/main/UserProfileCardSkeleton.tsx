import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Colors, Radii } from '@/src/constants/theme';

/**
 * SkeletonBox 컴포넌트
 * 범용 shimmer 효과 박스. 재사용 가능.
 */
function SkeletonBox({
  width,
  height,
  borderRadius = 6,
}: {
  width: number | `${number}%`;
  height: number;
  borderRadius?: number;
}) {
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.4, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
    return () => cancelAnimation(opacity);
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        styles.skeletonBase,
        { width, height, borderRadius },
        animatedStyle,
      ]}
    />
  );
}

/**
 * UserProfileCardSkeleton 컴포넌트
 * 메인 홈 진입 시 프로필 데이터 로딩 중 표시하는 스켈레톤 UI.
 * UserProfileCard와 동일한 외부 레이아웃을 유지합니다.
 */
export default function UserProfileCardSkeleton() {
  return (
    <View style={styles.container}>
      <View style={styles.inner}>
        {/* 아바타 스켈레톤 */}
        <SkeletonBox width={40} height={40} borderRadius={Radii.full} />

        {/* 텍스트 스켈레톤 */}
        <View style={styles.textGroup}>
          <View style={styles.titleRow}>
            <SkeletonBox width={72} height={14} borderRadius={6} />
            <SkeletonBox width={40} height={18} borderRadius={6} />
          </View>
          <SkeletonBox width={160} height={12} borderRadius={6} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
    borderRadius: Radii.md2,
    borderWidth: 0.612,
    borderColor: Colors.glass.white10,
    backgroundColor: Colors.glass.white5,
    paddingHorizontal: 12,
    height: 70,
    justifyContent: 'center',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  textGroup: {
    flex: 1,
    gap: 6,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  skeletonBase: {
    backgroundColor: Colors.glass.white10,
  },
});
