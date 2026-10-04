import {Colors, Radii, FontSize, FontWeight, Spacing} from '@/src/constants/theme';
import React, { useState, useEffect, useRef } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { getSidoList, getSigunguList, getEupmyeondongList } from '@/src/services/onboardingService';
import SelectDropdownModal, { DropdownAnchor } from '@/src/components/signup/common/SelectDropdownModal';
import { useThemeColors } from '@/src/hooks/useThemeColors';

interface LocationResult {
  sidoName: string;
  sigunguName: string;
  eupmyeondongName: string;
}

interface LocationDropdownProps {
  onSelect: (result: LocationResult) => void;
  onClose: () => void;
  sigunguCache: React.MutableRefObject<Map<string, string[]>>;
  eupmyeondongCache: React.MutableRefObject<Map<string, string[]>>;
  anchor: DropdownAnchor;
}

export default function LocationDropdown({ onSelect, onClose, sigunguCache, eupmyeondongCache, anchor }: LocationDropdownProps) {
  const { colors } = useThemeColors();
  const [activeTab, setActiveTab] = useState<0 | 1 | 2>(0);
  const [selectedSido, setSelectedSido] = useState<string | null>(null);
  const [selectedSigungu, setSelectedSigungu] = useState<string | null>(null);
  
  const sidoCache = useRef<string[] | null>(null);
  const [currentList, setCurrentList] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);

  useEffect(() => {
    let current = true;
    setIsLoading(true);
    setLoadFailed(false);
    setCurrentList([]);
    const cache = activeTab === 1 ? sigunguCache.current : eupmyeondongCache.current;
    const key = activeTab === 1 ? selectedSido : `${selectedSido}_${selectedSigungu}`;
    const cached = activeTab === 0 ? sidoCache.current : key ? cache.get(key) : null;
    const load = async () => {
      try {
        let items = cached;
        if (!items) {
          const response = activeTab === 0 ? await getSidoList()
            : activeTab === 1 ? await getSigunguList({ sidoName: selectedSido! })
            : await getEupmyeondongList({ sidoName: selectedSido!, sigunguName: selectedSigungu! });
          if (!current) return;
          if (!response.isSuccess || !Array.isArray(response.result)) throw new Error('Invalid location list');
          items = response.result;
          if (activeTab === 0) sidoCache.current = items;
          else if (key) cache.set(key, items);
        }
        if (current) setCurrentList(items);
      } catch {
        if (current) setLoadFailed(true);
      } finally {
        if (current) setIsLoading(false);
      }
    };
    void load();
    return () => { current = false; };
  }, [activeTab, selectedSido, selectedSigungu, sigunguCache, eupmyeondongCache, loadAttempt]);

  const handleSelect = (item: string) => {
    if (isLoading || loadFailed) return;
    if (activeTab < 2) { setCurrentList([]); setIsLoading(true); }
    if (activeTab === 0) {
      setSelectedSido(item);
      setSelectedSigungu(null);
      setActiveTab(1);
    } else if (activeTab === 1) {
      setSelectedSigungu(item);
      setActiveTab(2);
    } else if (activeTab === 2) {
      onSelect({
        sidoName: selectedSido!,
        sigunguName: selectedSigungu!,
        eupmyeondongName: item,
      });
      onClose();
    }
  };

  const renderTab = (tabIndex: 0 | 1 | 2, title: string) => {
    const isActive = activeTab === tabIndex;
    const canClick =
      tabIndex === 0 ||
      (tabIndex === 1 && selectedSido !== null) ||
      (tabIndex === 2 && selectedSigungu !== null);

    return (
      <TouchableOpacity
        style={[styles.tabButton, isActive && styles.tabActive]}
        activeOpacity={canClick ? 0.8 : 1}
        disabled={!canClick}
        accessibilityRole="tab"
        accessibilityLabel={title}
        accessibilityState={{ selected: isActive, disabled: !canClick }}
        onPress={() => {
          if (tabIndex === activeTab) return;
          setCurrentList([]);
          setIsLoading(true);
          setActiveTab(tabIndex);
        }}
      >
        <Text style={[styles.tabText, { color: colors.text.muted }, isActive && styles.tabTextActive]}>{title}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SelectDropdownModal onClose={onClose} anchor={anchor} panelStyle={styles.dropdownPanel}>
      <ScrollView style={styles.listContainer} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator>
        <View style={[styles.tabHeader, { borderBottomColor: colors.border.primary, backgroundColor: colors.background.glass }]}>
          {renderTab(0, '시/도')}
          {renderTab(1, '시/구/군')}
          {renderTab(2, '동/읍/면')}
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={Colors.primary.electricCyan} />
          </View>
        ) : loadFailed ? (
          <View style={styles.emptyContainer}>
            <Text accessibilityRole="alert" style={[styles.emptyText, { color: colors.text.secondary }]}>지역을 불러오지 못했어요.</Text>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="지역 목록 다시 불러오기" onPress={() => setLoadAttempt(value => value + 1)} style={styles.retryButton}>
              <Text style={[styles.emptyText, { color: colors.brand.accent }]}>다시 불러오기</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.listContent}>
            {currentList.map((item) => (
              <TouchableOpacity
                key={item}
                accessibilityRole="button"
                accessibilityLabel={item}
                style={styles.listItem}
                onPress={() => handleSelect(item)}
              >
                <Text style={[styles.listItemText, { color: colors.text.primary }]}>{item}</Text>
              </TouchableOpacity>
            ))}
            {currentList.length === 0 && (
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, { color: colors.text.muted }]}>데이터가 없습니다.</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SelectDropdownModal>
  );
}

const styles = StyleSheet.create({
  dropdownPanel: {
    height: 303.5,
  },
  tabHeader: {
    minHeight: 46.4,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 0.612,
  },
  tabButton: {
    flex: 1,
    minHeight: 44,
    paddingHorizontal: Spacing.xs,
    paddingVertical: Spacing.md,
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
    fontSize: FontSize.base,
    fontWeight: FontWeight.medium,
    textAlign: 'center',
  },
  tabTextActive: {
    color: Colors.primary.electricCyan,
  },
  listContainer: {
    width: '100%',
    flex: 1,
  },
  listContent: {
    paddingTop: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    paddingBottom: Spacing.lg,
  },
  listItem: {
    width: '100%',
    paddingVertical: 11.4,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radii.md2,
  },
  listItemText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.medium,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    padding: Spacing.xxl,
    alignItems: 'center',
  },
  retryButton: { minHeight: 44, padding: Spacing.sm, justifyContent: 'center' },
  emptyText: {
    fontSize: FontSize.base,
  }
});
