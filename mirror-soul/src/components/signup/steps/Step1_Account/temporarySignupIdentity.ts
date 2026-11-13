import type { BasicProfileRequest } from '@/src/types/api/auth';

/**
 * [임시] PASS 본인인증이 구현되기 전까지 가입 요청(POST /join/basic-profile)에 실어 보내는 값 (#208).
 *
 * 백엔드는 gender/birthDate가 null인 계정의 홈 추천 목록(GET /home/recommend)을 403으로 막고, 이 계정을
 * 다른 사람의 추천 후보에서도 제외한다. 가입 이후에 이 값을 채우는 API가 없어서 가입 때 보내야 한다.
 *
 * 모든 신규 계정이 같은 성별·나이로 저장된다 (같은 성별 계정끼리는 서로의 추천에 뜨지 않는다).
 * PASS 연동 또는 실제 입력 UI가 생기면 이 파일과 사용처(Step1AccountContainer)를 함께 지우고,
 * 공개(스토어) 빌드로 나가기 전에 반드시 제거할 것.
 */
export const TEMPORARY_SIGNUP_IDENTITY: Pick<BasicProfileRequest, 'gender' | 'birthDate'> = {
  gender: 'MALE',
  // 만 19세 이상(성인) 후보군에 묶이도록 충분히 오래된 날짜를 쓴다. 시간이 지나도 계속 성인이다.
  birthDate: '2000-01-01',
};
