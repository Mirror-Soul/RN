import React from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';
import { Modal, Text } from 'react-native';
import { BottomSheet } from './BottomSheet';

let mockHeight = 852;
const mockCompletions: ((finished: boolean) => void)[] = [];
jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({ __esModule: true, default: () => ({ width: 393, height: mockHeight, scale: 3, fontScale: 1 }) }));
jest.mock('@/src/hooks/useThemeColors', () => ({ useThemeColors: () => ({ colors: jest.requireActual('@/src/constants/theme').lightTheme }) }));
jest.mock('react-native-reanimated', () => ({
  __esModule: true,
  default: { View: jest.requireActual('react-native').View },
  useSharedValue: (value: number) => jest.requireActual('react').useRef({ value }).current,
  useAnimatedStyle: (style: () => unknown) => style(),
  withSpring: (value: number) => value,
  withTiming: (value: number, _: unknown, completion?: (finished: boolean) => void) => { if (completion) mockCompletions.push(completion); return value; },
  runOnJS: (callback: () => void) => callback,
}));
jest.mock('react-native-gesture-handler', () => ({
  GestureHandlerRootView: jest.requireActual('react-native').View,
  GestureDetector: ({ children }: { children: React.ReactNode }) => {
    const { View } = jest.requireActual('react-native');
    return <View testID="gesture-target">{children}</View>;
  },
  Gesture: { Pan: () => { const pan = { onUpdate: () => pan, onEnd: () => pan }; return pan; } },
}));
beforeEach(() => { mockHeight = 852; mockCompletions.length = 0; });

it('does not dismiss a reopened sheet when a previous closing animation is cancelled', () => {
  const onClose = jest.fn();
  const screen = render(<BottomSheet isOpen onClose={onClose}><Text>본문</Text></BottomSheet>);
  screen.rerender(<BottomSheet isOpen={false} onClose={onClose}><Text>본문</Text></BottomSheet>);
  const oldCompletion = mockCompletions[mockCompletions.length - 1];
  screen.rerender(<BottomSheet isOpen onClose={onClose}><Text>본문</Text></BottomSheet>);
  act(() => oldCompletion(false));
  expect(screen.UNSAFE_getByType(Modal).props.visible).toBe(true);
  expect(onClose).not.toHaveBeenCalled();
});

it('handles the Android back request only after the closing animation completes', () => {
  const onClose = jest.fn();
  const screen = render(<BottomSheet isOpen onClose={onClose}><Text>본문</Text></BottomSheet>);
  fireEvent(screen.UNSAFE_getByType(Modal), 'requestClose');
  const completion = mockCompletions[mockCompletions.length - 1];
  act(() => completion(false));
  expect(onClose).not.toHaveBeenCalled();
  act(() => completion(true));
  expect(onClose).toHaveBeenCalledTimes(1);
});

it('lets consent content scroll outside the handle gesture target', () => {
  const screen = render(<BottomSheet isOpen onClose={jest.fn()} dragFromHandleOnly><Text>스크롤 본문</Text></BottomSheet>);
  const target = screen.getByTestId('gesture-target');
  expect(target.findAllByType(Text)).toHaveLength(0);
  expect(screen.getByText('스크롤 본문')).toBeTruthy();
});
