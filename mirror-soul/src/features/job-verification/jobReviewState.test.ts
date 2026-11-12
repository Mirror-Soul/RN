import { jobReviewCopy } from './jobReviewState';
import type { JobReviewResult } from '@/src/types/api/jobVerification';
const base: JobReviewResult = { requestId: 42, status: 'APPROVED', claimedJob: 'IT_TECH', submittedAt: null, reviewedAt: null, rejectionReason: null, appliesToCurrentJob: true, passVerificationRequired: true };
it('calls approval document review without granting final identity verification', () => {
  const result = jobReviewCopy(base);
  expect(result.title).toBe('서류 확인이 완료됐어요');
  expect(result.canSubmit).toBe(false);
  expect(result.copy).toContain('아직 완료되지 않았어요');
  expect(jobReviewCopy({ ...base, passVerificationRequired: false }).title).toBe(result.title);
});
it('allows rejected and outdated approvals to be resubmitted but not outdated pending requests', () => {
  expect(jobReviewCopy({ ...base, status: 'REJECTED' }).canSubmit).toBe(true);
  expect(jobReviewCopy({ ...base, appliesToCurrentJob: false }).canSubmit).toBe(true);
  expect(jobReviewCopy({ ...base, status: 'PENDING', appliesToCurrentJob: false }).canSubmit).toBe(false);
});
it('does not claim an absence of legacy uploads when there is no new request', () => {
  expect(jobReviewCopy({ ...base, requestId: null, status: null }).title).toBe('직업 확인 서류를 제출해 주세요');
});
