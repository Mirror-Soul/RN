import React from 'react';
import { Alert, BackHandler, Linking, Modal } from 'react-native';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import CallDetailScreen from '../../../app/call-detail';
import type { TalkLogListResult } from '@/src/types/api/history';

const mockPush = jest.fn();
const mockBack = jest.fn();
const mockReplace = jest.fn();
const mockToast = jest.fn();
const mockRefetch = jest.fn();
const mockTimeRefetch = jest.fn();
const mockBlock = jest.fn();
let mockBlocking = false;
let mockUserUuid = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
let mockBlur: (() => void) | undefined;
let mockId = '41';
let mockSaving = false;
let mockRemainingTime = 180;
let mockTimeError = false;
let mockData: TalkLogListResult;
let mockError = false;
let mockDimensions = { width: 393, height: 852, fontScale: 1, scale: 3 };
const targetUuid = '01234567-89ab-cdef-0123-456789abcdef';

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, back: mockBack, replace: mockReplace, canGoBack: () => false }),
  useLocalSearchParams: () => ({ id: mockId }),
  useFocusEffect: (callback: () => () => void) => jest.requireActual('react').useEffect(() => {
    const cleanup = callback(); mockBlur = cleanup; return cleanup;
  }, [callback]),
}));
jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({ __esModule: true, default: () => mockDimensions }));
jest.mock('@/src/features/history/hooks/useCallDetail', () => ({ useCallDetail: () => ({
  data: mockData, isLoading: false, isError: mockError, isFetching: false, isSaving: mockSaving,
  refetch: mockRefetch, updateTalkLog: jest.fn(),
}) }));
jest.mock('@/src/features/history/hooks/useCallDetailGlow', () => ({ useCallDetailGlow: () => ({}) }));
jest.mock('@/src/features/chat/hooks/useBlockUserMutation', () => ({ useBlockUserMutation: () => ({ mutateAsync: mockBlock, isPending: mockBlocking }) }));
jest.mock('@/src/store/useAuthStore', () => ({ useAuthStore: (selector: (state: unknown) => unknown) => selector({ userUuid: mockUserUuid }) }));
jest.mock('@/src/components/home/main/Discovery/PartnerProfileModal', () => {
  const { Pressable, Text } = jest.requireActual('react-native');
  return { __esModule: true, default: ({ match, onClose }: { match: { userUuid: string } | null; onClose: () => void }) => match ? <Pressable onPress={onClose} accessibilityLabel="상세 닫기 테스트"><Text>{`상세 대상: ${match.userUuid}`}</Text></Pressable> : null };
});
jest.mock('@/src/hooks/useThemeColors', () => ({ useThemeColors: () => ({ colors: jest.requireActual('@/src/constants/theme').lightTheme }) }));
jest.mock('@/src/components/common/Toast/ToastProvider', () => ({ useToast: () => ({ showToast: mockToast }) }));
jest.mock('@/src/features/profile/hooks/useTimeStatusQuery', () => ({ useTimeStatusQuery: () => ({
  data: { remainingTalkTime: mockRemainingTime }, isFetching: false, isError: mockTimeError, refetch: mockTimeRefetch,
}) }));
jest.mock('@/src/features/profile/hooks/useBuyTimeMutation', () => ({ useBuyTimeMutation: () => ({ mutateAsync: jest.fn() }) }));
jest.mock('react-native-safe-area-context', () => ({ useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }) }));
jest.mock('@expo/vector-icons', () => ({ Feather: () => null }));
jest.mock('@/src/components/home/common/BrowseIcon', () => ({ BrowseIcon: () => null }));
jest.mock('@/src/features/match/components/MatchAvatar', () => ({ MatchAvatar: () => null }));
jest.mock('@/src/components/home/history/detail/CallDetailAlert', () => ({ __esModule: true, default: () => null }));
jest.mock('@/src/components/home/history/detail/CallDetailFooter', () => ({ __esModule: true, default: () => null }));
jest.mock('@/src/components/home/history/detail/CallDetailBody', () => {
  const { Pressable, Text } = jest.requireActual('react-native');
  return { __esModule: true, default: ({ onEditingChange, summary }: { onEditingChange: (value: boolean) => void; summary: React.ReactElement }) => <>
    {summary}
    <Pressable accessibilityLabel="답변 수정 테스트" onPress={() => onEditingChange(true)}><Text>답변 수정</Text></Pressable>
    <Pressable accessibilityLabel="답변 수정 취소 테스트" onPress={() => onEditingChange(false)}><Text>수정 취소</Text></Pressable>
  </> };
});
jest.mock('react-native-gesture-handler', () => ({
  GestureHandlerRootView: jest.requireActual('react-native').View,
  GestureDetector: ({ children }: { children: React.ReactNode }) => children,
  Gesture: { Pan: () => { const pan = { onUpdate: () => pan, onEnd: () => pan }; return pan; } },
}));
jest.mock('react-native-reanimated', () => {
  const chain = { delay: () => chain, duration: () => chain, springify: () => chain };
  return { __esModule: true, default: { View: jest.requireActual('react-native').View }, FadeInDown: chain,
    useSharedValue: (value: number) => jest.requireActual('react').useRef({ value }).current,
    useAnimatedStyle: (style: () => unknown) => style(), withSpring: (value: number) => value,
    withTiming: (value: number, _: unknown, callback?: (finished: boolean) => void) => { callback?.(true); return value; }, runOnJS: (callback: () => void) => callback,
  };
});

