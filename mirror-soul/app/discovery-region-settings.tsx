import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View, useWindowDimensions } from 'react-native';
import MapView, { Circle, Marker, PROVIDER_GOOGLE, type MapPressEvent, type MarkerDragStartEndEvent } from 'react-native-maps';
import { Feather } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BrowseText as Text } from '@/src/components/home/common/BrowseText';
import { useToast } from '@/src/components/common/Toast/ToastProvider';
import RegionRadiusSlider from '@/src/components/discovery/RegionRadiusSlider';
import { useMatchingDesign } from '@/src/features/match/components/MatchingDesign';
import { useRegionCoordinatesQuery } from '@/src/features/home/hooks/useRegionCoordinatesQuery';
import { useRegionSearchQuery } from '@/src/features/home/hooks/useRegionSearchQuery';
import { usePreferredRegionQuery } from '@/src/features/home/hooks/usePreferredRegionQuery';
import { useUpdatePreferredRegionMutation } from '@/src/features/home/hooks/useUpdatePreferredRegionMutation';
import type { RegionCoordinate, RegionSearchResult } from '@/src/types/api/region';
import { distanceKm, findNearestRegion, sortRegionsByDistance, takeNearest } from '@/src/utils/geoDistance';
import { getErrorDisplayMessage } from '@/src/utils/apiErrorCode';
import { logger } from '@/src/utils/logger';
import { useAuthStore } from '@/src/store/useAuthStore';

const SEOUL_CITY_HALL = { latitude: 37.5665, longitude: 126.978, latitudeDelta: 0.05, longitudeDelta: 0.05 };
const COUNT_STEPS = [1, 10, 30, 50];

