import React from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FlatList } from 'react-native';
import { useProfileRefresh } from '@/src/features/profile/hooks/useProfileRefresh';
import MatchScreen from './MatchScreen';
import {
  getReceivedMeetingRequests,
  acceptMeetingRequest,
  rejectMeetingRequest,
} from '@/src/services/meetingService';
import { getChatRooms } from '@/src/services/chatService';
import { getMatchingStatus } from '@/src/services/matchService';
import { getMyTime } from '@/src/services/profileService';
import { matchQueryKeys } from './hooks/matchQueryKeys';

let mockSession = { userUuid: 'me', isLoggedIn: true };
const mockPush = jest.fn();
const mockNavigate = jest.fn();
const mockToast = jest.fn();
let mockParams: {
  receivedRequestId?: string;
  receivedRequestReturnToken?: string;
} = {};
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, navigate: mockNavigate }),
  useLocalSearchParams: () => mockParams,
}));
jest.mock('@/src/store/useAuthStore', () => ({
  useAuthStore: Object.assign(
    (selector: (s: typeof mockSession) => unknown) => selector(mockSession),
    { getState: () => mockSession },
  ),
}));
jest.mock('@/src/components/common/Toast/ToastProvider', () => ({
  useToast: () => ({ showToast: mockToast }),
}));
jest.mock('@/src/hooks/useThemeColors', () => ({
  useThemeColors: () => ({
    colors: jest.requireActual('@/src/constants/theme').lightTheme,
  }),
}));
jest.mock('@/src/features/profile/hooks/useProfileRefresh', () => ({
  useProfileRefresh: jest.fn(),
}));
jest.mock('@/src/services/meetingService', () => ({
  getReceivedMeetingRequests: jest.fn(),
  acceptMeetingRequest: jest.fn(),
  rejectMeetingRequest: jest.fn(),
}));
jest.mock('@/src/services/chatService', () => ({ getChatRooms: jest.fn() }));
jest.mock('@/src/services/matchService', () => ({
  getMatchingStatus: jest.fn(),
  updateMatchingStatus: jest.fn(),
}));
jest.mock('@/src/services/profileService', () => ({ getMyTime: jest.fn() }));
jest.mock('@expo/vector-icons', () => ({ Feather: () => null }));
jest.mock('expo-image', () => ({
  Image: jest.requireActual('react-native').View,
}));
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: jest.requireActual('react-native').View,
  useSafeAreaInsets: () => ({ top: 24, bottom: 34, left: 0, right: 0 }),
}));
const requests = [1, 2].map((id) => ({
  requestId: id,
  senderUserUuid: `sender-${id}`,
  name: id === 1 ? '수연' : '지민',
  age: 28,
  profileImageUrl: null,
  lastActiveAt: null,
  twinSimilarity: null,
  message: `첫 메시지 ${id}`,
  conversationSummary: null,
  summaryPoints: [],
  requestedAt: new Date().toISOString(),
}));
const rooms = [
  {
    chatRoomId: 10,
    partner: {
      userUuid: 'sender-1',
      name: '수연',
      profileImageUrl: null,
      age: 28,
      twinSimilarity: null,
      lastActiveAt: null,
    },
    lastMessage: { content: '반가워요', createdAt: new Date().toISOString() },
    unreadCount: 2,
    notificationEnabled: true,
  },
  {
    chatRoomId: 11,
    partner: {
      userUuid: 'sender-2',
      name: '지민',
      profileImageUrl: null,
      age: 27,
      twinSimilarity: null,
      lastActiveAt: null,
    },
    lastMessage: null,
    unreadCount: 0,
    notificationEnabled: false,
  },
];
let client: QueryClient;
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={client}>{children}</QueryClientProvider>
);
beforeEach(() => {
  jest.clearAllMocks();
  mockSession = { userUuid: 'me', isLoggedIn: true };
  mockParams = {};
  client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  });
  (getReceivedMeetingRequests as jest.Mock).mockResolvedValue({
    result: { totalCount: 2, requests },
  });
  (getMatchingStatus as jest.Mock).mockResolvedValue({
    result: { matchingEnabled: true },
  });
  (getChatRooms as jest.Mock).mockResolvedValue({
    result: { totalCount: 2, rooms },
  });
  (acceptMeetingRequest as jest.Mock).mockResolvedValue({
    result: { requestId: 2, chatRoomId: 42 },
  });
  (rejectMeetingRequest as jest.Mock).mockResolvedValue({
    result: { requestId: 1 },
  });
  (getMyTime as jest.Mock).mockResolvedValue({
    result: { remainingTalkTime: 90 },
  });
});
afterEach(() => client.clear());

