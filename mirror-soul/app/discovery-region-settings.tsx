import { useToast } from '@/src/components/common/Toast/ToastProvider';
import RegionRadiusSlider from '@/src/components/discovery/RegionRadiusSlider';
import { Colors, FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { useRegionCoordinatesQuery } from '@/src/features/home/hooks/useRegionCoordinatesQuery';
import { useRegionSearchQuery } from '@/src/features/home/hooks/useRegionSearchQuery';
import { usePreferredRegionQuery } from '@/src/features/home/hooks/usePreferredRegionQuery';
import { useUpdatePreferredRegionMutation } from '@/src/features/home/hooks/useUpdatePreferredRegionMutation';
import type { RegionCoordinate, RegionSearchResult } from '@/src/types/api/region';
import { getErrorDisplayMessage } from '@/src/utils/apiErrorCode';
import { distanceKm, findNearestRegion, sortRegionsByDistance, takeNearest } from '@/src/utils/geoDistance';
import { logger } from '@/src/utils/logger';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, {
  Circle,
  Marker,
  PROVIDER_GOOGLE,
  type MapPressEvent,
  type MarkerDragStartEndEvent,
} from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SEOUL_CITY_HALL = {
  latitude: 37.5665,
  longitude: 126.978,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

// 당근마켓 참고 이미지와 동일하게 연속값이 아니라 4단계 고정 지점만 선택 가능하게 한다.
// 전부 백엔드 UpdatePreferredRegionDTO.nearbyCount의 @Min(1) @Max(50) 범위 안이라 백엔드 변경 불필요.
const NEARBY_COUNT_STEPS = [1, 10, 30, 50];
const DEFAULT_NEARBY_COUNT = NEARBY_COUNT_STEPS[1];

/**
 * Discovery "내 동네 설정" 화면 — 지도에서 앵커(동)를 고르고 반경 슬라이더로
 * 포함할 이웃 동 개수를 조절한다. 검색으로도, 지도 탭/드래그로도 앵커를 지정할 수 있다.
 */
export default function DiscoveryRegionSettingsScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useThemeColors();
  const { showToast } = useToast();
  const mapRef = useRef<MapView>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [anchor, setAnchor] = useState<RegionCoordinate | null>(null);
  const [nearbyCount, setNearbyCount] = useState(DEFAULT_NEARBY_COUNT);
  const hasInitializedRef = useRef(false);

  const { data: allRegions, isLoading: isCoordinatesLoading } = useRegionCoordinatesQuery();
  const { data: searchResults, isLoading: isSearching } = useRegionSearchQuery(searchQuery);
  const { data: existingPreference } = usePreferredRegionQuery();
  const updateMutation = useUpdatePreferredRegionMutation();

  const animateTo = useCallback((coordinate: { latitude: number; longitude: number }) => {
    mapRef.current?.animateToRegion(
      { ...coordinate, latitudeDelta: 0.05, longitudeDelta: 0.05 },
      300
    );
  }, []);

  // 기존에 저장된 탐색 지역이 있으면 최초 1회만 앵커/반경을 그걸로 초기화한다.
  useEffect(() => {
    if (hasInitializedRef.current || !allRegions || allRegions.length === 0) return;
    hasInitializedRef.current = true;
    if (!existingPreference) return;

    const existingAnchor = allRegions.find((region) => region.regionId === existingPreference.anchorRegionId);
    if (existingAnchor) {
      setAnchor(existingAnchor);
      setNearbyCount(existingPreference.nearbyCount);
      animateTo(existingAnchor);
    }
  }, [allRegions, existingPreference, animateTo]);

  // anchor가 바뀔 때만(슬라이더 조작 때는 X) 전체 거리 정렬을 다시 계산한다 — 5천여 건 재정렬은
  // 저렴한 연산이 아니라서, 슬라이더는 이 결과에서 자르기(takeNearest)만 하도록 분리했다.
  const sortedOthers = useMemo(
    () => (anchor && allRegions ? sortRegionsByDistance(anchor, allRegions) : []),
    [anchor, allRegions]
  );

  // 실제로 존재하는 데이터보다 큰 단계는 골라도 의미가 없으니 제외한다 — 전국 5천여 개 지역
  // 규모에선 사실상 항상 4단계가 다 남지만, 혹시 모를 데이터 누락에 대비한 방어용.
  const availableSteps = useMemo(() => {
    const filtered = NEARBY_COUNT_STEPS.filter((step) => step <= sortedOthers.length + 1);
    return filtered.length > 0 ? filtered : [1];
  }, [sortedOthers]);

  const selectedCount = availableSteps.includes(nearbyCount) ? nearbyCount : availableSteps[availableSteps.length - 1];

  const includedRegions = useMemo(
    () => (anchor ? takeNearest(anchor, sortedOthers, selectedCount) : []),
    [anchor, sortedOthers, selectedCount]
  );

  const radiusMeters = useMemo(() => {
    if (!anchor || includedRegions.length <= 1) return 0;
    const farthest = includedRegions[includedRegions.length - 1];
    return distanceKm(anchor.latitude, anchor.longitude, farthest.latitude, farthest.longitude) * 1000;
  }, [anchor, includedRegions]);

  const handleMapPress = useCallback(
    (event: MapPressEvent) => {
      if (!allRegions || allRegions.length === 0) return;
      const nearest = findNearestRegion(event.nativeEvent.coordinate, allRegions);
      if (nearest) setAnchor(nearest);
    },
    [allRegions]
  );

  const handleMarkerDragEnd = useCallback(
    (event: MarkerDragStartEndEvent) => {
      if (!allRegions || allRegions.length === 0) return;
      const nearest = findNearestRegion(event.nativeEvent.coordinate, allRegions);
      if (nearest) {
        setAnchor(nearest);
        animateTo(nearest);
      }
    },
    [allRegions, animateTo]
  );

  const handleSelectSearchResult = useCallback(
    (result: RegionSearchResult) => {
      const matched = allRegions?.find((region) => region.regionId === result.regionId);
      if (!matched) return;
      setAnchor(matched);
      setSearchQuery('');
      animateTo(matched);
    },
    [allRegions, animateTo]
  );

  const handleConfirm = useCallback(async () => {
    if (!anchor) return;
    try {
      await updateMutation.mutateAsync({
        anchorRegionId: anchor.regionId,
        nearbyCount: selectedCount,
      });
      showToast('탐색 지역이 저장됐어요.', 'success');
      router.back();
    } catch (error) {
      logger.error('discovery-region-settings: updatePreferredRegion failed', error);
      showToast(getErrorDisplayMessage(error, '지역 설정에 실패했습니다. 잠시 후 다시 시도해주세요.'), 'error');
    }
  }, [anchor, selectedCount, updateMutation, showToast]);

  const trimmedQuery = searchQuery.trim();

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={StyleSheet.absoluteFill}
        initialRegion={SEOUL_CITY_HALL}
        onPress={handleMapPress}
      >
        {anchor && (
          <>
            <Circle
              center={{ latitude: anchor.latitude, longitude: anchor.longitude }}
              radius={radiusMeters}
              fillColor="rgba(0, 211, 243, 0.12)"
              strokeColor="rgba(0, 211, 243, 0.6)"
              strokeWidth={1.5}
            />
            {/* 기본 마커(Google 빨간 핀)는 브랜드 컬러와 충돌해서 커스텀 도트 마커로 교체 */}
            <Marker
              coordinate={{ latitude: anchor.latitude, longitude: anchor.longitude }}
              draggable
              onDragEnd={handleMarkerDragEnd}
              anchor={{ x: 0.5, y: 0.5 }}
            >
              <View style={styles.markerOuter}>
                <View style={styles.markerInner} />
              </View>
            </Marker>
          </>
        )}
      </MapView>

      <TouchableOpacity
        style={[styles.closeButton, { top: insets.top + 12 }]}
        onPress={() => router.back()}
        accessibilityRole="button"
        accessibilityLabel="닫기"
      >
        <Feather name="x" size={20} color={Colors.primary.soulBlack} />
      </TouchableOpacity>

      <View style={[styles.searchWrapper, { top: insets.top + 12 }]}>
        <View style={styles.searchBox}>
          <Feather name="search" size={16} color={colors.text.muted} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="동 이름으로 검색"
            placeholderTextColor={colors.text.muted}
            style={[styles.searchInput, { color: colors.text.primary }]}
            accessibilityLabel="동 이름 검색"
          />
          {trimmedQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={8} accessibilityLabel="검색어 지우기">
              <Feather name="x-circle" size={16} color={colors.text.muted} />
            </TouchableOpacity>
          )}
        </View>

        {trimmedQuery.length > 0 && (
          <View style={[styles.searchResults, { backgroundColor: colors.background.primary }]}>
            {isSearching ? (
              <ActivityIndicator style={styles.searchResultsPadding} color={Colors.primary.electricCyan} />
            ) : searchResults && searchResults.length > 0 ? (
              searchResults.map((result) => (
                <TouchableOpacity
                  key={result.regionId}
                  style={styles.searchResultItem}
                  onPress={() => handleSelectSearchResult(result)}
                >
                  <Text style={[styles.searchResultText, { color: colors.text.primary }]}>
                    {result.sidoName} {result.sigunguName} {result.eupmyeondongName}
                  </Text>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={[styles.searchResultText, styles.searchResultsPadding, { color: colors.text.muted }]}>
                검색 결과가 없습니다.
              </Text>
            )}
          </View>
        )}
      </View>

      {isCoordinatesLoading && (
        <View style={[styles.loadingBanner, { top: insets.top + 64 }]}>
          <ActivityIndicator size="small" color={Colors.primary.electricCyan} />
          <Text style={styles.loadingBannerText}>지역 데이터를 불러오는 중...</Text>
        </View>
      )}

      <View style={[styles.bottomPanel, { paddingBottom: insets.bottom + Spacing.lg }]}>
        <View style={styles.handleBar} />
        {!anchor ? (
          <Text style={styles.promptText}>지도를 탭하거나 위에서 검색해서 내 동네를 설정해주세요.</Text>
        ) : (
          <>
            <View style={styles.anchorHeader}>
              <View style={styles.anchorIconWrapper}>
                <Feather name="map-pin" size={16} color={Colors.primary.electricCyan} />
              </View>
              <View style={styles.anchorTextGroup}>
                <Text style={styles.anchorName}>{anchor.eupmyeondongName}</Text>
                <Text style={styles.summaryText}>
                  근처 동네 {Math.max(0, includedRegions.length - 1)}개 포함
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <Text style={styles.sliderOverline}>가까운 동네 ↔ 먼 동네</Text>
            <RegionRadiusSlider steps={availableSteps} value={selectedCount} onValueChange={setNearbyCount} />
            <View style={styles.stepLabelRow}>
              {availableSteps.map((step) => (
                <Text key={step} style={styles.stepLabelText}>
                  {step}개
                </Text>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.confirmButton, updateMutation.isPending && styles.confirmButtonDisabled]}
              onPress={handleConfirm}
              disabled={updateMutation.isPending}
              accessibilityRole="button"
              accessibilityLabel="지역 설정 완료"
            >
              {updateMutation.isPending ? (
                <ActivityIndicator color={Colors.primary.soulBlack} />
              ) : (
                <Text style={styles.confirmButtonText}>설정 완료</Text>
              )}
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  closeButton: {
    position: 'absolute',
    left: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  searchWrapper: {
    position: 'absolute',
    left: 64,
    right: 16,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    height: 36,
    paddingHorizontal: Spacing.lg,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    fontFamily: FontFamily.sans,
    fontSize: FontSize.sm,
  },
  searchResults: {
    marginTop: Spacing.sm,
    borderRadius: Radii.md2,
    maxHeight: 280,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  searchResultsPadding: {
    padding: Spacing.lg,
  },
  searchResultItem: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  searchResultText: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  loadingBanner: {
    position: 'absolute',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radii.xxl,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  loadingBannerText: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.sm,
    color: '#ffffff',
  },
  bottomPanel: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    borderTopLeftRadius: Radii.xxl,
    borderTopRightRadius: Radii.xxl,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  handleBar: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0,0,0,0.12)',
    marginBottom: Spacing.lg,
  },
  promptText: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.base,
    fontWeight: FontWeight.medium,
    color: Colors.primary.soulBlack,
    textAlign: 'center',
    paddingVertical: Spacing.xl,
  },
  anchorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  anchorIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 211, 243, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  anchorTextGroup: {
    flex: 1,
  },
  anchorName: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.black,
    color: Colors.primary.soulBlack,
    letterSpacing: -0.5,
  },
  summaryText: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.primary.electricCyan,
    marginTop: 2,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(0,0,0,0.08)',
    marginVertical: Spacing.lg,
  },
  sliderOverline: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: 'rgba(0,0,0,0.45)',
    marginBottom: Spacing.md,
  },
  stepLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  stepLabelText: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: 'rgba(0,0,0,0.4)',
  },
  confirmButton: {
    height: 64,
    borderRadius: Radii.xxl,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.primary.electricCyan,
  },
  confirmButtonDisabled: {
    opacity: 0.6,
  },
  confirmButtonText: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.md,
    fontWeight: FontWeight.black,
    color: Colors.primary.soulBlack,
  },
  markerOuter: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    borderWidth: 3,
    borderColor: Colors.primary.electricCyan,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 4,
  },
  markerInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary.electricCyan,
  },
});