beforeEach(() => {
  jest.useFakeTimers();
  jest.clearAllMocks();
  mockBlocking = false; mockUserUuid = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  mockBlock.mockReset().mockResolvedValue({});
  mockId = '41'; mockError = false; mockSaving = false; mockRemainingTime = 180; mockTimeError = false;
  mockDimensions = { width: 393, height: 852, fontScale: 1, scale: 3 };
  mockRefetch.mockReset().mockResolvedValue({ isError: false }); mockTimeRefetch.mockResolvedValue({});
  mockData = { callId: 41, callNumber: 3, startedAt: '2026-10-05T14:30:00', description: '지수의 Twin과 대화',
    partner: { userUuid: targetUuid, name: '지수', age: 26, profileImageUrl: null, twinSyncRate: 85 }, talkLogs: [],
  };
});
afterEach(() => { jest.clearAllTimers(); jest.useRealTimers(); });

it('opens the actual history partner profile and returns to the same record', () => {
  const screen = render(<CallDetailScreen />);
  fireEvent.press(screen.getByLabelText('통화 기록 메뉴'));
  fireEvent.press(screen.getByLabelText('사용자 상세 보기'));
  expect(screen.getByText(`상세 대상: ${targetUuid}`)).toBeTruthy();
  expect(screen.queryByLabelText('기록 새로고침')).toBeNull();
  fireEvent.press(screen.getByLabelText('상세 닫기 테스트'));
  expect(screen.queryByText(`상세 대상: ${targetUuid}`)).toBeNull();
  expect(mockPush).not.toHaveBeenCalled();
});

it('requires confirmation before blocking, prevents duplicate requests, and returns to history', async () => {
  const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  const screen = render(<CallDetailScreen />);
  fireEvent.press(screen.getByLabelText('통화 기록 메뉴'));
  fireEvent.press(screen.getByLabelText('사용자 차단하기'));
  expect(mockBlock).not.toHaveBeenCalled();
  const buttons = alert.mock.calls[0][2]!;
  expect(buttons[0].style).toBe('cancel');
  act(() => { buttons[1].onPress?.(); buttons[1].onPress?.(); });
  await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/(main)/history'));
  expect(mockBlock).toHaveBeenCalledTimes(1);
  expect(mockBlock).toHaveBeenCalledWith(targetUuid);
  alert.mockRestore();
});

it('keeps the record available if blocking fails', async () => {
  mockBlock.mockRejectedValue(new Error('offline'));
  const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  const screen = render(<CallDetailScreen />);
  fireEvent.press(screen.getByLabelText('통화 기록 메뉴'));
  fireEvent.press(screen.getByLabelText('사용자 차단하기'));
  act(() => { alert.mock.calls[0][2]![1].onPress?.(); });
  await waitFor(() => expect(mockToast).toHaveBeenCalledWith(expect.any(String), 'error'));
  expect(mockReplace).not.toHaveBeenCalled();
  expect(screen.getByLabelText('상대의 AI 트윈과 통화')).toBeTruthy();
  alert.mockRestore();
});

