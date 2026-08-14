import { ApiResponse } from './common';

/**
 * 홈(Home) 도메인 API 타입 정의
 * 백엔드 HomeController(`/home`) 기준
 */

export interface PreferredRegion {
  sigunguId: number;
  sidoName: string;
  sigunguName: string;
}

export interface TalkTime {
  hours: number;
  minutes: number;
  seconds: number;
}

// ─────────────────────────────────────────────
// GET /home
// ─────────────────────────────────────────────
export interface HomeResult {
  remainingTalkTime: TalkTime;
  preferredRegions: PreferredRegion[];
}

export type HomeResponse = ApiResponse<HomeResult>;

// ─────────────────────────────────────────────
// PUT /home/preferred-regions
// ─────────────────────────────────────────────
export interface PreferredRegionInput {
  sidoName: string;
  sigunguName: string;
}

export interface UpdatePreferredRegionsRequest {
  regions: PreferredRegionInput[];
}

export interface PreferredRegionsResult {
  preferredRegions: PreferredRegion[];
}

export type PreferredRegionsResponse = ApiResponse<PreferredRegionsResult>;

// ─────────────────────────────────────────────
// GET /home/preferred-regions/options
// ─────────────────────────────────────────────
export interface SigunguOptionsResult {
  regions: PreferredRegion[];
}

export type SigunguOptionsResponse = ApiResponse<SigunguOptionsResult>;
