import { ApiResponse } from './common';
import type { JobEnum, MbtiEnum } from './onboarding';

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

// ─────────────────────────────────────────────
// GET /home/recommend?page=&size=
// ─────────────────────────────────────────────
export interface Residence {
  sidoName: string;
  sigunguName: string;
}

export interface Recommendation {
  userUuid: string;
  name: string;
  age: number | null;
  job: JobEnum;
  jobCertificationSubmitted: boolean;
  residence: Residence;
  selfIntroduction: string;
  mbti: MbtiEnum;
  hashtags: string[];
  profileImageUrl: string;
  recommendationScore: number;
}

export interface RecommendationsResult {
  recommendations: Recommendation[];
  page: number;
  size: number;
  hasNext: boolean;
}

export type RecommendationsResponse = ApiResponse<RecommendationsResult>;

// ─────────────────────────────────────────────
// GET /home/recommendations/{target-user-uuid}
// ─────────────────────────────────────────────
/** 백엔드는 RegionDTO/ResidenceDTO로 분리해서 쓰지만 모양이 Residence와 동일하다 */
export type Region = Residence;

export interface MbtiIndicators {
  ieScore: number;
  nsScore: number;
  ftScore: number;
  pjScore: number;
}

export interface VoicePreview {
  audioUrl: string;
  contentType: string;
  durationMs: number;
}

export interface RecommendationDetailResult {
  userUuid: string;
  name: string;
  age: number | null;
  profileImageUrl: string;
  syncRate: number | null;
  region: Region;
  job: JobEnum;
  jobCertificationSubmitted: boolean;
  selfIntroduction: string;
  mbti: MbtiEnum;
  mbtiIndicators: MbtiIndicators;
  hashtags: string[];
  voicePreview: VoicePreview;
}

export type RecommendationDetailResponse = ApiResponse<RecommendationDetailResult>;

// ─────────────────────────────────────────────
// POST /home/recommendations/{target-user-uuid}/swipe
// ─────────────────────────────────────────────
export type SwipeResponse = ApiResponse<null>;
