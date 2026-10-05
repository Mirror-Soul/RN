import React from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';
import { BackHandler } from 'react-native';
import OnboardingResumeScreen from './OnboardingResumeScreen';
import { performLogout } from '@/src/services/authService';

const mockContinue = jest.fn();
let mockSession = { isLoggedIn: true, userStatus: 'ONBOARD_A', continueOnboarding: mockContinue };
jest.mock('@/src/store/useAuthStore', () => ({ useAuthStore: Object.assign((selector: (s: typeof mockSession) => unknown) => selector(mockSession), { getState: () => mockSession }) }));
jest.mock('@/src/services/authService', () => ({ performLogout: jest.fn() }));
jest.mock('expo-router', () => ({ useFocusEffect: (callback: () => void | (() => void)) => jest.requireActual('react').useEffect(callback, [callback]) }));
jest.mock('@expo/vector-icons', () => ({ Feather: () => null }));
jest.mock('@/src/hooks/useThemeColors', () => ({ useThemeColors: () => ({ colors: jest.requireActual('@/src/constants/theme').lightTheme }) }));
beforeEach(() => { jest.clearAllMocks(); mockSession = { isLoggedIn: true, userStatus: 'ONBOARD_A', continueOnboarding: mockContinue }; });
afterEach(() => jest.restoreAllMocks());

it.each([['ONBOARD_A', '기본 프로필'], ['ONBOARD_B', '성격 유형'], ['ONBOARD_C', '음성 인터뷰'], ['ONBOARD_D', '나의 아바타 만들기']])('shows the authenticated next stage for %s and continues only once', (status, title) => {
  mockSession.userStatus = status;
  const screen = render(<OnboardingResumeScreen />);
  expect(screen.getByText(title)).toBeTruthy();
  if (status === 'ONBOARD_C') expect(screen.getByText('음성 인터뷰는 첫 질문부터 다시 진행해요.')).toBeTruthy();
  fireEvent.press(screen.getByLabelText('이어서 가입하기'));
  fireEvent.press(screen.getByLabelText('이어서 가입하기'));
  expect(mockContinue).toHaveBeenCalledTimes(1);
});

it('pauses through the existing logout procedure without double requests', async () => {
  let finish!: () => void;
  (performLogout as jest.Mock).mockImplementation(() => new Promise<void>(resolve => { finish = resolve; }));
  const screen = render(<OnboardingResumeScreen />);
  fireEvent.press(screen.getByLabelText('나중에 이어하기'));
  fireEvent.press(screen.getByLabelText('로그인 화면으로 돌아가는 중…'));
  expect(performLogout).toHaveBeenCalledTimes(1);
  expect(screen.getByLabelText('이어서 가입하기')).toBeDisabled();
  await act(async () => { finish(); });
});

it('does not render progress when unauthenticated or already active', () => {
  mockSession.isLoggedIn = false;
  const screen = render(<OnboardingResumeScreen />);
  expect(screen.queryByLabelText('이어서 가입하기')).toBeNull();
  mockSession.isLoggedIn = true;
  mockSession.userStatus = 'ACTIVE';
  screen.rerender(<OnboardingResumeScreen />);
  expect(screen.queryByLabelText('이어서 가입하기')).toBeNull();
});

it('handles Android back by pausing once and unregisters the listener on exit', async () => {
  let back!: () => boolean | null | undefined;
  const remove = jest.fn();
  jest.spyOn(BackHandler, 'addEventListener').mockImplementation((_event, callback) => {
    back = callback;
    return { remove };
  });
  (performLogout as jest.Mock).mockResolvedValue(undefined);
  const screen = render(<OnboardingResumeScreen />);
  await act(async () => { expect(back()).toBe(true); expect(back()).toBe(true); });
  expect(performLogout).toHaveBeenCalledTimes(1);
  screen.unmount();
  expect(remove).toHaveBeenCalledTimes(1);
});
