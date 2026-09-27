import type { Recommendation, RecommendationDetailResult } from '@/src/types/api/home';

/**
 * 개발 중 추천 카드 디자인을 눈으로 확인하기 위한 목업 데이터.
 * DiscoveryMatchSection이 __DEV__ && 실제 추천이 0건일 때만 폴백으로 사용한다.
 * userUuid를 'mock-'로 시작하게 해서, 패스/상세보기가 실제 백엔드를 호출하지 않도록 구분한다.
 */
export const MOCK_RECOMMENDATIONS: Recommendation[] = [
  {
    userUuid: 'mock-1',
    name: '서연',
    age: 27,
    job: 'DESIGN',
    jobCertificationSubmitted: true,
    residence: { sidoName: '서울특별시', sigunguName: '마포구' },
    selfIntroduction: '브랜드 디자인하며 주말엔 필름카메라 들고 동네 산책하는 걸 좋아해요.',
    mbti: 'INFP',
    personalityTags: ['필름카메라', '전시회', '커피'],
    profileImageUrl: '',
    recommendationScore: 92,
  },
  {
    userUuid: 'mock-2',
    name: '지훈',
    age: 31,
    job: 'IT_TECH',
    jobCertificationSubmitted: false,
    residence: { sidoName: '서울특별시', sigunguName: '강남구' },
    selfIntroduction: '평일엔 코드 짜고 주말엔 클라이밍장에 살아요. 같이 운동할 사람 찾습니다.',
    mbti: 'ISTJ',
    personalityTags: ['클라이밍', '헬스', '보드게임'],
    profileImageUrl: '',
    recommendationScore: 78,
  },
  {
    userUuid: 'mock-3',
    name: '민지',
    age: 26,
    job: 'MEDIA_CONTENT',
    jobCertificationSubmitted: true,
    residence: { sidoName: '경기도', sigunguName: '성남시 분당구' },
    selfIntroduction: '영상 편집자입니다. 넷플릭스 정주행이 취미고 맛집 탐방을 좋아해요.',
    mbti: 'ENFP',
    personalityTags: ['맛집탐방', '넷플릭스', '고양이'],
    profileImageUrl: '',
    recommendationScore: 85,
  },
  {
    userUuid: 'mock-4',
    name: '현우',
    age: 29,
    job: 'FINANCE_ACCOUNTING',
    jobCertificationSubmitted: false,
    residence: { sidoName: '서울특별시', sigunguName: '용산구' },
    // 일부러 길게 써서(2줄 초과) "더보기" 동작을 목업만으로도 확인할 수 있게 함
    selfIntroduction: '숫자랑 씨름하는 회계사예요. 요즘은 달리기에 빠져서 매일 아침 한강을 뜁니다. 재작년부터 마라톤 풀코스도 두 번 완주했고, 요즘은 서브3을 목표로 훈련 중이에요. 주말엔 러닝크루 사람들이랑 같이 뛰고 나서 브런치 먹는 게 낙입니다.',
    mbti: 'ESTJ',
    personalityTags: ['러닝', '한강', '재테크'],
    profileImageUrl: '',
    recommendationScore: 65,
  },
  {
    userUuid: 'mock-5',
    name: '수아',
    age: 24,
    job: 'STUDENT',
    jobCertificationSubmitted: false,
    residence: { sidoName: '서울특별시', sigunguName: '서대문구' },
    selfIntroduction: '대학원에서 심리학을 공부 중이에요. 책 읽고 글 쓰는 걸 좋아합니다.',
    mbti: 'INFJ',
    personalityTags: ['독서', '글쓰기', '전시'],
    profileImageUrl: '',
    recommendationScore: 71,
  },
];

/**
 * 상세 모달 UI를 실제 API 계약과 같은 모양으로 검토하기 위한 개발용 fixture.
 * `mock-` UUID는 실제 백엔드 UUID가 아니므로, 이 데이터가 있는 경우 네트워크 상세 조회를
 * 하지 않아야 한다. 목록과 상세에 같은 UUID를 유지해 목록을 넘긴 뒤에도 각 상대의 상세를
 * 일관되게 확인할 수 있게 한다.
 *
 * 음성은 번들된 테스트 파일이 없어 null로 둔다. 따라서 상세 화면의 "준비 중" 상태도 함께
 * 검토할 수 있으며, 임의의 외부 오디오 URL을 넣어 네트워크/저작권 의존성을 만들지 않는다.
 */