it('refreshes on focus without pulling the whole list down through the native refresh control', async () => {
  const screen = render(<MatchScreen />, { wrapper });
  await screen.findByText('첫 메시지 1');
  let finish!: (response: unknown) => void;
  (getReceivedMeetingRequests as jest.Mock).mockImplementationOnce(() => new Promise(resolve => { finish = resolve; }));
  let background!: Promise<unknown>;
  act(() => { background = jest.mocked(useProfileRefresh).mock.calls.at(-1)![0](); });
  await waitFor(() => expect(screen.getByLabelText('매칭 목록 새로고침').props.accessibilityState.busy).toBe(true));
  expect(screen.UNSAFE_getByType(FlatList).props.refreshing).toBe(false);
  await act(async () => { finish({ result: { totalCount: 2, requests } }); await background; });
});

it('keeps manual pull-to-refresh functional, blocks repeated pulls and clears its indicator', async () => {
  const screen = render(<MatchScreen />, { wrapper });
  await screen.findByText('첫 메시지 1');
  let finish!: (response: unknown) => void;
  (getReceivedMeetingRequests as jest.Mock).mockImplementationOnce(() => new Promise(resolve => { finish = resolve; }));
  const before = jest.mocked(getReceivedMeetingRequests).mock.calls.length;
  fireEvent(screen.UNSAFE_getByType(FlatList), 'refresh');
  fireEvent(screen.UNSAFE_getByType(FlatList), 'refresh');
  expect(screen.UNSAFE_getByType(FlatList).props.refreshing).toBe(true);
  await waitFor(() => expect(getReceivedMeetingRequests).toHaveBeenCalledTimes(before + 1));
  await act(async () => { finish({ result: { totalCount: 2, requests } }); });
  await waitFor(() => expect(screen.UNSAFE_getByType(FlatList).props.refreshing).toBe(false));
});

