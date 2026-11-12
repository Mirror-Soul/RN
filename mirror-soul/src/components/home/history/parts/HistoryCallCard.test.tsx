import React from 'react';
import { render } from '@testing-library/react-native';
import HistoryCallCard from './HistoryCallCard';
import type { CallHistoryResult } from '@/src/types/api/history';

const me = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
let mockUserUuid: string | null = me;
jest.mock('@/src/store/useAuthStore', () => ({ useAuthStore: (selector: (state: { userUuid: string | null }) => unknown) => selector({ userUuid: mockUserUuid }) }));
jest.mock('@/src/hooks/useThemeColors', () => ({ useThemeColors: () => ({ colors: jest.requireActual('@/src/constants/theme').lightTheme }) }));
jest.mock('@expo/vector-icons', () => ({ Feather: () => null }));
jest.mock('@/src/features/profile/photo/useRetryableProfileImage', () => ({
  useRetryableProfileImage: () => ({ failed: false, imageKey: 0, onError: jest.fn(), retry: jest.fn(), isReloading: false }),
}));
jest.mock('react-native-reanimated', () => {
  const chain = { delay: () => chain, duration: () => chain, springify: () => chain };
  return { __esModule: true, default: { View: jest.requireActual('react-native').View }, FadeInDown: chain };
});

const call = (changes: Partial<CallHistoryResult> = {}): CallHistoryResult => ({
  callId: 1, type: 'SENT', description: '내가 시작한 통화', mediaType: 'VIDEO', durationSec: 95,
  matchTarget: 'PARTNER_TWIN', matchScore: null, topics: [], startedAt: '2026-10-05T14:30:00', isNew: false,
  partner: { userUuid: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', name: '지수', age: 26, profileImageUrl: null, twinSyncRate: 85 },
  ...changes,
});

beforeEach(() => { mockUserUuid = me; });

it('does not show a permanent analysis spinner while no analysis result exists', () => {
  const screen = render(<HistoryCallCard data={call({ matchScore: null, topics: [] })} />);
  expect(screen.getByText(/지수/)).toBeTruthy();
  expect(screen.queryByText(/분석/)).toBeNull();
});

it('shows topic chips when the backend provides analysis topics', () => {
  const screen = render(<HistoryCallCard data={call({ matchScore: 80, topics: ['음악 취향', '여행 가치관'] })} />);
  expect(screen.getByText('음악 취향')).toBeTruthy();
  expect(screen.getByText('여행 가치관')).toBeTruthy();
});

it('presents a call with the user’s own clone as “내 AI 트윈” instead of their own name and age', () => {
  const screen = render(<HistoryCallCard data={call({ partner: { userUuid: me, name: '홍길동', age: 28, profileImageUrl: null, twinSyncRate: 91 } })} />);
  expect(screen.getByText(/내 AI 트윈/)).toBeTruthy();
  expect(screen.queryByText(/홍길동/)).toBeNull();
  expect(screen.queryByText(/28/)).toBeNull();
  expect(screen.getByLabelText(/^내 AI 트윈, 내가 건 통화/)).toBeTruthy();
});

it('keeps the partner’s name for calls with other people', () => {
  const screen = render(<HistoryCallCard data={call()} />);
  expect(screen.getByLabelText(/^지수, 26세, 내가 건 통화/)).toBeTruthy();
});
