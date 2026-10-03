import React from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';
import { Keyboard } from 'react-native';
import OnboardingSteps from './OnboardingSteps';

jest.mock('@expo/vector-icons', () => ({ Feather: () => null }));
jest.mock('@/src/hooks/useThemeColors', () => ({ useThemeColors: () => ({ colors: jest.requireActual('@/src/constants/theme').lightTheme }) }));

it('keeps the current step in progress even on the final signup screen', () => {
  const screen = render(<OnboardingSteps currentStep={5} />);
  expect(screen.getByRole('progressbar').props.accessibilityValue).toEqual(expect.objectContaining({ now: 4, max: 5 }));
  fireEvent.press(screen.getByRole('button', { name: '가입 순서' }));
  expect(screen.getAllByText('완료')).toHaveLength(4);
  expect(screen.getAllByText('진행 중')).toHaveLength(1);
});

it('shows the planned steps without offering navigation that bypasses signup', () => {
  const screen = render(<OnboardingSteps currentStep={2} />);
  fireEvent.press(screen.getByRole('button', { name: '가입 순서' }));
  expect(screen.getAllByText('예정')).toHaveLength(3);
  expect(screen.getAllByRole('button')).toHaveLength(1);
  screen.rerender(<OnboardingSteps currentStep={3} />);
  expect(screen.queryByText('예정')).toBeNull();
  expect(screen.getByText('다음 단계 · 음성 인터뷰')).toBeTruthy();
});

it('closes the expanded steps when the keyboard needs the screen space', () => {
  let show!: () => void;
  const listener = jest.spyOn(Keyboard, 'addListener').mockImplementation((_event, callback) => {
    show = () => callback({ duration: 0, easing: 'keyboard', endCoordinates: { width: 320, height: 300, screenX: 0, screenY: 400 } });
    return { remove: jest.fn() };
  });
  const screen = render(<OnboardingSteps />);
  fireEvent.press(screen.getByRole('button', { name: '가입 순서' }));
  expect(screen.getByRole('button', { name: '가입 순서' }).props.accessibilityState.expanded).toBe(true);
  act(() => show());
  expect(screen.getByRole('button', { name: '가입 순서' }).props.accessibilityState.expanded).toBe(false);
  listener.mockRestore();
});
