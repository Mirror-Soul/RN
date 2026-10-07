import React from 'react';
import { ScrollView } from 'react-native';
import { act, fireEvent, render, waitFor, within } from '@testing-library/react-native';
import { TimeRefillBottomSheet } from './TimeRefillBottomSheet';

const mockBuy = jest.fn();
const mockToast = jest.fn();
const mockRefetch = jest.fn();
let mockTime: { remainingTalkTime: number } | undefined;
let mockError = false;
let mockDimensions = { width: 393, height: 852, fontScale: 1, scale: 3 };
jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({ __esModule: true, default: () => mockDimensions }));
jest.mock('@/src/features/profile/hooks/useTimeStatusQuery', () => ({ useTimeStatusQuery: () => ({ data: mockTime, isError: mockError, isLoading: false, refetch: mockRefetch }) }));
jest.mock('@/src/features/profile/hooks/useBuyTimeMutation', () => ({ useBuyTimeMutation: () => ({ mutateAsync: mockBuy }) }));
jest.mock('@/src/components/common/Toast/ToastProvider', () => ({ useToast: () => ({ showToast: mockToast }) }));
jest.mock('@/src/hooks/useThemeColors', () => ({ useThemeColors: () => ({ colors: jest.requireActual('@/src/constants/theme').lightTheme }) }));
jest.mock('react-native-safe-area-context', () => ({ useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }) }));
jest.mock('@/src/components/home/common/BrowseIcon', () => ({ BrowseIcon: () => null }));
jest.mock('@/src/components/common/BottomSheet/BottomSheet', () => ({ BottomSheet: ({ isOpen, children }: { isOpen: boolean; children: React.ReactNode }) => isOpen ? children : null }));

beforeEach(() => {
  jest.clearAllMocks();
  mockTime = { remainingTalkTime: 180 };
  mockError = false;
  mockDimensions = { width: 393, height: 852, fontScale: 1, scale: 3 };
  mockBuy.mockReset().mockResolvedValue({});
});

const selectTwoHours = (screen: ReturnType<typeof render>) => fireEvent.press(screen.getByRole('radio', { name: '2시간, 가격 예시 ₩14,900' }));

it('requires explicit confirmation after selection and posts only the selected seconds', async () => {
  const onClose = jest.fn();
  const screen = render(<TimeRefillBottomSheet isOpen onClose={onClose} />);
  expect(screen.getByLabelText('시간을 선택해주세요')).toBeDisabled();
  selectTwoHours(screen);
  expect(mockBuy).not.toHaveBeenCalled();
  expect(screen.getByRole('radio', { name: '2시간, 가격 예시 ₩14,900', checked: true })).toBeTruthy();
  fireEvent.press(screen.getByLabelText('2시간 테스트 충전하기'));
  await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  expect(mockBuy).toHaveBeenCalledTimes(1);
  expect(mockBuy).toHaveBeenCalledWith(7200);
});

it('blocks rapid duplicate confirmation while the server request is pending', async () => {
  let complete!: () => void;
  mockBuy.mockImplementation(() => new Promise<void>(resolve => { complete = resolve; }));
  const screen = render(<TimeRefillBottomSheet isOpen onClose={jest.fn()} />);
  selectTwoHours(screen);
  const button = screen.getByLabelText('2시간 테스트 충전하기');
  act(() => { fireEvent.press(button); fireEvent.press(button); });
  expect(mockBuy).toHaveBeenCalledTimes(1);
  expect(screen.getByRole('radio', { name: '30분, 가격 예시 ₩4,900' })).toBeDisabled();
  await act(async () => { complete(); });
});

