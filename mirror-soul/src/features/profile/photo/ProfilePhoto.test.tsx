import React from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';
import { Image } from 'expo-image';
import { ProfilePhoto } from './ProfilePhoto';

jest.mock('expo-image', () => ({ Image: jest.requireActual('react-native').Image }));
jest.mock('expo-linear-gradient', () => ({ LinearGradient: jest.requireActual('react-native').View }));
jest.mock('@expo/vector-icons', () => ({ Feather: () => null }));
jest.mock('@/src/hooks/useThemeColors', () => ({ useThemeColors: () => ({ colors: jest.requireActual('@/src/constants/theme').darkTheme }) }));

it('uses the initial only when no photo is registered', () => {
  const screen = render(<ProfilePhoto name="소울" />);
  expect(screen.getByText('소')).toBeTruthy();
  expect(screen.queryByRole('button')).toBeNull();
});

it('distinguishes loading, a successful load, and a failed download', () => {
  const state = jest.fn();
  const screen = render(<ProfilePhoto name="소울" uri="https://bucket/photo.jpg" onLoadStateChange={state} />);
  expect(screen.getByLabelText('소울의 프로필 사진 불러오는 중')).toBeTruthy();
  const image = screen.UNSAFE_getByType(Image);
  fireEvent(image, 'load');
  expect(screen.getByLabelText('소울의 프로필 사진')).toBeTruthy();
  fireEvent(image, 'error');
  expect(screen.getByRole('button', { name: '프로필 사진 다시 불러오기' })).toBeTruthy();
  expect(screen.queryByText('소')).toBeNull();
  expect(state.mock.calls.map(([value]) => value)).toEqual(['loading', 'loaded', 'error']);
});

it('retries a failed download and ignores a late error from the old attempt', () => {
  const screen = render(<ProfilePhoto name="소울" uri="https://bucket/photo.jpg" />);
  const first = screen.UNSAFE_getByType(Image);
  const lateError = first.props.onError;
  fireEvent(first, 'error');
  fireEvent.press(screen.getByLabelText('프로필 사진 다시 불러오기'));
  const retry = screen.UNSAFE_getByType(Image);
  expect(screen.getByLabelText('소울의 프로필 사진 불러오는 중')).toBeTruthy();
  act(() => lateError());
  expect(screen.queryByRole('button')).toBeNull();
  fireEvent(retry, 'load');
  expect(screen.getByLabelText('소울의 프로필 사진')).toBeTruthy();
});

it('resets a failed download when the URL changes or the photo is deleted', () => {
  const screen = render(<ProfilePhoto name="소울" uri="https://bucket/old.jpg" />);
  fireEvent(screen.UNSAFE_getByType(Image), 'error');
  screen.rerender(<ProfilePhoto name="소울" uri="https://bucket/new.jpg" />);
  expect(screen.getByLabelText('소울의 프로필 사진 불러오는 중')).toBeTruthy();
  expect(screen.queryByRole('button')).toBeNull();
  screen.rerender(<ProfilePhoto name="소울" uri={null} />);
  expect(screen.getByText('소')).toBeTruthy();
});

it('opens the registered photo on press and reserves a failed photo press for retry', () => {
  const open = jest.fn();
  const screen = render(<ProfilePhoto name="소울" uri="https://bucket/photo.jpg" onPress={open} />);
  fireEvent.press(screen.getByLabelText('소울의 프로필 사진 크게 보기'));
  expect(open).toHaveBeenCalledTimes(1);
  fireEvent(screen.UNSAFE_getByType(Image), 'error');
  fireEvent.press(screen.getByLabelText('프로필 사진 다시 불러오기'));
  expect(open).toHaveBeenCalledTimes(1);
  fireEvent(screen.UNSAFE_getByType(Image), 'load');
  fireEvent.press(screen.getByLabelText('소울의 프로필 사진 크게 보기'));
  expect(open).toHaveBeenCalledTimes(2);
});

it('keeps a confirmed local preview visible while reporting a remote download failure', () => {
  const onState = jest.fn();
  const screen = render(<ProfilePhoto name="소울" uri="https://bucket/photo.jpg" previewUri="file:///registered.jpg" onLoadStateChange={onState} />);
  const remote = screen.UNSAFE_getAllByType(Image).find(image => image.props.source.uri === 'https://bucket/photo.jpg')!;
  fireEvent(remote, 'error');
  expect(screen.UNSAFE_getByType(Image).props.source.uri).toBe('file:///registered.jpg');
  expect(onState).toHaveBeenLastCalledWith('error');
  fireEvent(screen.UNSAFE_getByType(Image), 'error');
  expect(screen.getByLabelText('프로필 사진 다시 불러오기')).toBeTruthy();
});

it('replaces the local preview with the actual downloaded photo', () => {
  const screen = render(<ProfilePhoto name="소울" uri="https://bucket/photo.jpg" previewUri="file:///registered.jpg" />);
  fireEvent(screen.UNSAFE_getAllByType(Image).find(image => image.props.source.uri === 'https://bucket/photo.jpg')!, 'load');
  expect(screen.UNSAFE_getAllByType(Image)).toHaveLength(1);
  expect(screen.UNSAFE_getByType(Image).props.source.uri).toBe('https://bucket/photo.jpg');
});
