import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getChatRooms, updateNotificationSetting } from '@/src/services/chatService';
import { ChatNotificationSheet } from './ChatNotificationSheet';

const mockSession = { userUuid: 'me', isLoggedIn: true };
jest.mock('@/src/store/useAuthStore', () => ({ useAuthStore: Object.assign((selector: (s: typeof mockSession) => unknown) => selector(mockSession), { getState: () => mockSession }) }));
jest.mock('@/src/services/chatService', () => ({ getChatRooms: jest.fn(), updateNotificationSetting: jest.fn() }));
jest.mock('@/src/components/common/Toast/ToastProvider', () => ({ useToast: () => ({ showToast: jest.fn() }) }));
jest.mock('@/src/hooks/useThemeColors', () => ({ useThemeColors: () => ({ colors: jest.requireActual('@/src/constants/theme').lightTheme }) }));
jest.mock('@/src/features/profile/hooks/useProfileRefresh', () => ({ useProfileRefresh: jest.fn() }));
jest.mock('react-native-safe-area-context', () => ({ useSafeAreaInsets: () => ({ top: 0, bottom: 20, left: 0, right: 0 }) }));
jest.mock('@expo/vector-icons', () => ({ Feather: () => null }));
let client: QueryClient;
beforeEach(() => {
  jest.clearAllMocks();
  client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } });
});
afterEach(() => client.clear());

it('loads rooms when opened, saves a visible switch, and leaves the other room unchanged', async () => {
  (getChatRooms as jest.Mock).mockResolvedValue({ result: { totalCount: 2, rooms: [
    { chatRoomId: 10, notificationEnabled: true, partner: { name: '수연' } },
    { chatRoomId: 11, notificationEnabled: true, partner: { name: '민수' } },
  ] } });
  (updateNotificationSetting as jest.Mock).mockResolvedValue({ result: { chatRoomId: 10, enabled: false } });
  const close = jest.fn();
  const screen = render(<QueryClientProvider client={client}><ChatNotificationSheet visible={false} onClose={close} /></QueryClientProvider>);
  expect(getChatRooms).not.toHaveBeenCalled();
  screen.rerender(<QueryClientProvider client={client}><ChatNotificationSheet visible onClose={close} /></QueryClientProvider>);
  fireEvent.press(await screen.findByRole('switch', { name: '수연', checked: true }));
  await waitFor(() => expect(screen.getByRole('switch', { name: '수연', checked: false })).toBeEnabled());
  expect(updateNotificationSetting).toHaveBeenCalledWith(10, false);
  expect(screen.getByRole('switch', { name: '민수', checked: true })).toBeEnabled();
  fireEvent.press(screen.getAllByLabelText('대화방 알림 관리 닫기')[0]);
  expect(close).toHaveBeenCalledTimes(1);
});

it('offers retry after a list error and explains an empty result without switches', async () => {
  (getChatRooms as jest.Mock).mockRejectedValueOnce(new Error('offline')).mockResolvedValue({ result: { totalCount: 0, rooms: [] } });
  const screen = render(<QueryClientProvider client={client}><ChatNotificationSheet visible onClose={jest.fn()} /></QueryClientProvider>);
  await screen.findByText('대화방 알림 설정을 불러오지 못했어요.');
  fireEvent.press(screen.getByLabelText('대화방 알림 다시 불러오기'));
  await screen.findByText('아직 대화방이 없어요');
  expect(screen.queryByRole('switch')).toBeNull();
  expect(updateNotificationSetting).not.toHaveBeenCalled();
});

it('shows a save error inside the native modal and lets the user retry the confirmed switch', async () => {
  (getChatRooms as jest.Mock).mockResolvedValue({ result: { totalCount: 1, rooms: [{ chatRoomId: 10, notificationEnabled: true, partner: { name: '수연' } }] } });
  (updateNotificationSetting as jest.Mock).mockRejectedValueOnce({ code: 'NETWORK_ERROR', message: 'Network Error' }).mockResolvedValue({ result: { chatRoomId: 10, enabled: false } });
  const screen = render(<QueryClientProvider client={client}><ChatNotificationSheet visible onClose={jest.fn()} /></QueryClientProvider>);
  fireEvent.press(await screen.findByRole('switch', { name: '수연', checked: true }));
  await screen.findByText('네트워크 연결을 확인해주세요.');
  fireEvent.press(screen.getByRole('switch', { name: '수연', checked: true }));
  await waitFor(() => expect(screen.getByRole('switch', { name: '수연', checked: false })).toBeEnabled());
  expect(screen.queryByRole('alert')).toBeNull();
});
