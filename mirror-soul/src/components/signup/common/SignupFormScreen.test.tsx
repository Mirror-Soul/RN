import React from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';
import { Keyboard, Platform, TextInput } from 'react-native';
import SignupFormScreen from './SignupFormScreen';

jest.mock('@expo/vector-icons', () => ({ Feather: () => null }));
jest.mock('@/src/hooks/useThemeColors', () => ({ useThemeColors: () => ({ colors: jest.requireActual('@/src/constants/theme').lightTheme }) }));

afterEach(() => jest.restoreAllMocks());

it('gives typing the space of the footer and restores the action without losing input', () => {
  let show!: () => void;
  let hide!: () => void;
  const subscribe = Keyboard.addListener.bind(Keyboard);
  jest.spyOn(Keyboard, 'isVisible').mockReturnValue(false);
  jest.spyOn(Keyboard, 'addListener').mockImplementation((event, callback) => {
    const invoke = () => callback({ duration: 0, easing: 'keyboard', endCoordinates: { width: 390, height: 300, screenX: 0, screenY: 500 } });
    if (event === (Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow')) show = invoke;
    if (event === (Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide')) hide = invoke;
    return subscribe(event, callback);
  });
  const submit = jest.fn();
  const screen = render(<SignupFormScreen title="계정 만들고 계속" hint="다음 단계로 이동해요" disabled={false} isSubmitting={false} submittingLabel="저장 중" onContinue={submit}>
    <TextInput accessibilityLabel="이메일" value="me@example.com" />
  </SignupFormScreen>);
  expect(screen.getByRole('button', { name: '계정 만들고 계속' })).toBeTruthy();
  act(() => show());
  expect(screen.queryByRole('button', { name: '계정 만들고 계속' })).toBeNull();
  expect(screen.getByLabelText('이메일').props.value).toBe('me@example.com');
  expect(submit).not.toHaveBeenCalled();
  act(() => hide());
  fireEvent.press(screen.getByRole('button', { name: '계정 만들고 계속' }));
  expect(submit).toHaveBeenCalledTimes(1);
});

it('provides an explicit iOS keyboard dismissal action', () => {
  const dismiss = jest.spyOn(Keyboard, 'dismiss');
  const screen = render(<SignupFormScreen title="계속" hint="입력해주세요" disabled isSubmitting={false} submittingLabel="저장 중" onContinue={jest.fn()}>
    <TextInput />
  </SignupFormScreen>);
  if (Platform.OS === 'ios') {
    fireEvent.press(screen.getByRole('button', { name: '키보드 닫기' }));
    expect(dismiss).toHaveBeenCalledTimes(1);
  }
});
