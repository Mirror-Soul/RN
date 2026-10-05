import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useUpdatePreferredRegionMutation } from './useUpdatePreferredRegionMutation';
import { updatePreferredRegion } from '@/src/services/homeService';

let mockSession = { isLoggedIn: true, userUuid: 'me' };
jest.mock('@/src/store/useAuthStore', () => ({ useAuthStore: { getState: () => mockSession } }));
jest.mock('@/src/services/homeService', () => ({ updatePreferredRegion: jest.fn() }));
beforeEach(() => { jest.clearAllMocks(); mockSession = { isLoggedIn: true, userUuid: 'me' }; });
const payload = { anchorRegionId: 5, nearbyCount: 30 };

function setup() {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  const wrapper = ({ children }: { children: React.ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  return { client, ...renderHook(() => useUpdatePreferredRegionMutation(), { wrapper }) };
}

it('uses the server-calculated region list and invalidates recommendations after saving', async () => {
  const data = { ...payload, includedRegionIds: [5, 6] };
  (updatePreferredRegion as jest.Mock).mockResolvedValue({ result: data });
  const hook = setup();
  hook.client.setQueryData(['home', 'recommendations'], ['cached']);
  await act(async () => { await hook.result.current.mutateAsync(payload); });
  expect(hook.client.getQueryData(['home', 'preferredRegion'])).toEqual(data);
  expect(hook.client.getQueryState(['home', 'recommendations'])?.isInvalidated).toBe(true);
});

it('ignores an old account response after the session changes', async () => {
  let finish!: (value: object) => void;
  (updatePreferredRegion as jest.Mock).mockImplementation(() => new Promise(resolve => { finish = resolve; }));
  const hook = setup();
  act(() => hook.result.current.mutate(payload));
  await waitFor(() => expect(updatePreferredRegion).toHaveBeenCalled());
  mockSession = { isLoggedIn: true, userUuid: 'new-user' };
  await act(async () => finish({ result: payload }));
  expect(hook.client.getQueryData(['home', 'preferredRegion'])).toBeUndefined();
});

it('does not call the API when logged out', async () => {
  mockSession.isLoggedIn = false;
  const hook = setup();
  await act(async () => { await expect(hook.result.current.mutateAsync(payload)).rejects.toThrow('다시 로그인'); });
  expect(updatePreferredRegion).not.toHaveBeenCalled();
});
