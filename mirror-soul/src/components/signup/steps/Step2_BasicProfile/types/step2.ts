/**
 * Step2State 인터페이스
 * 회원가입 2단계(기본 프로필)에서 관리하는 모든 입력 상태를 정의합니다.
 */
export interface Step2State {
  nickname: string;
  isNicknameVerified: boolean; // 중복 확인 성공 여부
  location: string;
  jobCategory: string;
  jobTitle: string;
  isJobVerified: boolean; // 직업 인증 완료 여부
}

/**
 * Step 2 내 개별 섹션 컴포넌트들에 전달될 공통 Props 타입
 */
export interface SectionProps {
  state: Step2State;
  onChange: (updates: Partial<Step2State>) => void;
}
