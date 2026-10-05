import { act, renderHook } from '@testing-library/react-native';
import { Keyboard } from 'react-native';
import { useLoginForm } from './useLoginForm';

const mockLogin = jest.fn();
const mockPush = jest.fn();
jest.mock('./useLoginMutation', () => ({ useLoginMutation: () => ({ mutateAsync: mockLogin }) }));
jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush }) }));
jest.mock('@/src/utils/logger', () => ({ logger: { warn: jest.fn() } }));
beforeEach(() => { jest.clearAllMocks(); mockLogin.mockResolvedValue({}); });

it('blocks same-tick double submission, trims email, preserves password, and dismisses the keyboard', async () => {
  const dismiss = jest.spyOn(Keyboard, 'dismiss');
  let finish!: () => void;
  mockLogin.mockImplementation(() => new Promise<void>(resolve => { finish = resolve; }));
  const { result } = renderHook(() => useLoginForm('  me@example.com  '));
  act(() => result.current.setPassword(' pass1234 '));
  let pending!: Promise<void>;
  act(() => { pending = result.current.handleLogin(); void result.current.handleLogin(); });
  expect(mockLogin).toHaveBeenCalledTimes(1);
  expect(mockLogin).toHaveBeenCalledWith({ email: 'me@example.com', password: ' pass1234 ' });
  expect(dismiss).toHaveBeenCalled();
  await act(async () => { finish(); await pending; });
  expect(result.current.state.isSubmitting).toBe(false);
  dismiss.mockRestore();
});

it('keeps fields on timeout and allows retry without retyping', async () => {
  mockLogin.mockRejectedValueOnce({ code: 'TIMEOUT' });
  const { result } = renderHook(() => useLoginForm('me@example.com'));
  act(() => result.current.setPassword('pass1234'));
  await act(async () => { await result.current.handleLogin(); });
  expect(result.current.state).toMatchObject({ email: 'me@example.com', password: 'pass1234', isSubmitting: false });
  expect(result.current.state.generalError).toContain('지연');
  await act(async () => { await result.current.handleLogin(); });
  expect(mockLogin).toHaveBeenCalledTimes(2);
  expect(result.current.state.generalError).toBe('');
});

it('validates locally and sends only the email to password recovery', async () => {
  const { result } = renderHook(() => useLoginForm());
  await act(async () => { await result.current.handleLogin(); });
  expect(mockLogin).not.toHaveBeenCalled();
  expect(result.current.state.emailError).toBeTruthy();
  act(() => { result.current.setEmail('me@example.com'); result.current.setPassword('secret'); result.current.handleForgotPassword(); });
  // Navigation reads the latest rendered form, as a user tap does.
  act(() => result.current.handleForgotPassword());
  expect(mockPush).toHaveBeenLastCalledWith({ pathname: '/forgot-password', params: { email: 'me@example.com' } });
  expect(mockPush.mock.calls.every(([route]) => !('password' in route.params))).toBe(true);
});
