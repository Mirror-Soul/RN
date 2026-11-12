import apiClient from './apiClient';
import type { JobReviewResponse, JobSubmissionResponse } from '@/src/types/api/jobVerification';

export async function getJobReview(signal?: AbortSignal): Promise<JobReviewResponse> {
  return (await apiClient.get<JobReviewResponse>('/job-verifications/me', { signal })).data;
}
export async function submitJobDocuments(objectKeys: string[]): Promise<JobSubmissionResponse> {
  return (await apiClient.post<JobSubmissionResponse>('/job-verifications', { objectKeys })).data;
}
