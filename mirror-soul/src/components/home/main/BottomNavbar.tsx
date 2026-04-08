import GrowIcon from '@/assets/images/common/bottomNavbar/Grow.svg';
import HeartIcon from '@/assets/images/common/bottomNavbar/Heart.svg';
import HistoryIcon from '@/assets/images/common/bottomNavbar/History_button.svg';
import ProfileIcon from '@/assets/images/common/bottomNavbar/Profile.svg';
import SimilarityIcon from '@/assets/images/common/main/Similarity.svg';
import { Colors, Radii } from '@/src/constants/theme';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
 * BottomNavbar 컴포넌트 (SRP)
 * 메인 화면의 하단 네비게이션 바를 렌더링합니다.
 * 활성 탭은 cyan 색상으로 표시됩니다.
 */
export default function BottomNavbar({ activeTab = 'discover', onTabPress }: BottomNavbarProps) {
  return (
    <View style={styles.wrapper}>
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
              <tab.Icon width={24} height={24} />
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
    width: '100%',
    paddingHorizontal: 24,
    paddingBottom: 0,
  },
  bar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: Radii.full,
    borderWidth: 0.612,
    borderColor: Colors.glass.white20,
    backgroundColor: Colors.glass.white10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 25 },
    shadowOpacity: 0.25,
    shadowRadius: 50,
    elevation: 10,
  },
  tabItem: {
    width: 60,
    alignItems: 'center',
    gap: 4,
  },
  tabLabel: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    textAlign: 'center',
  },
});
