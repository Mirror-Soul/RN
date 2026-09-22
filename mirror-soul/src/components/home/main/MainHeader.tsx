import { Feather } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { tabHeaderStyles } from '@/src/components/home/common/tabHeaderStyles';
import { useMatchingStatus } from '@/src/features/home/hooks/useMatchingStatus';
import { AnimatedSwitch } from '@/src/components/common/AnimatedSwitch';
import type { WithSpringConfig } from 'react-native-reanimated';

interface MainHeaderProps {
  onAvatarPress?: () => void;
}

// 매칭 스위치 ON 색상 — 기본 시안-퍼플(60%)보다 옅게, 지난 조정(30%)보다는 살짝 진하게.
// 모듈 레벨 상수로 둬야 매 렌더 새 배열이 만들어지지 않아 AnimatedSwitch의 애니메이션
// useEffect가 불필요하게 재실행되지 않는다.
const MATCHING_SWITCH_GRADIENT: [string, string] = ['rgba(0, 211, 243, 0.4)', 'rgba(194, 122, 255, 0.4)'];

// 기본 스프링(damping 15/stiffness 120)보다 감쇠를 늘리고 강성을 낮춰 덜 튕기고 더 유연하게 움직이게 한다.
const MATCHING_SWITCH_SPRING: WithSpringConfig = {
  damping: 20,
  stiffness: 100,
  mass: 1,
  overshootClamping: false,
};

/**
 * MainHeader 컴포넌트 (SRP)
 * 좌측은 매칭 On/Off 스위치, 중앙은 "Discovery" 타이틀, 우측은 아바타(퀵액션시트 진입)
 * 버튼을 렌더링합니다. 매칭 스위치는 공용 AnimatedSwitch(알림 설정 등에서 이미 쓰는
 * 컴포넌트)를 재사용해 "탭 가능한 토글"이라는 것이 형태만으로 바로 읽히게 하고,
 * ON 그라디언트는 기본값보다 옅은 톤으로 오버라이드해 헤더에서 튀지 않게 한다.
 */
export default function MainHeader({ onAvatarPress }: MainHeaderProps) {
  const { colors } = useThemeColors();
  const { matchingEnabled, handleToggle, isLoading, isToggling } = useMatchingStatus();
  const isMatching = matchingEnabled ?? false;

  return (
    <View style={styles.container}>
      <View style={styles.switchSlot}>
        <AnimatedSwitch
          value={isMatching}
          onToggle={handleToggle}
          disabled={isLoading || isToggling || matchingEnabled === null}
          accessibilityLabel={isMatching ? '매칭 중단하기' : '매칭 시작하기'}
          activeGradientColors={MATCHING_SWITCH_GRADIENT}
          springConfig={MATCHING_SWITCH_SPRING}
        />
      </View>

      <View style={styles.titleWrapper}>
        <Text style={[styles.title, { color: colors.text.primary }]}>Discovery</Text>
      </View>

      <TouchableOpacity
        style={[styles.iconButton, { backgroundColor: colors.background.glass, borderColor: colors.border.primary }]}
        onPress={onAvatarPress}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="내 계정 메뉴 열기"
      >
        <Feather name="user" size={20} color={colors.text.secondary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: tabHeaderStyles.container,
  iconButton: tabHeaderStyles.iconButton,
  // 우측 iconButton(44px)과 폭을 맞춰 타이틀이 계속 중앙에 오도록 한다.
  switchSlot: {
    width: 44,
    height: 44,
    justifyContent: 'center',
  },
  titleWrapper: {
    alignItems: 'center',
  },
  title: tabHeaderStyles.title,
});
