import React from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import LoginTabView from './LoginTabView';

const mockLogin = jest.fn();
const mockPush = jest.fn();
jest.mock('../hooks/useLoginMutation', () => ({ useLoginMutation: () => ({ mutateAsync: mockLogin }) }));
jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush }) }));
jest.mock('@expo/vector-icons', () => ({ Feather: () => null }));
jest.mock('@/src/utils/logger', () => ({ logger: { warn: jest.fn() } }));
jest.mock('@/src/hooks/useThemeColors', () => ({ useThemeColors: () => ({ colors: jest.requireActual('@/src/constants/theme').lightTheme }) }));
beforeEach(() => { jest.clearAllMocks(); mockLogin.mockResolvedValue({}); });

it('keeps login immediately available, preserves email for signup, and does not persist a password in navigation', () => {
  const signup = jest.fn();
  const screen = render(<LoginTabView onSignup={signup} initialEmail="me@example.com" />);
  expect(screen.getByLabelText('로그인')).toBeEnabled();
  expect(screen.getByLabelText('비밀번호 입력').props.secureTextEntry).toBe(true);
  fireEvent.press(screen.getByLabelText('비밀번호 보기'));
  expect(screen.getByLabelText('비밀번호 입력').props.secureTextEntry).toBe(false);
  fireEvent.press(screen.getByLabelText('회원가입 시작하기'));
  expect(signup).toHaveBeenCalledWith('me@example.com');
  fireEvent.press(screen.getByLabelText('비밀번호 찾기'));
  expect(mockPush).toHaveBeenCalledWith({ pathname: '/forgot-password', params: { email: 'me@example.com' } });
});

it.each([['existing-account', '이 이메일로 만든 계정이 있어요'], ['password-reset', '비밀번호를 바꿨어요']])('does not attribute a %s notice to another email', (notice, title) => {
  const screen = render(<LoginTabView onSignup={jest.fn()} initialEmail="me@example.com" notice={notice} />);
  expect(screen.getByText(title)).toBeTruthy();
  fireEvent.changeText(screen.getByLabelText('이메일 입력'), 'other@example.com');
  expect(screen.queryByText(title)).toBeNull();
});

it('locks navigation and editing during login and restores retry controls on failure', async () => {
  let fail!: (error: unknown) => void;
  mockLogin.mockImplementation(() => new Promise((_, reject) => { fail = reject; }));
  const signup = jest.fn();
  const screen = render(<LoginTabView onSignup={signup} initialEmail="me@example.com" />);
  fireEvent.changeText(screen.getByLabelText('비밀번호 입력'), 'pass1234');
  fireEvent.press(screen.getByLabelText('로그인'));
  expect(screen.getByLabelText('이메일 입력').props.editable).toBe(false);
  expect(screen.getByLabelText('회원가입 시작하기')).toBeDisabled();
  fireEvent.press(screen.getByLabelText('회원가입 시작하기'));
  expect(signup).not.toHaveBeenCalled();
  await act(async () => { fail({ code: 'TIMEOUT' }); });
  await waitFor(() => expect(screen.getByLabelText('로그인')).toBeEnabled());
  expect(screen.getByLabelText('비밀번호 입력').props.value).toBe('pass1234');
  expect(screen.getByLabelText('회원가입 시작하기')).toBeEnabled();
});
