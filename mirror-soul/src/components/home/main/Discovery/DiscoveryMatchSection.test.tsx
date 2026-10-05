import React from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import DiscoveryMatchSection from './DiscoveryMatchSection';
import { MOCK_RECOMMENDATIONS } from './mockRecommendations';

const mockSwipe = jest.fn();
const mockFetchNextPage = jest.fn();
const mockRefetch = jest.fn();
const mockCooldown = jest.fn();
let mockQuery: Record<string, unknown>;
let mockCardCallbacks: { onPass: () => void };
jest.mock('@/src/features/home/hooks/useRecommendationsQuery', () => ({
  useRecommendationsQuery: () => mockQuery,
}));
jest.mock('@/src/features/home/hooks/useSwipeMutation', () => ({
  useSwipeMutation: () => ({ mutate: mockSwipe }),
}));
jest.mock('./useRefreshCooldown', () => ({
  useRefreshCooldown: () => ({
    isInCooldown: false,
    startCooldown: mockCooldown,
  }),
}));
jest.mock('@/src/hooks/useThemeColors', () => ({
  useThemeColors: () => ({
    colors: jest.requireActual('@/src/constants/theme').lightTheme,
  }),
}));
jest.mock('@expo/vector-icons', () => ({ Feather: () => null }));
jest.mock('./DiscoveryStackPeek', () => () => null);
jest.mock('./DiscoveryMatchCard', () => ({
  __esModule: true,
  SWIPE_DISTANCE_RATIO: 0.3,
  default: ({
    match,
    onPass,
  }: {
    match: { name: string };
    onPass: () => void;
  }) => {
    mockCardCallbacks = { onPass };
    const { Text } = jest.requireActual('react-native');
    return <Text>{match.name}</Text>;
  },
}));
const actual = MOCK_RECOMMENDATIONS.slice(0, 2).map((item, index) => ({
  ...item,
  userUuid: `actual-${index}`,
}));
beforeEach(() => {
  jest.clearAllMocks();
  mockRefetch.mockResolvedValue({ isSuccess: true });
  mockQuery = {
    recommendations: actual,
    isLoading: false,
    isFetching: false,
    isError: false,
    hasNextPage: false,
    isFetchingNextPage: false,
    isFetchNextPageError: false,
    fetchNextPage: mockFetchNextPage,
    refetch: mockRefetch,
  };
});

it('shows the real empty API result and requires explicit opt-in for development examples', () => {
  mockQuery.recommendations = [];
  const screen = render(<DiscoveryMatchSection />);
  expect(screen.getByText('추천할 상대가 아직 없어요')).toBeTruthy();
  expect(screen.queryByText(MOCK_RECOMMENDATIONS[0].name)).toBeNull();
  fireEvent.press(screen.getByLabelText('개발용 디자인 예시 보기'));
  expect(screen.getByText(MOCK_RECOMMENDATIONS[0].name)).toBeTruthy();
  fireEvent.press(screen.getByLabelText('다음 프로필'));
  expect(mockSwipe).not.toHaveBeenCalled();
});

it('records PASS on next and does not undo server history on previous', () => {
  const screen = render(<DiscoveryMatchSection />);
  expect(screen.getByText(actual[0].name)).toBeTruthy();
  expect(screen.queryByText(/분석 중|매칭 확률/)).toBeNull();
  expect(screen.getByLabelText('이전 프로필')).toBeDisabled();
  fireEvent.press(screen.getByLabelText('다음 프로필'));
  expect(mockSwipe).toHaveBeenCalledWith(actual[0].userUuid);
  expect(screen.getByText(actual[1].name)).toBeTruthy();
  fireEvent.press(screen.getByLabelText('이전 프로필'));
  expect(screen.getByText(actual[0].name)).toBeTruthy();
  expect(mockSwipe).toHaveBeenCalledTimes(1);
});

it('keeps accessible navigation without swipe instructions or ordinal labels', () => {
  const screen = render(<DiscoveryMatchSection />);
  expect(screen.queryByText('밀어서 둘러보기')).toBeNull();
  expect(screen.queryByText(/번째/)).toBeNull();
  expect(screen.queryByText('이전')).toBeNull();
  expect(screen.queryByText('다음')).toBeNull();
  expect(screen.getByLabelText('이전 프로필')).toBeDisabled();
  act(() => mockCardCallbacks.onPass());
  expect(screen.getByText(actual[1].name)).toBeTruthy();
  expect(screen.getByLabelText('이전 프로필')).toBeEnabled();
  fireEvent.press(screen.getByLabelText('이전 프로필'));
  expect(screen.getByText(actual[0].name)).toBeTruthy();
  expect(mockSwipe).toHaveBeenCalledTimes(1);
});

it('locks concurrent refreshes and keeps the selected profile after a failed refresh', async () => {
  let finish!: (value: unknown) => void;
  mockRefetch.mockImplementation(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  const screen = render(<DiscoveryMatchSection />);
  fireEvent.press(screen.getByLabelText('다음 프로필'));
  fireEvent.press(screen.getByLabelText('추천 목록 새로고침'));
  fireEvent.press(screen.getByLabelText('추천 목록 새로고침'));
  expect(mockRefetch).toHaveBeenCalledTimes(1);
  await act(async () => {
    finish({ isSuccess: false });
  });
  expect(screen.getByText(actual[1].name)).toBeTruthy();
});

it('ignores a delayed swipe callback after the next button has already changed the profile', () => {
  const screen = render(<DiscoveryMatchSection />);
  const previousCardSwipe = mockCardCallbacks.onPass;
  fireEvent.press(screen.getByLabelText('다음 프로필'));
  act(() => previousCardSwipe());
  expect(screen.getByText(actual[1].name)).toBeTruthy();
  expect(mockSwipe).toHaveBeenCalledTimes(1);
});

it('does not loop prefetch after a failure and offers retry for the failed next page', async () => {
  mockQuery.hasNextPage = true;
  mockQuery.isFetchNextPageError = true;
  const screen = render(<DiscoveryMatchSection />);
  expect(mockFetchNextPage).not.toHaveBeenCalled();
  fireEvent.press(screen.getByLabelText('다음 프로필'));
  fireEvent.press(screen.getByLabelText('다음 프로필'));
  expect(screen.getByText('다음 프로필을 불러오지 못했어요')).toBeTruthy();
  fireEvent.press(screen.getByLabelText('다음 프로필 다시 불러오기'));
  await waitFor(() => expect(mockFetchNextPage).toHaveBeenCalledTimes(1));
});