it('accepts the exact request row once and navigates even if the chat list refresh fails', async () => {
  let finish!: (response: unknown) => void;
  (acceptMeetingRequest as jest.Mock).mockImplementation(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  const screen = render(<MatchScreen />, { wrapper });
  await screen.findByText('첫 메시지 2');
  (getChatRooms as jest.Mock).mockRejectedValue(new Error('rooms unavailable'));
  fireEvent.press(screen.getAllByLabelText('수락하고 대화하기')[1]);
  fireEvent.press(screen.getAllByLabelText('수락하고 대화하기')[1]);
  await waitFor(() => expect(acceptMeetingRequest).toHaveBeenCalledWith(2));
  expect(acceptMeetingRequest).toHaveBeenCalledTimes(1);
  await act(async () => finish({ result: { requestId: 2, chatRoomId: 42 } }));
  await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/chat/42'));
  expect(client.getQueryData(matchQueryKeys.requests('me'))).toHaveProperty(
    'totalCount',
    1,
  );
});

it('requires confirmation before rejection and retains the request for retry after failure', async () => {
  (rejectMeetingRequest as jest.Mock)
    .mockRejectedValueOnce({ code: 'NETWORK_ERROR' })
    .mockResolvedValue({ result: { requestId: 1 } });
  const screen = render(<MatchScreen />, { wrapper });
  fireEvent.press(await screen.findByLabelText('수연님의 신청 자세히 보기'));
  expect(screen.queryByText('AI가 정리한 대화')).toBeNull();
  fireEvent.press(screen.getByLabelText('이 신청 거절'));
  expect(rejectMeetingRequest).not.toHaveBeenCalled();
  fireEvent.press(screen.getByLabelText('계속 살펴보기'));
  expect(rejectMeetingRequest).not.toHaveBeenCalled();
  fireEvent.press(screen.getByLabelText('이 신청 거절'));
  fireEvent.press(screen.getByLabelText('신청 거절하기'));
  await screen.findByText('네트워크 연결을 확인해주세요.');
  fireEvent.press(screen.getByLabelText('신청 거절하기'));
  await waitFor(() =>
    expect(mockToast).toHaveBeenCalledWith('신청을 거절했어요.', 'info'),
  );
});

it('filters unread conversations without losing the full conversation list', async () => {
  const screen = render(<MatchScreen />, { wrapper });
  fireEvent.press(
    await screen.findByRole('tab', { name: '메시지, 읽지 않은 메시지 2개' }),
  );
  expect(screen.getByText('첫 메시지를 보내보세요')).toBeTruthy();
  fireEvent.press(screen.getByLabelText('안 읽음 1'));
  expect(screen.queryByText('첫 메시지를 보내보세요')).toBeNull();
  fireEvent.press(screen.getByLabelText('전체 대화'));
  expect(screen.getByText('첫 메시지를 보내보세요')).toBeTruthy();
});

it('checks remaining time and carries the received request back through the optional twin call', async () => {
  const screen = render(<MatchScreen />, { wrapper });
  fireEvent.press(await screen.findByLabelText('지민님의 신청 자세히 보기'));
  fireEvent.press(screen.getByLabelText('상대 트윈과 먼저 통화하기'));
  await waitFor(() =>
    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/ai-call',
      params: {
        targetUuid: 'sender-2',
        targetName: '지민',
        remainingSeconds: '90',
        receivedRequestId: '2',
      },
    }),
  );
  expect(acceptMeetingRequest).not.toHaveBeenCalled();
});

it('does not start a call without time and keeps the request detail actionable', async () => {
  (getMyTime as jest.Mock).mockResolvedValue({
    result: { remainingTalkTime: 0 },
  });
  const screen = render(<MatchScreen />, { wrapper });
  fireEvent.press(await screen.findByLabelText('수연님의 신청 자세히 보기'));
  fireEvent.press(screen.getByLabelText('상대 트윈과 먼저 통화하기'));
  await screen.findByText(
    '통화할 대화 시간이 없어요. 프로필에서 남은 시간을 확인하고 충전해 주세요.',
  );
  expect(mockPush).not.toHaveBeenCalled();
  expect(screen.getAllByLabelText('수락하고 대화하기').at(-1)).toBeEnabled();
});

it('reopens a received request when returning from its twin call', async () => {
  mockParams = { receivedRequestId: '2', receivedRequestReturnToken: '101' };
  const screen = render(<MatchScreen />, { wrapper });
  await screen.findByText('받은 만남 신청');
  fireEvent.press(screen.getAllByLabelText('신청 상세 닫기')[0]);
  expect(screen.queryByText('받은 만남 신청')).toBeNull();
  screen.rerender(<MatchScreen />);
  expect(screen.queryByText('받은 만남 신청')).toBeNull();
  mockParams = { receivedRequestId: '2', receivedRequestReturnToken: '102' };
  screen.rerender(<MatchScreen />);
  await screen.findByText('받은 만남 신청');
});

it('shows a real read failure and retries instead of reporting an empty inbox', async () => {
  (getReceivedMeetingRequests as jest.Mock)
    .mockRejectedValueOnce(new Error('offline'))
    .mockResolvedValue({ result: { totalCount: 0, requests: [] } });
  const screen = render(<MatchScreen />, { wrapper });
  await screen.findByText('목록을 불러오지 못했어요');
  expect(screen.queryByText('아직 받은 신청이 없어요')).toBeNull();
  fireEvent.press(screen.getByLabelText('다시 불러오기'));
  fireEvent.press(await screen.findByLabelText('상대 둘러보기'));
  expect(mockNavigate).toHaveBeenCalledWith('/(main)');
});
