import React from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { PublicProfilePreview } from './PublicProfilePreview';
import { introductionPreview } from '../constants/introductionPreview';

let mockProfile = { ...introductionPreview, userUuid: 'me', profileImageUrl: 'https://signed/photo.jpg', voicePreview: { audioUrl: 'https://signed/sample.mp3', contentType: 'audio/mpeg', durationMs: 10000 } };
let mockLocalPreview: { url: string; uri: string } | null = null;
const mockOwnRefetch = jest.fn();
const mockOtherRefetch = jest.fn();
jest.mock('../hooks/useIntroductionQuery', () => ({ useIntroductionQuery: () => ({ data: mockProfile, isPreview: false, refetch: mockOwnRefetch }) }));
jest.mock('@/src/utils/logger', () => ({ logger: { warn: jest.fn(), info: jest.fn(), error: jest.fn(), debug: jest.fn() } }));
jest.mock('@/src/store/useAuthStore', () => ({ useAuthStore: jest.fn() }));
jest.mock('../hooks/useProfileRefresh', () => ({ useProfileRefresh: () => {} }));
jest.mock('./registeredPhotoPreview', () => ({ ...jest.requireActual('./registeredPhotoPreview'), useRegisteredPhotoPreview: () => mockLocalPreview }));
jest.mock('@/src/features/home/hooks/useRecommendationDetailQuery', () => ({ useRecommendationDetailQuery: () => ({ refetch: mockOtherRefetch }) }));
jest.mock('@/src/features/profile/components/VoicePreviewPlayer', () => {
  const { Pressable, Text } = jest.requireActual('react-native');
  return { VoicePreviewPlayer: ({ onReload }: { onReload: () => void }) => <Pressable onPress={onReload} accessibilityRole="button" accessibilityLabel="미리듣기 새로고침"><Text>새로고침</Text></Pressable> };
});
jest.mock('@/src/hooks/useThemeColors', () => ({ useThemeColors: () => ({ colors: jest.requireActual('@/src/constants/theme').lightTheme }) }));
jest.mock('@expo/vector-icons', () => ({ Feather: () => null }));
jest.mock('expo-image', () => ({ Image: jest.requireActual('react-native').Image }));
jest.mock('expo-blur', () => ({ BlurView: jest.requireActual('react-native').View }));
jest.mock('expo-linear-gradient', () => ({ LinearGradient: jest.requireActual('react-native').View }));
jest.mock('react-native-safe-area-context', () => ({ useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }) }));
jest.mock('react-native-reanimated', () => {
  const chain = { delay: () => chain, duration: () => chain };
  return { __esModule: true, default: { View: jest.requireActual('react-native').View }, FadeInUp: chain };
});

beforeEach(() => { mockLocalPreview = null; mockProfile = { ...mockProfile, profileImageUrl: 'https://signed/photo.jpg' }; jest.clearAllMocks(); mockOwnRefetch.mockResolvedValue({ data: introductionPreview }); });

it('refreshes the own-profile endpoint instead of manually refetching a null recommendation', async () => {
  const screen = render(<PublicProfilePreview onClose={jest.fn()} />);
  fireEvent.press(await screen.findByLabelText('미리듣기 새로고침'));
  await waitFor(() => expect(mockOwnRefetch).toHaveBeenCalledWith({ throwOnError: true }));
  expect(mockOtherRefetch).not.toHaveBeenCalled();
  expect(screen.queryByLabelText('통화하기')).toBeNull();
});


it('uses the registered local photo on download failure and retries the server image', async () => {
  mockLocalPreview = { url: mockProfile.profileImageUrl, uri: 'file:///registered.jpg' };
  const screen = render(<PublicProfilePreview onClose={jest.fn()} />);
  const Image = jest.requireActual('react-native').Image;
  const remote = screen.UNSAFE_getByType(Image);
  const lateError = remote.props.onError;
  fireEvent(remote, 'error');
  expect(screen.UNSAFE_getByType(Image).props.source.uri).toBe('file:///registered.jpg');
  fireEvent.press(screen.getByLabelText('프로필 사진 다시 불러오기'));
  expect(mockOwnRefetch).toHaveBeenCalledWith({ throwOnError: true });
  expect(screen.UNSAFE_getByType(Image).props.source.uri).toBe('https://signed/photo.jpg');
  await act(async () => lateError());
  expect(screen.UNSAFE_getByType(Image).props.source.uri).toBe('https://signed/photo.jpg');
});
