import { ApiResponse } from './common';
import type { JobEnum, MbtiEnum } from './onboarding';

/**
 * 홈(Home) 도메인 API 타입 정의
 * 백엔드 HomeController(`/home`) 기준
 */

export interface TalkTime {
  hours: number;
  minutes: number;
  seconds: number;
}

// ─────────────────────────────────────────────
// GET /home
// (2026-09-19: preferredRegions(배열) → preferredRegion(단일, 미설정 시 null)로 백엔드 변경됨.
//  기존 "구 최대 3개 선택"을 "동 앵커 1개 + 반경"으로 대체하는 개편의 일부 — 아래 PreferredRegionSetting 참고)
// ─────────────────────────────────────────────
export interface PreferredRegionSetting {
  anchorRegionId: number;
  sidoName: string;
  sigunguName: string;
  eupmyeondongName: string;
  nearbyCount: number;
  /** 앵커 자신 포함, 실제로 추천 하드 필터에 쓰이는 최종 지역 ID 목록 */
  includedRegionIds: number[];
}

export interface HomeResult {
  remainingTalkTime: TalkTime;
  preferredRegion: PreferredRegionSetting | null;
}

export type HomeResponse = ApiResponse<HomeResult>;

// ─────────────────────────────────────────────
// PUT /home/preferred-region (신규 — 동 앵커+반경 설정)
// ─────────────────────────────────────────────
export interface UpdatePreferredRegionRequest {
  anchorRegionId: number;
  nearbyCount: number;
}

export type UpdatePreferredRegionResponse = ApiResponse<PreferredRegionSetting>;

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

export interface MbtiAxisScores {
  ieScore: number;
  nsScore: number;
  ftScore: number;
  pjScore: number;
}

export interface VoicePreview {
  audioUrl: string;
  contentType: string | null;
  durationMs: number | null;
}

export interface RecommendationDetailResult {
  userUuid: string;
  name: string;
  age: number | null;
  profileImageUrl: string;
  syncRate: number | null;
  region: Region | null;
  job: JobEnum | null;
  jobCertificationSubmitted: boolean;
  selfIntroduction: string | null;
  mbti: MbtiEnum | null;
  mbtiAxisScores: MbtiAxisScores | null;
  personalityTags: string[];
  voicePreview: VoicePreview | null;
}

export type RecommendationDetailResponse = ApiResponse<RecommendationDetailResult>;

// ─────────────────────────────────────────────
// POST /home/recommendations/{target-user-uuid}/swipe
// ─────────────────────────────────────────────
export type SwipeResponse = ApiResponse<null>;
