import React from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';
import { Image } from 'react-native';
import DiscoveryCardContent from './DiscoveryCardContent';
import { MOCK_RECOMMENDATIONS } from './mockRecommendations';

jest.mock('@/src/hooks/useThemeColors', () => ({
  useThemeColors: () => ({ colors: jest.requireActual('@/src/constants/theme').lightTheme }),
}));
jest.mock('@expo/vector-icons', () => ({ Feather: () => null }));
jest.mock('expo-image', () => ({ Image: jest.requireActual('react-native').Image }));

const profile = { ...MOCK_RECOMMENDATIONS[0], profileImageUrl: 'https://photo/one.jpg' };

it('keeps enlarging the photo, opening the profile and starting a call as separate actions', () => {
  const onPhotoPress = jest.fn();
  const onContentPress = jest.fn();
  const onConnectPress = jest.fn();
  const screen = render(<DiscoveryCardContent match={profile} onPhotoPress={onPhotoPress} onContentPress={onContentPress} onConnectPress={onConnectPress} />);
  fireEvent.press(screen.getByLabelText('프로필 사진 크게 보기'));
  expect(onPhotoPress).toHaveBeenCalledTimes(1);
  expect(onContentPress).not.toHaveBeenCalled();
  fireEvent.press(screen.getByLabelText('프로필 보기'));
  expect(onContentPress).toHaveBeenCalledTimes(1);
  fireEvent.press(screen.getByLabelText('트윈과 통화'));
  expect(onConnectPress).toHaveBeenCalledTimes(1);
});

it('opens the profile instead of an empty photo viewer when the photo download fails', () => {
  const onPhotoPress = jest.fn();
  const onContentPress = jest.fn();
  const screen = render(<DiscoveryCardContent match={profile} onPhotoPress={onPhotoPress} onContentPress={onContentPress} />);
  fireEvent(screen.UNSAFE_getByType(Image), 'error');
  fireEvent.press(screen.getByLabelText('상세 프로필 보기'));
  expect(onContentPress).toHaveBeenCalledTimes(1);
  expect(onPhotoPress).not.toHaveBeenCalled();
});

it('does not hide the next profile photo when an earlier download reports a late error', () => {
  const screen = render(<DiscoveryCardContent match={profile} />);
  const lateError = screen.UNSAFE_getByType(Image).props.onError;
  const next = { ...profile, userUuid: 'next', profileImageUrl: 'https://photo/two.jpg' };
  screen.rerender(<DiscoveryCardContent match={next} />);
  act(() => lateError());
  expect(screen.UNSAFE_getByType(Image).props.source.uri).toBe(next.profileImageUrl);
});

it('distinguishes the job visually without treating a submitted document as approved verification', () => {
  const screen = render(<DiscoveryCardContent match={{ ...profile, job: 'DESIGN', jobCertificationSubmitted: true }} />);
  expect(screen.getByLabelText('직업: 디자인')).toBeTruthy();
  expect(screen.queryByText('서류 제출')).toBeNull();
  expect(screen.queryByText('직업 인증 완료')).toBeNull();
});

it('refreshes the photo source without opening the profile or starting a call', async () => {
  const reload = jest.fn().mockResolvedValue(undefined);
  const open = jest.fn();
  const screen = render(<DiscoveryCardContent match={profile} onContentPress={open} onReloadPhoto={reload} />);
  const oldError = screen.UNSAFE_getByType(Image).props.onError;
  fireEvent(screen.UNSAFE_getByType(Image), 'error');
  await act(async () => { fireEvent.press(screen.getByLabelText('추천 프로필 사진 다시 불러오기')); });
  expect(reload).toHaveBeenCalledTimes(1);
  act(() => oldError());
  expect(screen.UNSAFE_getByType(Image).props.source.uri).toBe(profile.profileImageUrl);
  expect(open).not.toHaveBeenCalled();
});
