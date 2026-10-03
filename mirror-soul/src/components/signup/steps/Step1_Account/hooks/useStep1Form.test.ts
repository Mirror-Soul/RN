import { act, renderHook } from '@testing-library/react-native';
import { sendVerificationCode, verifyCode } from '@/src/services/authService';
import { useStep1Form } from './useStep1Form';

jest.mock('@/src/services/authService', () => ({ sendVerificationCode: jest.fn(), verifyCode: jest.fn() }));
beforeEach(() => {
  jest.clearAllMocks();
  (sendVerificationCode as jest.Mock).mockResolvedValue({ isSuccess: true });
  (verifyCode as jest.Mock).mockResolvedValue({ result: { verifySuccess: true } });
});

it('clears the old code timer and verification when the email changes', async () => {
  const { result } = renderHook(() => useStep1Form());
  act(() => result.current.updateState({ email: 'old@example.com' }));
  await act(async () => { await result.current.handleSendEmailCode(); });
  expect(result.current.isTimerActive).toBe(true);
  act(() => result.current.updateState({ email: 'new@example.com' }));
  expect(result.current.isModalVisible).toBe(false);
  expect(result.current.isTimerActive).toBe(false);
  await act(async () => { await result.current.handleSendEmailCode(); });
  expect(sendVerificationCode).toHaveBeenLastCalledWith({ email: 'new@example.com' });
  await act(async () => { await result.current.handleVerifyEmail('123456'); });
  expect(result.current.state.isEmailVerified).toBe(true);
  act(() => result.current.updateState({ email: 'another@example.com' }));
  expect(result.current.state.isEmailVerified).toBe(false);
});

it('keeps marketing optional and PASS outside required signup conditions', () => {
  const { result } = renderHook(() => useStep1Form());
  act(() => result.current.updateState({ isEmailVerified: true, password: 'test1234', passwordConfirm: 'test1234', agreedToTerms: true, agreedToPrivacy: true, agreedToBiometricData: true, isAdultConfirmed: true }));
  expect(result.current.state.agreedToMarketing).toBe(false);
  expect(result.current.state.isIdentityVerified).toBe(false);
  expect(result.current.isFormValid).toBe(true);
  act(() => result.current.updateState({ agreedToBiometricData: false }));
  expect(result.current.isFormValid).toBe(false);
});
