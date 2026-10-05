import React from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';
import { Image } from 'react-native';
import { MatchAvatar } from './MatchAvatar';

jest.mock('@/src/hooks/useThemeColors', () => ({
  useThemeColors: () => ({ colors: jest.requireActual('@/src/constants/theme').lightTheme }),
}));
jest.mock('expo-image', () => ({ Image: jest.requireActual('react-native').Image }));

it('shows the initial on failure and attempts a newly received photo URL', () => {
  const screen = render(<MatchAvatar name="소울" url="https://photo/old.jpg" />);
  fireEvent(screen.UNSAFE_getByType(Image), 'error');
  expect(screen.getByLabelText('사진을 불러오지 못해 기본 아바타로 표시')).toBeTruthy();
  screen.rerender(<MatchAvatar name="소울" url="https://photo/new.jpg" />);
  expect(screen.UNSAFE_getByType(Image).props.source.uri).toBe('https://photo/new.jpg');
});

it('does not replace a new avatar when an old download reports a late error', () => {
  const screen = render(<MatchAvatar name="소울" url="https://photo/old.jpg" />);
  const lateError = screen.UNSAFE_getByType(Image).props.onError;
  screen.rerender(<MatchAvatar name="소울" url="https://photo/new.jpg" />);
  act(() => lateError());
  const image = screen.UNSAFE_getByType(Image);
  expect(image.props.source.uri).toBe('https://photo/new.jpg');
  expect(image.props.contentFit).toBe('cover');
  expect(image.props.contentPosition).toBe('center');
});
