import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { useCallDetail } from './useCallDetail';
import { getTalkLogs } from '@/src/services/historyService';

jest.mock('@/src/services/historyService', () => ({ getTalkLogs: jest.fn(), updateTalkLog: jest.fn() }));
jest.mock('@/src/store/useAuthStore', () => ({ useAuthStore: (selector: (state: { isLoggedIn: boolean }) => unknown) => selector({ isLoggedIn: true }) }));
jest.mock('@/src/components/common/Toast/ToastProvider', () => ({ useToast: () => ({ showToast: jest.fn() }) }));
const mockGet = getTalkLogs as jest.Mock;
function createWrapper() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  return function Wrapper({ children }: { children: React.ReactNode }) { return <QueryClientProvider client={client}>{children}</QueryClientProvider>; };
}
beforeEach(() => jest.clearAllMocks());

it.each([0, -1, 1.5, NaN, Infinity])('does not fetch an invalid history ID: %s', async callId => {
  renderHook(() => useCallDetail(callId), { wrapper: createWrapper() });
  await act(async () => { await Promise.resolve(); });
  expect(mockGet).not.toHaveBeenCalled();
});
it('fetches and refreshes the exact current record', async () => {
  mockGet.mockResolvedValue({ result: { callId: 41, talkLogs: [] } });
  const { result } = renderHook(() => useCallDetail(41), { wrapper: createWrapper() });
  await waitFor(() => expect(result.current.data?.callId).toBe(41));
  expect(mockGet).toHaveBeenCalledWith(41);
  await act(async () => { await result.current.refetch(); });
  expect(mockGet.mock.calls).toEqual([[41], [41]]);
});
