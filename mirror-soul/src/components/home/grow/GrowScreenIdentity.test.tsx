import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import GrowScreen from '@/app/(main)/grow';

let mockOwner = 'same-member';
jest.mock('@/src/store/useAuthStore', () => ({ useAuthStore: (select: (state: unknown) => unknown) => select({ userUuid: mockOwner }) }));
jest.mock('@/src/features/profile/hooks/useProfileRefresh', () => ({ useProfileRefresh: jest.fn() }));
jest.mock('@/src/features/growth/hooks/useTwinSyncQuery', () => ({ useTwinSyncQuery: () => ({ data: { syncRate: 72 }, isLoading: false, isError: false, refetch: jest.fn() }) }));
jest.mock('@/src/features/job-verification/useJobReviewQuery', () => ({ useJobReviewQuery: () => ({ data: undefined, isLoading: false, isError: false, refetch: jest.fn() }) }));
jest.mock('@/src/features/profile/hooks/useIntroductionQuery', () => ({ useIntroductionQuery: () => ({ data: { job: 'IT_TECH', jobCertificationSubmitted: false }, isLoading: false, isError: false, refetch: jest.fn() }) }));
jest.mock('react-native-safe-area-context', () => ({ useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }) }));
jest.mock('@/src/hooks/useLayout', () => ({ useLayout: () => ({ contentContainerStyle: {}, screenPadding: 24 }) }));
jest.mock('@/src/hooks/useThemeColors', () => ({ useThemeColors: () => ({ colors: jest.requireActual('@/src/constants/theme').lightTheme }) }));
jest.mock('./EvolveHeader', () => () => null);
jest.mock('./EvolveFooter', () => () => null);
jest.mock('./EvolveBodyTitle', () => () => null);
jest.mock('./TwinSimulationCard', () => () => null);
jest.mock('./FaceDataMissionCard', () => () => null);
jest.mock('./VoiceMissionCard', () => () => null);
jest.mock('./GrowthHeroSection', () => {
  const { Pressable, Text } = jest.requireActual('react-native');
  return function Hero({ onVerifyPress }: { onVerifyPress: () => void }) { return <Pressable onPress={onVerifyPress}><Text>직업 인증 열기</Text></Pressable>; };
});
jest.mock('./ValueBalanceMissionCard', () => {
  const { Pressable, Text } = jest.requireActual('react-native');
  return function Card({ onPress }: { onPress: () => void }) { return <Pressable onPress={onPress}><Text>가치관 열기</Text></Pressable>; };
});
jest.mock('./modals/VerificationModal', () => {
  const { TextInput } = jest.requireActual('react-native');
  return function Verification({ isOpen }: { isOpen: boolean }) {
    const [draft, setDraft] = jest.requireActual('react').useState('');
    return isOpen ? <TextInput accessibilityLabel="직업 서류 선택 상태" value={draft} onChangeText={setDraft} /> : null;
  };
});
jest.mock('./modals/ValueBalanceModal', () => {
  const { Text } = jest.requireActual('react-native');
  return function Balance({ isOpen }: { isOpen: boolean }) { return isOpen ? <Text>가치관 화면</Text> : null; };
});

beforeEach(() => { mockOwner = 'same-member'; });
afterEach(() => jest.restoreAllMocks());

it('keeps sibling modal identities unique when returning to growth and resets private state for a new member', () => {
  const errors = jest.spyOn(console, 'error').mockImplementation(() => {});
  const view = render(<GrowScreen />);
  fireEvent.press(view.getByText('직업 인증 열기'));
  fireEvent.changeText(view.getByLabelText('직업 서류 선택 상태'), 'private document');
  fireEvent.press(view.getByText('가치관 열기'));
  view.rerender(<GrowScreen />);
  expect(view.getByText('가치관 화면')).toBeTruthy();
  expect(view.getByLabelText('직업 서류 선택 상태').props.value).toBe('private document');
  mockOwner = 'new-member';
  view.rerender(<GrowScreen />);
  expect(view.getByLabelText('직업 서류 선택 상태').props.value).toBe('');
  expect(errors.mock.calls.filter(args => /same key|unique.*key/i.test(args.map(String).join(' ')))).toHaveLength(0);
});
