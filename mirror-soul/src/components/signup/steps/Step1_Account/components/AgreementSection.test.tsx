import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import AgeVerificationSection from './AgeVerificationSection';
import AgreementSection from './AgreementSection';
import { Step1State } from '../types/step1';

jest.mock('@expo/vector-icons', () => ({ Feather: () => null }));
jest.mock('@/src/hooks/useThemeColors', () => ({ useThemeColors: () => ({ colors: jest.requireActual('@/src/constants/theme').lightTheme }) }));
jest.mock('@/src/components/common/ConsentDetailSheet', () => ({
  ConsentDetailSheet: ({ visible, title, onClose, onConfirm }: { visible: boolean; title: string; onClose: () => void; onConfirm: () => void }) => {
    const { View, Text, Pressable } = jest.requireActual('react-native');
    return visible ? <View>
      <Text>{title}</Text>
      <Pressable accessibilityRole="button" accessibilityLabel="내용 닫기" onPress={onClose}><Text>닫기</Text></Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="내용 확인" onPress={() => { onConfirm(); onClose(); }}><Text>확인했습니다</Text></Pressable>
    </View> : null;
  },
}));

const state: Step1State = {
  email: 'me@example.com', isEmailVerified: true, password: 'test1234', passwordConfirm: 'test1234',
  isPasswordVisible: false, isPasswordConfirmVisible: false, isIdentityVerified: false,
  isAdultConfirmed: false, agreedToTerms: false, agreedToPrivacy: false, agreedToBiometricData: false, agreedToMarketing: false, isLoading: false,
};

it('lets users toggle the label as part of one checkbox target, keeping each consent separate', () => {
  const onChange = jest.fn();
  const screen = render(<><AgeVerificationSection state={state} onChange={onChange} /><AgreementSection state={state} onChange={onChange} /></>);
  expect(screen.getAllByRole('checkbox')).toHaveLength(5);
  fireEvent.press(screen.getByText('만 19세 이상이에요. (필수)'));
  expect(onChange).toHaveBeenLastCalledWith({ isAdultConfirmed: true });
  fireEvent.press(screen.getByText('서비스 이용약관 동의 (필수)'));
  expect(onChange).toHaveBeenLastCalledWith({ agreedToTerms: true });
  fireEvent.press(screen.getByRole('checkbox', { name: '생체정보 수집 및 AI 트윈 생성·활용 동의' }));
  expect(onChange).toHaveBeenLastCalledWith({ agreedToBiometricData: true });
});

it('opens and closes details without toggling, and checks only the explicitly confirmed consent', () => {
  const onChange = jest.fn();
  const screen = render(<AgreementSection state={state} onChange={onChange} />);
  fireEvent.press(screen.getByRole('button', { name: '개인정보 처리방침 자세히 보기' }));
  expect(onChange).not.toHaveBeenCalled();
  fireEvent.press(screen.getByRole('button', { name: '내용 닫기' }));
  expect(onChange).not.toHaveBeenCalled();
  fireEvent.press(screen.getByRole('button', { name: '생체정보 수집 및 AI 트윈 활용 동의 자세히 보기' }));
  fireEvent.press(screen.getByRole('button', { name: '내용 확인' }));
  expect(onChange).toHaveBeenCalledTimes(1);
  expect(onChange).toHaveBeenCalledWith({ agreedToBiometricData: true });
});

it('keeps marketing unselected until toggled, and allows withdrawing a selection', () => {
  const onChange = jest.fn();
  const screen = render(<AgreementSection state={state} onChange={onChange} />);
  expect(screen.getByRole('checkbox', { name: '마케팅 정보 수신 동의' }).props.accessibilityState.checked).toBe(false);
  expect(onChange).not.toHaveBeenCalled();
  fireEvent.press(screen.getByRole('checkbox', { name: '마케팅 정보 수신 동의' }));
  expect(onChange).toHaveBeenLastCalledWith({ agreedToMarketing: true });
  screen.rerender(<AgreementSection state={{ ...state, agreedToMarketing: true }} onChange={onChange} />);
  fireEvent.press(screen.getByRole('checkbox', { name: '마케팅 정보 수신 동의' }));
  expect(onChange).toHaveBeenLastCalledWith({ agreedToMarketing: false });
});
