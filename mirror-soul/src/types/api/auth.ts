import { ApiResponse } from './common';

// ─────────────────────────────────────────────
// POST /join/send-code
// ─────────────────────────────────────────────
export interface SendCodeRequest {
  email: string;
}
export type SendCodeResponse = ApiResponse<string>;

// ─────────────────────────────────────────────
// POST /join/verify-code
// ─────────────────────────────────────────────
export interface VerifyCodeRequest {
  code: string;
}
export interface VerifyCodeResult {
  verifySuccess: boolean;
}
export type VerifyCodeResponse = ApiResponse<VerifyCodeResult>;

// ─────────────────────────────────────────────
// POST /join/basic-profile
// ─────────────────────────────────────────────
export interface BasicProfileRequest {
  email: string;
  password: string;
  gender: 'MALE' | 'FEMALE' | null;  // PASS 인증 미구현 → 현재 nullable
  birthDate: string | null;           // PASS 인증 미구현 → 현재 nullable
  termsAgreed: boolean;
}
export interface BasicProfileResult {
  userUuid: string;
  accessToken: string;
  refreshToken: string;
  userStatus: string;
}
export type BasicProfileResponse = ApiResponse<BasicProfileResult>;