it('does not act on a confirmation left over from another record', () => {
  const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  const screen = render(<CallDetailScreen />);
  fireEvent.press(screen.getByLabelText('통화 기록 메뉴'));
  fireEvent.press(screen.getByLabelText('사용자 차단하기'));
  const confirm = alert.mock.calls[0][2]![1].onPress;
  mockId = '42'; mockData = { ...mockData, callId: 42 };
  screen.rerender(<CallDetailScreen />);
  act(() => { confirm?.(); });
  expect(mockBlock).not.toHaveBeenCalled();
  alert.mockRestore();
});

it('disables safety actions for oneself and while editing', () => {
  mockData.partner.userUuid = mockUserUuid;
  const screen = render(<CallDetailScreen />);
  fireEvent.press(screen.getByLabelText('통화 기록 메뉴'));
  expect(screen.getByLabelText('사용자 차단하기')).toBeDisabled();
  expect(screen.getByLabelText('사용자 신고하기')).toBeDisabled();
});

it('opens a report draft with the chosen reason, without claiming server receipt', async () => {
  const open = jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
  const screen = render(<CallDetailScreen />);
  fireEvent.press(screen.getByLabelText('통화 기록 메뉴'));
  fireEvent.press(screen.getByLabelText('사용자 신고하기'));
  expect(screen.getByLabelText('신고 메일 작성')).toBeDisabled();
  fireEvent.press(screen.getByLabelText('괴롭힘·위협'));
  fireEvent.press(screen.getByLabelText('신고 메일 작성'));
  await waitFor(() => expect(screen.getByText('메일 앱에서 전송을 완료해주세요. 여기서는 접수 여부를 확인할 수 없어요.')).toBeTruthy());
  const uri = new URL(open.mock.calls[0][0]);
  expect(uri.protocol).toBe('mailto:');
  expect(uri.searchParams.get('body')).toContain('통화 기록 ID: 41');
  expect(uri.searchParams.get('body')).toContain(targetUuid);
  expect(uri.searchParams.get('body')).toContain('괴롭힘·위협');
  expect(mockPush).not.toHaveBeenCalled();
  open.mockRestore();
});

it('preserves the selected report reason when opening the mail app fails', async () => {
  const open = jest.spyOn(Linking, 'openURL').mockRejectedValue(new Error('no mail client'));
  const screen = render(<CallDetailScreen />);
  fireEvent.press(screen.getByLabelText('통화 기록 메뉴'));
  fireEvent.press(screen.getByLabelText('사용자 신고하기'));
  fireEvent.press(screen.getByLabelText('기타'));
  fireEvent.press(screen.getByLabelText('신고 메일 작성'));
  await waitFor(() => expect(mockToast).toHaveBeenCalledWith(expect.any(String), 'error'));
  expect(screen.getByLabelText('기타').props.accessibilityState.checked).toBe(true);
  expect(screen.queryByText('메일 앱에서 전송을 완료해주세요. 여기서는 접수 여부를 확인할 수 없어요.')).toBeNull();
  open.mockRestore();
});

it('does not carry a late mail-opening result into a reopened report menu', async () => {
  let finish!: () => void;
  const open = jest.spyOn(Linking, 'openURL').mockImplementation(() => new Promise(resolve => { finish = () => resolve(undefined); }));
  const screen = render(<CallDetailScreen />);
  fireEvent.press(screen.getByLabelText('통화 기록 메뉴'));
  fireEvent.press(screen.getByLabelText('사용자 신고하기'));
  fireEvent.press(screen.getByLabelText('기타'));
  fireEvent.press(screen.getByLabelText('신고 메일 작성'));
  fireEvent.press(screen.getByLabelText('통화 기록 메뉴 닫기'));
  fireEvent.press(screen.getByLabelText('통화 기록 메뉴'));
  await act(async () => { finish(); });
  fireEvent.press(screen.getByLabelText('사용자 신고하기'));
  expect(screen.getByLabelText('신고 메일 작성')).toBeDisabled();
  expect(screen.queryByText('메일 앱에서 전송을 완료해주세요. 여기서는 접수 여부를 확인할 수 없어요.')).toBeNull();
  open.mockRestore();
});

it('truncates a long nickname on a small screen while keeping the action controls available', () => {
  mockDimensions = { width: 320, height: 568, fontScale: 1.5, scale: 2 };
  mockData.partner.name = '아주아주긴닉네임과이모지가있어요🙂🙂';
  const screen = render(<CallDetailScreen />);
  expect(screen.getByLabelText(`${mockData.partner.name}님`).props.numberOfLines).toBe(1);
  expect(screen.getByLabelText(`${mockData.partner.name}님`).props.ellipsizeMode).toBe('tail');
  expect(screen.getByLabelText('상대의 AI 트윈과 통화')).toBeEnabled();
  expect(screen.getByLabelText('통화 기록 메뉴')).toBeTruthy();
});

