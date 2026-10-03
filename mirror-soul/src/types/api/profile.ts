import { ApiResponse } from './common';
import type { JobEnum, MbtiEnum } from './onboarding';

/**
 * 마이페이지(Profile) 도메인 API 타입 정의
 * 백엔드 ProfileController(`/my-page`) 기준
 */

export type SpeechSpeed = 'SLOW' | 'NORMAL' | 'FAST';

// ─────────────────────────────────────────────
// GET /my-page
// ─────────────────────────────────────────────
export interface MyProfileResult {
  name: string | null;
  email: string;
  profileImageUrl: string | null;
}

export type MyProfileResponse = ApiResponse<MyProfileResult>;

// ── PATCH /my-page/profile-image ──
export interface ModifyProfileImageRequest {
  objectKey: string;
}
export interface ModifyProfileImageResult {
  profileImageUrl: string;
}
export type ModifyProfileImageResponse = ApiResponse<ModifyProfileImageResult>;

// ── DELETE /my-page/profile-image ──
export type DeleteProfileImageResponse = ApiResponse<null>;

// ─────────────────────────────────────────────
// GET /my-page/profile
// ─────────────────────────────────────────────
/**
 * 내 소개 전용 상세 프로필(백엔드 `MyProfileDetailDTO`). 추천 상세(`GET /home/recommendations/{uuid}`)와
 * 유사한 필드 계약을 쓰되, 본인 조회라 추천 노출/자기 자신 차단 규칙이 없고 email/jobDescription/
 * matchingEnabled가 추가로 붙는다.
 */
export interface IntroductionRegion {
  sidoName: string;
  sigunguName: string;
}

export interface MbtiAxisScores {
  ieScore: number;
  nsScore: number;
  ftScore: number;
  pjScore: number;
}

export interface IntroductionVoicePreview {
  audioUrl: string;
  contentType: string | null;
  durationMs: number | null;
}

export interface MyIntroductionResult {
  userUuid: string;
  email: string;
  name: string | null;
  age: number | null;
  profileImageUrl: string | null;
  syncRate: number | null;
  region: IntroductionRegion | null;
  job: JobEnum | null;
  jobDescription: string | null;
  jobCertificationSubmitted: boolean;
  selfIntroduction: string | null;
  mbti: MbtiEnum | null;
  mbtiAxisScores: MbtiAxisScores | null;
  personalityTags: string[];
  voicePreview: IntroductionVoicePreview | null;
  /** 매칭 on/off — 이 화면에서 직접 쓰진 않지만(별도 useMatchingStatus가 진실의 원천) 계약엔 포함된다. */
  matchingEnabled: boolean;
}

export type MyIntroductionResponse = ApiResponse<MyIntroductionResult>;

// ─────────────────────────────────────────────
// GET /my-page/buy-time
// POST /my-page/buy-time
// ─────────────────────────────────────────────
export interface TimeStatusResult {
  remainingTalkTime: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export type TimeStatusResponse = ApiResponse<TimeStatusResult>;

export interface BuyTimeRequest {
  buyTime: number;
}

// ─────────────────────────────────────────────
// GET /my-page/audio-settings
// PATCH /my-page/audio-settings
// ─────────────────────────────────────────────
export interface AudioSettingsResult {
  opponentVoiceVolume: number;
  opponentSpeechSpeed: SpeechSpeed;
}

export type AudioSettingsResponse = ApiResponse<AudioSettingsResult>;

export interface AudioSettingsRequest {
  opponentVoiceVolume: number;
  opponentSpeechSpeed: SpeechSpeed;
}

// ─────────────────────────────────────────────
// GET /my-page/alarm
// PATCH /my-page/alarm
// ─────────────────────────────────────────────
export interface AlarmSettingResult {
  missedCallNotificationEnabled: boolean;
  lowTimeNotificationEnabled: boolean;
}

export type AlarmSettingResponse = ApiResponse<AlarmSettingResult>;

export interface AlarmSettingRequest {
  missedCallNotificationEnabled: boolean;
  lowTimeNotificationEnabled: boolean;
}

// ─────────────────────────────────────────────
// GET /my-page/account
// ─────────────────────────────────────────────
export interface AccountInfoResult {
  name: string;
}

export type AccountInfoResponse = ApiResponse<AccountInfoResult>;

// ─────────────────────────────────────────────
// POST /my-page/account
// ─────────────────────────────────────────────
export interface ModifyNicknameRequest {
  nickname: string;
}

export type ModifyNicknameResponse = ApiResponse<null>;

// ─────────────────────────────────────────────
// DELETE /my-page
// ─────────────────────────────────────────────
export type DeleteAccountResponse = ApiResponse<null>;
