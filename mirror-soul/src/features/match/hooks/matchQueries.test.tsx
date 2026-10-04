import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useReceivedMeetingRequestsQuery } from './useReceivedMeetingRequestsQuery';
import { useAcceptMeetingRequestMutation } from './useAcceptMeetingRequestMutation';
import { useRejectMeetingRequestMutation } from './useRejectMeetingRequestMutation';
import { useMatchingStatus } from '@/src/features/home/hooks/useMatchingStatus';
import {
  getReceivedMeetingRequests,
  acceptMeetingRequest,
  rejectMeetingRequest,
} from '@/src/services/meetingService';
import { updateMatchingStatus } from '@/src/services/matchService';
import { matchQueryKeys } from './matchQueryKeys';
let mockSession = { userUuid: 'me', isLoggedIn: true };
jest.mock('@/src/store/useAuthStore', () => ({
  useAuthStore: Object.assign(
    (selector: (s: typeof mockSession) => unknown) => selector(mockSession),
    { getState: () => mockSession },
  ),
}));
jest.mock('@/src/services/meetingService', () => ({
  getReceivedMeetingRequests: jest.fn(),
  acceptMeetingRequest: jest.fn(),
  rejectMeetingRequest: jest.fn(),
}));
jest.mock('@/src/services/matchService', () => ({
  getMatchingStatus: jest.fn(),
  updateMatchingStatus: jest.fn(),
}));
jest.mock('@/src/components/common/Toast/ToastProvider', () => ({
  useToast: () => ({ showToast: jest.fn() }),
}));
let client: QueryClient;
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={client}>{children}</QueryClientProvider>
);
beforeEach(() => {
  jest.clearAllMocks();
  mockSession = { userUuid: 'me', isLoggedIn: true };
  client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  });
});
afterEach(() => client.clear());

it('isolates received requests by account and cancels the old read', async () => {
  let signal!: AbortSignal;
  (getReceivedMeetingRequests as jest.Mock)
    .mockImplementationOnce((input: AbortSignal) => {
      signal = input;
      return new Promise(() => {});
    })
    .mockResolvedValue({ result: { totalCount: 0, requests: [] } });
  const hook = renderHook(() => useReceivedMeetingRequestsQuery(), { wrapper });
  await waitFor(() =>
    expect(getReceivedMeetingRequests).toHaveBeenCalledTimes(1),
  );
  mockSession = { userUuid: 'other', isLoggedIn: true };
  hook.rerender({});
  await waitFor(() => expect(hook.result.current.data?.requests).toEqual([]));
  expect(signal.aborted).toBe(true);
  expect(client.getQueryData(matchQueryKeys.requests('me'))).toBeUndefined();
});

it.each(['accept', 'reject'] as const)(
  'ignores a late %s response after an account change',
  async (kind) => {
    const service = (
      kind === 'accept' ? acceptMeetingRequest : rejectMeetingRequest
    ) as jest.Mock;
    let finish!: (response: unknown) => void;
    service.mockImplementation(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );
    const requests = { totalCount: 1, requests: [{ requestId: 1 }] };
    client.setQueryData(matchQueryKeys.requests('me'), requests);
    client.setQueryData(matchQueryKeys.requests('other'), requests);
    const hook = renderHook(
      () => {
        const accept = useAcceptMeetingRequestMutation();
        const reject = useRejectMeetingRequestMutation();
        return kind === 'accept' ? accept : reject;
      },
      { wrapper },
    );
    let pending!: Promise<unknown>;
    act(() => {
      pending = hook.result.current.mutateAsync(1);
    });
    await waitFor(() => expect(service).toHaveBeenCalledWith(1));
    mockSession = { userUuid: 'other', isLoggedIn: true };
    hook.rerender({});
    await act(async () => {
      finish({ result: { requestId: 1, chatRoomId: 10 } });
      await pending;
    });
    expect(client.getQueryData(matchQueryKeys.requests('other'))).toEqual(
      requests,
    );
    expect(client.getQueryData(matchQueryKeys.requests('me'))).toEqual(
      requests,
    );
  },
);

it('uses the remaining items as the confirmed count and ignores a delayed stale read', async () => {
  client.setQueryData(matchQueryKeys.requests('me'), {
    totalCount: 20,
    requests: [{ requestId: 1 }, { requestId: 2 }],
  });
  let signal!: AbortSignal;
  let finishRead!: (response: unknown) => void;
  (getReceivedMeetingRequests as jest.Mock).mockImplementation(
    (input: AbortSignal) => {
      signal = input;
      return new Promise((resolve) => {
        finishRead = resolve;
      });
    },
  );
  (rejectMeetingRequest as jest.Mock).mockResolvedValue({
    result: { requestId: 1 },
  });
  const hook = renderHook(
    () => ({
      query: useReceivedMeetingRequestsQuery(),
      reject: useRejectMeetingRequestMutation(),
    }),
    { wrapper },
  );
  act(() => {
    void hook.result.current.query.refetch();
  });
  await waitFor(() => expect(getReceivedMeetingRequests).toHaveBeenCalled());
  await act(async () => {
    await hook.result.current.reject.mutateAsync(1);
  });
  expect(signal.aborted).toBe(true);
  await act(async () =>
    finishRead({
      result: { totalCount: 2, requests: [{ requestId: 1 }, { requestId: 2 }] },
    }),
  );
  expect(client.getQueryData(matchQueryKeys.requests('me'))).toEqual({
    totalCount: 1,
    requests: [{ requestId: 2 }],
  });
});

it('blocks rapid matching-status changes and rejects an old account toggle', async () => {
  client.setQueryData(matchQueryKeys.status('me'), { matchingEnabled: true });
  let finish!: (response: unknown) => void;
  (updateMatchingStatus as jest.Mock).mockImplementation(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  const hook = renderHook(() => useMatchingStatus(), { wrapper });
  const oldToggle = hook.result.current.handleToggle;
  act(() => {
    oldToggle();
    oldToggle();
  });
  await waitFor(() => expect(updateMatchingStatus).toHaveBeenCalledTimes(1));
  mockSession = { userUuid: 'other', isLoggedIn: true };
  hook.rerender({});
  await act(async () => finish({ result: { matchingEnabled: false } }));
  act(() => oldToggle());
  expect(updateMatchingStatus).toHaveBeenCalledTimes(1);
  expect(client.getQueryData(matchQueryKeys.status('other'))).toBeUndefined();
});
