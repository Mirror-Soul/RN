import React from 'react';
import { fireEvent, render, within, waitFor } from '@testing-library/react-native';
import * as RN from 'react-native';
import { DetailPhotoOverlay } from '@/src/features/profile/photo/ProfilePhotoOverlays';
import { PROFILE_PHOTO_ASPECT } from '@/src/features/profile/photo/profilePhotoPresentation';
import PartnerProfileModal from './PartnerProfileModal';
import { MOCK_RECOMMENDATIONS } from './mockRecommendations';
import { introductionPreview } from '@/src/features/profile/constants/introductionPreview';
import type { RecommendationDetailResult } from '@/src/types/api/home';

let mockDetail: RecommendationDetailResult | undefined;
let mockError: unknown;
let mockRemainingTime = 180;
let mockDimensions = { width: 393, height: 852, fontScale: 1, scale: 3 };
const mockRefetchTime = jest.fn().mockResolvedValue({});
jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({ __esModule: true, default: () => mockDimensions }));
jest.mock('@/src/features/profile/hooks/useTimeStatusQuery', () => ({
  useTimeStatusQuery: () => ({ data: { remainingTalkTime: mockRemainingTime }, isFetching: false, isError: false, refetch: mockRefetchTime }),
}));
jest.mock('@/src/features/profile/hooks/useBuyTimeMutation', () => ({ useBuyTimeMutation: () => ({ mutateAsync: jest.fn() }) }));
jest.mock('@/src/components/common/Toast/ToastProvider', () => ({ useToast: () => ({ showToast: jest.fn() }) }));
jest.mock('@/src/features/profile/components/TimeRefillOption', () => ({ TimeRefillOption: () => null }));
jest.mock('react-native-gesture-handler', () => ({
  GestureHandlerRootView: jest.requireActual('react-native').View,
  GestureDetector: ({ children }: { children: React.ReactNode }) => children,
  Gesture: { Pan: () => { const pan = { onUpdate: () => pan, onEnd: () => pan }; return pan; } },
}));
jest.mock('@/src/features/home/hooks/useRecommendationDetailQuery', () => ({
  useRecommendationDetailQuery: () => ({ data: mockDetail, error: mockError, isError: !!mockError, isFetching: false, refetch: jest.fn() }),
}));
jest.mock('@/src/hooks/useThemeColors', () => ({
  useThemeColors: () => ({ colors: jest.requireActual('@/src/constants/theme').lightTheme }),
}));
jest.mock('@expo/vector-icons', () => ({ Feather: () => null }));
jest.mock('expo-image', () => ({ Image: jest.requireActual('react-native').Image }));
jest.mock('@/src/features/profile/components/VoicePreviewPlayer', () => ({ VoicePreviewPlayer: () => null }));
jest.mock('react-native-safe-area-context', () => ({ useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }) }));
jest.mock('react-native-reanimated', () => {
  const chain = { delay: () => chain, duration: () => chain };
  return {
    __esModule: true, default: { View: jest.requireActual('react-native').View }, FadeInUp: chain,
    useSharedValue: (value: number) => jest.requireActual('react').useRef({ value }).current,
    useAnimatedStyle: (style: () => unknown) => style(),
    withSpring: (value: number) => value,
    withTiming: (value: number, _: unknown, completion?: (finished: boolean) => void) => { completion?.(true); return value; },
    runOnJS: (callback: () => void) => callback,
  };
});

const profile = { ...MOCK_RECOMMENDATIONS[0], userUuid: 'actual-profile', name: '목록의 이름', profileImageUrl: 'https://photo/old.jpg' };
beforeEach(() => {
  mockDetail = { ...introductionPreview, userUuid: profile.userUuid, name: '최신 이름', profileImageUrl: null };
  mockError = undefined;
  mockRemainingTime = 180;
  mockDimensions = { width: 393, height: 852, fontScale: 1, scale: 3 };
});
afterEach(() => jest.restoreAllMocks());

it('uses the latest detail fields and opens confirmation before starting a call', async () => {
  const onStartCall = jest.fn();
  const screen = render(<PartnerProfileModal match={profile} embedded onClose={jest.fn()} onStartCall={onStartCall} />);
  expect(screen.getByText('최신 이름')).toBeTruthy();
  expect(screen.queryByText('목록의 이름')).toBeNull();
  expect(screen.UNSAFE_queryByType(RN.Image)).toBeNull();
  fireEvent.press(screen.getByLabelText('트윈과 통화하기'));
  expect(onStartCall).not.toHaveBeenCalled();
  await waitFor(() => expect(screen.getByLabelText('통화 시작')).toBeEnabled());
  fireEvent.press(screen.getByLabelText('통화 시작'));
  expect(onStartCall).toHaveBeenCalledWith({ userUuid: profile.userUuid, name: '최신 이름' }, false, 180);
});

it.each([
  { width: 320, height: 480, fontScale: 1 },
  { width: 360, height: 740, fontScale: 2 },
])('keeps one accessible call action inside scrolling content for constrained screens: %j', dimensions => {
  mockDimensions = { ...dimensions, scale: 3 };
  const screen = render(<PartnerProfileModal match={profile} embedded onClose={jest.fn()} onStartCall={jest.fn()} />);
  expect(screen.getAllByLabelText('트윈과 통화하기')).toHaveLength(1);
  const scroll = screen.UNSAFE_getByType(RN.ScrollView);
  expect(within(scroll).getByLabelText('트윈과 통화하기')).toBeTruthy();
});

