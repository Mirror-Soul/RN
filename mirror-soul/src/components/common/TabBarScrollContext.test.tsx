import React, { useContext } from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';
import { AccessibilityInfo, Keyboard, Pressable, ScrollView, Text } from 'react-native';
import { TabBarCompactContext, TabBarScrollContext, TabBarScrollProvider } from './TabBarScrollContext';
import { FloatingTabBarInsetContext } from './FloatingTabBarInsetContext';
import { useMainTabScroll } from '@/src/hooks/useMainTabScroll';
import { useMainTabBottomPadding } from '@/src/hooks/useMainTabBottomPadding';
import BottomNavbar from '@/src/components/home/main/BottomNavbar';

jest.mock('expo-font', () => ({ isLoaded: () => false }));
jest.mock('react-native-reanimated', () => jest.requireActual('react-native-reanimated/mock'));
jest.mock('expo-blur', () => ({ BlurView: jest.requireActual('react-native').View }));
jest.mock('react-native-safe-area-context', () => ({ useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }) }));
jest.mock('@/src/hooks/useThemeColors', () => ({ useThemeColors: () => ({ colors: jest.requireActual('@/src/constants/theme').lightTheme, isDark: false }) }));

function Content() {
  const controller = useContext(TabBarScrollContext);
  const compact = useContext(TabBarCompactContext);
  const primary = useMainTabScroll('index');
  const stale = useMainTabScroll('history');
  const padding = useMainTabBottomPadding();
  return <>
    <Text>{compact ? '축소' : '펼침'}</Text><Text>{`여백 ${padding}`}</Text>
    <ScrollView testID="primary-scroll" {...primary} />
    <ScrollView testID="stale-scroll" {...stale} />
    <Pressable testID="activate" onPress={() => controller?.activate('grow')} />
    <Pressable testID="return" onPress={() => controller?.activate('index')} />
    <BottomNavbar />
  </>;
}
const setup = () => render(<TabBarScrollProvider><FloatingTabBarInsetContext.Provider value={210}><Content /></FloatingTabBarInsetContext.Provider></TabBarScrollProvider>);
const event = (y: number, max = 2000) => ({ nativeEvent: { contentOffset: { x: 0, y }, contentSize: { width: 320, height: max + 500 }, layoutMeasurement: { width: 320, height: 500 } } });

beforeEach(() => {
  jest.useFakeTimers();
  jest.spyOn(AccessibilityInfo, 'isScreenReaderEnabled').mockResolvedValue(false);
  jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(true);
  jest.spyOn(AccessibilityInfo, 'isReduceTransparencyEnabled').mockResolvedValue(false);
});
afterEach(() => { jest.useRealTimers(); jest.restoreAllMocks(); });

it('keeps compact tabs interactive while retaining exactly the same content padding', async () => {
  const screen = setup();
  await act(async () => {});
  const scroll = screen.getByTestId('primary-scroll');
  fireEvent(scroll, 'scrollBeginDrag', event(0));
  fireEvent.scroll(scroll, event(40));
  expect(screen.getByText('축소')).toBeTruthy();
  expect(screen.getByText('여백 226')).toBeTruthy();
  expect(screen.getByTestId('main-tab-bar', { includeHiddenElements: true }).props.pointerEvents).toBe('box-none');
  expect(screen.getByTestId('main-tab-bar', { includeHiddenElements: true }).props.accessibilityElementsHidden).not.toBe(true);
  fireEvent.scroll(scroll, event(28));
  expect(screen.getByText('펼침')).toBeTruthy();
  expect(screen.getByText('여백 226')).toBeTruthy();
  expect(screen.getByTestId('main-tab-bar').props.pointerEvents).toBe('box-none');
});

it('shows for a new route and ignores late events from mounted inactive tabs', async () => {
  const screen = setup();
  await act(async () => {});
  fireEvent(screen.getByTestId('stale-scroll'), 'scrollBeginDrag', event(0));
  fireEvent.scroll(screen.getByTestId('stale-scroll'), event(80));
  expect(screen.getByText('펼침')).toBeTruthy();
  fireEvent(screen.getByTestId('primary-scroll'), 'scrollBeginDrag', event(0));
  fireEvent.scroll(screen.getByTestId('primary-scroll'), event(80));
  expect(screen.getByText('축소')).toBeTruthy();
  fireEvent.press(screen.getByTestId('activate'));
  expect(screen.getByText('펼침')).toBeTruthy();
  fireEvent.scroll(screen.getByTestId('primary-scroll'), event(200));
  expect(screen.getByText('펼침')).toBeTruthy();
});