export default function DiscoveryRegionSettingsScreen() {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const { colors, palette } = useMatchingDesign();
  const { showToast } = useToast();
  const map = useRef<MapView>(null);
  const alive = useRef(true);
  const initialized = useRef(false);
  const locateLock = useRef(false);
  const saveLock = useRef(false);
  const selectionVersion = useRef(0);
  const permissionVersion = useRef(0);
  const locateTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [search, setSearch] = useState('');
  const [keyword, setKeyword] = useState('');
  const [anchor, setAnchor] = useState<RegionCoordinate | null>(null);
  const [nearbyCount, setNearbyCount] = useState(10);
  const [mapReady, setMapReady] = useState(false);
  const [mapSize, setMapSize] = useState({ width: 0, height: 0 });
  const [viewportHeight, setViewportHeight] = useState<number | null>(null);
  const [headerHeight, setHeaderHeight] = useState(insets.top + 64);
  const [confirmHeight, setConfirmHeight] = useState(48);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [locationFocus, setLocationFocus] = useState<{ latitude: number; longitude: number } | null>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const coordinates = useRegionCoordinatesQuery();
  const preference = usePreferredRegionQuery();
  const searchQuery = useRegionSearchQuery(keyword);
  const update = useUpdatePreferredRegionMutation();
  const allRegions = useMemo(() => coordinates.data?.filter(region => Number.isFinite(region.latitude) && Number.isFinite(region.longitude) && Math.abs(region.latitude) <= 90 && Math.abs(region.longitude) <= 180) ?? [], [coordinates.data]);
  const blocked = update.isPending;

  useEffect(() => {
    alive.current = true;
    // Read permission without prompting. Only the location button asks for access.
    const version = permissionVersion.current;
    void Location.getForegroundPermissionsAsync().then(result => { if (alive.current && version === permissionVersion.current) setPermissionGranted(result.granted); }).catch(() => {});
    return () => { alive.current = false; if (locateTimer.current) clearTimeout(locateTimer.current); };
  }, []);
  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => { show.remove(); hide.remove(); };
  }, []);
  useEffect(() => {
    const timer = setTimeout(() => setKeyword(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);
  useEffect(() => {
    if (initialized.current || !allRegions.length || preference.isPending || preference.isError) return;
    initialized.current = true;
    if (!preference.data) return;
    const existing = allRegions.find(region => region.regionId === preference.data?.anchorRegionId);
    if (existing) {
      setAnchor(existing);
      setNearbyCount(Number.isSafeInteger(preference.data.nearbyCount) && preference.data.nearbyCount >= 1 && preference.data.nearbyCount <= 50 ? preference.data.nearbyCount : 10);
    }
  }, [allRegions, preference.data, preference.isPending, preference.isError]);

  const sorted = useMemo(() => anchor ? sortRegionsByDistance(anchor, allRegions) : [], [anchor, allRegions]);
  const steps = useMemo(() => COUNT_STEPS.filter(step => step <= sorted.length + 1), [sorted.length]);
  // Preserve older API counts (2..49) on entry; the explicit buttons set the new fixed stages.
  const count = Math.max(1, Math.min(nearbyCount, sorted.length + 1));
  const included = useMemo(() => anchor ? takeNearest(anchor, sorted, count) : [], [anchor, sorted, count]);
  const radius = useMemo(() => anchor && included.length > 1 ? distanceKm(anchor.latitude, anchor.longitude, included[included.length - 1].latitude, included[included.length - 1].longitude) * 1000 : 0, [anchor, included]);

  useEffect(() => {
    if (!mapReady || !mapSize.width || !mapSize.height || !anchor) return;
    if (included.length === 1 && !locationFocus) map.current?.animateToRegion({ latitude: anchor.latitude, longitude: anchor.longitude, latitudeDelta: 0.012, longitudeDelta: 0.012 }, 250);
    else map.current?.fitToCoordinates(locationFocus ? [...included, locationFocus] : included, { edgePadding: { top: Math.min(52, mapSize.height / 4), bottom: Math.min(52, mapSize.height / 4), left: 24, right: 48 }, animated: true });
  }, [anchor, included, mapReady, mapSize, locationFocus]);

  const select = useCallback((region: RegionCoordinate, position: { latitude: number; longitude: number } | null = null) => {
    if (saveLock.current) return;
    selectionVersion.current += 1;
    initialized.current = true; // A late GET must not replace a manual choice.
    setAnchor(region);
    setLocationFocus(position);
    setSearch(''); setKeyword('');
    Keyboard.dismiss();
  }, []);
  const onMapPress = (event: MapPressEvent) => {
    if (event.nativeEvent.action === 'marker-press') return;
    if (search) { setSearch(''); setKeyword(''); Keyboard.dismiss(); return; }
    const nearest = findNearestRegion(event.nativeEvent.coordinate, allRegions);
    if (nearest) select(nearest);
  };
  const onDragEnd = (event: MarkerDragStartEndEvent) => {
    const nearest = findNearestRegion(event.nativeEvent.coordinate, allRegions);
    if (nearest) select(nearest);
  };
  const selectSearch = (result: RegionSearchResult) => {
    const matched = allRegions.find(region => region.regionId === result.regionId);
    if (matched) select(matched);
    else showToast('지도 정보를 불러온 뒤 다시 선택해 주세요.', 'error');
  };
  const locate = async () => {
    if (locateLock.current || saveLock.current || !allRegions.length) return;
    const version = selectionVersion.current;
    permissionVersion.current += 1;
    locateLock.current = true; setIsLocating(true);
    try {
      const result = await Location.requestForegroundPermissionsAsync();
      if (!alive.current) return;
      setPermissionGranted(result.granted);
      if (!result.granted) { showToast('현재 위치를 보려면 기기 설정에서 위치 접근을 허용해 주세요.', 'error'); return; }
      const position = await Promise.race([
        Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
        new Promise<never>((_resolve, reject) => { locateTimer.current = setTimeout(() => reject(new Error('location timeout')), 15000); }),
      ]);
      if (!alive.current) return;
      const nearest = findNearestRegion(position.coords, allRegions);
      if (nearest && version === selectionVersion.current) select(nearest, { latitude: position.coords.latitude, longitude: position.coords.longitude });
    } catch (error) {
      if (alive.current) { logger.warn('Could not locate discovery region', error); showToast('현재 위치를 확인하지 못했어요. 지도나 검색으로 동네를 선택해 주세요.', 'error'); }
    } finally {
      if (locateTimer.current) clearTimeout(locateTimer.current);
      locateLock.current = false;
      if (alive.current) setIsLocating(false);
    }
  };
  const confirm = async () => {
    const session = useAuthStore.getState();
    if (!anchor || saveLock.current || isLocating || !session.isLoggedIn || !session.userUuid) return;
    const userUuid = session.userUuid;
    saveLock.current = true;
    Keyboard.dismiss();
    try {
      await update.mutateAsync({ anchorRegionId: anchor.regionId, nearbyCount: count });
      if (alive.current && useAuthStore.getState().isLoggedIn && useAuthStore.getState().userUuid === userUuid) { showToast('탐색 지역을 저장했어요.', 'success'); router.back(); }
    } catch (error) {
      if (alive.current && useAuthStore.getState().userUuid === userUuid) showToast(getErrorDisplayMessage(error, '저장하지 못했어요. 다시 시도해 주세요.'), 'error');
    } finally { saveLock.current = false; }
  };
  const statusText = coordinates.isError ? '지도 정보를 불러오지 못했어요.' : coordinates.isLoading ? '지도 정보를 불러오고 있어요…' : !allRegions.length ? '선택할 동네 정보가 없어요.' : preference.isError ? '저장된 지역을 불러오지 못했어요.' : null;
  const trim = search.trim();
  const bottomPadding = Math.max(12, insets.bottom);
  const availableHeight = (viewportHeight ?? height) - headerHeight - confirmHeight - bottomPadding - 12;
  const panelLimit = Math.max(0, Math.min(availableHeight * 0.55, availableHeight - 64));
  const pin = palette.cyanInk;

  return <KeyboardAvoidingView onLayout={event => setViewportHeight(event.nativeEvent.layout.height)} style={[styles.screen, { backgroundColor: colors.background.primary }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <View onLayout={event => setHeaderHeight(event.nativeEvent.layout.height)} style={[styles.header, { paddingTop: insets.top + 8, paddingLeft: insets.left + 12, paddingRight: insets.right + 12 }]}>
      <Pressable accessibilityRole="button" accessibilityLabel="지역 설정 닫기" onPress={() => { Keyboard.dismiss(); router.back(); }} style={styles.iconButton}><Feather name="chevron-left" size={24} color={colors.text.primary} /></Pressable>
      <View style={[styles.searchBox, { borderColor: colors.border.primary, backgroundColor: colors.background.card }]}>
        <Feather name="search" size={18} color={colors.text.secondary} />
        <TextInput value={search} onChangeText={setSearch} editable={!blocked} placeholder="동네 이름 검색" placeholderTextColor={colors.text.muted} accessibilityLabel="동 이름 검색" returnKeyType="search" onSubmitEditing={Keyboard.dismiss} style={[styles.searchInput, { color: colors.text.primary }]} />
        {!!search && <Pressable accessibilityRole="button" accessibilityLabel="검색어 지우기" onPress={() => { setSearch(''); setKeyword(''); }} style={styles.clear}><Feather name="x" size={18} color={colors.text.secondary} /></Pressable>}
      </View>
    </View>
    <View style={styles.mapArea} onLayout={event => setMapSize({ width: event.nativeEvent.layout.width, height: event.nativeEvent.layout.height })}>
      <MapView ref={map} testID="discovery-region-map" provider={PROVIDER_GOOGLE} style={StyleSheet.absoluteFill} initialRegion={SEOUL_CITY_HALL}
        onMapReady={() => setMapReady(true)} onPress={onMapPress} showsUserLocation={permissionGranted} showsMyLocationButton={false} moveOnMarkerPress={false}>
        {anchor && <>
          {radius > 0 && <Circle center={anchor} radius={radius} fillColor="rgba(93,190,215,0.12)" strokeColor={pin} strokeWidth={1.5} />}
          {included.filter(region => region.regionId !== anchor.regionId).map(region => <Marker key={region.regionId} identifier={`included-${region.regionId}`} coordinate={region} pinColor={palette.accentInk} opacity={0.65} title={region.eupmyeondongName} description="탐색에 포함된 동네" />)}
          <Marker key={`anchor-${anchor.regionId}`} identifier="selected-anchor" coordinate={anchor} draggable={!blocked} onDragEnd={onDragEnd} pinColor={pin} title={`기준 동네 · ${anchor.eupmyeondongName}`} description="길게 눌러 다른 동네로 옮길 수 있어요" zIndex={2} />
        </>}
      </MapView>
      <Pressable disabled={isLocating || blocked || !allRegions.length} onPress={() => { void locate(); }} accessibilityRole="button" accessibilityLabel="현재 위치로 동네 선택" accessibilityState={{ disabled: isLocating || blocked || !allRegions.length }} style={[styles.locate, { right: insets.right + 12, backgroundColor: colors.background.card, opacity: !allRegions.length ? 0.5 : 1 }]}>
        {isLocating ? <ActivityIndicator color={pin} /> : <Feather name="crosshair" size={22} color={pin} />}
      </Pressable>
      {anchor && <View pointerEvents="none" style={[styles.legend, { left: insets.left + 12, right: insets.right + 12, backgroundColor: colors.background.card }]}>
        <View style={styles.legendItem}><View style={[styles.dot, { backgroundColor: pin }]} /><Text style={[styles.small, { color: colors.text.secondary }]}>기준 동네</Text></View>
        {included.length > 1 && <View style={styles.legendItem}><View style={[styles.dot, { backgroundColor: palette.accentInk }]} /><Text style={[styles.small, { color: colors.text.secondary }]}>포함된 동네</Text></View>}
        {permissionGranted && <View style={styles.legendItem}><View style={[styles.dot, { backgroundColor: '#4285F4' }]} /><Text style={[styles.small, { color: colors.text.secondary }]}>내 위치</Text></View>}
      </View>}
      {!!trim && <ScrollView keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" style={[styles.results, { left: insets.left + 12, right: insets.right + 12, maxHeight: Math.max(48, Math.min(280, mapSize.height - 8)), backgroundColor: colors.background.card }]}>
        {trim !== keyword || searchQuery.isFetching ? <ActivityIndicator style={styles.result} color={pin} /> : searchQuery.isError ? <Pressable accessibilityRole="button" accessibilityLabel="지역 검색 다시 시도" onPress={() => { void searchQuery.refetch(); }} style={styles.result}><Text style={{ color: colors.state.danger }}>검색하지 못했어요. 눌러 다시 시도해 주세요.</Text></Pressable> : searchQuery.data?.length ? searchQuery.data.map(region => <Pressable key={region.regionId} onPress={() => selectSearch(region)} disabled={blocked || !allRegions.length} accessibilityRole="button" style={styles.result}><Text style={[styles.resultName, { color: colors.text.primary }]}>{region.eupmyeondongName}</Text><Text style={[styles.small, { color: colors.text.secondary }]}>{region.sidoName} {region.sigunguName}</Text></Pressable>) : <Text style={[styles.result, { color: colors.text.secondary }]}>검색 결과가 없어요.</Text>}
      </ScrollView>}
    </View>
    {!keyboardVisible && <View style={[styles.panel, { paddingLeft: insets.left + 20, paddingRight: insets.right + 20, paddingBottom: bottomPadding, backgroundColor: colors.background.card, borderColor: colors.border.primary }]}>
      <ScrollView style={{ maxHeight: panelLimit, flexGrow: 0 }} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.panelBody}>
        {statusText && <Pressable disabled={!coordinates.isError && !preference.isError && !!allRegions.length} accessibilityRole="button" accessibilityLabel={`${statusText} 다시 시도`} onPress={() => { if (coordinates.isError || !allRegions.length) void coordinates.refetch(); else void preference.refetch(); }} style={styles.status}><Text style={[styles.small, { color: colors.state.danger }]}>{statusText}{coordinates.isError || preference.isError || (!allRegions.length && !coordinates.isLoading) ? ' 눌러 다시 시도' : ''}</Text></Pressable>}
        {anchor ? <>
          <View style={styles.anchorHeading}><Feather name="map-pin" size={22} color={pin} /><View style={styles.anchorCopy}><Text variant="heading" style={[styles.anchorName, { color: colors.text.primary }]}>{anchor.eupmyeondongName}</Text><Text style={[styles.small, { color: colors.text.secondary }]}>{anchor.sigunguName} · {included.length === 1 ? '이 동네만 탐색해요' : `기준 동네 포함 ${included.length}개 동을 탐색해요`}</Text></View></View>
          <RegionRadiusSlider steps={steps} value={count} disabled={blocked || isLocating} onValueChange={next => { if (!saveLock.current && !locateLock.current) setNearbyCount(next); }} />
        </> : <Text style={[styles.prompt, { color: colors.text.secondary }]}>지도를 누르거나 동네 이름을 검색해 주세요.{ '\n' }현재 위치 버튼으로도 선택할 수 있어요.</Text>}
      </ScrollView>
      <Pressable onLayout={event => setConfirmHeight(event.nativeEvent.layout.height)} disabled={!anchor || blocked || isLocating} accessibilityRole="button" accessibilityLabel="지역 설정 완료" accessibilityState={{ disabled: !anchor || blocked || isLocating }} onPress={() => { void confirm(); }} style={[styles.confirm, { backgroundColor: palette.coolTint, opacity: !anchor || blocked || isLocating ? 0.5 : 1 }]}>
        {blocked ? <ActivityIndicator color={pin} /> : <Text style={[styles.confirmText, { color: pin }]}>{anchor ? `${count}개 동으로 설정` : '동네를 선택해 주세요'}</Text>}
      </Pressable>
    </View>}
  </KeyboardAvoidingView>;
}
const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingBottom: 8 },
  iconButton: { minWidth: 44, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  searchBox: { flex: 1, minWidth: 0, minHeight: 48, borderWidth: 1, borderRadius: 14, flexDirection: 'row', alignItems: 'center', paddingLeft: 12, gap: 8 },
  searchInput: { flex: 1, minWidth: 0, fontSize: 15, paddingVertical: 10 },
  clear: { width: 44, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  mapArea: { flex: 1, minHeight: 64, overflow: 'hidden' },
  locate: { position: 'absolute', top: 12, width: 48, height: 48, borderRadius: 24, elevation: 3, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 5, shadowOffset: { width: 0, height: 2 }, justifyContent: 'center', alignItems: 'center' },
  legend: { position: 'absolute', bottom: 12, flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  small: { fontSize: 12, lineHeight: 19 },
  results: { position: 'absolute', top: 0, borderRadius: 14, elevation: 5, zIndex: 3 },
  result: { minHeight: 52, paddingHorizontal: 14, paddingVertical: 10 },
  resultName: { fontSize: 15, lineHeight: 23, fontWeight: '600' },
  panel: { paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth },
  panelBody: { paddingBottom: 12 },
  anchorHeading: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  anchorCopy: { flex: 1, minWidth: 0 },
  anchorName: { fontSize: 21, lineHeight: 29, fontWeight: '600' },
  prompt: { fontSize: 14, lineHeight: 22, paddingVertical: 10 },
  status: { minHeight: 44, justifyContent: 'center' },
  confirm: { minHeight: 48, borderRadius: 14, padding: 10, alignItems: 'center', justifyContent: 'center' },
  confirmText: { fontSize: 15, lineHeight: 23, fontWeight: '600', textAlign: 'center' },
});
