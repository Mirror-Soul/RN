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
  name: string;
  email: string;
}

export type MyProfileResponse = ApiResponse<MyProfileResult>;

// ─────────────────────────────────────────────
// GET /my-page/introduction
// ─────────────────────────────────────────────
/**
 * 내 소개 전용 상세 프로필. 추천 상세(`GET /home/recommendations/{uuid}`)와
 * 동일한 필드 계약을 사용하되, 본인 조회에는 추천 노출/자기 자신 차단 규칙을 적용하지 않는다.
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
  name: string | null;
  age: number | null;
  profileImageUrl: string | null;
  syncRate: number | null;
  region: IntroductionRegion | null;
  job: JobEnum | null;
  jobCertificationSubmitted: boolean;
  selfIntroduction: string | null;
  mbti: MbtiEnum | null;
  mbtiAxisScores: MbtiAxisScores | null;
  personalityTags: string[];
  voicePreview: IntroductionVoicePreview | null;
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
