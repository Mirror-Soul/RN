import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Colors } from '@/src/constants/theme';
import { locationData } from './locationData';

interface LocationDropdownProps {
  onSelect: (fullLocation: string) => void;
  onClose: () => void;
}

export default function LocationDropdown({ onSelect, onClose }: LocationDropdownProps) {
  const [activeTab, setActiveTab] = useState<0 | 1 | 2>(0);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);

  // 현재 탭과 선택된 데이터에 따라 보여줄 목록 필터링
  let currentList: string[] = [];
  if (activeTab === 0) {
    currentList = Object.keys(locationData);
  } else if (activeTab === 1 && selectedCity) {
    currentList = Object.keys(locationData[selectedCity] || {});
  } else if (activeTab === 2 && selectedCity && selectedDistrict) {
    currentList = locationData[selectedCity][selectedDistrict] || [];
  }

  const handleSelect = (item: string) => {
    if (activeTab === 0) {
      setSelectedCity(item);
      setSelectedDistrict(null); // 시/도 변경 시 구/군 하위 항목 초기화
      setActiveTab(1); // 구/군으로 자동 탭 이동
    } else if (activeTab === 1) {
      setSelectedDistrict(item);
      setActiveTab(2); // 동/읍/면으로 자동 탭 이동
    } else if (activeTab === 2) {
      // 최종 동/읍/면 선택 시 onSelect 콜백 호출하여 완료
      onSelect(`${selectedCity} ${selectedDistrict} ${item}`);
    }
  };

  const renderTab = (tabIndex: 0 | 1 | 2, title: string) => {
    const isActive = activeTab === tabIndex;
    // 이전 탭으로 돌아가는 것은 자유이나, 선택 뎁스가 안 채워졌는데 강제로 미래의 탭을 누르는 것은 막음
    const canClick = 
      tabIndex === 0 || 
      (tabIndex === 1 && selectedCity !== null) || 
      (tabIndex === 2 && selectedDistrict !== null);

    return (
      <TouchableOpacity 
        style={[styles.tabButton, isActive && styles.tabActive]} 
        activeOpacity={0.8}
        onPress={() => {
          if (canClick) setActiveTab(tabIndex);
        }}
      >
        <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{title}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Top Tabs */}
      <View style={styles.tabHeader}>
        {renderTab(0, '시/도')}
        {renderTab(1, '시/구/군')}
        {renderTab(2, '동/읍/면')}
      </View>

      {/* List Area */}
      <ScrollView 
        style={styles.listContainer} 
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {currentList.map((item) => (
          <TouchableOpacity 
            key={item} 
            style={styles.listItem}
            activeOpacity={0.6}
            onPress={() => handleSelect(item)}
          >
            <Text style={styles.listItemText}>{item}</Text>
          </TouchableOpacity>
        ))}
        {currentList.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>선택 가능한 지역이 없습니다.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 120, // SelectDropdown의 높이를 고려해 UI 밀어냄
    left: 0,
    right: 0,
    height: 303.5,
    padding: 0.612,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    borderRadius: 16,
    borderWidth: 0.612,
    borderColor: Colors.glass.white10,
    backgroundColor: Colors.glass.slate95,
  },
  tabHeader: {
    height: 46.4,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 0.612,
    borderBottomColor: Colors.glass.white10,
    backgroundColor: Colors.glass.white5,
  },
  tabButton: {
    flex: 1, // 3등분
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.5,
  },
  tabActive: {
    opacity: 1,
    borderBottomWidth: 1.836,
    borderBottomColor: Colors.primary.electricCyan,
  },
  tabText: {
    color: Colors.neutral.darkGray,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    letterSpacing: -0.15,
  },
  tabTextActive: {
    color: Colors.primary.electricCyan,
  },
  listContainer: {
    width: '100%',
    height: 255.8,
  },
  listContent: {
    paddingTop: 8,
    paddingHorizontal: 8,
    paddingBottom: 16,
  },
  listItem: {
    width: '100%',
    paddingVertical: 11.4,
    paddingHorizontal: 16,
    borderRadius: 14,
  },
  listItemText: {
    color: Colors.neutral.pureWhite,
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
    letterSpacing: -0.312,
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    color: Colors.neutral.darkGray,
    fontSize: 14,
  }
});