it('continues user momentum, reveals at the end and stops reacting after it settles', async () => {
  const screen = setup();
  await act(async () => {});
  const scroll = screen.getByTestId('primary-scroll');
  fireEvent(scroll, 'scrollBeginDrag', event(0));
  fireEvent(scroll, 'scrollEndDrag', event(20));
  fireEvent(scroll, 'momentumScrollBegin', event(20));
  act(() => jest.advanceTimersByTime(200));
  fireEvent.scroll(scroll, event(80));
  expect(screen.getByText('축소')).toBeTruthy();
  fireEvent(scroll, 'momentumScrollEnd', event(1998));
  expect(screen.getByText('펼침')).toBeTruthy();
  fireEvent.scroll(scroll, event(1800));
  fireEvent.scroll(scroll, event(1900));
  expect(screen.getByText('펼침')).toBeTruthy();
});

it('does not treat programmatic momentum as a drag', async () => {
  const screen = setup();
  await act(async () => {});
  const scroll = screen.getByTestId('primary-scroll');
  fireEvent(scroll, 'momentumScrollBegin', event(0));
  fireEvent.scroll(scroll, event(200));
  fireEvent.scroll(scroll, event(500));
  expect(screen.getByText('펼침')).toBeTruthy();
});

it('invalidates a previous gesture when leaving and returning to the same tab', async () => {
  const screen = setup();
  await act(async () => {});
  const scroll = screen.getByTestId('primary-scroll');
  fireEvent(scroll, 'scrollBeginDrag', event(0));
  fireEvent.scroll(scroll, event(80));
  expect(screen.getByText('축소')).toBeTruthy();
  fireEvent.press(screen.getByTestId('activate'));
  fireEvent.press(screen.getByTestId('return'));
  fireEvent.scroll(scroll, event(300));
  fireEvent.scroll(scroll, event(400));
  expect(screen.getByText('펼침')).toBeTruthy();
  fireEvent(scroll, 'scrollBeginDrag', event(400));
  fireEvent.scroll(scroll, event(440));
  expect(screen.getByText('축소')).toBeTruthy();
});

it('restores navigation after closing the keyboard even when previously hidden', async () => {
  const callbacks: Record<string, () => void> = {};
  jest.spyOn(Keyboard, 'addListener').mockImplementation((name, handler) => {
    callbacks[name] = () => handler({ duration: 0, easing: 'keyboard', endCoordinates: { width: 320, height: 250, screenX: 0, screenY: 318 } });
    return { remove: jest.fn() } as any;
  });
  const screen = setup();
  await act(async () => {});
  const scroll = screen.getByTestId('primary-scroll');
  fireEvent(scroll, 'scrollBeginDrag', event(0));
  fireEvent.scroll(scroll, event(80));
  expect(screen.getByText('축소')).toBeTruthy();
  act(() => (callbacks.keyboardWillShow ?? callbacks.keyboardDidShow)());
  expect(screen.queryByTestId('main-tab-bar', { includeHiddenElements: true })).toBeNull();
  act(() => callbacks.keyboardDidHide());
  expect(screen.getByText('펼침')).toBeTruthy();
  expect(screen.getByTestId('main-tab-bar').props.pointerEvents).toBe('box-none');
});

it('keeps navigation visible for screen readers, including when enabled while hidden', async () => {
  let listener: ((enabled: boolean) => void) | undefined;
  jest.spyOn(AccessibilityInfo, 'addEventListener').mockImplementation((name: string, handler: (...args: any[]) => void) => {
    if (name === 'screenReaderChanged') listener = handler;
    return { remove: jest.fn() } as any;
  });
  const screen = setup();
  await act(async () => {});
  const scroll = screen.getByTestId('primary-scroll');
  fireEvent(scroll, 'scrollBeginDrag', event(0));
  fireEvent.scroll(scroll, event(80));
  expect(screen.getByText('축소')).toBeTruthy();
  act(() => listener?.(true));
  expect(screen.getByText('펼침')).toBeTruthy();
  fireEvent.scroll(scroll, event(200));
  expect(screen.getByText('펼침')).toBeTruthy();
});

it('cleans up the drag settling timer on unmount', async () => {
  const screen = setup();
  await act(async () => {});
  const scroll = screen.getByTestId('primary-scroll');
  const schedule = jest.spyOn(global, 'setTimeout');
  const clear = jest.spyOn(global, 'clearTimeout');
  fireEvent(scroll, 'scrollBeginDrag', event(0));
  fireEvent(scroll, 'scrollEndDrag', event(40));
  const index = schedule.mock.calls.findIndex(call => call[1] === 120);
  expect(index).toBeGreaterThanOrEqual(0);
  const timer = schedule.mock.results[index].value;
  screen.unmount();
  expect(clear).toHaveBeenCalledWith(timer);
});
