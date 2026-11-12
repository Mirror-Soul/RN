import { renderHook, waitFor } from '@testing-library/react-native';
import { useReconcilePendingCall } from './useReconcilePendingCall';
import { logger } from '../utils/logger';

const mockReconcile = jest.fn();
jest.mock('../services/callService', () => ({ reconcilePendingCall: () => mockReconcile() }));
jest.mock('../utils/logger', () => ({ logger: { debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn() } }));
let mockAuth: { isLoggedIn: boolean; userUuid: string | null } = { isLoggedIn: true, userUuid: 'user-start' };
jest.mock('../store/useAuthStore', () => ({
  useAuthStore: (selector: (state: typeof mockAuth) => unknown) => selector(mockAuth),
}));

// 훅은 프로세스 단위 상태를 가지므로 테스트마다 서로 다른 계정을 쓴다.
beforeEach(() => {
  jest.clearAllMocks();
  mockReconcile.mockReset().mockResolvedValue(true);
});

it('ends a leftover call once when a signed-in account opens the app', () => {
  mockAuth = { isLoggedIn: true, userUuid: 'user-a' };
  const { rerender } = renderHook(() => useReconcilePendingCall());
  expect(mockReconcile).toHaveBeenCalledTimes(1);
  rerender({});
  rerender({});
  expect(mockReconcile).toHaveBeenCalledTimes(1);
});

it('waits for sign-in, then runs once', () => {
  mockAuth = { isLoggedIn: false, userUuid: null };
  const { rerender } = renderHook(() => useReconcilePendingCall());
  expect(mockReconcile).not.toHaveBeenCalled();
  mockAuth = { isLoggedIn: true, userUuid: 'user-b' };
  rerender({});
  expect(mockReconcile).toHaveBeenCalledTimes(1);
});

it('does not run for a signed-out session that still remembers an account id', () => {
  mockAuth = { isLoggedIn: false, userUuid: 'user-c' };
  renderHook(() => useReconcilePendingCall());
  expect(mockReconcile).not.toHaveBeenCalled();
});

it('does not run again for the same account in this process, so a call in progress is never cut off', () => {
  mockAuth = { isLoggedIn: true, userUuid: 'user-d' };
  const first = renderHook(() => useReconcilePendingCall());
  first.unmount();
  renderHook(() => useReconcilePendingCall());
  expect(mockReconcile).toHaveBeenCalledTimes(1);
});

it('runs for a different account that signs in later in the same process', () => {
  mockAuth = { isLoggedIn: true, userUuid: 'user-e' };
  const { rerender } = renderHook(() => useReconcilePendingCall());
  mockAuth = { isLoggedIn: true, userUuid: 'user-f' };
  rerender({});
  expect(mockReconcile).toHaveBeenCalledTimes(2);
});

it('logs and carries on if the cleanup fails unexpectedly', async () => {
  mockReconcile.mockRejectedValue(new Error('boom'));
  mockAuth = { isLoggedIn: true, userUuid: 'user-g' };
  renderHook(() => useReconcilePendingCall());
  await waitFor(() => expect(logger.warn).toHaveBeenCalled());
});
