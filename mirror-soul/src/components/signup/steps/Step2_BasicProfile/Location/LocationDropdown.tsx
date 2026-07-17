import {Colors, Radii, FontSize, FontWeight, Spacing} from '@/src/constants/theme';
import React, { useState, useEffect, useCallback } from 'react';
import { Dimensions, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, Alert } from 'react-native';
import { getSidoList, getSigunguList, getEupmyeondongList } from '@/src/services/onboardingService';

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
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function LocationDropdown({ onSelect, onClose, sigunguCache, eupmyeondongCache }: LocationDropdownProps) {
  const [activeTab, setActiveTab] = useState<0 | 1 | 2>(0);
  const [selectedSido, setSelectedSido] = useState<string | null>(null);
  const [selectedSigungu, setSelectedSigungu] = useState<string | null>(null);
  
  const [sidoList, setSidoList] = useState<string[]>([]);
  const [currentList, setCurrentList] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 마운트 시 시도 목록 로드
  useEffect(() => {
    loadSido();
  }, []);

  // 탭 변경 시 현재 목록 동기화
  useEffect(() => {
    if (activeTab === 0) {
      setCurrentList(sidoList);
    } else if (activeTab === 1 && selectedSido) {
      loadSigungu(selectedSido);
    } else if (activeTab === 2 && selectedSido && selectedSigungu) {
      loadEupmyeondong(selectedSido, selectedSigungu);
    }
  }, [activeTab, selectedSido, selectedSigungu, sidoList]);

  // 공통 API 데이터 로드 헬퍼 (DRY & Error Handling)
  const fetchWithHandling = useCallback(async (
    fetcher: () => Promise<any>, 
    onSuccess: (data: string[]) => void,
    cacheKey?: string,
    cacheRef?: React.MutableRefObject<Map<string, string[]>>
  ) => {
    try {
      setIsLoading(true);
      const res = await fetcher();
      if (res.isSuccess) {
        onSuccess(res.result);
        if (cacheKey && cacheRef) {
          cacheRef.current.set(cacheKey, res.result);
        }
      } else {
        throw new Error(res.message || '데이터를 불러오지 못했습니다.');
      }
    } catch (error: any) {
      Alert.alert('오류', '지역 정보를 불러오지 못했습니다. 다시 시도해주세요.');
      console.error('[LocationDropdown] Fetch Error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadSido = () => {
    fetchWithHandling(getSidoList, (data) => {
      setSidoList(data);
      setCurrentList(data);
    });
  };

  const loadSigungu = (sido: string) => {
    if (sigunguCache.current.has(sido)) {
      setCurrentList(sigunguCache.current.get(sido)!);
      return;
    }
    fetchWithHandling(
      () => getSigunguList({ sidoName: sido }),
      (data) => setCurrentList(data),
      sido,
      sigunguCache
    );
  };

  const loadEupmyeondong = (sido: string, sigungu: string) => {
    const key = `${sido}_${sigungu}`;
    if (eupmyeondongCache.current.has(key)) {
      setCurrentList(eupmyeondongCache.current.get(key)!);
      return;
    }
    fetchWithHandling(
      () => getEupmyeondongList({ sidoName: sido, sigunguName: sigungu }),
      (data) => setCurrentList(data),
      key,
      eupmyeondongCache
    );
  };

  const handleSelect = (item: string) => {
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
        onPress={() => setActiveTab(tabIndex)}
      >
        <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{title}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.overlayContainer}>
      <Pressable style={styles.backdrop} onPress={onClose} />

      <View style={styles.dropdownPanel}>
        <View style={styles.tabHeader}>
          {renderTab(0, '시/도')}
          {renderTab(1, '시/구/군')}
          {renderTab(2, '동/읍/면')}
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={Colors.primary.electricCyan} />
          </View>
        ) : (
          <ScrollView
            style={styles.listContainer}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {currentList.map((item) => (
              <TouchableOpacity
                key={item}
                style={styles.listItem}
                onPress={() => handleSelect(item)}
              >
                <Text style={styles.listItemText}>{item}</Text>
              </TouchableOpacity>
            ))}
            {currentList.length === 0 && (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>데이터가 없습니다.</Text>
              </View>
            )}
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlayContainer: {
    position: 'absolute',
    top: -SCREEN_HEIGHT,
    left: -100,
    right: -100,
    height: SCREEN_HEIGHT * 2,
    zIndex: 1000,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  dropdownPanel: {
    marginTop: SCREEN_HEIGHT + 70,
    marginHorizontal: 100,
    height: 303.5,
    borderRadius: Radii.lg,
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
    color: Colors.neutral.darkGray,
    fontSize: FontSize.base,
    fontWeight: FontWeight.medium,
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
    color: Colors.neutral.pureWhite,
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
  emptyText: {
    color: Colors.neutral.darkGray,
    fontSize: FontSize.base,
  }
});
