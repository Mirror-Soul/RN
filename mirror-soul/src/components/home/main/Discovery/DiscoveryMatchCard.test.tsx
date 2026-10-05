import React from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';
import { View } from 'react-native';
import DiscoveryMatchCard from './DiscoveryMatchCard';
import { MOCK_RECOMMENDATIONS } from './mockRecommendations';

type PanEvent = { translationX: number; velocityX: number };
let mockPanHandlers: {
  update: (event: PanEvent) => void;
  end: (event: PanEvent) => void;
  finalize: (event: PanEvent, completed: boolean) => void;
};
let mockAnimationFinished = true;
jest.mock('@/src/hooks/useThemeColors', () => ({
  useThemeColors: () => ({ colors: jest.requireActual('@/src/constants/theme').lightTheme }),
}));
jest.mock('@/src/hooks/useLayout', () => ({ useLayout: () => ({ cardWidth: 300 }) }));
jest.mock('expo-haptics', () => ({ impactAsync: jest.fn().mockResolvedValue(undefined), ImpactFeedbackStyle: { Medium: 'medium' } }));
jest.mock('./DiscoveryCardContent', () => () => null);
jest.mock('./PhotoLightbox', () => () => null);
jest.mock('react-native-gesture-handler', () => ({
  Gesture: {
    Pan: () => {
      const builder = {
        activeOffsetX: () => builder,
        failOffsetY: () => builder,
        onUpdate: (callback: typeof mockPanHandlers.update) => { mockPanHandlers.update = callback; return builder; },
        onEnd: (callback: typeof mockPanHandlers.end) => { mockPanHandlers.end = callback; return builder; },
        onFinalize: (callback: typeof mockPanHandlers.finalize) => { mockPanHandlers.finalize = callback; return builder; },
      };
      return builder;
    },
  },
  GestureDetector: ({ children }: { children: React.ReactNode }) => children,
}));
jest.mock('react-native-reanimated', () => ({
  __esModule: true,
  default: { View: jest.requireActual('react-native').View },
  useSharedValue: (value: unknown) => jest.requireActual('react').useRef({ value }).current,
  cancelAnimation: jest.fn(),
  ReduceMotion: { System: 'system' },
  useAnimatedStyle: (callback: () => unknown) => callback(),
  withSpring: (value: number) => value,
  withTiming: (value: number, _options: unknown, done: (finished: boolean) => void) => { done(mockAnimationFinished); return value; },
  runOnJS: (callback: unknown) => callback,
}));

function setup(canGoBack = true) {
  const onPass = jest.fn();
  const onGoBack = jest.fn();
  const translateX = { value: 0 };
  const screen = render(<DiscoveryMatchCard match={MOCK_RECOMMENDATIONS[0]} canGoBack={canGoBack}
    onPass={onPass} onGoBack={onGoBack} onConnect={jest.fn()} translateX={translateX as never} />);
  return { screen, onPass, onGoBack, translateX };
}
beforeEach(() => {
  mockPanHandlers = {} as typeof mockPanHandlers;
  mockAnimationFinished = true;
});

it('moves to the next profile on a left swipe', () => {
  const { onPass, onGoBack } = setup();
  act(() => mockPanHandlers.end({ translationX: -120, velocityX: 0 }));
  expect(onPass).toHaveBeenCalledTimes(1);
  expect(onGoBack).not.toHaveBeenCalled();
});

it('moves to the previous profile on a right swipe without recording PASS', () => {
  const { onPass, onGoBack } = setup();
  act(() => mockPanHandlers.end({ translationX: 120, velocityX: 0 }));
  expect(onGoBack).toHaveBeenCalledTimes(1);
  expect(onPass).not.toHaveBeenCalled();
});

it('blocks dragging right on the first profile while allowing dragging left', () => {
  const { translateX, onPass, onGoBack } = setup(false);
  act(() => mockPanHandlers.update({ translationX: 150, velocityX: 0 }));
  expect(translateX.value).toBe(0);
  act(() => mockPanHandlers.end({ translationX: 150, velocityX: 700 }));
  expect(onGoBack).not.toHaveBeenCalled();
  act(() => mockPanHandlers.update({ translationX: -150, velocityX: 0 }));
  expect(translateX.value).toBe(-150);
  act(() => mockPanHandlers.end({ translationX: -150, velocityX: 0 }));
  expect(onPass).toHaveBeenCalledTimes(1);
});

it('does not change the profile for short drags or canceled gestures', () => {
  const { translateX, onPass, onGoBack } = setup();
  act(() => mockPanHandlers.end({ translationX: -20, velocityX: 0 }));
  expect(translateX.value).toBe(0);
  act(() => {
    mockPanHandlers.update({ translationX: -100, velocityX: 0 });
    mockPanHandlers.finalize({ translationX: -100, velocityX: 0 }, false);
  });
  expect(translateX.value).toBe(0);
  expect(onPass).not.toHaveBeenCalled();
  expect(onGoBack).not.toHaveBeenCalled();
});

it('uses the measured card width instead of the whole display for the swipe threshold', () => {
  const { screen, onPass } = setup();
  const card = screen.UNSAFE_getAllByType(View).find(node => node.props.onLayout)!;
  fireEvent(card, 'layout', { nativeEvent: { layout: { width: 180 } } });
  act(() => mockPanHandlers.end({ translationX: -60, velocityX: 0 }));
  expect(onPass).toHaveBeenCalledTimes(1);
});

it('ignores high-velocity tiny flicks to avoid accidentally skipping profiles', () => {
  const { onPass, onGoBack } = setup();
  act(() => mockPanHandlers.end({ translationX: -10, velocityX: -700 }));
  expect(onPass).not.toHaveBeenCalled();
  expect(onGoBack).not.toHaveBeenCalled();
});

it('accepts an intentional short fling in its actual drag direction', () => {
  const { onPass } = setup();
  act(() => mockPanHandlers.end({ translationX: -40, velocityX: -700 }));
  expect(onPass).toHaveBeenCalledTimes(1);
});

it('returns a short drag that reverses velocity instead of jumping profiles', () => {
  const { onPass, onGoBack } = setup();
  act(() => mockPanHandlers.end({ translationX: -40, velocityX: 700 }));
  expect(onPass).not.toHaveBeenCalled();
  expect(onGoBack).not.toHaveBeenCalled();
});

it('commits an exit only once even if another gesture ends before the card changes', () => {
  const { onPass } = setup();
  act(() => {
    mockPanHandlers.end({ translationX: -120, velocityX: 0 });
    mockPanHandlers.end({ translationX: -120, velocityX: 0 });
  });
  expect(onPass).toHaveBeenCalledTimes(1);
});

it('does not advance after an interrupted exit animation', () => {
  mockAnimationFinished = false;
  const { onPass, onGoBack } = setup();
  act(() => mockPanHandlers.end({ translationX: -120, velocityX: 0 }));
  expect(onPass).not.toHaveBeenCalled();
  expect(onGoBack).not.toHaveBeenCalled();
});
