import React from 'react';
import { Modal, Platform } from 'react-native';
import { Image } from 'expo-image';
import { act, fireEvent, render } from '@testing-library/react-native';
import { ProfilePhotoViewer } from './ProfilePhotoViewer';

jest.mock('expo-image', () => ({ Image: jest.requireActual('react-native').Image }));
jest.mock('@expo/vector-icons', () => ({ Feather: () => null }));
jest.mock('react-native-safe-area-context', () => ({ useSafeAreaInsets: () => ({ top: 0, bottom: 0 }) }));
jest.mock('@/src/hooks/useThemeColors', () => ({ useThemeColors: () => ({ colors: jest.requireActual('@/src/constants/theme').lightTheme }) }));

const props = { uri: 'https://bucket/photo.jpg', name: '소울', onClose: jest.fn(), onChange: jest.fn(), onDelete: jest.fn() };
beforeEach(() => jest.clearAllMocks());
afterEach(() => jest.restoreAllMocks());

it('keeps registration distinct from image failure and retries without changing the URL', () => {
  const screen = render(<ProfilePhotoViewer {...props} />);
  const first = screen.UNSAFE_getByType(Image);
  const lateLoad = first.props.onLoad;
  fireEvent(first, 'error');
  expect(screen.getByText(/사진은 등록되어 있어요/)).toBeTruthy();
  act(() => lateLoad());
  expect(screen.queryByText('다시 불러오기')).toBeTruthy();
  fireEvent.press(screen.getByLabelText('등록한 프로필 사진 다시 불러오기'));
  const next = screen.UNSAFE_getByType(Image);
  expect(next.props.source.uri).toBe(props.uri);
  fireEvent(next, 'load');
  expect(screen.queryByText('사진을 불러오고 있어요…')).toBeNull();
  expect(props.onChange).not.toHaveBeenCalled();
});

it.each(['사진 바꾸기', '사진 삭제'])('waits for iOS modal dismissal before %s', label => {
  jest.replaceProperty(Platform, 'OS', 'ios');
  const screen = render(<ProfilePhotoViewer {...props} />);
  const modal = screen.UNSAFE_getByType(Modal);
  fireEvent.press(screen.getByRole('button', { name: label }));
  expect(props.onClose).not.toHaveBeenCalled();
  expect(props.onChange).not.toHaveBeenCalled();
  expect(props.onDelete).not.toHaveBeenCalled();
  fireEvent(modal, 'dismiss');
  expect(props.onClose).toHaveBeenCalledTimes(1);
  expect(label === '사진 바꾸기' ? props.onChange : props.onDelete).toHaveBeenCalledTimes(1);
  fireEvent(modal, 'dismiss');
  expect(props.onClose).toHaveBeenCalledTimes(1);
});

it('opens deletion after Android closes the viewer', () => {
  jest.replaceProperty(Platform, 'OS', 'android');
  const screen = render(<ProfilePhotoViewer {...props} />);
  fireEvent.press(screen.getByRole('button', { name: '사진 삭제' }));
  expect(props.onClose).toHaveBeenCalledTimes(1);
  expect(props.onDelete).toHaveBeenCalledTimes(1);
});

it('keeps the registration preview visible without hiding the remote error or blocking actions', () => {
  const screen = render(<ProfilePhotoViewer {...props} previewUri="file:///registered.jpg" />);
  const remote = screen.UNSAFE_getAllByType(Image).find(image => image.props.source.uri === props.uri)!;
  fireEvent(remote, 'error');
  expect(screen.UNSAFE_getByType(Image).props.source.uri).toBe('file:///registered.jpg');
  expect(screen.getByRole('alert')).toBeTruthy();
  expect(screen.getByLabelText('등록한 프로필 사진 다시 불러오기')).toBeEnabled();
  expect(screen.getByRole('button', { name: '사진 바꾸기' })).toBeEnabled();
  fireEvent(screen.UNSAFE_getByType(Image), 'error');
  expect(screen.getByText(/사진은 등록되어 있어요/)).toBeTruthy();
});
