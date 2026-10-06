import React from 'react';
import { Text, ScrollView, StyleSheet, Linking, Platform } from 'react-native';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { AudioModule } from 'expo-audio';
import MainLayout from '@/app/(main)/_layout';
import BottomNavbar from '@/src/components/home/main/BottomNavbar';
import { ScreenLayout } from './ScreenLayout';
import { FloatingTabBarInsetContext } from './FloatingTabBarInsetContext';

let mockInsets = { top: 0, bottom: 34, left: 0, right: 0 };
const mockRefresh = jest.fn(async () => {});
jest.mock('react-native-safe-area-context', () => ({ useSafeAreaInsets: () => mockInsets }));
jest.mock('@/src/hooks/useThemeColors', () => ({ useThemeColors: () => ({ colors: jest.requireActual('@/src/constants/theme').lightTheme, isDark: false }) }));
jest.mock('@/src/hooks/useLayout', () => ({ useLayout: () => ({ sizeClass: 'compact', contentContainerStyle: { width: '100%' } }) }));
jest.mock('@expo/vector-icons', () => ({ Feather: () => null }));
jest.mock('expo-blur', () => ({ BlurView: jest.requireActual('react-native').View }));
jest.mock('react-native-reanimated', () => ({
  __esModule: true,
  default: { View: jest.requireActual('react-native').View },
  useSharedValue: (value: number) => ({ value }),
  useAnimatedStyle: (fn: () => unknown) => fn(),
  withTiming: (value: number) => value,
  Easing: { out: () => undefined, inOut: () => undefined },
}));
jest.mock('@/src/components/common/Header', () => ({ Header: () => null }));
jest.mock('@/src/features/voice-audio/hooks/useVoiceAudioSettings', () => ({ useVoiceAudioSettings: () => ({ volume: 50, handleVolumeChange: jest.fn(), isLoading: false, isError: false, isSaving: false, refetch: mockRefresh }) }));
jest.mock('@/src/features/voice-audio/components/AudioCheck', () => ({ AudioCheck: () => null }));
jest.mock('expo-audio', () => ({ AudioModule: { getRecordingPermissionsAsync: jest.fn() } }));
jest.mock('@/src/features/profile/hooks/useProfileRefresh', () => ({ useProfileRefresh: (refresh: () => Promise<unknown>) => { jest.requireActual('react').useEffect(() => { void refresh(); }, [refresh]); } }));
jest.mock('expo-router', () => {
  const { View } = jest.requireActual('react-native');
  const Tabs = ({ children, tabBar }: { children: React.ReactNode; tabBar: (props: unknown) => React.ReactNode }) => <View>{children}{tabBar({ state: { routes: [{ name: 'voice-audio' }], index: 0 }, navigation: { navigate: jest.fn() } })}</View>;
  Tabs.Screen = function MockTabScreen({ name }: { name: string }) {
    const { VoiceAudioScreen } = jest.requireActual('@/src/features/voice-audio/VoiceAudioScreen');
    return name === 'voice-audio' ? <VoiceAudioScreen /> : null;
  };
  return { Tabs, useRouter: () => ({ canGoBack: () => true, back: jest.fn() }) };
});
const originalPlatform = Platform.OS;
beforeEach(() => {
  jest.clearAllMocks();
  mockInsets = { top: 0, bottom: 34, left: 0, right: 0 };
  (AudioModule.getRecordingPermissionsAsync as jest.Mock).mockResolvedValue({ granted: true, canAskAgain: true });
});
afterEach(() => { jest.restoreAllMocks(); Object.defineProperty(Platform, 'OS', { configurable: true, value: originalPlatform }); });

it.each([
  { platform: 'ios', safeBottom: 34, barHeight: 86 },
  { platform: 'android', safeBottom: 24, barHeight: 86 },
  { platform: 'android', safeBottom: 0, barHeight: 132 },
])('uses measured tab height on $platform (safe=$safeBottom, bar=$barHeight) and opens microphone settings', async ({ platform, safeBottom, barHeight }) => {
  Object.defineProperty(Platform, 'OS', { configurable: true, value: platform });
  mockInsets = { ...mockInsets, bottom: safeBottom };
  const open = jest.spyOn(Linking, 'openSettings').mockResolvedValue(undefined);
  const screen = render(<MainLayout />);
  await screen.findByText('마이크 사용이 허용되어 있어요.');
  const navbar = screen.UNSAFE_getByType(BottomNavbar);
  const layoutTarget = navbar.findAll((node: { props: { onLayout?: unknown } }) => typeof node.props.onLayout === 'function')[0];
  fireEvent(layoutTarget, 'layout', { nativeEvent: { layout: { height: barHeight, width: 360, x: 0, y: 0 } } });
  const scroll = screen.UNSAFE_getByType(ScrollView);
  await waitFor(() => expect(StyleSheet.flatten(scroll.props.contentContainerStyle).paddingBottom).toBe(safeBottom + barHeight + 8 + 16));
  fireEvent.press(screen.getByLabelText('마이크 설정 열기'));
  await waitFor(() => expect(open).toHaveBeenCalledTimes(1));
  // 회전/큰 글자 등으로 메뉴 높이나 안전 영역이 달라지면 같은 스크롤도 갱신한다.
  mockInsets = { ...mockInsets, bottom: 0 };
  screen.rerender(<MainLayout />);
  fireEvent(layoutTarget, 'layout', { nativeEvent: { layout: { height: barHeight + 24, width: 640, x: 0, y: 0 } } });
  await waitFor(() => expect(StyleSheet.flatten(scroll.props.contentContainerStyle).paddingBottom).toBe(barHeight + 24 + 8 + 16));
});

it('preserves larger caller padding and leaves screens outside main tabs unchanged', () => {
  const screen = render(<FloatingTabBarInsetContext.Provider value={100}><ScreenLayout paddingBottomOffset={180}><Text>끝</Text></ScreenLayout></FloatingTabBarInsetContext.Provider>);
  expect(StyleSheet.flatten(screen.UNSAFE_getByType(ScrollView).props.contentContainerStyle).paddingBottom).toBe(214);
  screen.unmount();
  const outside = render(<ScreenLayout paddingBottomOffset={0}><Text>끝</Text></ScreenLayout>);
  expect(StyleSheet.flatten(outside.UNSAFE_getByType(ScrollView).props.contentContainerStyle).paddingBottom).toBe(34);
});
