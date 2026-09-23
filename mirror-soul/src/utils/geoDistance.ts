import type { RegionCoordinate } from '../types/api/region';

const EARTH_RADIUS_KM = 6371.0088;

/**
 * 두 좌표 사이의 대권거리(km).
 * 백엔드 GeoDistanceUtils.distanceKm과 동일한 Haversine 공식 — 서버 재계산 결과와 어긋나지 않도록 유지할 것.
 */
export const distanceKm = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const lat1Rad = (lat1 * Math.PI) / 180;
  const lat2Rad = (lat2 * Math.PI) / 180;
  const latDiffRad = lat2Rad - lat1Rad;
  const lngDiffRad = ((lng2 - lng1) * Math.PI) / 180;

  const haversine =
    Math.sin(latDiffRad / 2) ** 2 + Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(lngDiffRad / 2) ** 2;

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(Math.min(1, haversine)));
};

/**
 * anchor를 제외한 나머지 지역을 anchor 기준 가까운 순으로 정렬한다.
 * 백엔드 NearbyRegionFinder.findNearestRegionIds와 동일한 정렬 규칙
 * (거리 오름차순, 동률 시 regionId 오름차순).
 *
 * 슬라이더처럼 anchor는 고정한 채 개수(count)만 바뀌는 상호작용에서는 이 함수로 한 번만
 * 정렬해두고, 매 조작마다 takeNearest로 자르기만 하면 된다 — 매번 다시 정렬하면
 * 5천여 건을 슬라이더 조작 프레임마다 재계산하게 되어 불필요하게 무겁다.
 */
export const sortRegionsByDistance = (
  anchor: RegionCoordinate,
  allRegions: RegionCoordinate[]
): RegionCoordinate[] => {
  return allRegions
    .filter((region) => region.regionId !== anchor.regionId)
    .map((region) => ({
      region,
      distance: distanceKm(anchor.latitude, anchor.longitude, region.latitude, region.longitude),
    }))
    .sort((a, b) => a.distance - b.distance || a.region.regionId - b.region.regionId)
    .map((entry) => entry.region);
};

/** sortRegionsByDistance로 미리 정렬해둔 목록에서 앵커 포함 최대 count개를 자른다. */
export const takeNearest = (
  anchor: RegionCoordinate,
  sortedOthers: RegionCoordinate[],
  count: number
): RegionCoordinate[] => [anchor, ...sortedOthers.slice(0, Math.max(0, count - 1))];

/** 지도를 탭했을 때, 그 좌표에서 가장 가까운 실제 지역(동)을 찾는다 — 별도 리버스 지오코딩 없이 캐싱된 좌표 목록만으로 처리. */
export const findNearestRegion = (
  point: { latitude: number; longitude: number },
  allRegions: RegionCoordinate[]
): RegionCoordinate | null => {
  let nearest: RegionCoordinate | null = null;
  let nearestDistance = Infinity;

  for (const region of allRegions) {
    const distance = distanceKm(point.latitude, point.longitude, region.latitude, region.longitude);
    if (distance < nearestDistance) {
      nearest = region;
      nearestDistance = distance;
    }
  }

  return nearest;
};
