import React from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';
import { Keyboard, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import AuthEntryScreen from './AuthEntryScreen';

const mockPush = jest.fn();
let mockParams: { email?: string; notice?: string } = {};
const mockKeyboard = new Map<string, () => void>();
jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush }), useLocalSearchParams: () => mockParams }));
jest.mock('../hooks/useLoginMutation', () => ({ useLoginMutation: () => ({ mutateAsync: jest.fn() }) }));
jest.mock('@/src/store/useAuthStore', () => ({ useAuthStore: (selector: (s: { hasInterruptedSignup: boolean }) => unknown) => selector({ hasInterruptedSignup: false }) }));
jest.mock('@/src/hooks/useThemeColors', () => ({ useThemeColors: () => ({ colors: jest.requireActual('@/src/constants/theme').lightTheme, isDark: false }) }));
jest.mock('@expo/vector-icons', () => ({ Feather: () => null }));
jest.mock('expo-status-bar', () => ({ StatusBar: () => null }));
jest.mock('react-native-safe-area-context', () => ({ SafeAreaView: jest.requireActual('react-native').View }));
beforeEach(() => {
  jest.clearAllMocks(); mockParams = {}; mockKeyboard.clear();
  jest.spyOn(jest.requireActual('react-native'), 'useWindowDimensions').mockReturnValue({ width: 390, height: 844, scale: 3, fontScale: 1 });
  jest.spyOn(Keyboard, 'isVisible').mockReturnValue(false);
  jest.spyOn(Keyboard, 'addListener').mockImplementation((event, callback) => {
    mockKeyboard.set(event, callback as () => void);
    return { remove: jest.fn() } as unknown as ReturnType<typeof Keyboard.addListener>;
  });
});
afterEach(() => jest.restoreAllMocks());

it.each(['ios', 'android'] as const)('preserves typed credentials while opening and closing the %s keyboard', platform => {
  jest.replaceProperty(Platform, 'OS', platform);
  const screen = render(<AuthEntryScreen />);
  fireEvent.changeText(screen.getByLabelText('이메일 입력'), 'me@example.com');
  fireEvent.changeText(screen.getByLabelText('비밀번호 입력'), 'pass1234');
  expect(screen.UNSAFE_queryByType(KeyboardAvoidingView)).toBeNull();
  expect(screen.UNSAFE_getByType(ScrollView).props.automaticallyAdjustKeyboardInsets).toBe(platform === 'ios');
  act(() => mockKeyboard.get(platform === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow')?.());
  expect(screen.queryByText(/나를 닮은 트윈, 새로운 연결/)).toBeNull();
  expect(screen.getByLabelText('이메일 입력').props.value).toBe('me@example.com');
  expect(screen.getByLabelText('비밀번호 입력').props.value).toBe('pass1234');
  act(() => mockKeyboard.get(platform === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide')?.());
  expect(screen.getByText(/나를 닮은 트윈, 새로운 연결/)).toBeTruthy();
  fireEvent.press(screen.getByLabelText('회원가입 시작하기'));
  expect(mockPush).toHaveBeenCalledWith({ pathname: '/signup', params: { email: 'me@example.com' } });
});

it('keeps the form usable when an Android window shrinks without a keyboard event', () => {
  jest.replaceProperty(Platform, 'OS', 'android');
  const screen = render(<AuthEntryScreen />);
  fireEvent.changeText(screen.getByLabelText('이메일 입력'), 'me@example.com');
  fireEvent(screen.UNSAFE_getByType(ScrollView), 'layout', { nativeEvent: { layout: { width: 320, height: 320 } } });
  expect(screen.queryByText(/나를 닮은 트윈, 새로운 연결/)).toBeNull();
  expect(screen.getByLabelText('이메일 입력').props.value).toBe('me@example.com');
  fireEvent(screen.UNSAFE_getByType(ScrollView), 'layout', { nativeEvent: { layout: { width: 320, height: 700 } } });
  expect(screen.getByText(/나를 닮은 트윈, 새로운 연결/)).toBeTruthy();
});

it('retains credentials when the device window and accessibility font size change', () => {
  const dimensions = jest.spyOn(jest.requireActual('react-native'), 'useWindowDimensions');
  dimensions.mockReturnValue({ width: 390, height: 844, scale: 3, fontScale: 1 });
  const screen = render(<AuthEntryScreen />);
  fireEvent.changeText(screen.getByLabelText('이메일 입력'), 'me@example.com');
  fireEvent.changeText(screen.getByLabelText('비밀번호 입력'), 'pass1234');
  dimensions.mockReturnValue({ width: 320, height: 568, scale: 2, fontScale: 2 });
  screen.rerender(<AuthEntryScreen />);
  expect(screen.queryByText(/나를 닮은 트윈, 새로운 연결/)).toBeNull();
  expect(screen.getByLabelText('이메일 입력').props.value).toBe('me@example.com');
  expect(screen.getByLabelText('비밀번호 입력').props.value).toBe('pass1234');
  dimensions.mockReturnValue({ width: 768, height: 1024, scale: 2, fontScale: 1 });
  screen.rerender(<AuthEntryScreen />);
  expect(screen.getByText(/나를 닮은 트윈, 새로운 연결/)).toBeTruthy();
  expect(screen.getByLabelText('비밀번호 입력').props.value).toBe('pass1234');
});

it('starts an existing account login with its email and a blank password', () => {
  mockParams = { email: 'me@example.com', notice: 'existing-account' };
  const screen = render(<AuthEntryScreen />);
  expect(screen.getByLabelText('이메일 입력').props.value).toBe('me@example.com');
  expect(screen.getByLabelText('비밀번호 입력').props.value).toBe('');
  expect(screen.getByText('이 이메일로 만든 계정이 있어요')).toBeTruthy();
});
