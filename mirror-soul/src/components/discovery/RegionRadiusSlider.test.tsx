import React from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import Slider from './RegionRadiusSlider';

let mockPan: { start: (event: { x: number }) => void; update: (event: { x: number }) => void };
let mockTap: (event: { x: number }, success: boolean) => void;
let mockFailOffsetY: number[];
jest.mock('@/src/hooks/useThemeColors', () => ({ useThemeColors: () => ({ colors: jest.requireActual('@/src/constants/theme').lightTheme }) }));
jest.mock('react-native-gesture-handler', () => ({
  GestureDetector: ({ children }: { children: React.ReactNode }) => children,
  Gesture: {
    Race: () => ({}),
    Pan: () => {
      const builder = { enabled: () => builder, activeOffsetX: () => builder, failOffsetY: (value: number[]) => { mockFailOffsetY = value; return builder; }, onStart: (callback: typeof mockPan.start) => { mockPan.start = callback; return builder; }, onUpdate: (callback: typeof mockPan.update) => { mockPan.update = callback; return builder; } };
      return builder;
    },
    Tap: () => {
      const builder = { enabled: () => builder, maxDistance: () => builder, onEnd: (callback: typeof mockTap) => { mockTap = callback; return builder; } };
      return builder;
    },
  },
}));
jest.mock('react-native-reanimated', () => ({
  __esModule: true, default: { View: jest.requireActual('react-native').View },
  useSharedValue: (value: unknown) => jest.requireActual('react').useRef({ value }).current,
  useAnimatedStyle: (callback: () => unknown) => callback(), runOnJS: (callback: unknown) => callback,
}));
beforeEach(() => { mockPan = {} as typeof mockPan; });

it('uses a 48px gesture surface and offers full buttons for every count', () => {
  const onValueChange = jest.fn();
  const screen = render(<Slider steps={[1, 10, 30, 50]} value={1} onValueChange={onValueChange} />);
  expect(StyleSheet.flatten(screen.getByTestId('region-radius-touch-surface').props.style).height).toBe(48);
  for (const count of [1, 10, 30, 50]) {
    fireEvent.press(screen.getByLabelText(`${count}개 동 선택`));
    expect(onValueChange).toHaveBeenLastCalledWith(count);
  }
  expect(mockFailOffsetY).toEqual([-12, 12]);
});

it('handles taps at both ends without a drag and does not flood JS while within the same stage', () => {
  const onValueChange = jest.fn();
  const screen = render(<Slider steps={[1, 10, 30, 50]} value={1} onValueChange={onValueChange} />);
  fireEvent(screen.getByTestId('region-radius-touch-surface'), 'layout', { nativeEvent: { layout: { width: 324 } } });
  act(() => mockTap({ x: 323 }, true));
  expect(onValueChange).toHaveBeenLastCalledWith(50);
  act(() => { mockPan.update({ x: 314 }); mockPan.update({ x: 310 }); });
  expect(onValueChange).toHaveBeenCalledTimes(1);
  act(() => mockTap({ x: 0 }, true));
  expect(onValueChange).toHaveBeenLastCalledWith(1);
});

it('ignores a canceled tap and disables selection during saving', () => {
  const onValueChange = jest.fn();
  const screen = render(<Slider steps={[1, 10, 30, 50]} value={10} disabled onValueChange={onValueChange} />);
  fireEvent(screen.getByTestId('region-radius-touch-surface'), 'layout', { nativeEvent: { layout: { width: 324 } } });
  fireEvent.press(screen.getByLabelText('50개 동 선택'));
  act(() => mockTap({ x: 323 }, false));
  expect(onValueChange).not.toHaveBeenCalled();
});
