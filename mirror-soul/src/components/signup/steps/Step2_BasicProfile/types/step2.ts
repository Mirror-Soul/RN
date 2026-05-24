/**
 * Step2State 인터페이스
 * 회원가입 2단계(기본 프로필)에서 관리하는 모든 입력 상태를 정의합니다.
 */
export interface Step2State {
  nickname: string;
  isNicknameVerified: boolean;
  isNicknameChecking: boolean; // API 로딩 상태 추가

  // 지역 정보 분리 (API 명세 대응)
  sidoName: string;
  sigunguName: string;
  eupmyeondongName: string;

  jobCategory: string; // JobEnum과 매칭됨
  jobTitle: string; // jobDescription에 해당
  isJobVerifying: boolean; // S3 업로드 로딩 상태 추가
  isJobVerified: boolean;
  jobCertificationObjectKey: string | null; // S3에서 받은 키 저장
}

/**
 * Step 2 내 개별 섹션 컴포넌트들에 전달될 공통 Props 타입
 */
export interface SectionProps {
  state: Step2State;
  onChange: (updates: Partial<Step2State>) => void;
}
