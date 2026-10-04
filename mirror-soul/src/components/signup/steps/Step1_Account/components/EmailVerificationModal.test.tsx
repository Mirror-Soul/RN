import React from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';
import { Keyboard } from 'react-native';
import EmailVerificationModal from './EmailVerificationModal';

jest.mock('@expo/vector-icons', () => ({ Feather: () => null }));
jest.mock('react-native-safe-area-context', () => ({
  ...jest.requireActual('react-native-safe-area-context'),
  useSafeAreaInsets: () => ({ top: 0, left: 0, right: 0, bottom: 34 }),
}));
jest.mock('@/src/hooks/useThemeColors', () => ({ useThemeColors: () => ({ colors: jest.requireActual('@/src/constants/theme').lightTheme }) }));
const props = { isVisible: true, email: 'me@example.com', onClose: jest.fn(), onVerify: jest.fn(), onResend: jest.fn(), timeLeft: 180 };
beforeEach(() => { jest.clearAllMocks(); props.onVerify.mockResolvedValue(true); });
afterEach(() => jest.restoreAllMocks());

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

it('explains the verification limit separately from timer expiry', () => {
  const screen = render(<EmailVerificationModal {...props} timeLeft={0} requiresNewCode />);
  expect(screen.getByText('새 코드 필요')).toBeTruthy();
  expect(screen.getByText('코드를 여러 번 확인하지 못했어요. 새 코드를 받아주세요.')).toBeTruthy();
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

it('dismisses the number pad after six digits without verifying automatically', () => {
  const dismiss = jest.spyOn(Keyboard, 'dismiss');
  const screen = render(<EmailVerificationModal {...props} />);
  fireEvent.changeText(screen.getByLabelText('이메일 인증 코드 6자리'), '12345');
  expect(dismiss).not.toHaveBeenCalled();
  fireEvent.changeText(screen.getByLabelText('이메일 인증 코드 6자리'), '123 456');
  expect(dismiss).toHaveBeenCalledTimes(1);
  expect(screen.getByLabelText('이메일 인증 코드 6자리').props.value).toBe('123456');
  expect(screen.getByRole('button', { name: '이메일 인증하기' }).props.accessibilityState.disabled).toBe(false);
  expect(props.onVerify).not.toHaveBeenCalled();
});

it('dismisses the keyboard when closing an unfinished verification', () => {
  const dismiss = jest.spyOn(Keyboard, 'dismiss');
  const screen = render(<EmailVerificationModal {...props} />);
  fireEvent.changeText(screen.getByLabelText('이메일 인증 코드 6자리'), '123');
  fireEvent.press(screen.getByRole('button', { name: '인증 창 닫기' }));
  expect(dismiss).toHaveBeenCalledTimes(1);
  expect(props.onClose).toHaveBeenCalledTimes(1);
  expect(props.onVerify).not.toHaveBeenCalled();
});

it('keeps the code and allows retrying after verification fails', async () => {
  props.onVerify.mockResolvedValueOnce(false).mockResolvedValueOnce(true);
  const screen = render(<EmailVerificationModal {...props} />);
  fireEvent.changeText(screen.getByLabelText('이메일 인증 코드 6자리'), '654321');
  await act(async () => { fireEvent.press(screen.getByRole('button', { name: '이메일 인증하기' })); });
  expect(screen.getByRole('alert')).toBeTruthy();
  expect(screen.getByLabelText('이메일 인증 코드 6자리').props.value).toBe('654321');
  expect(props.onClose).not.toHaveBeenCalled();
  await act(async () => { fireEvent.press(screen.getByRole('button', { name: '이메일 인증하기' })); });
  expect(props.onVerify).toHaveBeenCalledTimes(2);
  expect(props.onClose).toHaveBeenCalledTimes(1);
});