it('keeps the chosen option after failure, refreshes balance, and allows explicit retry', async () => {
  mockBuy.mockRejectedValueOnce(new Error('network'));
  const onClose = jest.fn();
  const screen = render(<TimeRefillBottomSheet isOpen onClose={onClose} />);
  selectTwoHours(screen);
  fireEvent.press(screen.getByLabelText('2시간 테스트 충전하기'));
  await waitFor(() => expect(mockToast).toHaveBeenCalled());
  expect(onClose).not.toHaveBeenCalled();
  expect(mockRefetch).toHaveBeenCalledTimes(1);
  expect(screen.getByLabelText('2시간 테스트 충전하기')).toBeEnabled();
  fireEvent.press(screen.getByLabelText('2시간 테스트 충전하기'));
  await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  expect(mockBuy.mock.calls).toEqual([[7200], [7200]]);
});

it('opens actual draft terms without charging and preserves the selection when returning', () => {
  const screen = render(<TimeRefillBottomSheet isOpen onClose={jest.fn()} />);
  selectTwoHours(screen);
  fireEvent.press(screen.getByLabelText('충전 이용약관 보기'));
  expect(screen.getByText('검토용 초안 · 2026.10.05')).toBeTruthy();
  expect(screen.getByText('제7조 청약철회')).toBeTruthy();
  expect(screen.getByText('제8조 환불·과오금·부분 사용')).toBeTruthy();
  expect(mockBuy).not.toHaveBeenCalled();
  fireEvent.press(screen.getByLabelText('충전으로 돌아가기'));
  expect(screen.getByLabelText('2시간 테스트 충전하기')).toBeEnabled();
  expect(screen.getByText('₩4,700 절약 · 약 24%')).toBeTruthy();
  expect(screen.getByText('₩39,000 절약 · 약 40%')).toBeTruthy();
});

it('does not show an unavailable balance as zero and provides error retry', () => {
  mockTime = undefined;
  const screen = render(<TimeRefillBottomSheet isOpen onClose={jest.fn()} />);
  expect(screen.getByText('확인 중…')).toBeTruthy();
  expect(screen.queryByText('00:00:00')).toBeNull();
  mockError = true;
  screen.rerender(<TimeRefillBottomSheet isOpen onClose={jest.fn()} />);
  fireEvent.press(screen.getByLabelText('남은 시간 다시 조회'));
  expect(mockRefetch).toHaveBeenCalledTimes(1);
});

it('puts confirmation inside the scrollable area in landscape and at large text size', () => {
  mockDimensions = { width: 740, height: 360, fontScale: 2, scale: 3 };
  const screen = render(<TimeRefillBottomSheet isOpen onClose={jest.fn()} />);
  const scroll = screen.UNSAFE_getByType(ScrollView);
  expect(within(scroll).getByLabelText('시간을 선택해주세요')).toBeTruthy();
});

it('does not let an old request close a newly reopened sheet', async () => {
  let complete!: () => void;
  mockBuy.mockImplementation(() => new Promise<void>(resolve => { complete = resolve; }));
  const onClose = jest.fn();
  const screen = render(<TimeRefillBottomSheet isOpen onClose={onClose} />);
  selectTwoHours(screen);
  fireEvent.press(screen.getByLabelText('2시간 테스트 충전하기'));
  screen.rerender(<TimeRefillBottomSheet isOpen={false} onClose={onClose} />);
  screen.rerender(<TimeRefillBottomSheet isOpen onClose={onClose} />);
  await act(async () => { complete(); });
  expect(onClose).not.toHaveBeenCalled();
  expect(screen.getByText('대화 시간 채우기')).toBeTruthy();
});

it('does not invoke view callbacks after the charging sheet is unmounted', async () => {
  let complete!: () => void;
  mockBuy.mockImplementation(() => new Promise<void>(resolve => { complete = resolve; }));
  const onClose = jest.fn();
  const screen = render(<TimeRefillBottomSheet isOpen onClose={onClose} />);
  selectTwoHours(screen);
  fireEvent.press(screen.getByLabelText('2시간 테스트 충전하기'));
  screen.unmount();
  await act(async () => { complete(); });
  expect(onClose).not.toHaveBeenCalled();
  expect(mockToast).not.toHaveBeenCalled();
});