it.each(['지수의 Twin과 대화', '지수와 내 Twin의 대화'])('starts a new call to the API partner after confirmation: %s', async description => {
  mockData.description = description;
  const screen = render(<CallDetailScreen />);
  fireEvent.press(screen.getByLabelText('상대의 AI 트윈과 통화'));
  expect(mockPush).not.toHaveBeenCalled();
  await waitFor(() => expect(screen.getByLabelText('통화 시작')).toBeEnabled());
  fireEvent.press(screen.getByLabelText('통화 시작'));
  act(() => jest.advanceTimersByTime(300));
  expect(mockPush).toHaveBeenCalledTimes(1);
  expect(mockPush).toHaveBeenCalledWith({ pathname: '/ai-call', params: { targetUuid, targetName: '지수', remainingSeconds: '180' } });
});

it('preserves the record when confirmation is cancelled', () => {
  const screen = render(<CallDetailScreen />);
  fireEvent.press(screen.getByLabelText('상대의 AI 트윈과 통화'));
  fireEvent.press(screen.getByLabelText('통화 확인 닫기'));
  expect(screen.getByText('지수의 Twin과 대화')).toBeTruthy();
  expect(mockPush).not.toHaveBeenCalled();
});

it('switches zero balance to refill in one native Modal and returns to the record with Android back', async () => {
  mockRemainingTime = 0;
  const screen = render(<CallDetailScreen />);
  fireEvent.press(screen.getByLabelText('상대의 AI 트윈과 통화'));
  await waitFor(() => expect(screen.getByLabelText('대화 시간 충전하기')).toBeEnabled());
  fireEvent.press(screen.getByLabelText('대화 시간 충전하기'));
  expect(screen.getByText('대화 시간 채우기')).toBeTruthy();
  expect(screen.UNSAFE_getAllByType(Modal)).toHaveLength(1);
  fireEvent(screen.UNSAFE_getByType(Modal), 'requestClose');
  expect(screen.queryByText('대화 시간 채우기')).toBeNull();
  expect(mockPush).not.toHaveBeenCalled();
});

it('does not start from a failed balance check', async () => {
  mockTimeError = true;
  const screen = render(<CallDetailScreen />);
  fireEvent.press(screen.getByLabelText('상대의 AI 트윈과 통화'));
  await waitFor(() => expect(screen.getByLabelText('통화 시작')).toBeDisabled());
  expect(mockPush).not.toHaveBeenCalled();
});

it('disables call and refresh until editing is finished', () => {
  const screen = render(<CallDetailScreen />);
  fireEvent.press(screen.getByLabelText('답변 수정 테스트'));
  expect(screen.getByLabelText('상대의 AI 트윈과 통화')).toBeDisabled();
  fireEvent.press(screen.getByLabelText('통화 기록 메뉴'));
  expect(screen.getByLabelText('기록 새로고침')).toBeDisabled();
  fireEvent.press(screen.getByLabelText('통화 기록 메뉴 닫기'));
  fireEvent.press(screen.getByLabelText('답변 수정 취소 테스트'));
  expect(screen.getByLabelText('상대의 AI 트윈과 통화')).toBeEnabled();
});

it('shows actual call information and editing guidance, and refreshes the current API record', async () => {
  const screen = render(<CallDetailScreen />);
  fireEvent.press(screen.getByLabelText('통화 기록 메뉴'));
  fireEvent.press(screen.getByLabelText('통화 정보'));
  expect(screen.getByText('2026.10.05 · 14:30')).toBeTruthy();
  expect(screen.getByText('3번째')).toBeTruthy();
  fireEvent.press(screen.getByLabelText('통화 기록 메뉴로 돌아가기'));
  fireEvent.press(screen.getByLabelText('기록 안내'));
  expect(screen.getByText('내 트윈의 답변만 수정해요')).toBeTruthy();
  fireEvent.press(screen.getByLabelText('통화 기록 메뉴로 돌아가기'));
  fireEvent.press(screen.getByLabelText('기록 새로고침'));
  await waitFor(() => expect(mockRefetch).toHaveBeenCalledTimes(1));
});

