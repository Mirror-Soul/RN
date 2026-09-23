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
import * as Location from 'expo-location';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
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
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [anchor, setAnchor] = useState<RegionCoordinate | null>(null);
  const [nearbyCount, setNearbyCount] = useState(DEFAULT_NEARBY_COUNT);
  const [isLocating, setIsLocating] = useState(false);
  const hasInitializedRef = useRef(false);

  // 한글 IME는 조합 중간 상태도 onChangeText로 보내서(예: "부곡" 입력 시 ㅂ→부→부ㄱ→부고→부곡),
  // 디바운스 없이 그대로 넘기면 인증 없는 공개 검색 API가 키 입력마다 호출된다.
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: allRegions, isLoading: isCoordinatesLoading } = useRegionCoordinatesQuery();
  const { data: searchResults, isLoading: isSearching } = useRegionSearchQuery(debouncedQuery);
  const { data: existingPreference, isPending: isPreferencePending } = usePreferredRegionQuery();
  const updateMutation = useUpdatePreferredRegionMutation();

  const animateTo = useCallback((coordinate: { latitude: number; longitude: number }) => {
    mapRef.current?.animateToRegion(
      { ...coordinate, latitudeDelta: 0.05, longitudeDelta: 0.05 },
      300
    );
  }, []);

  // 기존에 저장된 탐색 지역이 있으면 최초 1회만 앵커/반경을 그걸로 초기화한다.
  // 좌표 목록은 gcTime: Infinity라 재방문 시 캐시에서 즉시 준비될 수 있는 반면 선호 지역
  // 조회는 아직 진행 중(undefined)일 수 있다 — isPreferencePending으로 "조회 중"과 "미설정"을
  // 구분하지 않으면, 조회가 끝나기 전에 플래그가 닫혀 기존 설정을 영영 못 불러올 수 있다.
  useEffect(() => {
    if (hasInitializedRef.current || !allRegions || allRegions.length === 0 || isPreferencePending) return;
    hasInitializedRef.current = true;
    if (!existingPreference) return;

    const existingAnchor = allRegions.find((region) => region.regionId === existingPreference.anchorRegionId);
    if (existingAnchor) {
      setAnchor(existingAnchor);
      setNearbyCount(existingPreference.nearbyCount);
      animateTo(existingAnchor);
    }
  }, [allRegions, existingPreference, isPreferencePending, animateTo]);

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
      if (nearest) {
        setAnchor(nearest);
        // 탭한 좌표와 가장 가까운 실제 동(anchor)의 좌표가 다를 수 있어(동 단위 이산 데이터라
        // 정확히 탭한 픽셀과 동 중심이 어긋남), 지도를 그 동 중심으로 다시 맞춰줘야 "여기가
        // 내가 고른 곳"이 명확해진다 — 드래그/검색 선택과 동일하게 맞춘다.
        animateTo(nearest);
      }
    },
    [allRegions, animateTo]
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

  // 현재 위치로 이동 — GPS 좌표를 그대로 쓰지 않고 findNearestRegion으로 가장 가까운 실제
  // 동을 앵커로 잡는다(지도 탭/마커 드래그와 동일한 경로) — 그래야 백엔드가 아는 지역
  // ID(anchorRegionId)로 저장할 수 있다.
  const handleLocateMe = useCallback(async () => {
    if (!allRegions || allRegions.length === 0 || isLocating) return;
    setIsLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        showToast('위치 접근 권한이 필요합니다.', 'error');
        return;
      }
      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const nearest = findNearestRegion(
        { latitude: position.coords.latitude, longitude: position.coords.longitude },
        allRegions
      );
      if (nearest) {
        setAnchor(nearest);
        animateTo(nearest);
      }
    } catch (error) {
      logger.error('discovery-region-settings: handleLocateMe failed', error);
      showToast('현재 위치를 가져오지 못했습니다.', 'error');
    } finally {
      setIsLocating(false);
    }
  }, [allRegions, isLocating, animateTo, showToast]);

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
              fillColor="rgba(21, 93, 252, 0.12)"
              strokeColor="rgba(21, 93, 252, 0.6)"
              strokeWidth={1.5}
            />
            {/* 기본 마커(Google 빨간 핀)는 브랜드 컬러와 충돌해서 커스텀 마커로 교체 —
                점 하나만으로는 "핀"으로 안 읽혀서 실제 map-pin 아이콘을 흰 배지 위에 올린다. */}
            <Marker
              coordinate={{ latitude: anchor.latitude, longitude: anchor.longitude }}
              draggable
              onDragEnd={handleMarkerDragEnd}
              anchor={{ x: 0.5, y: 0.5 }}
              // 커스텀 마커(아이콘 포함 View)는 네이티브가 스냅샷을 찍어 이미지로 쓰는데,
              // 기본값(false)이면 최초 마운트 시 아이콘 폰트가 아직 안 그려진 스냅샷이
              // 찍혀서 흰 배지만 보이고 핀 아이콘이 영영 안 나타날 수 있다 — 계속
              // 재스냅샷하도록 켠다(마커가 이 화면엔 최대 1개뿐이라 성능 영향 미미).
              tracksViewChanges
            >
              <View style={styles.markerBadge}>
                <Feather name="map-pin" size={18} color={Colors.primary.mapMarkerBlue} />
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
          <ScrollView
            style={[styles.searchResults, { backgroundColor: colors.background.primary }]}
            keyboardShouldPersistTaps="handled"
          >
            {isSearching ? (
              <ActivityIndicator style={styles.searchResultsPadding} color={Colors.primary.electricCyan} />
            ) : searchResults && searchResults.length > 0 ? (
              searchResults.map((result) => (
                <TouchableOpacity
                  key={result.regionId}
                  style={styles.searchResultItem}
                  onPress={() => handleSelectSearchResult(result)}
                  accessibilityRole="button"
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
          </ScrollView>
        )}
      </View>

      <TouchableOpacity
        style={[styles.locateButton, { top: insets.top + 60 }]}
        onPress={handleLocateMe}
        disabled={isLocating}
        accessibilityRole="button"
        accessibilityLabel="현재 위치로 이동"
      >
        {isLocating ? (
          <ActivityIndicator size="small" color={Colors.primary.mapMarkerBlue} />
        ) : (
          <Feather name="crosshair" size={18} color={Colors.primary.mapMarkerBlue} />
        )}
      </TouchableOpacity>

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
                <Feather name="map-pin" size={16} color={Colors.primary.mapMarkerBlue} />
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
                <TouchableOpacity
                  key={step}
                  onPress={() => setNearbyCount(step)}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel={`${step}개 선택`}
                  accessibilityState={{ selected: step === selectedCount }}
                >
                  <Text style={[styles.stepLabelText, step === selectedCount && styles.stepLabelTextActive]}>
                    {step}개
                  </Text>
                </TouchableOpacity>
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
  // 검색창(높이 36) 바로 아래, 우측 정렬 — bottomPanel은 앵커 유무로 높이가 크게
  // 달라져서(프롬프트 텍스트만 있을 때 vs 슬라이더까지 다 펼쳐질 때) 그 위로 안전하게
  // 띄우려고 높이를 역산하는 대신, 높이가 고정된 검색창 기준으로 위치를 잡았다.
  locateButton: {
    position: 'absolute',
    right: 16,
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
    backgroundColor: 'rgba(21, 93, 252, 0.12)',
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
    color: Colors.primary.mapMarkerBlue,
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
  stepLabelTextActive: {
    color: Colors.primary.mapMarkerBlue,
    fontWeight: FontWeight.bold,
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
  markerBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 4,
  },
});
