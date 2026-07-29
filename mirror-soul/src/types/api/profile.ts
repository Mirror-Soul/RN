import { ApiResponse } from './common';

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
