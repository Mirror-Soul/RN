import { create } from 'zustand';

interface SignupState {
  userUuid: string | null; // 추후 UUID 전환 시 string | null 로 변경
  setUserUuid: (id: string) => void;
  reset: () => void;
}

/**
 * 회원가입 프로세스 전역 상태 (최소주의)
 *
 * - userUuid: POST /join/basic-profile 응답에서 받은 사용자 UUID
 * - Step2에서 /onboarding/profile/{userUuid} 등에 사용
 * - 회원가입 완료 또는 이탈 시 reset() 호출
 *
 * email, password는 전역 저장 불필요 (Step1 컴포넌트 언마운트 시 자연 소멸)
 */
export const useSignupStore = create<SignupState>((set) => ({
  userUuid: null,
  setUserUuid: (id) => set({ userUuid: id }),
  reset: () => set({ userUuid: null }),
}));
