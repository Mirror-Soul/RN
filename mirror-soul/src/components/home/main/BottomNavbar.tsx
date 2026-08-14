import { Feather } from '@expo/vector-icons';
import { Colors, FontFamily, Radii, FontSize, FontWeight, Spacing } from '@/src/constants/theme';
import { BlurView } from 'expo-blur';
import React, { useCallback, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLayout, WindowSizeClass } from '@/src/hooks/useLayout';
import { useThemeColors } from '@/src/hooks/useThemeColors';

// 부유형 pill 내비바는 일반 컨텐츠 캡(useLayout의 contentMaxWidth)만큼 넓어지면 탭 사이
// 간격이 과하게 벌어져 보인다. 태블릿에서도 손이 닿기 좋은 너비로 별도 상한을 둔다.
const NAV_BAR_MAX_WIDTH: Record<WindowSizeClass, number | undefined> = {
  compact: undefined,
  medium: 480,
  expanded: 560,
};

export type BottomTabId = 'history' | 'grow' | 'discover' | 'match' | 'profile';

interface TabItem {
  id: BottomTabId;
  label: string;
  iconName: keyof typeof Feather.glyphMap;
}

const TABS: TabItem[] = [
  { id: 'history', label: '기록', iconName: 'clock' },
  { id: 'grow', label: '성장', iconName: 'trending-up' },
  { id: 'discover', label: '발견', iconName: 'compass' },
  { id: 'match', label: '매칭', iconName: 'heart' },
  { id: 'profile', label: '프로필', iconName: 'user' },
];

interface BottomNavbarProps {
  activeTab?: BottomTabId;
  onTabPress?: (tab: BottomTabId) => void;
}

/**
 * 개별 탭 아이템 컴포넌트
 * 활성 탭은 원형 액센트 배지(Common Navigation System 기준)로,
 * 비활성 탭은 무채색 아이콘+라벨로 렌더링합니다.
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
  const badgeScale = useSharedValue(isActive ? 1 : 0.6);
  const badgeOpacity = useSharedValue(isActive ? 1 : 0);

  useEffect(() => {
    badgeScale.value = withTiming(isActive ? 1 : 0.6, {
      duration: 220,
      easing: Easing.out(Easing.cubic),
    });
    badgeOpacity.value = withTiming(isActive ? 1 : 0, {
      duration: 180,
      easing: Easing.inOut(Easing.ease),
    });
  }, [isActive, badgeScale, badgeOpacity]);

  const badgeStyle = useAnimatedStyle(() => ({
    opacity: badgeOpacity.value,
    transform: [{ scale: badgeScale.value }],
  }));

  return (
    <TouchableOpacity
      style={styles.tabItem}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="tab"
      accessibilityLabel={tab.label}
      accessibilityState={{ selected: isActive }}
    >
      <View style={styles.iconSlot}>
        {isActive ? (
          <Animated.View style={[styles.activeBadge, badgeStyle]}>
            <Feather name={tab.iconName} size={22} color={Colors.primary.soulBlack} />
          </Animated.View>
        ) : (
          <Feather name={tab.iconName} size={22} color={mutedColor} />
        )}
      </View>
      <Text style={[styles.tabLabel, { color: isActive ? Colors.primary.electricCyan : mutedColor }]}>
        {tab.label}
      </Text>
    </TouchableOpacity>
  );
}

/**
 * BottomNavbar 컴포넌트
 * 모든 메인 탭 화면에서 공유하는 부유형(Floating) 글래스모피즘 내비게이션 바.
 * 현재 활성 탭은 원형 액센트 배지로 강조합니다 (Common Navigation System 기준).
 */
export default function BottomNavbar({ activeTab = 'discover', onTabPress }: BottomNavbarProps) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useThemeColors();
  const { sizeClass } = useLayout();

  const handleTabPress = useCallback(
    (tab: BottomTabId) => onTabPress?.(tab),
    [onTabPress],
  );

  return (
    <View style={[styles.wrapper, { maxWidth: NAV_BAR_MAX_WIDTH[sizeClass], bottom: insets.bottom + 16 }]}>
      {/* 그림자는 블러 클리핑(overflow: hidden)과 같은 레이어에 두면 안 보이므로 분리 */}
      <View style={[styles.shadowLayer, { shadowColor: colors.text.primary }]}>
        <BlurView
          intensity={isDark ? 40 : 60}
          tint={isDark ? 'dark' : 'light'}
          style={[styles.bar, { borderColor: colors.border.primary }]}
        >
          {/* 블러 위에 브랜드 톤을 살짝 얹어서 아이폰 탭바 같은 "흐릿하지만 색이 있는" 느낌을 낸다 */}
          <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.background.glass }]} pointerEvents="none" />

          {TABS.map((tab) => (
            <TabItem
              key={tab.id}
              tab={tab}
              isActive={tab.id === activeTab}
              onPress={() => handleTabPress(tab.id)}
              mutedColor={colors.text.muted}
            />
          ))}
        </BlurView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    width: '100%',
    paddingHorizontal: Spacing.xxl,
    alignSelf: 'center',
    zIndex: 1000,
  },
  shadowLayer: {
    borderRadius: Radii.full,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  bar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radii.full,
    borderWidth: 1,
    overflow: 'hidden', // BlurView를 pill 모양으로 클리핑
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  iconSlot: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeBadge: {
    width: 44,
    height: 44,
    borderRadius: Radii.full,
    backgroundColor: Colors.primary.electricCyan,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary.electricCyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  tabLabel: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    lineHeight: 14,
    textAlign: 'center',
  },
});