it('does not allow starting a call when the recommended user is no longer available', () => {
  mockDetail = undefined;
  mockError = { code: 'RECOMMENDATION_4040' };
  const onStartCall = jest.fn();
  const screen = render(<PartnerProfileModal match={profile} embedded onClose={jest.fn()} onStartCall={onStartCall} />);
  const call = screen.getByLabelText('통화할 수 없어요');
  expect(call).toBeDisabled();
  fireEvent.press(call);
  expect(onStartCall).not.toHaveBeenCalled();
});

it('explains unavailable history profiles and returns to the call record', () => {
  mockDetail = undefined;
  mockError = { code: 'RECOMMENDATION_4040' };
  const onClose = jest.fn();
  const screen = render(<PartnerProfileModal source="history" match={profile} embedded onClose={onClose} />);
  expect(screen.getByText('사용자 상세')).toBeTruthy();
  expect(screen.getByText('현재 이 사용자의 상세 프로필을 확인할 수 없어요.')).toBeTruthy();
  expect(screen.queryByText('활동 지역 미설정')).toBeNull();
  fireEvent.press(screen.getByLabelText('통화 기록으로 돌아가기'));
  expect(onClose).toHaveBeenCalledTimes(1);
});

it('uses the registration-preview name overlay and centered 4:5 image for public profiles', () => {
  mockDetail = { ...mockDetail!, profileImageUrl: 'https://photo/new.jpg' };
  const screen = render(<PartnerProfileModal match={profile} embedded onClose={jest.fn()} />);
  const overlay = screen.UNSAFE_getByType(DetailPhotoOverlay);
  expect(overlay.props.name).toBe('최신 이름');
  expect(overlay.props.width / overlay.props.height).toBeCloseTo(PROFILE_PHOTO_ASPECT);
  expect(screen.getAllByText('최신 이름')).toHaveLength(1);
  const image = screen.UNSAFE_getByType(RN.Image);
  expect(image.props.contentFit).toBe('cover');
  expect(image.props.contentPosition).toBe('center');
});

it('shows the actual job without a verification claim based only on a submitted document', () => {
  mockDetail = { ...mockDetail!, job: 'IT_TECH', jobCertificationSubmitted: true };
  const screen = render(<PartnerProfileModal match={profile} embedded onClose={jest.fn()} />);
  expect(screen.getByLabelText('직업: 기술 · IT')).toBeTruthy();
  expect(screen.queryByText('서류 제출')).toBeNull();
  expect(screen.queryByText('직업 인증 완료')).toBeNull();
});


it('keeps the same profile scroll view and one native Modal when confirmation is cancelled', () => {
  const onClose = jest.fn();
  const screen = render(<PartnerProfileModal match={profile} onClose={onClose} onStartCall={jest.fn()} />);
  const profileScroll = screen.UNSAFE_getByType(RN.ScrollView);
  fireEvent.press(screen.getByLabelText('트윈과 통화하기'));
  expect(screen.UNSAFE_getAllByType(RN.Modal)).toHaveLength(1);
  fireEvent.press(screen.getByLabelText('통화 확인 닫기'));
  expect(screen.getByText('최신 이름')).toBeTruthy();
  expect(screen.UNSAFE_getByType(RN.ScrollView)).toBe(profileScroll);
  expect(onClose).not.toHaveBeenCalled();
});

it('keeps the profile underneath refill and handles Android back from the top layer', async () => {
  mockRemainingTime = 0;
  const onClose = jest.fn();
  const screen = render(<PartnerProfileModal match={profile} onClose={onClose} onStartCall={jest.fn()} />);
  const profileScroll = screen.UNSAFE_getByType(RN.ScrollView);
  fireEvent.press(screen.getByLabelText('트윈과 통화하기'));
  await waitFor(() => expect(screen.getByLabelText('대화 시간 충전하기')).toBeEnabled());
  fireEvent.press(screen.getByLabelText('대화 시간 충전하기'));
  expect(screen.getByText('대화 시간 채우기')).toBeTruthy();
  expect(screen.UNSAFE_getAllByType(RN.Modal)).toHaveLength(1);
  fireEvent(screen.UNSAFE_getByType(RN.Modal), 'requestClose');
  expect(screen.queryByText('대화 시간 채우기')).toBeNull();
  expect(screen.UNSAFE_getByType(RN.ScrollView)).toBe(profileScroll);
  expect(onClose).not.toHaveBeenCalled();
  fireEvent(screen.UNSAFE_getByType(RN.Modal), 'requestClose');
  expect(onClose).toHaveBeenCalledTimes(1);
});

it('places the MBTI type beside the balance heading instead of repeating it near the photo', () => {
  mockDetail = { ...mockDetail!, mbti: 'INFP', mbtiAxisScores: { ieScore: 40, nsScore: 60, ftScore: 70, pjScore: 30 } };
  const screen = render(<PartnerProfileModal match={profile} embedded onClose={jest.fn()} />);
  const headingRow = screen.UNSAFE_getAllByType(RN.View).find(node =>
    RN.StyleSheet.flatten(node.props.style)?.flexDirection === 'row' &&
    within(node).queryByText('MBTI 성향 밸런스') && within(node).queryByText('INFP'));
  expect(headingRow).toBeDefined();
  expect(screen.getAllByText('INFP')).toHaveLength(1);
});