it('does not navigate from an invalid partner identifier', () => {
  mockData.partner.userUuid = '';
  const screen = render(<CallDetailScreen />);
  expect(screen.getByLabelText('상대의 AI 트윈과 통화')).toBeDisabled();
});

it.each(['blur', 'unmount', 'record change'])('cancels delayed navigation on %s', async reason => {
  const screen = render(<CallDetailScreen />);
  fireEvent.press(screen.getByLabelText('상대의 AI 트윈과 통화'));
  await waitFor(() => expect(screen.getByLabelText('통화 시작')).toBeEnabled());
  fireEvent.press(screen.getByLabelText('통화 시작'));
  if (reason === 'unmount') screen.unmount();
  else if (reason === 'blur') act(() => mockBlur?.());
  else { mockId = '42'; mockData = { ...mockData, callId: 42 }; screen.rerender(<CallDetailScreen />); }
  act(() => jest.advanceTimersByTime(300));
  expect(mockPush).not.toHaveBeenCalled();
});

it('keeps a small landscape menu scrollable inside safe bounds at large text size', () => {
  mockDimensions = { width: 740, height: 360, fontScale: 2, scale: 3 };
  const screen = render(<CallDetailScreen />);
  fireEvent.press(screen.getByLabelText('통화 기록 메뉴'));
  fireEvent.press(screen.getByLabelText('기록 안내'));
  expect(screen.getByText('전화 버튼으로 새 대화를 시작해요')).toBeTruthy();
});

it('returns an inaccessible record to the history tab without a navigation stack', () => {
  mockError = true; mockData = undefined as unknown as TalkLogListResult;
  const screen = render(<CallDetailScreen />);
  fireEvent.press(screen.getByLabelText('기록으로 돌아가기'));
  expect(mockReplace).toHaveBeenCalledWith('/(main)/history');
});

it('handles Android back inside the menu before leaving the record', () => {
  const listener = jest.spyOn(BackHandler, 'addEventListener');
  const screen = render(<CallDetailScreen />);
  fireEvent.press(screen.getByLabelText('통화 기록 메뉴'));
  fireEvent.press(screen.getByLabelText('기록 안내'));
  let back = listener.mock.calls[listener.mock.calls.length - 1][1];
  act(() => { expect(back()).toBe(true); });
  expect(screen.getByLabelText('기록 새로고침')).toBeTruthy();
  back = listener.mock.calls[listener.mock.calls.length - 1][1];
  act(() => { expect(back()).toBe(true); });
  expect(screen.queryByLabelText('기록 새로고침')).toBeNull();
  expect(mockBack).not.toHaveBeenCalled();
  listener.mockRestore();
});

it('keeps a new record usable while an old refresh finishes, without clearing a newer refresh', async () => {
  let finishOld!: (value: { isError: boolean }) => void;
  let finishNew!: (value: { isError: boolean }) => void;
  mockRefetch.mockImplementationOnce(() => new Promise(resolve => { finishOld = resolve; }))
    .mockImplementationOnce(() => new Promise(resolve => { finishNew = resolve; }));
  const screen = render(<CallDetailScreen />);
  fireEvent.press(screen.getByLabelText('통화 기록 메뉴'));
  fireEvent.press(screen.getByLabelText('기록 새로고침'));
  mockId = '42'; mockData = { ...mockData, callId: 42 };
  screen.rerender(<CallDetailScreen />);
  expect(screen.getByLabelText('상대의 AI 트윈과 통화')).toBeEnabled();
  fireEvent.press(screen.getByLabelText('통화 기록 메뉴'));
  fireEvent.press(screen.getByLabelText('기록 새로고침'));
  await act(async () => { finishOld({ isError: false }); });
  expect(screen.getByLabelText('상대의 AI 트윈과 통화')).toBeDisabled();
  await act(async () => { finishNew({ isError: false }); });
  expect(screen.getByLabelText('상대의 AI 트윈과 통화')).toBeEnabled();
});


it('keeps a cached transcript readable when a background refresh fails', () => {
  mockError = true;
  const screen = render(<CallDetailScreen />);
  expect(screen.getByText('지수의 Twin과 대화')).toBeTruthy();
  expect(screen.getByText('새로고침하지 못했어요. 이전에 불러온 기록을 보여드려요. 더보기에서 다시 시도할 수 있어요.')).toBeTruthy();
  expect(screen.queryByText('통화 기록을 불러오지 못했습니다.')).toBeNull();
});
