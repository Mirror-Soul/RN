import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useIntroductionQuery } from './useIntroductionQuery';
import { useProfileQuery } from './useProfileQuery';
import { useAccountInfoQuery } from '@/src/features/account/hooks/useAccountInfoQuery';
import { useTwinSyncQuery } from '@/src/features/growth/hooks/useTwinSyncQuery';
import { useModifyNicknameMutation } from '@/src/features/account/hooks/useModifyNicknameMutation';
import { getMyIntroduction, getMyProfile, modifyNickname, getAccountInfo } from '@/src/services/profileService';
import { getTwinSync } from '@/src/services/evolveService';
import { profileQueryKeys } from './profileQueryKeys';
import { introductionPreview } from '../constants/introductionPreview';

let mockSession = { userUuid: 'first', isLoggedIn: true };
jest.mock('@/src/store/useAuthStore', () => ({ useAuthStore: Object.assign((selector: (state: typeof mockSession) => unknown) => selector(mockSession), { getState: () => mockSession }) }));
jest.mock('@/src/services/profileService', () => ({ getMyIntroduction: jest.fn(), getMyProfile: jest.fn(), getAccountInfo: jest.fn(), modifyNickname: jest.fn() }));
jest.mock('@/src/services/evolveService', () => ({ getTwinSync: jest.fn() }));
let client: QueryClient;
beforeEach(() => {
  jest.clearAllMocks();
  mockSession = { userUuid: 'first', isLoggedIn: true };
  client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } });
});
afterEach(() => client.clear());
const wrapper = ({ children }: { children: React.ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;

it('does not request private profile or twin data without a logged-in account', async () => {
  mockSession = { userUuid: '', isLoggedIn: false };
  renderHook(() => { useIntroductionQuery(); useProfileQuery(); useTwinSyncQuery(); useAccountInfoQuery(); }, { wrapper });
  await act(async () => {});
  expect(getMyIntroduction).not.toHaveBeenCalled();
  expect(getMyProfile).not.toHaveBeenCalled();
  expect(getTwinSync).not.toHaveBeenCalled();
  expect(getAccountInfo).not.toHaveBeenCalled();
});

it('shows endpoint failures instead of replacing them with a fixture', async () => {
  (getMyIntroduction as jest.Mock).mockRejectedValue({ code: 'API_NOT_FOUND' });
  const hook = renderHook(() => useIntroductionQuery(), { wrapper });
  await waitFor(() => expect(hook.result.current.isError).toBe(true));
  expect(hook.result.current.data).toBeUndefined();
  expect(hook.result.current.isPreview).toBe(false);
});

it('cancels an old account request and isolates its data when accounts change', async () => {
  let firstSignal!: AbortSignal;
  (getMyIntroduction as jest.Mock).mockImplementationOnce((signal: AbortSignal) => {
    firstSignal = signal;
    return new Promise((_resolve, reject) => signal.addEventListener('abort', () => reject(new Error('aborted'))));
  }).mockResolvedValueOnce({ result: { ...introductionPreview, userUuid: 'second', name: '새 계정' } });
  const hook = renderHook(() => useIntroductionQuery(), { wrapper });
  await waitFor(() => expect(getMyIntroduction).toHaveBeenCalledTimes(1));
  mockSession = { userUuid: 'second', isLoggedIn: true };
  hook.rerender({});
  await waitFor(() => expect(hook.result.current.data?.name).toBe('새 계정'));
  expect(firstSignal.aborted).toBe(true);
  expect(client.getQueryData(profileQueryKeys.introduction('first'))).toBeUndefined();
  expect(client.getQueryData(profileQueryKeys.introduction('second'))).toHaveProperty('userUuid', 'second');
});

it('updates the public preview after nickname changes without overwriting another account', async () => {
  (modifyNickname as jest.Mock).mockResolvedValue({ isSuccess: true });
  client.setQueryData(profileQueryKeys.accountInfo('first'), { name: '옛 이름' });
  client.setQueryData(profileQueryKeys.me('first'), { name: '옛 이름', email: 'me@example.com' });
  client.setQueryData(profileQueryKeys.introduction('first'), { ...introductionPreview, name: '옛 이름' });
  client.setQueryData(profileQueryKeys.introduction('second'), { ...introductionPreview, name: '다른 계정' });
  const hook = renderHook(() => useModifyNicknameMutation(), { wrapper });
  await act(async () => { await hook.result.current.mutateAsync('새 이름'); });
  expect(client.getQueryData(profileQueryKeys.introduction('first'))).toHaveProperty('name', '새 이름');
  expect(client.getQueryData(profileQueryKeys.accountInfo('first'))).toHaveProperty('name', '새 이름');
  expect(client.getQueryData(profileQueryKeys.introduction('second'))).toHaveProperty('name', '다른 계정');
});

it('does not apply a late nickname response to the next logged-in account', async () => {
  let complete!: () => void;
  (modifyNickname as jest.Mock).mockImplementation(() => new Promise<void>(resolve => { complete = resolve; }));
  client.setQueryData(profileQueryKeys.accountInfo('second'), { name: '새 계정 이름' });
  const hook = renderHook(() => useModifyNicknameMutation(), { wrapper });
  act(() => hook.result.current.mutate('이전 계정 이름'));
  await waitFor(() => expect(modifyNickname).toHaveBeenCalled());
  mockSession = { userUuid: 'second', isLoggedIn: true };
  await act(async () => complete());
  expect(client.getQueryData(profileQueryKeys.accountInfo('second'))).toHaveProperty('name', '새 계정 이름');
});


it('prevents an earlier account read from restoring an old nickname after save', async () => {
  client.setQueryData(profileQueryKeys.accountInfo('first'), { name: '옛 이름' });
  let finish!: (response: unknown) => void;
  let requestSignal!: AbortSignal;
  (getAccountInfo as jest.Mock).mockImplementation((signal: AbortSignal) => {
    requestSignal = signal;
    return new Promise(resolve => { finish = resolve; });
  });
  (modifyNickname as jest.Mock).mockResolvedValue({ isSuccess: true });
  const hook = renderHook(() => ({ read: useAccountInfoQuery(), save: useModifyNicknameMutation() }), { wrapper });
  act(() => { void hook.result.current.read.refetch(); });
  await waitFor(() => expect(getAccountInfo).toHaveBeenCalled());
  await act(async () => { await hook.result.current.save.mutateAsync('새 이름'); });
  expect(requestSignal.aborted).toBe(true);
  await act(async () => { finish({ result: { name: '옛 이름' } }); });
  expect(client.getQueryData(profileQueryKeys.accountInfo('first'))).toHaveProperty('name', '새 이름');
  await waitFor(() => expect(hook.result.current.read.data?.name).toBe('새 이름'));
});
