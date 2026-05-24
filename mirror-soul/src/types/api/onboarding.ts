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
  /** 사용자가 직접 입력하는 직업 상세 설명 (자유 텍스트) */
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
  /**
   * I/E 점수 (0~100)
   * - 0에 가까울수록 I(내향) 성향
   * - 100에 가까울수록 E(외향) 성향
   */
  ieScore: number;
  /** N/S 점수 (0~100) */
  nsScore: number;
  /** F/T 점수 (0~100) */
  ftScore: number;
  /** P/J 점수 (0~100) */
  pjScore: number;
  selfIntroduction: string;
}

export type SavePersonalityResponse = ApiResponse<string>;

// ─────────────────────────────────────────────
// POST /onboarding/interview/answers/{userUuid}
// ─────────────────────────────────────────────
export interface SaveInterviewAnswerRequest {
  interviewId: number;
  answerAudioObjectKey: string;
  answerText: string;
}

export interface SaveInterviewAnswerResult {
  recordId: number;
  interviewId: number;
  saved: boolean;
}

export type SaveInterviewAnswerResponse = ApiResponse<SaveInterviewAnswerResult>;

// ─────────────────────────────────────────────
// GET /onboarding/interview/questions
// ─────────────────────────────────────────────
export interface InterviewQuestionItem {
  questionId: number;
  question: string;
}

export interface GetInterviewQuestionsResult {
  questions: InterviewQuestionItem[];
}

export type GetInterviewQuestionsResponse = ApiResponse<GetInterviewQuestionsResult>;

// ─────────────────────────────────────────────
// POST /onboarding/visual/{userUuid}
// ─────────────────────────────────────────────
export interface SaveFaceScanRequest {
  fileUrl: string;
  objectKey: string;
}

export interface SaveFaceScanResult {
  faceFileId: number;
  userUuid: string;
  fileUrl: string;
  objectKey: string;
  saved: boolean;
}

export type SaveFaceScanResponse = ApiResponse<SaveFaceScanResult>;
