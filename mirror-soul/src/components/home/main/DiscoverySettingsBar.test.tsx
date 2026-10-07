import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import DiscoverySettingsBar from './DiscoverySettingsBar';

let mockTime: { remainingTalkTime: number } | undefined;
let mockLoading = false;
let mockError = false;
let mockDimensions = { width: 393, height: 852, fontScale: 1, scale: 3 };
const mockRefetch = jest.fn();
jest.mock('@/src/features/profile/hooks/useTimeStatusQuery', () => ({ useTimeStatusQuery: () => ({ data: mockTime, isLoading: mockLoading, isError: mockError, refetch: mockRefetch }) }));
jest.mock('@/src/hooks/useThemeColors', () => ({ useThemeColors: () => ({ colors: jest.requireActual('@/src/constants/theme').lightTheme }) }));
jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({ __esModule: true, default: () => mockDimensions }));
jest.mock('react-native-safe-area-context', () => ({ useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }) }));
jest.mock('@expo/vector-icons', () => ({ Feather: () => null }));

const props = { regionName: '성수동', nearbyCount: 10, isRegionLoading: false, isRegionError: false, onRefillPress: jest.fn(), onRegionPress: jest.fn(), onRegionRetry: jest.fn() };
beforeEach(() => {
  jest.clearAllMocks(); mockTime = { remainingTalkTime: 5025 }; mockLoading = false; mockError = false;
  mockDimensions = { width: 393, height: 852, fontScale: 1, scale: 3 };
});

it('keeps two separate actions in one horizontal bar and preserves the selected area scope', () => {
  const screen = render(<DiscoverySettingsBar {...props} />);
  expect(screen.getByText('01:23:45')).toBeTruthy();
  expect(screen.getByText('성수동')).toBeTruthy();
  expect(StyleSheet.flatten(screen.getByTestId('discovery-settings-bar').props.style).flexDirection).toBe('row');
  fireEvent.press(screen.getByRole('button', { name: /남은 대화 시간 1시간 23분 45초/ }));
  expect(props.onRefillPress).toHaveBeenCalledTimes(1);
  expect(props.onRegionPress).not.toHaveBeenCalled();
  fireEvent.press(screen.getByLabelText('탐색 지역 성수동 외 9개 동, 지역 설정'));
  expect(props.onRegionPress).toHaveBeenCalledTimes(1);
});

it('retries a failed balance query instead of opening a refill', () => {
  mockError = true;
  const screen = render(<DiscoverySettingsBar {...props} />);
  fireEvent.press(screen.getByLabelText('남은 시간 다시 조회'));
  expect(mockRefetch).toHaveBeenCalledTimes(1);
  expect(props.onRefillPress).not.toHaveBeenCalled();
  expect(screen.queryByText('01:23:45')).toBeNull();
});

it('retries only the failed region query and leaves refill accessible', () => {
  const screen = render(<DiscoverySettingsBar {...props} isRegionError />);
  fireEvent.press(screen.getByLabelText('탐색 지역 다시 조회'));
  expect(props.onRegionRetry).toHaveBeenCalledTimes(1);
  expect(props.onRegionPress).not.toHaveBeenCalled();
  fireEvent.press(screen.getByRole('button', { name: /남은 대화 시간/ }));
  expect(props.onRefillPress).toHaveBeenCalledTimes(1);
});

it('does not show unknown time or region data as zero or all regions', () => {
  mockLoading = true; mockTime = undefined;
  const screen = render(<DiscoverySettingsBar {...props} regionName={undefined} isRegionLoading />);
  expect(screen.getByText('--:--:--')).toBeTruthy();
  expect(screen.queryByText('00:00:00')).toBeNull();
  expect(screen.queryByText('전체 지역')).toBeNull();
  expect(screen.getByLabelText('탐색 지역 확인 중')).toBeDisabled();
});

it('shows the actual zero balance and unset region without a false loading state', () => {
  mockTime = { remainingTalkTime: 0 };
  const screen = render(<DiscoverySettingsBar {...props} regionName={null} nearbyCount={undefined} />);
  expect(screen.getByText('00:00:00')).toBeTruthy();
  expect(screen.getByText('전체 지역')).toBeTruthy();
});

it.each([
  { width: 320, height: 568, fontScale: 1, scale: 2 },
  { width: 393, height: 852, fontScale: 2, scale: 3 },
])('reflows into two rows without removing either action: %j', dimensions => {
  mockDimensions = dimensions;
  const screen = render(<DiscoverySettingsBar {...props} />);
  expect(StyleSheet.flatten(screen.getByTestId('discovery-settings-bar').props.style).flexDirection).toBe('column');
  expect(screen.getAllByRole('button')).toHaveLength(2);
  expect(screen.getByText('성수동')).toBeTruthy();
});

it('responds to the actual parent width and retains the full long region name for accessibility', () => {
  const name = '아주긴탐색지역이름';
  const screen = render(<DiscoverySettingsBar {...props} regionName={name} />);
  fireEvent(screen.getByTestId('discovery-settings-bar'), 'layout', { nativeEvent: { layout: { width: 260 } } });
  expect(StyleSheet.flatten(screen.getByTestId('discovery-settings-bar').props.style).flexDirection).toBe('column');
  expect(screen.getByLabelText(`탐색 지역 ${name} 외 9개 동, 지역 설정`)).toBeTruthy();
});


it.each([1, 10, 30, 50])('shows an explicit %i-neighborhood scope instead of an identical nearby label', count => {
  const screen = render(<DiscoverySettingsBar {...props} nearbyCount={count} />);
  expect(screen.getByText(`${count}개 동`)).toBeTruthy();
  expect(screen.queryByText('성수동 주변')).toBeNull();
});

it('assigns the same flexible width to time and region instead of shrinking time to content', () => {
  const screen = render(<DiscoverySettingsBar {...props} />);
  const time = screen.getByRole('button', { name: /남은 대화 시간/ });
  const region = screen.getByLabelText('탐색 지역 성수동 외 9개 동, 지역 설정');
  expect(StyleSheet.flatten(time.props.style).flex).toBe(1);
  expect(StyleSheet.flatten(region.props.style).flex).toBe(1);
});
