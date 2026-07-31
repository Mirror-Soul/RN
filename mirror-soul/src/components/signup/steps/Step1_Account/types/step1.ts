import { StyleProp, ViewStyle } from 'react-native';

export interface Step1State {
  email: string;
  isEmailVerified: boolean;
  /** 이메일 인증코드 발송/가입 완료 시 중복 이메일 등으로 실패하면 인라인으로 보여줄 메시지. */
  emailError?: string;
  password: string;
  passwordConfirm: string;
  isPasswordVisible: boolean;
  isPasswordConfirmVisible: boolean;
  isIdentityVerified: boolean;
  agreedToTerms: boolean;
  isAdultConfirmed: boolean;
  agreedToBiometricData: boolean;
  /** 선택 동의 — isFormValid 조건에 포함하지 않는다. */
  agreedToMarketing: boolean;
  isLoading: boolean;
}

export interface VerificationModalProps {
  isVisible: boolean;
  email: string;
  onClose: () => void;
  onVerify: (code: string) => Promise<boolean>;
  timeLeft?: number;
  formattedTime?: string;
  onResend?: () => void;
  isLoading?: boolean;
}

export interface SectionProps {
  state: Step1State;
  onChange: (updates: Partial<Step1State>) => void;
}
