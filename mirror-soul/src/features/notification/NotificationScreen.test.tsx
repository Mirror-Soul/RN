import React from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { Switch } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NotificationScreen } from './NotificationScreen';
import { getAlarmSetting, modifyAlarmSetting } from '@/src/services/profileService';

const mockSession = { userUuid: 'me', isLoggedIn: true };
jest.mock('@/src/store/useAuthStore', () => ({ useAuthStore: Object.assign((selector: (s: typeof mockSession) => unknown) => selector(mockSession), { getState: () => mockSession }) }));
jest.mock('@/src/services/profileService', () => ({ getAlarmSetting: jest.fn(), modifyAlarmSetting: jest.fn() }));
jest.mock('@/src/components/common/Toast/ToastProvider', () => ({ useToast: () => ({ showToast: jest.fn() }) }));
jest.mock('@/src/hooks/useThemeColors', () => ({ useThemeColors: () => ({ colors: jest.requireActual('@/src/constants/theme').lightTheme }) }));
jest.mock('@/src/features/profile/hooks/useProfileRefresh', () => ({ useProfileRefresh: jest.fn() }));
jest.mock('@/src/components/common/Header', () => ({ Header: () => null }));
jest.mock('@/src/components/common/ScreenLayout', () => ({ ScreenLayout: jest.requireActual('react-native').View }));
jest.mock('expo-router', () => ({ useRouter: () => ({ canGoBack: () => true, back: jest.fn() }) }));
jest.mock('@expo/vector-icons', () => ({ Feather: () => null }));
jest.mock('./components/NotificationPermissionCard', () => ({ NotificationPermissionCard: () => null }));
jest.mock('./components/ChatNotificationSheet', () => ({ ChatNotificationSheet: () => null }));
let client: QueryClient;
const wrapper = ({ children }: { children: React.ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;
beforeEach(() => {
  jest.clearAllMocks();
  client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } });
  (getAlarmSetting as jest.Mock).mockResolvedValue({ result: { missedCallNotificationEnabled: true, lowTimeNotificationEnabled: true } });
});
afterEach(() => client.clear());

it('keeps the unrelated native switch appearance and value while saving and blocks overlapping requests', async () => {
  let finish!: (result: unknown) => void;
  (modifyAlarmSetting as jest.Mock).mockImplementation(() => new Promise(resolve => { finish = resolve; }));
  const screen = render(<NotificationScreen />, { wrapper });
  await screen.findByRole('switch', { name: '남은 대화 시간', checked: true });
  const before = screen.UNSAFE_getAllByType(Switch)[0].props;
  fireEvent.press(screen.getByLabelText('남은 대화 시간'));
  await screen.findByText('저장 중');
  const during = screen.UNSAFE_getAllByType(Switch)[0].props;
  expect(during.disabled).toBe(before.disabled);
  expect(during.value).toBe(before.value);
  expect(during.trackColor).toEqual(before.trackColor);
  expect(screen.getByRole('switch', { name: '부재중 통화' })).toBeDisabled();
  fireEvent.press(screen.getByLabelText('부재중 통화'));
  expect(modifyAlarmSetting).toHaveBeenCalledTimes(1);
  expect(modifyAlarmSetting).toHaveBeenCalledWith({ missedCallNotificationEnabled: true, lowTimeNotificationEnabled: false });
  await act(async () => finish({ result: { missedCallNotificationEnabled: true, lowTimeNotificationEnabled: false } }));
  await waitFor(() => expect(screen.getByRole('switch', { name: '남은 대화 시간', checked: false })).toBeEnabled());
  expect(screen.getByRole('switch', { name: '부재중 통화', checked: true })).toBeEnabled();
});

it('shows twin call notifications as planned without pretending an unsupported preference is saved', async () => {
  const screen = render(<NotificationScreen />, { wrapper });
  await screen.findByRole('switch', { name: '부재중 통화', checked: true });
  expect(screen.getByText('내 트윈 통화 알림')).toBeTruthy();
  expect(screen.getByText('준비 중')).toBeTruthy();
  expect(screen.queryByRole('switch', { name: '내 트윈 통화 알림' })).toBeNull();
  expect(modifyAlarmSetting).not.toHaveBeenCalled();
});
