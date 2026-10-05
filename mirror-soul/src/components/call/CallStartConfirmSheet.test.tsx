import React from 'react';
import * as RN from 'react-native';
import { act, fireEvent, render, waitFor, within } from '@testing-library/react-native';
import CallStartConfirmSheet from './CallStartConfirmSheet';
import { BottomSheet } from '@/src/components/common/BottomSheet/BottomSheet';
import { useTimeStatusQuery } from '@/src/features/profile/hooks/useTimeStatusQuery';

let mockDimensions = { width: 393, height: 852, fontScale: 1, scale: 3 };
jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({ __esModule: true, default: () => mockDimensions }));
const mockRefetch = jest.fn();
let mockTime = { data: { remainingTalkTime: 120 }, isFetching: false, isError: false, refetch: mockRefetch };
jest.mock('@/src/features/profile/hooks/useTimeStatusQuery', () => ({ useTimeStatusQuery: jest.fn(() => mockTime) }));
jest.mock('@/src/hooks/useThemeColors', () => ({ useThemeColors: () => ({ colors: jest.requireActual('@/src/constants/theme').lightTheme }) }));
jest.mock('react-native-safe-area-context', () => ({ useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }) }));
jest.mock('@expo/vector-icons', () => ({ Feather: () => null }));
jest.mock('expo-linear-gradient', () => ({ LinearGradient: jest.requireActual('react-native').View }));
jest.mock('@/src/components/common/BottomSheet/BottomSheet', () => ({ BottomSheet: ({ children }: { children: React.ReactNode }) => children }));

const target = { userUuid: 'actual-user', name: '이름이 긴 사용자' };
const props = { target, isOpen: true, onClose: jest.fn(), onStart: jest.fn(), onRefill: jest.fn() };
beforeEach(() => {
  jest.clearAllMocks();
  mockRefetch.mockResolvedValue({ isSuccess: true });
  mockTime = { data: { remainingTalkTime: 120 }, isFetching: false, isError: false, refetch: mockRefetch };
  mockDimensions = { width: 393, height: 852, fontScale: 1, scale: 3 };
});
afterEach(() => jest.restoreAllMocks());

it('waits for a fresh balance and starts a real call only once', async () => {
  let finish!: (result: unknown) => void;
  mockRefetch.mockImplementation(() => new Promise(resolve => { finish = resolve; }));
  const screen = render(<CallStartConfirmSheet {...props} />);
  expect(screen.getByLabelText('통화 시작')).toBeDisabled();
  fireEvent.press(screen.getByLabelText('통화 시작'));
  expect(props.onStart).not.toHaveBeenCalled();
  await act(async () => finish({ isSuccess: true }));
  fireEvent.press(screen.getByLabelText('통화 시작'));
  fireEvent.press(screen.getByLabelText('통화 시작'));
  expect(props.onStart).toHaveBeenCalledTimes(1);
  expect(props.onStart).toHaveBeenCalledWith(target, false, 120);
});

it('keeps time-query failure retryable and cannot start from a stale cached balance', async () => {
  mockTime.isError = true;
  const screen = render(<CallStartConfirmSheet {...props} />);
  await waitFor(() => expect(screen.getByText('확인하지 못했어요')).toBeTruthy());
  expect(screen.getByLabelText('통화 시작')).toBeDisabled();
  fireEvent.press(screen.getByLabelText('남은 대화 시간 다시 확인'));
  expect(mockRefetch).toHaveBeenCalledTimes(2);
  expect(props.onStart).not.toHaveBeenCalled();
});

it('offers charging at zero seconds and prevents duplicate transitions', async () => {
  mockTime.data.remainingTalkTime = 0;
  const screen = render(<CallStartConfirmSheet {...props} />);
  await waitFor(() => expect(screen.getByLabelText('대화 시간 충전하기')).toBeEnabled());
  fireEvent.press(screen.getByLabelText('대화 시간 충전하기'));
  fireEvent.press(screen.getByLabelText('대화 시간 충전하기'));
  expect(props.onRefill).toHaveBeenCalledTimes(1);
  expect(props.onStart).not.toHaveBeenCalled();
});

it('keeps the preview free of balance requests', () => {
  const preview = { ...target, userUuid: 'mock-1' };
  const screen = render(<CallStartConfirmSheet {...props} target={preview} />);
  expect(useTimeStatusQuery).toHaveBeenCalledWith(false);
  expect(mockRefetch).not.toHaveBeenCalled();
  fireEvent.press(screen.getByLabelText('통화 화면 미리보기'));
  expect(props.onStart).toHaveBeenCalledWith(preview, true, undefined);
});

it('caps measured content at the available height and keeps normal-screen actions outside scrolling', () => {
  const screen = render(<CallStartConfirmSheet {...props} />);
  fireEvent(screen.getByTestId('call-start-scroll'), 'contentSizeChange', 361, 950);
  fireEvent(screen.getByTestId('call-start-actions'), 'layout', { nativeEvent: { layout: { height: 100 } } });
  expect(screen.UNSAFE_getByType(BottomSheet).props.height).toBe(852 - 44 - 12);
  expect(screen.UNSAFE_getByType(BottomSheet).props.dragFromHandleOnly).toBe(true);
  expect(within(screen.getByTestId('call-start-scroll')).queryByLabelText('통화 시작')).toBeNull();
  expect(RN.StyleSheet.flatten(screen.getByTestId('call-start-actions').props.style).paddingBottom).toBeGreaterThanOrEqual(34);
});

it.each([
  { width: 740, height: 320, fontScale: 1 },
  { width: 320, height: 568, fontScale: 2 },
])('keeps one scroll-reachable action and a close button on a constrained screen: %j', dimensions => {
  mockDimensions = { ...dimensions, scale: 3 };
  const screen = render(<CallStartConfirmSheet {...props} />);
  fireEvent(screen.getByTestId('call-start-scroll'), 'contentSizeChange', dimensions.width, 1000);
  expect(screen.getAllByLabelText('통화 시작')).toHaveLength(1);
  expect(within(screen.getByTestId('call-start-scroll')).getByLabelText('통화 시작')).toBeTruthy();
  expect(screen.UNSAFE_getByType(BottomSheet).props.height).toBeLessThanOrEqual(dimensions.height - 44 - 12);
  fireEvent.press(screen.getByLabelText('통화 확인 닫기'));
  expect(props.onClose).toHaveBeenCalledTimes(1);
});
