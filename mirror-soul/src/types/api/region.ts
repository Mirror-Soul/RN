import { ApiResponse } from './common';

/**
 * 지역(Region) 도메인 API 타입 정의
 * 백엔드 RegionController(`/regions`) 기준
 */

export interface RegionCoordinate {
  regionId: number;
  sidoName: string;
  sigunguName: string;
  eupmyeondongName: string;
  latitude: number;
  longitude: number;
}

// ─────────────────────────────────────────────
// GET /regions/coordinates
// ─────────────────────────────────────────────
export type RegionCoordinatesResponse = ApiResponse<RegionCoordinate[]>;

// ─────────────────────────────────────────────
// GET /regions/search?keyword=
// ─────────────────────────────────────────────
export interface RegionSearchResult {
  regionId: number;
  sidoName: string;
  sigunguName: string;
  eupmyeondongName: string;
}

export type RegionSearchResponse = ApiResponse<RegionSearchResult[]>;
