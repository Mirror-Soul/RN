import React from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { Linking } from 'react-native';
import * as Notifications from 'expo-notifications';
import { NotificationPermissionCard } from './NotificationPermissionCard';

let mockRefresh!: () => Promise<unknown>;
jest.mock('expo-notifications', () => ({ getPermissionsAsync: jest.fn(), requestPermissionsAsync: jest.fn(), IosAuthorizationStatus: { PROVISIONAL: 3, EPHEMERAL: 4 } }));
jest.mock('@/src/features/profile/hooks/useProfileRefresh', () => ({ useProfileRefresh: (refresh: () => Promise<unknown>) => { mockRefresh = refresh; jest.requireActual('react').useEffect(() => { void refresh(); }, [refresh]); } }));
jest.mock('@/src/hooks/useThemeColors', () => ({ useThemeColors: () => ({ colors: jest.requireActual('@/src/constants/theme').lightTheme }) }));
jest.mock('@expo/vector-icons', () => ({ Feather: () => null }));
beforeEach(() => jest.clearAllMocks());
afterEach(() => jest.restoreAllMocks());

it('reads permission without a prompt and refreshes changes made in OS settings', async () => {
  (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ granted: false });
  const open = jest.spyOn(Linking, 'openSettings').mockResolvedValue(undefined);
  const screen = render(<NotificationPermissionCard />);
  await screen.findByText('기기 알림 꺼짐');
  fireEvent.press(screen.getByLabelText('기기 알림 설정 열기'));
  await waitFor(() => expect(open).toHaveBeenCalledTimes(1));
  (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ granted: true });
  await act(async () => { await mockRefresh(); });
  expect(screen.getByText('기기 알림 허용됨')).toBeTruthy();
  expect(Notifications.requestPermissionsAsync).not.toHaveBeenCalled();
});

it('distinguishes quiet provisional permission from ordinary permission', async () => {
  (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ granted: false, ios: { status: 3 } });
  const screen = render(<NotificationPermissionCard />);
  await screen.findByText('조용한 알림 허용됨');
});

it('recovers a permission-read error and explains a failed settings link', async () => {
  (Notifications.getPermissionsAsync as jest.Mock).mockRejectedValueOnce(new Error('unavailable')).mockResolvedValue({ granted: true });
  jest.spyOn(Linking, 'openSettings').mockRejectedValue(new Error('settings unavailable'));
  const screen = render(<NotificationPermissionCard />);
  fireEvent.press(await screen.findByLabelText('기기 알림 권한 다시 확인'));
  await screen.findByText('기기 알림 허용됨');
  fireEvent.press(screen.getByLabelText('기기 알림 설정 열기'));
  await screen.findByText('설정을 열지 못했어요. 휴대폰 설정에서 Mirror Soul의 알림 항목을 찾아주세요.');
});
