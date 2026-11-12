import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import JobVerificationSection from './JobVerificationSection';
import { Step2State } from '../types/step2';

jest.mock('@expo/vector-icons', () => ({ Feather: () => null }));
jest.mock('@/src/features/job-verification/EvidencePicker', () => ({ EvidencePicker: () => null }));
const mockSync = jest.fn();
let mockBusy = false;
jest.mock('@/src/features/job-verification/evidenceDraft', () => ({ useEvidenceDraft: () => ({ photos: [], busy: mockBusy }), syncEvidenceDraft: (...args: unknown[]) => mockSync(...args) }));
jest.mock('@/src/store/useAuthStore', () => ({ useAuthStore: (s: (v: unknown) => unknown) => s({ userUuid: 'me' }) }));
jest.mock('expo-image-picker', () => ({ requestCameraPermissionsAsync: jest.fn(), launchCameraAsync: jest.fn() }));
jest.mock('@/src/hooks/useThemeColors', () => ({ useThemeColors: () => ({ colors: jest.requireActual('@/src/constants/theme').lightTheme }) }));
jest.mock('@/src/components/signup/common/useDropdownAnchor', () => ({ useDropdownAnchor: () => ({ triggerRef: { current: null }, anchor: { x: 0, y: 0, width: 200, height: 52 }, measureAndOpen: (open: () => void) => open() }) }));
jest.mock('../Professional/JobCategoryDropdown', () => ({ __esModule: true, default: ({ onSelect }: { onSelect: (job: string) => void }) => {
  const { Pressable, Text } = jest.requireActual('react-native');
  const { View } = jest.requireActual('react-native');
  return <View>
    <Pressable accessibilityRole="button" accessibilityLabel="디자인 직군 선택" onPress={() => onSelect('DESIGN')}><Text>디자인</Text></Pressable>
    <Pressable accessibilityRole="button" accessibilityLabel="기존 직군 선택" onPress={() => onSelect('IT_TECH')}><Text>IT</Text></Pressable>
  </View>;
} }));
beforeEach(() => { mockBusy = false; mockSync.mockClear(); });
const state: Step2State = { nickname: '회원', isNicknameVerified: true, isNicknameChecking: false, sidoName: '서울', sigunguName: '강남구', eupmyeondongName: '역삼동', jobCategory: 'IT_TECH', jobTitle: '' };

it('clears the old job certificate when a different category is selected', () => {
  const onChange = jest.fn();
  const screen = render(<JobVerificationSection state={state} onChange={onChange} />);
  fireEvent.press(screen.getAllByRole('button')[0]);
  fireEvent.press(screen.getByRole('button', { name: '디자인 직군 선택' }));
  expect(onChange).toHaveBeenCalledWith({ jobCategory: 'DESIGN' });
});

it('blocks category changes while a document is being prepared', () => {
  mockBusy = true;
  const onChange = jest.fn();
  const screen = render(<JobVerificationSection state={state} onChange={onChange} />);
  fireEvent.press(screen.getAllByRole('button')[0]);
  expect(screen.queryByRole('button', { name: '디자인 직군 선택' })).toBeNull();
  expect(screen.getByText('직업 확인 서류 · 선택')).toBeTruthy();
  expect(onChange).not.toHaveBeenCalled();
});

it('keeps the uploaded certificate when the same category is selected again', () => {
  const onChange = jest.fn();
  const screen = render(<JobVerificationSection state={state} onChange={onChange} />);
  fireEvent.press(screen.getAllByRole('button')[0]);
  fireEvent.press(screen.getByRole('button', { name: '기존 직군 선택' }));
  expect(onChange).not.toHaveBeenCalled();
});
