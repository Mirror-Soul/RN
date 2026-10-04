import React from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AccountSettingsScreen } from './AccountSettingsScreen';
import { NicknameEditModal } from './components/NicknameEditModal';
import { AccountDeleteScreen } from './AccountDeleteScreen';
import { getAccountInfo, getMyProfile, modifyNickname, deleteAccount } from '@/src/services/profileService';
import { performLogout } from '@/src/services/authService';
import { profileQueryKeys } from '@/src/features/profile/hooks/profileQueryKeys';

let mockSession = { userUuid: 'me', isLoggedIn: true };
const mockReplace = jest.fn();
const mockPush = jest.fn();
const mockToast = jest.fn();
const mockSetTheme = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ canGoBack: () => true, back: jest.fn(), replace: mockReplace, push: mockPush, navigate: mockPush }) }));
jest.mock('@/src/hooks/useThemeColors', () => ({ useThemeColors: () => ({ colors: jest.requireActual('@/src/constants/theme').lightTheme }) }));
jest.mock('@/src/store/useThemeStore', () => ({ useThemeStore: () => ({ themeMode: 'system', setThemeMode: mockSetTheme }) }));
jest.mock('@/src/store/useAuthStore', () => ({ useAuthStore: Object.assign((selector: (s: typeof mockSession) => unknown) => selector(mockSession), { getState: () => mockSession }) }));
jest.mock('@/src/services/profileService', () => ({ getAccountInfo: jest.fn(), getMyProfile: jest.fn(), modifyNickname: jest.fn(), deleteAccount: jest.fn() }));
jest.mock('@/src/services/authService', () => ({ performLogout: jest.fn() }));
jest.mock('@/src/features/profile/hooks/useProfileRefresh', () => ({ useProfileRefresh: jest.fn() }));
jest.mock('@/src/components/common/Toast/ToastProvider', () => ({ useToast: () => ({ showToast: mockToast }) }));
jest.mock('@/src/components/common/Header', () => ({ Header: () => null }));
jest.mock('@/src/components/common/ScreenLayout', () => ({ ScreenLayout: jest.requireActual('react-native').View }));
jest.mock('@/src/features/profile/photo/PublicProfilePreview', () => {
  const { Text, Pressable } = jest.requireActual('react-native');
  return { PublicProfilePreview: ({ onClose }: { onClose: () => void }) => <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="미리보기 닫기"><Text>공개 모습</Text></Pressable> };
});
jest.mock('@expo/vector-icons', () => ({ Feather: () => null }));
jest.mock('react-native-safe-area-context', () => ({ useSafeAreaInsets: () => ({ top: 20, bottom: 20, left: 0, right: 0 }) }));
let client: QueryClient;
const wrapper = ({ children }: { children: React.ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;
beforeEach(() => {
  jest.clearAllMocks();
  mockSession = { userUuid: 'me', isLoggedIn: true };
  client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } });
  (getAccountInfo as jest.Mock).mockResolvedValue({ result: { name: '내닉네임' } });
  (getMyProfile as jest.Mock).mockResolvedValue({ result: { name: '내닉네임', email: 'me@example.com', profileImageUrl: null } });
  (performLogout as jest.Mock).mockResolvedValue(undefined);
});
afterEach(() => client.clear());

it('loads actual account/email data and opens preview, appearance and help controls', async () => {
  const screen = render(<AccountSettingsScreen />, { wrapper });
  await screen.findByText('내닉네임');
  await screen.findByText('me@example.com');
  fireEvent.press(screen.getByRole('radio', { name: '어둡게 화면' }));
  expect(mockSetTheme).toHaveBeenCalledWith('dark');
  fireEvent.press(screen.getByRole('button', { name: '내 프로필 미리보기' }));
  expect(screen.getByText('공개 모습')).toBeTruthy();
  fireEvent.press(screen.getByLabelText('미리보기 닫기'));
  fireEvent.press(screen.getByLabelText('로그인 도움이 필요해요'));
  expect(mockPush).toHaveBeenCalledWith('/(main)/customer-center');
});

it('lets the user retry a failed nickname read without enabling edits on missing data', async () => {
  (getAccountInfo as jest.Mock).mockRejectedValueOnce({ code: 'NETWORK_ERROR' }).mockResolvedValue({ result: { name: '복구된이름' } });
  const screen = render(<AccountSettingsScreen />, { wrapper });
  fireEvent.press(await screen.findByLabelText('계정 정보 다시 불러오기'));
  expect(screen.getByRole('button', { name: '닉네임 변경' })).toBeDisabled();
  await screen.findByText('복구된이름');
  expect(screen.getByRole('button', { name: '닉네임 변경' })).toBeEnabled();
});

it('keeps typed nickname on refresh, retains it on save failure and retries without retyping', async () => {
  client.setQueryData(profileQueryKeys.accountInfo('me'), { name: '이전이름' });
  (modifyNickname as jest.Mock).mockRejectedValueOnce({ code: 'NETWORK_ERROR' }).mockResolvedValue({ isSuccess: true });
  const close = jest.fn();
  const screen = render(<NicknameEditModal isOpen onClose={close} />, { wrapper });
  fireEvent.changeText(screen.getByLabelText('새 닉네임'), '새이름');
  await act(async () => client.setQueryData(profileQueryKeys.accountInfo('me'), { name: '서버이름' }));
  expect(screen.getByLabelText('새 닉네임').props.value).toBe('새이름');
  await waitFor(() => expect(screen.getByLabelText('닉네임 저장')).toBeEnabled());
  fireEvent.press(screen.getByLabelText('닉네임 저장'));
  await screen.findByText('네트워크 연결을 확인해주세요.');
  expect(close).not.toHaveBeenCalled();
  fireEvent.press(screen.getByLabelText('닉네임 저장'));
  await waitFor(() => expect(close).toHaveBeenCalledTimes(1));
  expect(modifyNickname).toHaveBeenNthCalledWith(2, '새이름');
  expect(mockToast).toHaveBeenCalledWith('닉네임을 변경했어요.', 'success');
});

