import React from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { sendVerificationCode } from '@/src/services/authService';
import { useStep1Form } from '../hooks/useStep1Form';
import EmailSection from './EmailSection';

const mockLogin = jest.fn();
jest.mock('@/src/services/authService', () => ({ sendVerificationCode: jest.fn(), verifyCode: jest.fn() }));
jest.mock('./EmailVerificationModal', () => () => null);
jest.mock('@/src/hooks/useThemeColors', () => ({ useThemeColors: () => ({ colors: jest.requireActual('@/src/constants/theme').lightTheme, isDark: false }) }));
function SignupEmail() {
  const form = useStep1Form('me@example.com');
  return <EmailSection state={form.state} onChange={form.updateState} isModalVisible={form.isModalVisible} setIsModalVisible={form.setIsModalVisible}
    onSendCode={() => void form.handleSendEmailCode()} onVerify={form.handleVerifyEmail} isLoading={form.isEmailActionLoading}
    onExistingAccountLogin={() => mockLogin(form.state.email)} />;
}
beforeEach(() => { jest.clearAllMocks(); });

it('offers login for a server-confirmed existing account, keeps its email, and resets the notice when edited', async () => {
  (sendVerificationCode as jest.Mock).mockRejectedValue({ code: 'USER_4090' });
  const screen = render(<SignupEmail />);
  fireEvent.press(screen.getByLabelText('인증 코드 받기'));
  await waitFor(() => expect(screen.getByLabelText('로그인하고 계속')).toBeEnabled());
  expect(screen.getByDisplayValue('me@example.com')).toBeTruthy();
  fireEvent.press(screen.getByLabelText('로그인하고 계속'));
  expect(mockLogin).toHaveBeenCalledWith('me@example.com');
  expect(sendVerificationCode).toHaveBeenCalledTimes(1);
  fireEvent.changeText(screen.getByLabelText('이메일 입력란'), 'new@example.com');
  expect(screen.queryByLabelText('로그인하고 계속')).toBeNull();
  expect(screen.getByLabelText('인증 코드 받기')).toBeEnabled();
});

it('locks the email during a request and does not call another conflict an existing email', async () => {
  const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  let fail!: (error: unknown) => void;
  (sendVerificationCode as jest.Mock).mockImplementation(() => new Promise((_, reject) => { fail = reject; }));
  const screen = render(<SignupEmail />);
  fireEvent.press(screen.getByLabelText('인증 코드 받기'));
  expect(screen.getByLabelText('이메일 입력란').props.editable).toBe(false);
  await act(async () => { fail({ code: 'DUPLICATE_LOGINID' }); });
  expect(screen.queryByLabelText('로그인하고 계속')).toBeNull();
  expect(screen.getByDisplayValue('me@example.com')).toBeTruthy();
  expect(screen.getByLabelText('이메일 입력란').props.editable).toBe(true);
  expect(alert).toHaveBeenCalled();
  alert.mockRestore();
});
