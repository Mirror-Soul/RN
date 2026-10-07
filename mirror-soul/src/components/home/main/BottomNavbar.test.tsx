import React from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';
import { AccessibilityInfo, Keyboard, Platform, Text } from 'react-native';
import BottomNavbar from './BottomNavbar';
import { FloatingTabBarInsetContext } from '@/src/components/common/FloatingTabBarInsetContext';
import { useMainTabBottomPadding } from '@/src/hooks/useMainTabBottomPadding';
import { TabBarCompactContext } from '@/src/components/common/TabBarScrollContext';

jest.mock('expo-font', () => ({ isLoaded: () => false }));
jest.mock('react-native-reanimated', () => jest.requireActual('react-native-reanimated/mock'));
jest.mock('expo-blur', () => ({ BlurView: (props: any) => jest.requireActual('react').createElement(jest.requireActual('react-native').View, props) }));
jest.mock('react-native-safe-area-context', () => ({ useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }) }));
jest.mock('@/src/hooks/useThemeColors', () => ({ useThemeColors: () => ({ colors: jest.requireActual('@/src/constants/theme').lightTheme, isDark: false }) }));
let mockDimensions = { width: 320, height: 568, fontScale: 1, scale: 3 };
jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({ __esModule: true, default: () => mockDimensions }));

const originalOS = Platform.OS;
beforeEach(() => {
  mockDimensions = { width: 320, height: 568, fontScale: 1, scale: 3 };
  Platform.OS = 'ios';
  jest.spyOn(Keyboard, 'isVisible').mockReturnValue(false);
  jest.spyOn(AccessibilityInfo, 'isReduceTransparencyEnabled').mockResolvedValue(false);
});
afterEach(() => { Platform.OS = originalOS; jest.restoreAllMocks(); });

it('keeps all five named tabs and routes taps and long presses without changing order', async () => {
  const onTabPress = jest.fn();
  const onTabLongPress = jest.fn();
  const screen = render(<BottomNavbar activeTab="match" onTabPress={onTabPress} onTabLongPress={onTabLongPress} />);
  await act(async () => {});
  expect(screen.getAllByRole('tab').map(tab => tab.props.accessibilityLabel)).toEqual(['기록', '성장', '발견', '매칭', '프로필']);
  expect(screen.getByRole('tab', { name: '매칭' }).props.accessibilityState.selected).toBe(true);
  fireEvent.press(screen.getByRole('tab', { name: '프로필' }));
  fireEvent(screen.getByRole('tab', { name: '기록' }), 'longPress');
  expect(onTabPress).toHaveBeenCalledWith('profile');
  expect(onTabLongPress).toHaveBeenCalledWith('history');
});

it('reports large measured height plus safe area rather than a fixed content offset', async () => {
  mockDimensions.fontScale = 2;
  const update = jest.fn();
  const screen = render(<BottomNavbar onObstructionHeightChange={update} />);
  await act(async () => {});
  fireEvent(screen.getByTestId('main-tab-bar'), 'layout', { nativeEvent: { layout: { height: 180 } } });
  expect(update).toHaveBeenLastCalledWith(222);
  expect(screen.getByText('프로필').props.numberOfLines).toBeUndefined();
  expect(screen.getByText('프로필').props.maxFontSizeMultiplier).toBeUndefined();
});

it('removes blur when reduced transparency changes at runtime', async () => {
  let listener: ((value: boolean) => void) | undefined;
  jest.spyOn(AccessibilityInfo, 'addEventListener').mockImplementation((event: string, handler: (...args: any[]) => void) => {
    if (event === 'reduceTransparencyChanged') listener = handler;
    return { remove: jest.fn() } as any;
  });
  const screen = render(<BottomNavbar />);
  await act(async () => {});
  expect(screen.getByTestId('main-tab-blur')).toBeTruthy();
  act(() => listener?.(true));
  expect(screen.queryByTestId('main-tab-blur')).toBeNull();
});

it('does not enable experimental Android blur', async () => {
  Platform.OS = 'android';
  const screen = render(<BottomNavbar />);
  await act(async () => {});
  expect(screen.queryByTestId('main-tab-blur')).toBeNull();
  expect(screen.getAllByRole('tab')).toHaveLength(5);
});

it('hides while typing, clears obstruction, and restores after keyboard dismissal', async () => {
  const callbacks: Record<string, () => void> = {};
  jest.spyOn(Keyboard, 'addListener').mockImplementation((event, handler) => {
    callbacks[event] = () => handler({ duration: 0, easing: 'keyboard', endCoordinates: { width: 320, height: 250, screenX: 0, screenY: 318 } });
    return { remove: jest.fn() } as any;
  });
  const update = jest.fn();
  const screen = render(<BottomNavbar onObstructionHeightChange={update} />);
  await act(async () => {});
  act(() => callbacks.keyboardWillShow());
  expect(screen.queryByTestId('main-tab-bar')).toBeNull();
  expect(update).toHaveBeenLastCalledWith(0);
  act(() => callbacks.keyboardDidHide());
  expect(screen.getAllByRole('tab')).toHaveLength(5);
  expect(update.mock.calls.at(-1)[0]).toBeGreaterThan(34);
});

it('gives scroll content the measured inset without adding the home indicator twice', () => {
  function Content() { return <Text>{useMainTabBottomPadding()}</Text>; }
  const screen = render(<FloatingTabBarInsetContext.Provider value={210}><Content /></FloatingTabBarInsetContext.Provider>);
  expect(screen.getByText('226')).toBeTruthy();
});

it('keeps all five tabs tappable in the compact state and uses an expanded reserve', async () => {
  const onPress = jest.fn();
  const inset = jest.fn();
  const screen = render(<TabBarCompactContext.Provider value={true}><BottomNavbar onTabPress={onPress} onObstructionHeightChange={inset} /></TabBarCompactContext.Provider>);
  await act(async () => {});
  expect(screen.getAllByRole('tab')).toHaveLength(5);
  fireEvent(screen.getByTestId('main-tab-bar'), 'layout', { nativeEvent: { layout: { height: 78 } } });
  expect(inset).toHaveBeenLastCalledWith(120);
  fireEvent.press(screen.getByRole('tab', { name: '매칭' }));
  expect(onPress).toHaveBeenCalledWith('match');
  expect(screen.getByTestId('main-tab-bar').props.pointerEvents).toBe('box-none');
});