const MOCK_RECOMMENDATION_DETAILS: Record<string, RecommendationDetailResult> = {
  'mock-1': {
    userUuid: 'mock-1',
    name: '서연',
    age: 27,
    profileImageUrl: '',
    syncRate: 94,
    region: { sidoName: '서울특별시', sigunguName: '마포구' },
    job: 'DESIGN',
    jobCertificationSubmitted: true,
    selfIntroduction: '브랜드 디자인하며 주말엔 필름카메라 들고 동네 산책하는 걸 좋아해요.',
    mbti: 'INFP',
    mbtiAxisScores: { ieScore: 62, nsScore: 74, ftScore: 68, pjScore: 42 },
    personalityTags: ['필름카메라', '전시회', '커피'],
    voicePreview: null,
  },
  'mock-2': {
    userUuid: 'mock-2',
    name: '지훈',
    age: 31,
    profileImageUrl: '',
    syncRate: 81,
    region: { sidoName: '서울특별시', sigunguName: '강남구' },
    job: 'IT_TECH',
    jobCertificationSubmitted: false,
    selfIntroduction: '평일엔 코드 짜고 주말엔 클라이밍장에 살아요. 같이 운동할 사람 찾습니다.',
    mbti: 'ISTJ',
    mbtiAxisScores: { ieScore: 31, nsScore: 28, ftScore: 44, pjScore: 83 },
    personalityTags: ['클라이밍', '헬스', '보드게임'],
    voicePreview: null,
  },
  'mock-3': {
    userUuid: 'mock-3',
    name: '민지',
    age: 26,
    profileImageUrl: '',
    syncRate: 89,
    region: { sidoName: '경기도', sigunguName: '성남시 분당구' },
    job: 'MEDIA_CONTENT',
    jobCertificationSubmitted: true,
    selfIntroduction: '영상 편집자입니다. 넷플릭스 정주행이 취미고 맛집 탐방을 좋아해요.',
    mbti: 'ENFP',
    mbtiAxisScores: { ieScore: 79, nsScore: 71, ftScore: 63, pjScore: 29 },
    personalityTags: ['맛집탐방', '넷플릭스', '고양이'],
    voicePreview: null,
  },
  'mock-4': {
    userUuid: 'mock-4',
    name: '현우',
    age: 29,
    profileImageUrl: '',
    syncRate: 76,
    region: { sidoName: '서울특별시', sigunguName: '용산구' },
    job: 'FINANCE_ACCOUNTING',
    jobCertificationSubmitted: false,
    selfIntroduction:
      '숫자랑 씨름하는 회계사예요. 요즘은 달리기에 빠져서 매일 아침 한강을 뜁니다. 재작년부터 마라톤 풀코스도 두 번 완주했고, 요즘은 서브3을 목표로 훈련 중이에요. 주말엔 러닝크루 사람들이랑 같이 뛰고 나서 브런치 먹는 게 낙입니다.',
    mbti: 'ESTJ',
    mbtiAxisScores: { ieScore: 36, nsScore: 39, ftScore: 57, pjScore: 86 },
    personalityTags: ['러닝', '한강', '재테크'],
    voicePreview: null,
  },
  'mock-5': {
    userUuid: 'mock-5',
    name: '수아',
    age: 24,
    profileImageUrl: '',
    syncRate: 91,
    region: { sidoName: '서울특별시', sigunguName: '서대문구' },
    job: 'STUDENT',
    jobCertificationSubmitted: false,
    selfIntroduction: '대학원에서 심리학을 공부 중이에요. 책 읽고 글 쓰는 걸 좋아합니다.',
    mbti: 'INFJ',
    mbtiAxisScores: { ieScore: 58, nsScore: 77, ftScore: 72, pjScore: 47 },
    personalityTags: ['독서', '글쓰기', '전시'],
    voicePreview: null,
  },
};

/** 목업 UUID는 어떤 경우에도 실제 상세 API로 보내지 않는다. */
export const isMockRecommendationUuid = (userUuid: string | null | undefined): boolean => userUuid?.startsWith('mock-') ?? false;

/** 목업 UUID의 상세 fixture만 반환한다. 실제 UUID에는 undefined를 반환해 API 조회를 유지한다. */
export const getMockRecommendationDetail = (userUuid: string | null | undefined): RecommendationDetailResult | undefined => {
  if (!userUuid || !isMockRecommendationUuid(userUuid)) return undefined;
  return MOCK_RECOMMENDATION_DETAILS[userUuid];
};
