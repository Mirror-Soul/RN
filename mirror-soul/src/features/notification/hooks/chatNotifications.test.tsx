import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getChatRooms, updateNotificationSetting } from '@/src/services/chatService';
import { useNotificationChatRooms } from './useNotificationChatRooms';
import { notificationQueryKeys } from './notificationQueryKeys';

let mockSession = { userUuid: 'me', isLoggedIn: true };
const mockToast = jest.fn();
jest.mock('@/src/store/useAuthStore', () => ({ useAuthStore: Object.assign((selector: (s: typeof mockSession) => unknown) => selector(mockSession), { getState: () => mockSession }) }));
jest.mock('@/src/services/chatService', () => ({ getChatRooms: jest.fn(), updateNotificationSetting: jest.fn() }));
jest.mock('@/src/components/common/Toast/ToastProvider', () => ({ useToast: () => ({ showToast: mockToast }) }));
const rooms = { totalCount: 2, rooms: [{ chatRoomId: 10, notificationEnabled: true, partner: { name: '수연' } }, { chatRoomId: 11, notificationEnabled: false, partner: { name: '민수' } }] };
let client: QueryClient;
const wrapper = ({ children }: { children: React.ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;
beforeEach(() => {
  jest.clearAllMocks();
  mockSession = { userUuid: 'me', isLoggedIn: true };
  client = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: Infinity, gcTime: Infinity } } });
  (getChatRooms as jest.Mock).mockResolvedValue({ result: rooms });
});
afterEach(() => client.clear());

it('loads the room list only when the management sheet opens', async () => {
  const hook = renderHook<ReturnType<typeof useNotificationChatRooms>, { visible: boolean }>(({ visible }) => useNotificationChatRooms(visible), { wrapper, initialProps: { visible: false } });
  expect(getChatRooms).not.toHaveBeenCalled();
  hook.rerender({ visible: true });
  await waitFor(() => expect(hook.result.current.data?.rooms).toHaveLength(2));
  expect(getChatRooms).toHaveBeenCalledTimes(1);
});

it('saves one room and synchronizes the list and room-option caches', async () => {
  client.setQueryData(notificationQueryKeys.chatRooms('me'), rooms);
  client.setQueryData(['chat', 'rooms'], rooms);
  (updateNotificationSetting as jest.Mock).mockResolvedValue({ result: { chatRoomId: 10, enabled: false } });
  const hook = renderHook(() => useNotificationChatRooms(true), { wrapper });
  act(() => hook.result.current.toggle(10));
  await waitFor(() => expect(hook.result.current.data?.rooms[0].notificationEnabled).toBe(false));
  expect(updateNotificationSetting).toHaveBeenCalledWith(10, false);
  expect(hook.result.current.data?.rooms[1].notificationEnabled).toBe(false);
  expect(client.getQueryData(notificationQueryKeys.chatRoom('me', 10))).toEqual({ chatRoomId: 10, enabled: false });
  expect(client.getQueryData(['chat', 'rooms'])).toHaveProperty('rooms.0.notificationEnabled', false);
});

it('keeps the confirmed setting on failure and blocks rapid duplicate changes', async () => {
  client.setQueryData(notificationQueryKeys.chatRooms('me'), rooms);
  let fail!: (reason: Error) => void;
  (updateNotificationSetting as jest.Mock).mockImplementation(() => new Promise((_resolve, reject) => { fail = reject; }));
  const hook = renderHook(() => useNotificationChatRooms(true), { wrapper });
  act(() => { hook.result.current.toggle(10); hook.result.current.toggle(10); });
  await waitFor(() => expect(updateNotificationSetting).toHaveBeenCalledTimes(1));
  await act(async () => fail(new Error('offline')));
  await waitFor(() => expect(hook.result.current.saveError).toBeTruthy());
  expect(mockToast).not.toHaveBeenCalled();
  expect(hook.result.current.data?.rooms[0].notificationEnabled).toBe(true);
  await waitFor(() => expect(hook.result.current.isSaving).toBe(false));
});

it('ignores late saves and stale click callbacks after an account change', async () => {
  client.setQueryData(notificationQueryKeys.chatRooms('me'), rooms);
  let finish!: (response: unknown) => void;
  (updateNotificationSetting as jest.Mock).mockImplementation(() => new Promise(resolve => { finish = resolve; }));
  const hook = renderHook(() => useNotificationChatRooms(true), { wrapper });
  const oldToggle = hook.result.current.toggle;
  act(() => hook.result.current.toggle(10));
  await waitFor(() => expect(updateNotificationSetting).toHaveBeenCalled());
  mockSession = { userUuid: 'other', isLoggedIn: true };
  await act(async () => finish({ result: { chatRoomId: 10, enabled: false } }));
  act(() => oldToggle(11));
  expect(updateNotificationSetting).toHaveBeenCalledTimes(1);
  expect(client.getQueryData(notificationQueryKeys.chatRoom('other', 10))).toBeUndefined();
  expect(client.getQueryData(notificationQueryKeys.chatRooms('me'))).toHaveProperty('rooms.0.notificationEnabled', true);
});

it('cancels a refresh started during save so an older list cannot undo the setting', async () => {
  client.setQueryData(notificationQueryKeys.chatRooms('me'), rooms);
  let finishSave!: (response: unknown) => void;
  let finishRead!: (response: unknown) => void;
  let signal!: AbortSignal;
  (updateNotificationSetting as jest.Mock).mockImplementation(() => new Promise(resolve => { finishSave = resolve; }));
  (getChatRooms as jest.Mock).mockImplementation((input: AbortSignal) => { signal = input; return new Promise(resolve => { finishRead = resolve; }); });
  const hook = renderHook(() => useNotificationChatRooms(true), { wrapper });
  act(() => hook.result.current.toggle(10));
  await waitFor(() => expect(updateNotificationSetting).toHaveBeenCalled());
  act(() => { void hook.result.current.refetch(); });
  await waitFor(() => expect(getChatRooms).toHaveBeenCalled());
  await act(async () => finishSave({ result: { chatRoomId: 10, enabled: false } }));
  await waitFor(() => expect(hook.result.current.data?.rooms[0].notificationEnabled).toBe(false));
  expect(signal.aborted).toBe(true);
  await act(async () => finishRead({ result: rooms }));
  expect(hook.result.current.data?.rooms[0].notificationEnabled).toBe(false);
});
