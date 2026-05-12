import { JobEnum } from "@/src/types/api/onboarding";

export interface JobCategory {
  label: string;
  value: JobEnum;
}

export const jobCategories: JobCategory[] = [
  { label: 'IT/기술', value: 'IT_TECH' },
  { label: '디자인', value: 'DESIGN' },
  { label: '기획/전략', value: 'PLANNING_STRATEGY' },
  { label: '마케팅/PR', value: 'MARKETING_PR' },
  { label: '영업/비즈니스', value: 'SALES_BUSINESS' },
  { label: '인사/채용', value: 'HR_RECRUITING' },
  { label: '재무/회계', value: 'FINANCE_ACCOUNTING' },
  { label: '운영/CS', value: 'OPERATIONS_CS' },
  { label: '교육', value: 'EDUCATION' },
  { label: '의료/보건', value: 'MEDICAL_HEALTHCARE' },
  { label: '미디어/콘텐츠', value: 'MEDIA_CONTENT' },
  { label: '법률/공공', value: 'LEGAL_PUBLIC' },
  { label: '제조/엔지니어링', value: 'MANUFACTURING_ENGINEERING' },
  { label: '학생', value: 'STUDENT' },
  { label: '프리랜서', value: 'FREELANCER' },
  { label: '기타', value: 'ETC' },
];
