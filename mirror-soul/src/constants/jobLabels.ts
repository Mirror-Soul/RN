import type { JobEnum } from '@/src/types/api/onboarding';

/**
 * 백엔드 Job enum(16종, Job.java @Schema description 기준)의 한글 라벨.
 */
export const JOB_LABEL: Record<JobEnum, string> = {
  IT_TECH: '기술 · IT',
  DESIGN: '디자인',
  PLANNING_STRATEGY: '기획 · 전략',
  MARKETING_PR: '마케팅 · PR',
  SALES_BUSINESS: '영업 · 비즈니스',
  HR_RECRUITING: '인사 · 채용',
  FINANCE_ACCOUNTING: '재무 · 회계',
  OPERATIONS_CS: '운영 · 고객지원',
  EDUCATION: '교육',
  MEDICAL_HEALTHCARE: '의료 · 헬스케어',
  MEDIA_CONTENT: '미디어 · 콘텐츠',
  LEGAL_PUBLIC: '법률 · 공공',
  MANUFACTURING_ENGINEERING: '제조 · 엔지니어링',
  STUDENT: '학생',
  FREELANCER: '프리랜서',
  ETC: '기타',
};
