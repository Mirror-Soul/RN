import type { JobReviewResult } from '@/src/types/api/jobVerification';

export function jobReviewCopy(review: JobReviewResult) {
  if (!review.requestId || !review.status) return { title: '직업 확인 서류를 제출해 주세요', copy: '직업을 확인할 수 있는 사진을 보내면 담당자가 직접 확인해요. 서류 제출은 선택 사항이에요.', canSubmit: true };
  if (review.status === 'PENDING') return { title: '서류를 확인하고 있어요', copy: review.appliesToCurrentJob ? '결과가 나오면 여기에서 확인할 수 있어요. 확인에는 시간이 걸릴 수 있어요.' : '이전 직군으로 신청한 서류를 확인 중이에요. 새 신청은 현재 심사가 끝난 뒤 할 수 있어요.', canSubmit: false };
  if (!review.appliesToCurrentJob) return { title: '현재 직군의 서류가 필요해요', copy: '이전에 신청한 직군과 현재 프로필의 직군이 달라요. 현재 직군을 확인할 수 있는 사진을 제출해 주세요.', canSubmit: true };
  if (review.status === 'REJECTED') return { title: '서류를 보완해 주세요', copy: '아래 내용을 확인하고 사진을 다시 제출해 주세요.', canSubmit: true };
  return { title: '서류 확인이 완료됐어요', copy: '프로필에 ‘직업 서류 확인’이 표시돼요. 서류 확인과 PASS 본인확인은 별개이며, 신청자와 서류의 이름 대조는 아직 완료되지 않았어요.', canSubmit: false };
}
