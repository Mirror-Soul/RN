import type { MyIntroductionResult } from '@/src/types/api/profile';

/**
 * 개발 중 `/my-page/introduction`이 배포되기 전 화면 점검을 위한 목 데이터.
 * `__DEV__`에서만 API 실패 시 사용하며, 실제 배포본에는 노출되지 않는다.
 */
export const introductionPreview: MyIntroductionResult = {
  userUuid: 'development-preview-user',
  name: '소울',
  age: 28,
  profileImageUrl: null,
  syncRate: 74,
  region: {
    sidoName: '서울',
    sigunguName: '강남구',
  },
  job: 'DESIGN',
  jobCertificationSubmitted: true,
  selfIntroduction: '좋은 대화는 서로를 조금 더 이해하게 만든다고 믿어요. 편안한 이야기부터 천천히 시작해요.',
  mbti: 'INFJ',
  mbtiAxisScores: {
    ieScore: 72,
    nsScore: 65,
    ftScore: 70,
    pjScore: 75,
  },
  personalityTags: ['깊이 있는 대화', '차분한 공감', '새로운 경험'],
  voicePreview: null,
};
