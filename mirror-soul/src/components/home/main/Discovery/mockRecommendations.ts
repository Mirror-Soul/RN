import type { Recommendation } from '@/src/types/api/home';

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
    hashtags: ['필름카메라', '전시회', '커피'],
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
    hashtags: ['클라이밍', '헬스', '보드게임'],
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
    hashtags: ['맛집탐방', '넷플릭스', '고양이'],
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
    selfIntroduction: '숫자랑 씨름하는 회계사예요. 요즘은 달리기에 빠져서 매일 아침 한강을 뜁니다.',
    mbti: 'ESTJ',
    hashtags: ['러닝', '한강', '재테크'],
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
    hashtags: ['독서', '글쓰기', '전시'],
    profileImageUrl: '',
    recommendationScore: 71,
  },
];
