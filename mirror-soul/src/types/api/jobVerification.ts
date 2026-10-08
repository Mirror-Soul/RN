import type { ApiResponse } from './common';
import type { JobEnum } from './onboarding';

export type JobReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export interface JobReviewResult {
  requestId: number | null;
  status: JobReviewStatus | null;
  claimedJob: JobEnum | null;
  submittedAt: string | null;
  reviewedAt: string | null;
  rejectionReason: string | null;
  appliesToCurrentJob: boolean;
  /** 서류 승인과 PASS 본인확인은 별개. false도 최종 인증 완료를 의미하지 않는다. */
  passVerificationRequired: boolean;
}
export interface JobSubmissionResult {
  requestId: number;
  status: JobReviewStatus;
  claimedJob: JobEnum;
}
export type JobReviewResponse = ApiResponse<JobReviewResult>;
export type JobSubmissionResponse = ApiResponse<JobSubmissionResult>;
