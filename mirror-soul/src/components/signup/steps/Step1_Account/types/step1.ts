import { StyleProp, ViewStyle } from 'react-native';

export interface Step1State {
  email: string;
  isEmailVerified: boolean;
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
