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
