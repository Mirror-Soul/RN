import GrowIcon from '@/assets/images/common/bottomNavbar/Grow.svg';
import HeartIcon from '@/assets/images/common/bottomNavbar/Heart.svg';
import HistoryIcon from '@/assets/images/common/bottomNavbar/History_button.svg';
import ProfileIcon from '@/assets/images/common/bottomNavbar/Profile.svg';
import SimilarityMainIcon from '@/assets/images/common/main/Similarity.svg';
import {Colors, FontFamily, Layout, Radii, FontSize, FontWeight, Spacing} from '@/src/constants/theme';
import React, { useCallback, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '@/src/hooks/useThemeColors';

export type BottomTabId = 'history' | 'grow' | 'discover' | 'match' | 'profile';

interface TabItem {
  id: BottomTabId;
  label: string;
  Icon: React.FC<{ width: number; height: number; color?: string }>;
}

const TABS: TabItem[] = [
  { id: 'history', label: '기록', Icon: HistoryIcon as React.FC<{ width: number; height: number; color?: string }> },
  { id: 'grow', label: '성장', Icon: GrowIcon as React.FC<{ width: number; height: number; color?: string }> },
  { id: 'discover', label: '발견', Icon: SimilarityMainIcon as React.FC<{ width: number; height: number; color?: string }> },
  { id: 'match', label: '매칭', Icon: HeartIcon as React.FC<{ width: number; height: number; color?: string }> },
  { id: 'profile', label: '프로필', Icon: ProfileIcon as React.FC<{ width: number; height: number; color?: string }> },
];

interface BottomNavbarProps {
  activeTab?: BottomTabId;
  onTabPress?: (tab: BottomTabId) => void;
}

/**
 * 개별 탭 아이템 컴포넌트
 * 활성화 상태에 따라 아이콘 scale + 그라디언트 dot indicator 표시.
 */
function TabItem({
  tab,
  isActive,
  onPress,
  mutedColor,
}: {
  tab: TabItem;
  isActive: boolean;
  onPress: () => void;
  mutedColor: string;
}) {
  const scale = useSharedValue(isActive ? 1.1 : 1);
  const dotOpacity = useSharedValue(isActive ? 1 : 0);

  useEffect(() => {
    scale.value = withTiming(isActive ? 1.1 : 1, {
      duration: 200,
      easing: Easing.inOut(Easing.ease),
    });
    dotOpacity.value = withTiming(isActive ? 1 : 0, {
      duration: 200,
      easing: Easing.inOut(Easing.ease),
    });
  }, [isActive, scale, dotOpacity]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const dotStyle = useAnimatedStyle(() => ({
    opacity: dotOpacity.value,
  }));

  const color = isActive ? Colors.primary.electricCyan : mutedColor;

  return (
    <TouchableOpacity
      style={styles.tabItem}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="tab"
      accessibilityLabel={tab.label}
      accessibilityState={{ selected: isActive }}
    >
      <Animated.View style={iconStyle}>
        <tab.Icon width={24} height={24} color={color} />
      </Animated.View>
      <Text style={[styles.tabLabel, { color }]}>{tab.label}</Text>

      {/* 그라디언트 Dot indicator */}
      <Animated.View style={[styles.dotWrapper, dotStyle]}>
        <LinearGradient
          colors={Colors.gradient.cyanToPurple}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.dot}
        />
      </Animated.View>
    </TouchableOpacity>
  );
}

/**
 * BottomNavbar 컴포넌트
 * 메인 화면의 하단 부유형(Floating) 네비게이션 바.
 * 각 탭 전환 시 scale + dot indicator 애니메이션 적용.
 */
export default function BottomNavbar({ activeTab = 'discover', onTabPress }: BottomNavbarProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useThemeColors();

  const handleTabPress = useCallback(
    (tab: BottomTabId) => onTabPress?.(tab),
    [onTabPress],
  );

  return (
    <View style={[styles.wrapper, { bottom: insets.bottom + 16 }]}>
      <View
        style={[
          styles.bar,
          { backgroundColor: colors.background.glass, borderColor: colors.border.primary, shadowColor: colors.text.primary },
        ]}
      >
        {TABS.map((tab) => (
          <TabItem
            key={tab.id}
            tab={tab}
            isActive={tab.id === activeTab}
            onPress={() => handleTabPress(tab.id)}
            mutedColor={colors.text.muted}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    width: '100%',
    maxWidth: Layout.MAX_CONTENT_WIDTH + 48,
    paddingHorizontal: Spacing.xxl,
    alignSelf: 'center',
    zIndex: 1000,
  },
  bar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radii.full,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.xs,
    position: 'relative',
  },
  tabLabel: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    lineHeight: 14,
    textAlign: 'center',
  },
  dotWrapper: {
    position: 'absolute',
    bottom: -12,
    alignSelf: 'center',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});
