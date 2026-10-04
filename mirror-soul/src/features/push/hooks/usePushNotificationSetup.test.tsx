import { act, renderHook, waitFor } from '@testing-library/react-native';
import { AppState, type AppStateStatus, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { getOrCreateInstallationId } from '@/src/utils/installationIdStorage';
import { usePushNotificationSetup } from './usePushNotificationSetup';

let mockSession = { isLoggedIn: true, userUuid: 'me' };
const mockRegister = jest.fn();
jest.mock('@/src/store/useAuthStore', () => ({ useAuthStore: Object.assign((selector: (s: typeof mockSession) => unknown) => selector(mockSession), { getState: () => mockSession }) }));
jest.mock('./useRegisterPushDeviceMutation', () => ({ useRegisterPushDeviceMutation: () => ({ mutateAsync: mockRegister }) }));
jest.mock('@/src/utils/installationIdStorage', () => ({ getOrCreateInstallationId: jest.fn() }));
jest.mock('@/src/utils/logger', () => ({ logger: { warn: jest.fn() } }));
jest.mock('expo-router', () => ({ router: { push: jest.fn() }, useRootNavigationState: () => ({ key: 'ready' }) }));
jest.mock('expo-notifications', () => ({ setNotificationHandler: jest.fn(), setNotificationChannelAsync: jest.fn(), getPermissionsAsync: jest.fn(), requestPermissionsAsync: jest.fn(), getDevicePushTokenAsync: jest.fn(), addPushTokenListener: jest.fn(() => ({ remove: jest.fn() })), useLastNotificationResponse: () => null, AndroidImportance: { HIGH: 4 } }));
let foreground!: (state: AppStateStatus) => void;
const oldPlatform = Platform.OS;
beforeEach(() => {
  jest.clearAllMocks();
  mockSession = { isLoggedIn: true, userUuid: 'me' };
  Object.defineProperty(Platform, 'OS', { configurable: true, value: 'android' });
  jest.spyOn(AppState, 'addEventListener').mockImplementation((_type, listener) => { foreground = listener; return { remove: jest.fn() }; });
  (Notifications.setNotificationChannelAsync as jest.Mock).mockResolvedValue(undefined);
  (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ granted: false, canAskAgain: true });
  (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({ granted: false });
  (Notifications.getDevicePushTokenAsync as jest.Mock).mockResolvedValue({ data: 'device-token' });
  (getOrCreateInstallationId as jest.Mock).mockResolvedValue('installation');
  mockRegister.mockResolvedValue({ isSuccess: true });
});
afterEach(() => { jest.restoreAllMocks(); Object.defineProperty(Platform, 'OS', { configurable: true, value: oldPlatform }); });

it('registers permission granted in OS settings without another prompt or repeated registration', async () => {
  renderHook(() => usePushNotificationSetup());
  await waitFor(() => expect(Notifications.requestPermissionsAsync).toHaveBeenCalledTimes(1));
  expect(mockRegister).not.toHaveBeenCalled();
  (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ granted: true });
  await act(async () => foreground('active'));
  await waitFor(() => expect(mockRegister).toHaveBeenCalledTimes(1));
  expect(mockRegister).toHaveBeenCalledWith({ installationId: 'installation', pushToken: 'device-token', platform: 'ANDROID' });
  await act(async () => foreground('active'));
  expect(mockRegister).toHaveBeenCalledTimes(1);
  expect(Notifications.requestPermissionsAsync).toHaveBeenCalledTimes(1);
});

it('does not reopen a declined permission prompt when the app returns', async () => {
  renderHook(() => usePushNotificationSetup());
  await waitFor(() => expect(Notifications.requestPermissionsAsync).toHaveBeenCalledTimes(1));
  await act(async () => foreground('active'));
  expect(Notifications.requestPermissionsAsync).toHaveBeenCalledTimes(1);
  expect(mockRegister).not.toHaveBeenCalled();
});

it('abandons registration if the account changes while the installation ID is loading', async () => {
  (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ granted: true });
  let finish!: (value: string) => void;
  (getOrCreateInstallationId as jest.Mock).mockImplementation(() => new Promise(resolve => { finish = resolve; }));
  const hook = renderHook(() => usePushNotificationSetup());
  await waitFor(() => expect(getOrCreateInstallationId).toHaveBeenCalled());
  mockSession = { isLoggedIn: true, userUuid: 'other' };
  (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ granted: false, canAskAgain: false });
  hook.rerender({});
  await act(async () => finish('installation'));
  expect(mockRegister).not.toHaveBeenCalled();
});
