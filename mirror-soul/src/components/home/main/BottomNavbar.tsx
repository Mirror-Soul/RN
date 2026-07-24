import GrowIcon from '@/assets/images/common/bottomNavbar/Grow.svg';
import HeartIcon from '@/assets/images/common/bottomNavbar/Heart.svg';
import HistoryIcon from '@/assets/images/common/bottomNavbar/History_button.svg';
import ProfileIcon from '@/assets/images/common/bottomNavbar/Profile.svg';
import SimilarityMainIcon from '@/assets/images/common/main/Similarity.svg';
import { Colors, FontFamily, Layout, Radii, FontSize, FontWeight, Spacing } from '@/src/constants/theme';
import React, { useCallback, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
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
      {isActive ? (
        <Animated.View style={[styles.activeBadge, badgeStyle]}>
          <tab.Icon width={22} height={22} color={Colors.primary.soulBlack} />
        </Animated.View>
      ) : (
        <tab.Icon width={22} height={22} color={mutedColor} />
      )}
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
    marginBottom: 4,
  },
  tabLabel: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    lineHeight: 14,
    textAlign: 'center',
  },
});
