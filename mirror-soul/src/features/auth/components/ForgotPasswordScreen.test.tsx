import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { Keyboard, Platform } from 'react-native';
import ForgotPasswordScreen from './ForgotPasswordScreen';

const mockBack = jest.fn();
const mockReplace = jest.fn();
const mockCanGoBack = jest.fn();
const mockSend = jest.fn();
const mockVerify = jest.fn();
const mockReset = jest.fn();
const mockSetCode = jest.fn();
let mockState = {
  step: 'email', email: 'me@example.com', emailError: '', code: '', codeError: '',
  newPassword: '', newPasswordConfirm: '', passwordError: '', isLoading: false,
};
jest.mock('expo-router', () => ({ useRouter: () => ({ back: mockBack, replace: mockReplace, canGoBack: mockCanGoBack }) }));
jest.mock('../hooks/useForgotPasswordFlow', () => ({ useForgotPasswordFlow: () => ({
  state: mockState, setEmail: jest.fn(), setCode: mockSetCode, setNewPassword: jest.fn(), setNewPasswordConfirm: jest.fn(),
  handleSendCode: mockSend, handleResendCode: mockSend, handleVerifyCode: mockVerify, handleResetPassword: mockReset,
  isTimerActive: true, formattedTime: '02:59',
}) }));
jest.mock('@/src/hooks/useThemeColors', () => ({ useThemeColors: () => ({ colors: jest.requireActual('@/src/constants/theme').lightTheme, isDark: false }) }));
jest.mock('@expo/vector-icons', () => ({ Feather: () => null }));
jest.mock('expo-status-bar', () => ({ StatusBar: () => null }));
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: jest.requireActual('react-native').View,
  useSafeAreaInsets: () => ({ top: 24, bottom: 24, left: 0, right: 0 }),
}));
beforeEach(() => {
  jest.clearAllMocks();
  mockState = { step: 'email', email: 'me@example.com', emailError: '', code: '', codeError: '', newPassword: '', newPasswordConfirm: '', passwordError: '', isLoading: false };
  mockSend.mockResolvedValue(undefined); mockVerify.mockResolvedValue(undefined); mockReset.mockResolvedValue(undefined);
  mockCanGoBack.mockReturnValue(false);
});
afterEach(() => jest.restoreAllMocks());

it.each(['ios', 'android'] as const)('dismisses the %s keyboard before a recovery request and locks input while pending', platform => {
  jest.replaceProperty(Platform, 'OS', platform);
  const dismiss = jest.spyOn(Keyboard, 'dismiss');
  mockSend.mockImplementation(() => { expect(dismiss).toHaveBeenCalled(); return Promise.resolve(); });
  const screen = render(<ForgotPasswordScreen />);
  fireEvent.press(screen.getByRole('button', { name: '인증 코드 받기' }));
  expect(mockSend).toHaveBeenCalledTimes(1);
  mockState.isLoading = true;
  screen.rerender(<ForgotPasswordScreen />);
  expect(screen.getByLabelText('이메일 입력').props.editable).toBe(false);
  fireEvent.press(screen.getByRole('button', { name: '인증 코드 받기' }));
  expect(mockSend).toHaveBeenCalledTimes(1);
});

it.each(['ios', 'android'] as const)('dismisses the %s number pad only after six digits without auto-submitting', platform => {
  jest.replaceProperty(Platform, 'OS', platform);
  const dismiss = jest.spyOn(Keyboard, 'dismiss');
  mockState.step = 'code';
  const screen = render(<ForgotPasswordScreen />);
  fireEvent.changeText(screen.getByLabelText('인증 코드 입력'), '12345');
  expect(dismiss).not.toHaveBeenCalled();
  fireEvent.changeText(screen.getByLabelText('인증 코드 입력'), '123 456');
  expect(mockSetCode).toHaveBeenLastCalledWith('123456');
  expect(dismiss).toHaveBeenCalledTimes(1);
  expect(mockVerify).not.toHaveBeenCalled();
  fireEvent.press(screen.getByRole('button', { name: '인증 확인' }));
  expect(mockVerify).toHaveBeenCalledTimes(1);
});

it('submits the confirmed password from the keyboard and preserves the pending lock', () => {
  mockState.step = 'reset';
  const screen = render(<ForgotPasswordScreen />);
  fireEvent(screen.getByLabelText('새 비밀번호 확인 입력'), 'submitEditing');
  expect(mockReset).toHaveBeenCalledTimes(1);
  mockState.isLoading = true;
  screen.rerender(<ForgotPasswordScreen />);
  expect(screen.getByLabelText('새 비밀번호 입력').props.editable).toBe(false);
  expect(screen.getByLabelText('새 비밀번호 확인 입력').props.editable).toBe(false);
  expect(screen.getByRole('button', { name: '비밀번호 재설정' })).toBeDisabled();
});

it('returns to login when opened without navigation history', () => {
  const dismiss = jest.spyOn(Keyboard, 'dismiss');
  const screen = render(<ForgotPasswordScreen />);
  fireEvent.press(screen.getByRole('button', { name: '뒤로 가기' }));
  expect(dismiss).toHaveBeenCalled();
  expect(mockReplace).toHaveBeenCalledWith('/login');
  expect(mockBack).not.toHaveBeenCalled();
});
