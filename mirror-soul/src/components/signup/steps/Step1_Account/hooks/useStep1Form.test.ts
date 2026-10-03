import { act, renderHook } from '@testing-library/react-native';
import { sendVerificationCode, verifyCode } from '@/src/services/authService';
import { useStep1Form } from './useStep1Form';
import { Alert } from 'react-native';

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

it('ignores verification for an email changed while the request is pending', async () => {
  let finish!: (value: unknown) => void;
  (verifyCode as jest.Mock).mockImplementation(() => new Promise(resolve => { finish = resolve; }));
  const { result } = renderHook(() => useStep1Form());
  act(() => result.current.updateState({ email: 'old@example.com' }));
  await act(async () => { await result.current.handleSendEmailCode(); });
  let pending!: Promise<boolean>;
  act(() => { pending = result.current.handleVerifyEmail('123456'); });
  act(() => result.current.updateState({ email: 'new@example.com' }));
  await act(async () => { finish({ result: { verifySuccess: true } }); await pending; });
  expect(result.current.state.isEmailVerified).toBe(false);
  expect(result.current.isTimerActive).toBe(false);
  expect(result.current.isEmailActionLoading).toBe(false);
});

it('does not report an old send failure against a new email', async () => {
  let reject!: (reason: Error) => void;
  (sendVerificationCode as jest.Mock).mockImplementation(() => new Promise((_, fail) => { reject = fail; }));
  const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  const { result } = renderHook(() => useStep1Form());
  act(() => result.current.updateState({ email: 'old@example.com' }));
  let pending!: Promise<void>;
  act(() => { pending = result.current.handleSendEmailCode(); });
  act(() => result.current.updateState({ email: 'new@example.com' }));
  await act(async () => { reject(new Error('Old request failed')); await pending; });
  expect(alert).not.toHaveBeenCalled();
  expect(result.current.state.emailError).toBeUndefined();
  expect(result.current.isModalVisible).toBe(false);
  expect(result.current.isEmailActionLoading).toBe(false);
  alert.mockRestore();
});

it('blocks duplicate sends before React updates the loading state', async () => {
  let finish!: (value: unknown) => void;
  (sendVerificationCode as jest.Mock).mockImplementation(() => new Promise(resolve => { finish = resolve; }));
  const { result } = renderHook(() => useStep1Form());
  act(() => result.current.updateState({ email: 'me@example.com' }));
  let pending!: Promise<void>;
  act(() => { pending = result.current.handleSendEmailCode(); void result.current.handleSendEmailCode(); });
  expect(sendVerificationCode).toHaveBeenCalledTimes(1);
  await act(async () => { finish({ isSuccess: true }); await pending; });
});

it('offers a fresh code immediately after five incorrect attempts', async () => {
  (verifyCode as jest.Mock).mockResolvedValue({ result: { verifySuccess: false } });
  const { result } = renderHook(() => useStep1Form());
  act(() => result.current.updateState({ email: 'me@example.com' }));
  await act(async () => { await result.current.handleSendEmailCode(); });
  for (let index = 0; index < 5; index++) {
    await act(async () => { await result.current.handleVerifyEmail('123456'); });
  }
  expect(result.current.timeLeft).toBe(0);
  await act(async () => { await result.current.handleResendCode(); });
  expect(sendVerificationCode).toHaveBeenCalledTimes(2);
  expect(result.current.verifyAttemptCount).toBe(0);
  expect(result.current.timeLeft).toBe(180);
});
