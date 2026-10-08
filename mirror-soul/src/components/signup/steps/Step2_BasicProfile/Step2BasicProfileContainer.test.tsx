import React from 'react';
import { Alert } from 'react-native';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import Step2BasicProfileContainer from './Step2BasicProfileContainer';
const mockSave = jest.fn(); const mockSubmit = jest.fn(); const mockStatus = jest.fn(); const mockReplace = jest.fn();
let mockOwner = 'me';
let mockPhotos: unknown[] = [{}];
jest.mock('@/src/store/useAuthStore', () => ({ useAuthStore: Object.assign((s: (v: unknown) => unknown) => s({ userUuid: mockOwner }), { getState: () => ({ userUuid: mockOwner, isLoggedIn: true, updateUserStatus: mockStatus }) }) }));
jest.mock('@/src/services/onboardingService', () => ({ saveProfile: (...args: unknown[]) => mockSave(...args) }));
jest.mock('@/src/features/job-verification/evidenceDraft', () => ({ syncEvidenceDraft: jest.fn(), submitEvidenceDraft: () => mockSubmit(), useEvidenceDraft: Object.assign(() => ({ busy: false, phase: '' }), { getState: () => ({ owner: 'me', photos: mockPhotos }) }) }));
jest.mock('./hooks/useStep2Form', () => ({ useStep2Form: () => ({ state: { nickname: '회원', isNicknameVerified: true, sidoName: '서울', sigunguName: '강남구', eupmyeondongName: '역삼동', jobCategory: 'IT_TECH', jobTitle: '' }, isFormValid: true }) }));
jest.mock('expo-router', () => ({ useRouter: () => ({ replace: mockReplace }) }));
jest.mock('@/src/components/signup/common/SignupFormScreen', () => {
  const { View, Pressable, Text } = jest.requireActual('react-native');
  return function Screen({ onContinue, children, isSubmitting }: { onContinue: () => void; children: React.ReactNode; isSubmitting: boolean }) { return <View>{children}<Pressable disabled={isSubmitting} onPress={onContinue}><Text>계속</Text></Pressable></View>; };
});
jest.mock('@/src/components/signup/common/SignupSection', () => ({ __esModule: true, default: ({ children }: { children: React.ReactNode }) => children }));
jest.mock('./components/JobVerificationSection', () => () => null);
jest.mock('./components/LocationSection', () => () => null);
jest.mock('./components/NicknameSection', () => () => null);
jest.mock('./components/Step2Header', () => () => null);
jest.mock('@/src/features/profile/photo/ProfilePhotoManager', () => ({ ProfilePhotoManager: () => null }));
beforeEach(() => { jest.clearAllMocks(); mockOwner = 'me'; mockPhotos = [{}]; mockSave.mockResolvedValue({ isSuccess: true }); mockSubmit.mockResolvedValue({ requestId: 42 }); mockStatus.mockResolvedValue(undefined); });
afterEach(() => jest.restoreAllMocks());

it('saves the chosen job before submission without sending the obsolete certificate key', async () => {
  const view = render(<Step2BasicProfileContainer />); fireEvent.press(view.getByText('계속'));
  await waitFor(() => expect(mockReplace).toHaveBeenCalled());
  expect(mockSave.mock.invocationCallOrder[0]).toBeLessThan(mockSubmit.mock.invocationCallOrder[0]);
  expect(mockSave.mock.calls[0][1]).not.toHaveProperty('jobCertificationObjectKey');
  expect(mockStatus).toHaveBeenCalledWith('ONBOARD_B');
});
it('retries only documents after profile success and submission failure', async () => {
  const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  mockSubmit.mockRejectedValueOnce(new Error('timeout'));
  const view = render(<Step2BasicProfileContainer />); fireEvent.press(view.getByText('계속'));
  await waitFor(() => expect(alert).toHaveBeenCalledWith('프로필은 저장됐어요', expect.any(String), expect.any(Array)));
  expect(mockStatus).not.toHaveBeenCalled();
  const retry = alert.mock.calls[0][2]!.find(button => button.text === '서류 다시 제출')!;
  await act(async () => retry.onPress?.());
  await waitFor(() => expect(mockReplace).toHaveBeenCalled());
  expect(mockSave).toHaveBeenCalledTimes(1); expect(mockSubmit).toHaveBeenCalledTimes(2);
});
it('lets signup continue while keeping the failed documents for later', async () => {
  const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  mockSubmit.mockRejectedValueOnce(new Error('timeout'));
  const view = render(<Step2BasicProfileContainer />); fireEvent.press(view.getByText('계속'));
  await waitFor(() => expect(alert).toHaveBeenCalled());
  await act(async () => alert.mock.calls[0][2]!.find(button => button.text === '가입 먼저 계속')!.onPress?.());
  expect(mockStatus).toHaveBeenCalledWith('ONBOARD_B'); expect(mockPhotos).toHaveLength(1);
});
it('does not submit if the account changes before profile saving completes', async () => {
  let finish!: (result: unknown) => void; mockSave.mockImplementation(() => new Promise(resolve => { finish = resolve; }));
  const view = render(<Step2BasicProfileContainer />); fireEvent.press(view.getByText('계속'));
  mockOwner = 'another'; await act(async () => finish({ isSuccess: true }));
  expect(mockSubmit).not.toHaveBeenCalled(); expect(mockStatus).not.toHaveBeenCalled();
});
