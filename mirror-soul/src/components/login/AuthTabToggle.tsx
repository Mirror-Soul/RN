import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, LayoutChangeEvent } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolateColor,
} from 'react-native-reanimated';
import { Colors, Radii } from '@/src/constants/theme';

interface AuthTabToggleProps {
  activeTab: 'login' | 'signup';
  onTabChange: (tab: 'login' | 'signup') => void;
}

const TAB_HEIGHT = 53.2;
const PADDING = 4;
const TAB_CONTAINER_RADIUS = TAB_HEIGHT / 2;

/**
 * AuthTabToggle 컴포넌트
 * 로그인과 회원가입 탭을 전환하는 필(Pill) 형태의 토글 버튼.
 * Reanimated를 활용한 Spring 슬라이딩 애니메이션이 적용되어 있습니다.
 * onLayout을 통해 실제 컨테이너 너비를 측정하여 반응형으로 동작합니다.
 */
export default function AuthTabToggle({ activeTab, onTabChange }: AuthTabToggleProps) {
  const [containerWidth, setContainerWidth] = useState(0);
  const isLogin = activeTab === 'login';

  // 인디케이터 너비 계산 (PADDING 제외한 영역의 절반)
  const indicatorWidth = containerWidth > 0 ? (containerWidth - PADDING * 2) / 2 : 0;

  // --- Animation States ---
  const translateX = useSharedValue(0);

  const onLayout = useCallback((event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setContainerWidth(width);
  }, []);

  // activeTab 또는 indicatorWidth 변화 시 애니메이션 트리거
  React.useEffect(() => {
    if (containerWidth > 0) {
      translateX.value = withSpring(isLogin ? 0 : indicatorWidth, {
        damping: 15,
        stiffness: 120,
        mass: 0.8,
      });
    }
  }, [isLogin, indicatorWidth, containerWidth, translateX]);

  // 슬라이딩 인디케이터 스타일
  const animatedIndicatorStyle = useAnimatedStyle(() => ({
    width: indicatorWidth,
    transform: [{ translateX: translateX.value }],
  }));

  // 텍스트 색상 애니메이션 보간 (0: Login, indicatorWidth: Signup)
  const loginTextStyle = useAnimatedStyle(() => {
    const color = interpolateColor(
      translateX.value,
      [0, Math.max(1, indicatorWidth)],
      ['#000', '#99A1AF']
    );
    return { color };
  });

  const signupTextStyle = useAnimatedStyle(() => {
    const color = interpolateColor(
      translateX.value,
      [0, Math.max(1, indicatorWidth)],
      ['#99A1AF', '#000']
    );
    return { color };
  });

  return (
    <View style={styles.container} onLayout={onLayout}>
      {/* Sliding Background Indicator */}
      {containerWidth > 0 && (
        <Animated.View style={[styles.indicatorWrapper, animatedIndicatorStyle]}>
          <LinearGradient
            colors={Colors.gradient.cyanToPurple}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.activeTab}
          />
        </Animated.View>
      )}

      {/* Login Tab Button */}
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => onTabChange('login')}
        style={styles.tabWrapper}
      >
        <Animated.Text style={[styles.tabText, loginTextStyle]}>로그인</Animated.Text>
      </TouchableOpacity>

      {/* Signup Tab Button */}
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => onTabChange('signup')}
        style={styles.tabWrapper}
      >
        <Animated.Text style={[styles.tabText, signupTextStyle]}>회원가입</Animated.Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    width: '100%',
    height: TAB_HEIGHT,
    padding: PADDING,
    borderRadius: TAB_CONTAINER_RADIUS,
    borderWidth: 0.612,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    position: 'relative', 
  },
  indicatorWrapper: {
    position: 'absolute',
    top: PADDING,
    left: PADDING,
    height: TAB_HEIGHT - PADDING * 2,
    zIndex: 0,
  },
  tabWrapper: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  activeTab: {
    flex: 1,
    borderRadius: Radii.full,
  },
  tabText: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    letterSpacing: -0.15,
  },
});


