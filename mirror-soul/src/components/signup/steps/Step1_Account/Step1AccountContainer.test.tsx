import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { SIGNUP_ROUTES } from '@/src/constants/routes/signupRoutes';
import Step1AccountContainer from './Step1AccountContainer';
import { TEMPORARY_SIGNUP_IDENTITY } from './temporarySignupIdentity';

const mockReplace = jest.fn();
const mockMutateAsync = jest.fn();
const mockUpdateState = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace }),
  useLocalSearchParams: () => ({}),
}));
jest.mock('@/src/hooks/useThemeColors', () => ({ useThemeColors: () => ({ colors: { text: { secondary: '#666' } } }) }));
jest.mock('@/src/features/auth/onboardingResume', () => ({ getAuthEntryEmail: (email?: string) => email ?? '' }));
jest.mock('./hooks/useStep1Form', () => ({
  useStep1Form: () => ({
    state: {
      email: 'tester@example.com', password: 'abcd1234', passwordConfirm: 'abcd1234',
      agreedToTerms: true, agreedToPrivacy: true, emailExists: false, isEmailVerified: true, isLoading: false,
    },
    updateState: mockUpdateState,
    isFormValid: true,
  }),
}));
jest.mock('./hooks/useCreateAccountMutation', () => ({ useCreateAccountMutation: () => ({ mutateAsync: mockMutateAsync }) }));
// 화면 껍데기는 "계속" 버튼 하나로 대체하고, 폼 섹션들은 이 테스트와 무관해 렌더하지 않는다.
jest.mock('@/src/components/signup/common/SignupFormScreen', () => {
  const { Pressable } = jest.requireActual<typeof import('react-native')>('react-native');
  const { createElement } = jest.requireActual<typeof import('react')>('react');
  return {
    __esModule: true,
    default: ({ onContinue }: { onContinue: () => void }) => createElement(Pressable, { testID: 'continue', onPress: onContinue }),
  };
});
jest.mock('@/src/components/signup/common/SignupSection', () => ({ __esModule: true, default: () => null }));
jest.mock('./components/AgeVerificationSection', () => ({ __esModule: true, default: () => null }));
jest.mock('./components/AgreementSection', () => ({ __esModule: true, default: () => null }));
jest.mock('./components/EmailSection', () => ({ __esModule: true, default: () => null }));
jest.mock('./components/PasswordSection', () => ({ __esModule: true, default: () => null }));
jest.mock('./components/Step1Header', () => ({ __esModule: true, default: () => null }));

beforeEach(() => {
  jest.clearAllMocks();
  mockMutateAsync.mockResolvedValue({});
});

it('sends the temporary gender and birthDate with the signup request instead of null', async () => {
  const { getByTestId } = render(<Step1AccountContainer />);
  fireEvent.press(getByTestId('continue'));
  await waitFor(() => expect(mockMutateAsync).toHaveBeenCalledTimes(1));
  const request = mockMutateAsync.mock.calls[0][0];
  expect(request).toEqual({
    email: 'tester@example.com',
    password: 'abcd1234',
    gender: TEMPORARY_SIGNUP_IDENTITY.gender,
    birthDate: TEMPORARY_SIGNUP_IDENTITY.birthDate,
    termsAgreed: true,
  });
  expect(request.gender).not.toBeNull();
  expect(request.birthDate).not.toBeNull();
  await waitFor(() => expect(mockReplace).toHaveBeenCalledWith(SIGNUP_ROUTES.PROFILE));
});
