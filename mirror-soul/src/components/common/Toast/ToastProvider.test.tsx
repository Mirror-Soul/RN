import React, { useState } from 'react';
import { act, fireEvent, render, within } from '@testing-library/react-native';
import { AccessibilityInfo, Pressable, Text, View } from 'react-native';
import { ToastProvider, useToast, showGlobalToast } from './ToastProvider';
import { ToastViewport } from './ToastViewport';
import { noticeDuration } from './noticePresentation';

jest.mock('@expo/vector-icons', () => ({ Feather: () => null }));
jest.mock('expo-font', () => ({ isLoaded: () => false }));
jest.mock('react-native-safe-area-context', () => ({ useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }) }));
jest.mock('@/src/hooks/useThemeColors', () => ({ useThemeColors: () => ({ colors: jest.requireActual('@/src/constants/theme').lightTheme, isDark: false }) }));
let mockDimensions = { width: 320, height: 568, fontScale: 1, scale: 3 };
jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({ __esModule: true, default: () => mockDimensions }));

const longMessage = '현재 위치를 확인하지 못했어요. 지도나 검색으로 동네를 선택하고 네트워크와 위치 접근 권한을 확인한 뒤 다시 시도해주세요.\n입력한 내용은 그대로 유지돼요.';
function Actions() {
  const { showToast } = useToast();
  const [open, setOpen] = useState(false);
  return <>
    <Pressable testID="saved" onPress={() => showToast('탐색 지역을 저장했어요.', 'success')}><Text>저장</Text></Pressable>
    <Pressable testID="failed" onPress={() => showToast(longMessage, 'error')}><Text>오류</Text></Pressable>
    <Pressable testID="open" onPress={() => setOpen(true)}><Text>창 열기</Text></Pressable>
    <Pressable testID="close-modal" onPress={() => setOpen(false)}><Text>창 닫기</Text></Pressable>
    {open && <View testID="modal"><ToastViewport /></View>}
  </>;
}
const setup = () => render(<ToastProvider><Actions /></ToastProvider>);
beforeEach(() => {
  jest.useFakeTimers();
  mockDimensions = { width: 320, height: 568, fontScale: 1, scale: 3 };
  jest.spyOn(AccessibilityInfo, 'isScreenReaderEnabled').mockResolvedValue(false);
});
afterEach(() => { jest.useRealTimers(); jest.restoreAllMocks(); });

it('replaces repeated notices in the same clock tick without overlapping outgoing text', async () => {
  const screen = setup();
  await act(async () => {});
  fireEvent.press(screen.getByTestId('saved'));
  fireEvent.press(screen.getByTestId('failed'));
  expect(screen.queryByText('탐색 지역을 저장했어요.')).toBeNull();
  expect(screen.getAllByRole('alert')).toHaveLength(1);
  expect(screen.getByText(longMessage).props.numberOfLines).toBeUndefined();
  fireEvent.press(screen.getByLabelText('알림 닫기'));
  expect(screen.queryByRole('alert')).toBeNull();
});

it('allows the latest notice its own reading time instead of dismissing it with the old timer', async () => {
  const screen = setup();
  await act(async () => {});
  fireEvent.press(screen.getByTestId('saved'));
  act(() => { jest.advanceTimersByTime(3000); });
  fireEvent.press(screen.getByTestId('failed'));
  act(() => { jest.advanceTimersByTime(1500); });
  expect(screen.getByText(longMessage)).toBeTruthy();
  act(() => { jest.advanceTimersByTime(13000); });
  expect(screen.queryByRole('alert')).toBeNull();
});

it('keeps a message available when the user touches it to read or scroll', async () => {
  const screen = setup();
  await act(async () => {});
  fireEvent.press(screen.getByTestId('failed'));
  fireEvent(screen.getByTestId('notice-card'), 'touchStart');
  act(() => { jest.advanceTimersByTime(20000); });
  expect(screen.getByText(longMessage)).toBeTruthy();
});

it('renders a notice inside the foreground modal and hands it back after that modal closes', async () => {
  const screen = setup();
  await act(async () => {});
  fireEvent.press(screen.getByTestId('open'));
  fireEvent.press(screen.getByTestId('failed'));
  expect(within(screen.getByTestId('modal')).getByText(longMessage)).toBeTruthy();
  expect(within(screen.getByTestId('toast-root-viewport')).queryByRole('alert')).toBeNull();
  fireEvent.press(screen.getByTestId('close-modal'));
  await act(async () => { jest.runAllTicks(); });
  expect(within(screen.getByTestId('toast-root-viewport')).getByText(longMessage)).toBeTruthy();
  expect(screen.getAllByRole('alert')).toHaveLength(1);
});

it('does not time out a screen-reader announcement before the user can dismiss it', async () => {
  jest.mocked(AccessibilityInfo.isScreenReaderEnabled).mockResolvedValue(true);
  const screen = setup();
  await act(async () => {});
  act(() => showGlobalToast('세션이 만료되어 다시 로그인해주세요.', 'info'));
  act(() => { jest.advanceTimersByTime(20000); });
  expect(screen.getByRole('alert')).toBeTruthy();
  fireEvent.press(screen.getByLabelText('알림 닫기'));
  expect(screen.queryByRole('alert')).toBeNull();
});

it.each([[240, 568, 2], [740, 360, 2], [1024, 1366, 1.5]])('keeps the complete message and dismissal at %sx%s, font scale %s', async (width, height, fontScale) => {
  mockDimensions = { width, height, fontScale, scale: 3 };
  const screen = setup();
  await act(async () => {});
  fireEvent.press(screen.getByTestId('failed'));
  expect(screen.getByText(longMessage).props.numberOfLines).toBeUndefined();
  expect(screen.getByLabelText('알림 닫기')).toBeTruthy();
});

it('extends longer errors and large text without an unlimited automatic timer', () => {
  expect(noticeDuration(longMessage, 'error', 2)).toBeGreaterThan(noticeDuration('저장했어요.', 'success', 1));
  expect(noticeDuration(longMessage.repeat(20), 'error', 4)).toBe(12000);
});
