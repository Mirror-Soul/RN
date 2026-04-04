import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
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
const TAB_CONTAINER_WIDTH = 344.94;
const PADDING = 4;
const INDICATOR_WIDTH = (TAB_CONTAINER_WIDTH - PADDING * 2) / 2;
const TAB_CONTAINER_RADIUS = TAB_HEIGHT / 2;

/**
 * AuthTabToggle 컴포넌트
 * 로그인과 회원가입 탭을 전환하는 필(Pill) 형태의 토글 버튼.
 * Reanimated를 활용한 Spring 슬라이딩 애니메이션이 적용되어 있습니다.
 */
export default function AuthTabToggle({ activeTab, onTabChange }: AuthTabToggleProps) {
  const isLogin = activeTab === 'login';

  // --- Animation States ---
  const translateX = useSharedValue(isLogin ? 0 : INDICATOR_WIDTH);

  // activeTab 변화 시 애니메이션 트리거
  React.useEffect(() => {
    translateX.value = withSpring(isLogin ? 0 : INDICATOR_WIDTH, {
      damping: 15,
      stiffness: 120,
      mass: 0.8,
    });
  }, [isLogin, translateX]);

  // 슬라이딩 인디케이터 스타일
  const animatedIndicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  // 텍스트 색상 애니메이션 보간 (0: Login, 1: Signup)
  const loginTextStyle = useAnimatedStyle(() => {
    const color = interpolateColor(
      translateX.value,
      [0, INDICATOR_WIDTH],
      ['#000', '#99A1AF']
    );
    return { color };
  });

  const signupTextStyle = useAnimatedStyle(() => {
    const color = interpolateColor(
      translateX.value,
      [0, INDICATOR_WIDTH],
      ['#99A1AF', '#000']
    );
    return { color };
  });

  return (
    <View style={styles.container}>
      {/* Sliding Background Indicator */}
      <Animated.View style={[styles.indicatorWrapper, animatedIndicatorStyle]}>
        <LinearGradient
          colors={Colors.gradient.cyanToPurple}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.activeTab}
        />
      </Animated.View>

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
    width: TAB_CONTAINER_WIDTH,
    height: TAB_HEIGHT,
    padding: PADDING,
    borderRadius: TAB_CONTAINER_RADIUS,
    borderWidth: 0.612,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    position: 'relative', // 인디케이터 배치를 위해 absolute 기준점 설정
  },
  indicatorWrapper: {
    position: 'absolute',
    top: PADDING,
    left: PADDING,
    width: INDICATOR_WIDTH,
    height: TAB_HEIGHT - PADDING * 2,
    zIndex: 0,
  },
  tabWrapper: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1, // 텍스트가 인디케이터 위에 오도록 보장
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


