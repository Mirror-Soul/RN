import GrowIcon from '@/assets/images/common/bottomNavbar/Grow.svg';
import HeartIcon from '@/assets/images/common/bottomNavbar/Heart.svg';
import HistoryIcon from '@/assets/images/common/bottomNavbar/History_button.svg';
import ProfileIcon from '@/assets/images/common/bottomNavbar/Profile.svg';
import SimilarityIcon from '@/assets/images/common/main/Similarity.svg';
import { Colors, Layout, Radii } from '@/src/constants/theme';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type BottomTabId = 'history' | 'grow' | 'discover' | 'match' | 'profile';

interface TabItem {
  id: BottomTabId;
  label: string;
  Icon: React.FC<{ width: number; height: number; color?: string }>;
}

const TABS: TabItem[] = [
  { id: 'history', label: '기록', Icon: HistoryIcon as React.FC<{ width: number; height: number; color?: string }> },
  { id: 'grow', label: '성장', Icon: GrowIcon as React.FC<{ width: number; height: number; color?: string }> },
  { id: 'discover', label: '발견', Icon: SimilarityIcon as React.FC<{ width: number; height: number; color?: string }> },
  { id: 'match', label: '매칭', Icon: HeartIcon as React.FC<{ width: number; height: number; color?: string }> },
  { id: 'profile', label: '프로필', Icon: ProfileIcon as React.FC<{ width: number; height: number; color?: string }> },
];

interface BottomNavbarProps {
  activeTab?: BottomTabId;
  onTabPress?: (tab: BottomTabId) => void;
}

/**
 * BottomNavbar 컴포넌트
 * 메인 화면의 하단 네비게이션 바를 부유형(Floating)으로 렌더링합니다.
 */
export default function BottomNavbar({ activeTab = 'discover', onTabPress }: BottomNavbarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrapper, { bottom: insets.bottom + 16 }]}>
      <View style={styles.bar}>
        {TABS.map((tab) => {
          const isActive = tab.id === activeTab;
          const color = isActive ? Colors.primary.electricCyan : Colors.neutral.lightGray;
          return (
            <TouchableOpacity
              key={tab.id}
              style={styles.tabItem}
              onPress={() => onTabPress?.(tab.id)}
              activeOpacity={0.7}
              accessibilityRole="tab"
              accessibilityLabel={tab.label}
              accessibilityState={{ selected: isActive }}
            >
              <tab.Icon width={24} height={24} color={color} />
              <Text style={[styles.tabLabel, { color }]}>{tab.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    width: '100%',
    maxWidth: Layout.MAX_CONTENT_WIDTH + 48, // Padding 24 * 2 포함
    paddingHorizontal: 24,
    alignSelf: 'center',
    zIndex: 1000,
  },
  bar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: Radii.full,
    borderWidth: 1, // 선명도를 위해 약간 두껍게 조정
    borderColor: 'rgba(255, 255, 255, 0.15)', // Glassmorphism 경계 강조
    backgroundColor: 'rgba(20, 20, 20, 0.85)', // 내부가 살짝 비치되 메인 색상 유지
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  tabItem: {
    flex: 1, // 균등 배분
    alignItems: 'center',
    gap: 4,
  },
  tabLabel: {
    fontFamily: 'Inter',
    fontSize: 10, // 텍스트 겹침 방지를 위해 약간 축소
    fontWeight: '500',
    lineHeight: 14,
    textAlign: 'center',
  },
});
