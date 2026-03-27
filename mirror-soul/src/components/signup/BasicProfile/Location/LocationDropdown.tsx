import { Colors } from '@/src/constants/theme';
import React, { useState } from 'react';
import { Dimensions, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { locationData } from './locationData';

interface LocationDropdownProps {
  onSelect: (fullLocation: string) => void;
  onClose: () => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

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
      setSelectedDistrict(null);
      setActiveTab(1);
    } else if (activeTab === 1) {
      setSelectedDistrict(item);
      setActiveTab(2);
    } else if (activeTab === 2) {
      onSelect(`${selectedCity} ${selectedDistrict} ${item}`);
      onClose(); // 선택 완료 후 명시적으로 닫기 호출
    }
  };

  const renderTab = (tabIndex: 0 | 1 | 2, title: string) => {
    const isActive = activeTab === tabIndex;
    const canClick =
      tabIndex === 0 ||
      (tabIndex === 1 && selectedCity !== null) ||
      (tabIndex === 2 && selectedDistrict !== null);

    return (
      <TouchableOpacity
        style={[styles.tabButton, isActive && styles.tabActive]}
        activeOpacity={canClick ? 0.8 : 1}
        disabled={!canClick}
        onPress={() => setActiveTab(tabIndex)}
        accessible={true}
        accessibilityRole="tab"
        accessibilityState={{ selected: isActive, disabled: !canClick }}
      >
        <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{title}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.overlayContainer}>
      {/* 바깥 영역 터치 시 닫기를 위한 투명 백드롭 */}
      <Pressable style={styles.backdrop} onPress={onClose} />

      <View style={styles.dropdownPanel}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  overlayContainer: {
    position: 'absolute',
    top: -SCREEN_HEIGHT, // 상단 영역까지 덮기 위해 위로 크게 확장
    left: -100, // 좌우 여백까지 덮기 위함
    right: -100,
    height: SCREEN_HEIGHT * 2,
    zIndex: 1000,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  dropdownPanel: {
    marginTop: SCREEN_HEIGHT + 120,
    marginHorizontal: 100,
    height: 303.5,
    padding: 0.612,
    flexDirection: 'column',
    borderRadius: 16,
    borderWidth: 0.612,
    borderColor: Colors.glass.white10,
    backgroundColor: Colors.glass.slate95,
    overflow: 'hidden',
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
    flex: 1,
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
