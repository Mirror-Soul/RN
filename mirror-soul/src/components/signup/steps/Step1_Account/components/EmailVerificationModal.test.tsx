import React from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';
import EmailVerificationModal from './EmailVerificationModal';

jest.mock('@expo/vector-icons', () => ({ Feather: () => null }));
jest.mock('@/src/hooks/useThemeColors', () => ({ useThemeColors: () => ({ colors: jest.requireActual('@/src/constants/theme').lightTheme }) }));
const props = { isVisible: true, email: 'me@example.com', onClose: jest.fn(), onVerify: jest.fn(), onResend: jest.fn(), timeLeft: 180 };
beforeEach(() => { jest.clearAllMocks(); props.onVerify.mockResolvedValue(true); });

it('disables code entry and confirmation until sending finishes', () => {
  const screen = render(<EmailVerificationModal {...props} isLoading />);
  expect(screen.getByLabelText('이메일 인증 코드 6자리').props.editable).toBe(false);
  fireEvent.press(screen.getByRole('button', { name: '이메일 인증하기' }));
  expect(props.onVerify).not.toHaveBeenCalled();
});

it('accepts pasted digits and performs only one verification while a request is pending', async () => {
  let finish!: (success: boolean) => void;
  props.onVerify.mockImplementation(() => new Promise(resolve => { finish = resolve; }));
  const screen = render(<EmailVerificationModal {...props} />);
  fireEvent.changeText(screen.getByLabelText('이메일 인증 코드 6자리'), '123 456');
  fireEvent.press(screen.getByRole('button', { name: '이메일 인증하기' }));
  fireEvent.press(screen.getByRole('button', { name: '이메일 인증하기' }));
  expect(props.onVerify).toHaveBeenCalledTimes(1);
  expect(props.onVerify).toHaveBeenCalledWith('123456');
  await act(async () => { finish(true); });
  expect(props.onClose).toHaveBeenCalledTimes(1);
});

it('requires resending an expired code rather than submitting it', () => {
  const screen = render(<EmailVerificationModal {...props} timeLeft={0} />);
  fireEvent.press(screen.getByRole('button', { name: '인증 코드 다시 받기' }));
  expect(props.onResend).toHaveBeenCalledTimes(1);
  expect(props.onVerify).not.toHaveBeenCalled();
});

it('does not close a reopened modal with an old verification response', async () => {
  let finish!: (success: boolean) => void;
  props.onVerify.mockImplementation(() => new Promise(resolve => { finish = resolve; }));
  const screen = render(<EmailVerificationModal {...props} />);
  fireEvent.changeText(screen.getByLabelText('이메일 인증 코드 6자리'), '123456');
  fireEvent.press(screen.getByRole('button', { name: '이메일 인증하기' }));
  screen.rerender(<EmailVerificationModal {...props} isVisible={false} />);
  screen.rerender(<EmailVerificationModal {...props} email="new@example.com" />);
  await act(async () => { finish(true); });
  expect(props.onClose).not.toHaveBeenCalled();
  expect(screen.getByLabelText('이메일 인증 코드 6자리').props.value).toBe('');
});