it('blocks invalid and unchanged nicknames and rejects edits from an old account', async () => {
  client.setQueryData(profileQueryKeys.accountInfo('me'), { name: '이전이름' });
  const screen = render(<NicknameEditModal isOpen onClose={jest.fn()} />, { wrapper });
  expect(screen.getByLabelText('닉네임 저장')).toBeDisabled();
  fireEvent.changeText(screen.getByLabelText('새 닉네임'), '공백 이름');
  await screen.findByText('한글·영문·숫자만 사용할 수 있어요.');
  expect(screen.getByLabelText('닉네임 저장')).toBeDisabled();
  fireEvent.changeText(screen.getByLabelText('새 닉네임'), '새이름');
  await waitFor(() => expect(screen.getByLabelText('닉네임 저장')).toBeEnabled());
  mockSession = { userUuid: 'other', isLoggedIn: true };
  fireEvent.press(screen.getByLabelText('닉네임 저장'));
  await screen.findByText('계정이 변경됐어요. 창을 닫고 다시 시도해 주세요.');
  expect(modifyNickname).not.toHaveBeenCalled();
});

it('supports cancelling logout and blocks duplicate logout requests until navigation', async () => {
  let finish!: () => void;
  (performLogout as jest.Mock).mockImplementation(() => new Promise<void>(resolve => { finish = resolve; }));
  const screen = render(<AccountSettingsScreen />, { wrapper });
  fireEvent.press(screen.getByRole('button', { name: '로그아웃' }));
  fireEvent.press(screen.getByRole('button', { name: '계속 이용하기' }));
  expect(performLogout).not.toHaveBeenCalled();
  fireEvent.press(screen.getByRole('button', { name: '로그아웃' }));
  fireEvent.press(screen.getByLabelText('로그아웃하기'));
  fireEvent.press(screen.getByLabelText('로그아웃하기'));
  expect(performLogout).toHaveBeenCalledTimes(1);
  expect(screen.getByLabelText('계속 이용하기')).toBeDisabled();
  await act(async () => finish());
  expect(mockReplace).toHaveBeenCalledWith('/login');
});

it('requires consent, keeps a failed withdrawal recoverable and stays busy through logout', async () => {
  (deleteAccount as jest.Mock).mockRejectedValueOnce({ code: 'NETWORK_ERROR' }).mockResolvedValue({ isSuccess: true });
  let finish!: () => void;
  (performLogout as jest.Mock).mockImplementation(() => new Promise<void>(resolve => { finish = resolve; }));
  const screen = render(<AccountDeleteScreen />, { wrapper });
  expect(screen.getByLabelText('회원 탈퇴 최종 확인')).toBeDisabled();
  fireEvent.press(screen.getByRole('checkbox'));
  fireEvent.press(screen.getByLabelText('회원 탈퇴 최종 확인'));
  fireEvent.press(screen.getByLabelText('탈퇴하기'));
  await waitFor(() => expect(mockToast).toHaveBeenCalledWith('네트워크 연결을 확인해주세요.', 'error'));
  expect(performLogout).not.toHaveBeenCalled();
  fireEvent.press(screen.getByLabelText('회원 탈퇴 최종 확인'));
  fireEvent.press(screen.getByLabelText('탈퇴하기'));
  fireEvent.press(screen.getByLabelText('탈퇴하기'));
  await waitFor(() => expect(performLogout).toHaveBeenCalledTimes(1));
  expect(deleteAccount).toHaveBeenCalledTimes(2);
  expect(screen.getByLabelText('계정 유지하기')).toBeDisabled();
  expect(screen.getByLabelText('탈퇴하기')).toBeDisabled();
  await act(async () => finish());
  expect(mockReplace).toHaveBeenCalledWith('/login');
});

it('does not withdraw a different account from an old confirmation', async () => {
  const screen = render(<AccountDeleteScreen />, { wrapper });
  fireEvent.press(screen.getByRole('checkbox'));
  fireEvent.press(screen.getByLabelText('회원 탈퇴 최종 확인'));
  mockSession = { userUuid: 'other', isLoggedIn: true };
  fireEvent.press(screen.getByLabelText('탈퇴하기'));
  expect(deleteAccount).not.toHaveBeenCalled();
  expect(screen.getByRole('checkbox', { checked: false })).toBeTruthy();
});

it('does not clear the next account or log it out after an earlier withdrawal completes', async () => {
  let finish!: (response: unknown) => void;
  (deleteAccount as jest.Mock).mockImplementation(() => new Promise(resolve => { finish = resolve; }));
  const screen = render(<AccountDeleteScreen />, { wrapper });
  fireEvent.press(screen.getByRole('checkbox'));
  fireEvent.press(screen.getByLabelText('회원 탈퇴 최종 확인'));
  fireEvent.press(screen.getByLabelText('탈퇴하기'));
  await waitFor(() => expect(deleteAccount).toHaveBeenCalled());
  mockSession = { userUuid: 'other', isLoggedIn: true };
  client.setQueryData(profileQueryKeys.accountInfo('other'), { name: '다른계정' });
  await act(async () => finish({ isSuccess: true }));
  expect(client.getQueryData(profileQueryKeys.accountInfo('other'))).toEqual({ name: '다른계정' });
  expect(performLogout).not.toHaveBeenCalled();
  expect(mockReplace).not.toHaveBeenCalled();
});
