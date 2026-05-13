import { ApiResponse } from './common';

/**
 * Onboarding 도메인 API 타입 정의
 */

// ─────────────────────────────────────────────
// POST /onboarding/profile/check-dup-nickname
// ─────────────────────────────────────────────
export interface CheckNicknameRequest {
  nickname: string;
}
export type CheckNicknameResponse = ApiResponse<string>;

// ─────────────────────────────────────────────
// 지역 조회 API (Sido / Sigungu / Eupmyeondong)
// ─────────────────────────────────────────────
export type GetSidoResponse = ApiResponse<string[]>;

export interface GetSigunguRequest {
  sidoName: string;
}
export type GetSigunguResponse = ApiResponse<string[]>;

export interface GetEupmyeondongRequest {
  sidoName: string;
  sigunguName: string;
}
export type GetEupmyeondongResponse = ApiResponse<string[]>;

// ─────────────────────────────────────────────
// POST /files/presigned-url
// ─────────────────────────────────────────────
export interface PresignedUrlRequest {
  fileName: string;
  contentType: string;
  directory: 'interviews' | 'face-videos' | 'job-certifications';
}

export interface PresignedUrlResult {
  presignedUrl: string;
  fileUrl: string;
  objectKey: string;
}
export type PresignedUrlResponse = ApiResponse<PresignedUrlResult>;

// ─────────────────────────────────────────────
// POST /onboarding/profile/{userUuid}
// ─────────────────────────────────────────────
export type JobEnum = 
  | 'IT_TECH' 
  | 'DESIGN' 
  | 'PLANNING_STRATEGY' 
  | 'MARKETING_PR' 
  | 'SALES_BUSINESS' 
  | 'HR_RECRUITING' 
  | 'FINANCE_ACCOUNTING' 
  | 'OPERATIONS_CS' 
  | 'EDUCATION' 
  | 'MEDICAL_HEALTHCARE' 
  | 'MEDIA_CONTENT' 
  | 'LEGAL_PUBLIC' 
  | 'MANUFACTURING_ENGINEERING' 
  | 'STUDENT' 
  | 'FREELANCER' 
  | 'ETC';

export interface SaveProfileRequest {
  nickname: string;
  sidoName: string;
  sigunguName: string;
  eupmyeondongName: string;
  jobDescription: string;
  jobCertificationObjectKey?: string | null;
}

export type SaveProfileResponse = ApiResponse<string>;

// ─────────────────────────────────────────────
// PUT /onboarding/personality/{userUuid}
// ─────────────────────────────────────────────
export type MbtiEnum =
  | 'ISTJ' | 'ISFJ' | 'INFJ' | 'INTJ'
  | 'ISTP' | 'ISFP' | 'INFP' | 'INTP'
  | 'ESTP' | 'ESFP' | 'ENFP' | 'ENTP'
  | 'ESTJ' | 'ESFJ' | 'ENFJ' | 'ENTJ';

export interface SavePersonalityRequest {
  mbti: MbtiEnum;
  ieScore: number;
  nsScore: number;
  ftScore: number;
  pjScore: number;
  selfIntroduction: string;
}

export type SavePersonalityResponse = ApiResponse<string>;
