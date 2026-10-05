import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useBlockUserMutation } from './useBlockUserMutation';

const mockBlock = jest.fn();
let mockUserUuid = 'current-account';
jest.mock('@/src/services/blockService', () => ({ blockUser: (uuid: string) => mockBlock(uuid) }));
jest.mock('@/src/store/useAuthStore', () => ({ useAuthStore: { getState: () => ({ userUuid: mockUserUuid }) } }));

function setup() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity }, mutations: { retry: false, gcTime: Infinity } } });
  client.setQueryData(['chat', 'rooms'], { totalCount: 2, rooms: [{ chatRoomId: 1, partner: { userUuid: 'blocked' } }, { chatRoomId: 2, partner: { userUuid: 'other' } }] });
  client.setQueryData(['history', 'calls'], { summary: { totalCount: 2, receivedCount: 1, sentCount: 1 }, groups: [{ date: '2026-10-05', histories: [{ type: 'SENT', partner: { userUuid: 'blocked' } }, { type: 'RECEIVED', partner: { userUuid: 'other' } }] }] });
  client.setQueryData(['home', 'recommendations'], { pageParams: [0, 1], pages: [{ recommendations: [{ userUuid: 'blocked' }, { userUuid: 'other' }], page: 0, hasNext: true }, { recommendations: [{ userUuid: 'blocked' }], page: 1, hasNext: false }] });
  client.setQueryData(['match', 'meetingRequests', mockUserUuid], { totalCount: 2, requests: [{ senderUserUuid: 'blocked' }, { senderUserUuid: 'other' }] });
  client.setQueryData(['home', 'recommendationDetail', 'blocked'], { userUuid: 'blocked' });
  client.setQueryData(['history', 'talkLogs', 41], { partner: { userUuid: 'blocked' }, talkLogs: [] });
  client.setQueryData(['history', 'talkLogs', 42], { partner: { userUuid: 'other' }, talkLogs: [] });
  const wrapper = ({ children }: { children: React.ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  return { client, ...renderHook(useBlockUserMutation, { wrapper }) };
}
beforeEach(() => { mockUserUuid = 'current-account'; mockBlock.mockReset().mockResolvedValue({}); });

it('updates all peer lists after server success without changing other peers or pagination', async () => {
  const { client, result, unmount } = setup();
  await act(async () => { await result.current.mutateAsync('blocked'); });
  expect(mockBlock).toHaveBeenCalledWith('blocked');
  expect(client.getQueryData(['chat', 'rooms'])).toMatchObject({ totalCount: 1, rooms: [{ partner: { userUuid: 'other' } }] });
  expect(client.getQueryData(['history', 'calls'])).toMatchObject({ summary: { totalCount: 1, receivedCount: 1, sentCount: 0 }, groups: [{ histories: [{ partner: { userUuid: 'other' } }] }] });
  expect(client.getQueryData(['home', 'recommendations'])).toMatchObject({ pageParams: [0, 1], pages: [{ recommendations: [{ userUuid: 'other' }], hasNext: true }, { recommendations: [], hasNext: false }] });
  expect(client.getQueryData(['match', 'meetingRequests', mockUserUuid])).toMatchObject({ totalCount: 1, requests: [{ senderUserUuid: 'other' }] });
  expect(client.getQueryData(['home', 'recommendationDetail', 'blocked'])).toBeUndefined();
  expect(client.getQueryData(['history', 'talkLogs', 41])).toBeUndefined();
  expect(client.getQueryData(['history', 'talkLogs', 42])).toBeDefined();
  unmount(); client.clear();
});

it('preserves all cached lists when the server rejects the block', async () => {
  mockBlock.mockRejectedValue(new Error('offline'));
  const { client, result, unmount } = setup();
  await act(async () => { await expect(result.current.mutateAsync('blocked')).rejects.toThrow('offline'); });
  expect(client.getQueryData(['chat', 'rooms'])).toMatchObject({ totalCount: 2 });
  expect(client.getQueryData(['history', 'calls'])).toMatchObject({ summary: { totalCount: 2 } });
  expect(client.getQueryData(['home', 'recommendationDetail', 'blocked'])).toBeDefined();
  unmount(); client.clear();
});

it('does not mutate caches after the account changes while blocking is in flight', async () => {
  let finish!: (value: unknown) => void;
  mockBlock.mockImplementation(() => new Promise(resolve => { finish = resolve; }));
  const { client, result, unmount } = setup();
  let pending!: Promise<unknown>;
  act(() => { pending = result.current.mutateAsync('blocked'); });
  await waitFor(() => expect(mockBlock).toHaveBeenCalled());
  mockUserUuid = 'new-account';
  await act(async () => { finish({}); await pending; });
  expect(client.getQueryData(['chat', 'rooms'])).toMatchObject({ totalCount: 2 });
  unmount(); client.clear();
});
