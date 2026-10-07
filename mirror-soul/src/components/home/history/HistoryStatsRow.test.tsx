import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import HistoryStatsRow from './HistoryStatsRow';
import type { WeeklySummaryResult } from '@/src/types/api/history';

let mockData: WeeklySummaryResult | undefined;
let mockLoading = false;
let mockError = false;
const mockRefetch = jest.fn();
jest.mock('@/src/features/history/hooks/useWeeklySummaryQuery', () => ({ useWeeklySummaryQuery: () => ({ data: mockData, isLoading: mockLoading, isError: mockError, refetch: mockRefetch }) }));
jest.mock('@/src/hooks/useThemeColors', () => ({ useThemeColors: () => ({ colors: jest.requireActual('@/src/constants/theme').lightTheme }) }));
jest.mock('@expo/vector-icons', () => ({ Feather: () => null }));

beforeEach(() => {
  mockLoading = false; mockError = false; mockRefetch.mockClear();
  mockData = { period: { startedAt: '', endedAt: '', nextResetAt: '' }, totalTalkTimeSec: 0, receivedCallCount: 2, sentCallCount: 3, changeRate: null, comparable: false, trend: 'NO_DATA' };
});

it.each([
  [0, '0시간 0분 0초'],
  [59, '0시간 0분 59초'],
  [3599, '0시간 59분 59초'],
  [3600, '1시간 0분 0초'],
  [3661, '1시간 1분 1초'],
  [90061, '25시간 1분 1초'],
])('preserves API second precision and hours beyond one day: %i', (total, label) => {
  mockData!.totalTalkTimeSec = total as number;
  const screen = render(<HistoryStatsRow />);
  expect(screen.getByLabelText(`누적 대화 시간 ${label}`)).toBeTruthy();
  expect(screen.getByText('02')).toBeTruthy();
  expect(screen.getByText('03')).toBeTruthy();
});

it('keeps unavailable data distinct from a genuine zero duration', () => {
  mockData = undefined; mockLoading = true;
  const screen = render(<HistoryStatsRow />);
  expect(screen.getByLabelText('누적 대화 시간 확인 중')).toBeTruthy();
  expect(screen.queryByLabelText('누적 대화 시간 0시간 0분 0초')).toBeNull();
});

it('shows hours, minutes and seconds in one text line with one shared number style', () => {
  mockData!.totalTalkTimeSec = 5025;
  const screen = render(<HistoryStatsRow />);
  const duration = screen.getByText('1시간 23분 45초');
  expect(duration.props.numberOfLines).toBe(1);
  expect(duration.props.adjustsFontSizeToFit).toBe(true);
});

it('preserves the existing retry action when the API fails', () => {
  mockError = true;
  const screen = render(<HistoryStatsRow />);
  fireEvent.press(screen.getByLabelText('주간 통계 다시 조회'));
  expect(mockRefetch).toHaveBeenCalledTimes(1);
  expect(screen.queryByLabelText('누적 대화 시간 0시간 0분 0초')).toBeNull();
});
