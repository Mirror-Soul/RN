import React from 'react';
import { Alert, Modal, ScrollView, View, StyleSheet } from 'react-native';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import VerificationModal from './modals/VerificationModal';
import ValueBalanceModal from './modals/ValueBalanceModal';
import VoiceMissionCard from './VoiceMissionCard';
import VoiceUpdateButton from './voice-update/VoiceUpdateButton';
import TwinSimulationCard from './TwinSimulationCard';
import CallStartConfirmSheet from '@/src/components/call/CallStartConfirmSheet';
import GrowthMissionCard from './GrowthMissionCard';
import GrowthHeroSection from './GrowthHeroSection';
import ValueBalanceMissionCard from './ValueBalanceMissionCard';
import { getSyncCopy } from './growthSyncCopy';
import { valueBalanceUnlockLabel } from './valueBalanceCopy';
import VoiceUpdatePrompt from './voice-update/VoiceUpdatePrompt';
import VoiceUpdateTranscriptBox from './voice-update/VoiceUpdateTranscriptBox';
import type { ValueBalanceQuestionResult } from '@/src/types/api/evolve';

const mockPick = jest.fn();
const mockCamera = jest.fn();
const mockPermission = jest.fn();
const mockPush = jest.fn();
const mockBack = jest.fn();
const mockSubmit = jest.fn();
const mockRetry = jest.fn();
const mockTimeRefetch = jest.fn();
const mockFlash = jest.fn();
const mockUpload = jest.fn();
let mockUser = 'member-one';
let mockQuestion: ValueBalanceQuestionResult;
let mockQueryError = false;
let mockDimensions = { width: 393, height: 852, fontScale: 1, scale: 3 };
jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({ __esModule: true, default: () => mockDimensions }));
jest.mock('react-native-safe-area-context', () => ({ SafeAreaView: jest.requireActual('react-native').View, useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }) }));
jest.mock('expo-font', () => ({ isLoaded: () => false }));
jest.mock('expo-image', () => ({ Image: jest.requireActual('react-native').View }));
jest.mock('@expo/vector-icons', () => ({ Feather: () => null, Ionicons: () => null, MaterialCommunityIcons: () => null }));
jest.mock('expo-router', () => ({
  router: { push: (...args: unknown[]) => mockPush(...args), back: (...args: unknown[]) => mockBack(...args), canGoBack: () => true, replace: jest.fn() },
  useRouter: () => ({ back: mockBack, canGoBack: () => true, replace: jest.fn() }),
  useFocusEffect: (callback: () => () => void) => jest.requireActual('react').useEffect(callback, [callback]),
}));
jest.mock('expo-image-picker', () => ({ launchImageLibraryAsync: (...args: unknown[]) => mockPick(...args), launchCameraAsync: (...args: unknown[]) => mockCamera(...args), requestCameraPermissionsAsync: () => mockPermission() }));
jest.mock('@/src/services/s3Service', () => ({ uploadFileToS3: (...args: unknown[]) => mockUpload(...args) }));
jest.mock('@/src/hooks/useThemeColors', () => ({ useThemeColors: () => ({ colors: jest.requireActual('@/src/constants/theme').lightTheme, isDark: false }) }));
jest.mock('@/src/store/useAuthStore', () => ({ useAuthStore: Object.assign((selector: (value: unknown) => unknown) => selector({ userUuid: mockUser, isLoggedIn: true }), { getState: () => ({ userUuid: mockUser, isLoggedIn: true }) }) }));
jest.mock('@/src/features/growth/hooks/useTwinSyncQuery', () => ({ useTwinSyncQuery: () => ({ data: { syncRate: 72.5, voiceTrainingCount: 9, lastVoiceTrainingAt: 'bad-date' }, isLoading: false, isError: false, refetch: mockRetry }) }));
jest.mock('@/src/features/growth/hooks/useValueBalanceQuestionQuery', () => ({ useValueBalanceQuestionQuery: () => ({ data: mockQuestion, isLoading: false, isError: mockQueryError, isFetching: false, refetch: mockRetry }) }));
jest.mock('@/src/features/growth/hooks/useSubmitValueBalanceAnswerMutation', () => ({ useSubmitValueBalanceAnswerMutation: () => ({ mutateAsync: mockSubmit, isPending: false }) }));
jest.mock('@/src/components/common/Toast/ToastProvider', () => ({ useToast: () => ({ showToast: mockFlash }) }));
jest.mock('@/src/components/home/grow/GrowSubScreenHeader', () => () => null);
jest.mock('@/src/features/profile/hooks/useTimeStatusQuery', () => ({ useTimeStatusQuery: () => ({ data: { remainingTalkTime: 120 }, isFetching: false, isError: false, refetch: mockTimeRefetch }) }));
jest.mock('@/src/features/profile/components/TimeRefillBottomSheet', () => ({ TimeRefillBottomSheet: () => null }));
jest.mock('@/src/components/common/BottomSheet/BottomSheet', () => {
  const SheetView = jest.requireActual('react-native').View;
  return { BottomSheet: ({ isOpen, children, ...props }: { isOpen: boolean; children: React.ReactNode }) => isOpen ? <SheetView testID="sheet" {...props}>{children}</SheetView> : null };
});

const props = { isOpen: true, onClose: jest.fn(), submitted: false, job: 'IT_TECH' as const, loading: false, error: false, onRetry: mockRetry };
beforeEach(() => {
  jest.clearAllMocks();
  mockTimeRefetch.mockResolvedValue({ isSuccess: true });
  mockUser = 'member-one'; mockQueryError = false;
  mockDimensions = { width: 393, height: 852, fontScale: 1, scale: 3 };
  mockPick.mockResolvedValue({ canceled: false, assets: [{ uri: 'file:///document.jpg', fileName: '재직증명서.jpg', width: 600, height: 800 }] });
  mockCamera.mockResolvedValue({ canceled: true, assets: [] });
  mockPermission.mockResolvedValue({ granted: false });
  mockQuestion = { questionId: 7, axis: 'PRIORITY', leftLabel: '관계 우선', rightLabel: '내 시간 우선', currentSet: 1, answeredInSet: 3, setSize: 8, totalSets: 13, totalAnswered: 3, locked: false, lockedUntil: null, completed: false };
});
afterEach(() => jest.restoreAllMocks());

it('selects a real image and previews it without inventing submission or verification', async () => {
  const screen = render(<VerificationModal {...props} />);
  fireEvent.press(screen.getByLabelText('사진첩에서 직업 서류 선택'));
  await waitFor(() => expect(screen.getByText('재직증명서.jpg')).toBeTruthy());
  expect(screen.getByLabelText('선택한 직업 확인 서류 사진').props.source.uri).toBe('file:///document.jpg');
  expect(screen.getByLabelText('직업 인증 서류 제출 준비 중')).toBeDisabled();
  expect(mockUpload).not.toHaveBeenCalled();
  fireEvent.press(screen.getByLabelText('첨부 사진 삭제'));
  expect(screen.queryByLabelText('선택한 직업 확인 서류 사진')).toBeNull();
});

it('retains the existing image when a replacement is cancelled', async () => {
  const screen = render(<VerificationModal {...props} />);
  fireEvent.press(screen.getByLabelText('사진첩에서 직업 서류 선택'));
  await waitFor(() => expect(screen.getByText('재직증명서.jpg')).toBeTruthy());
  mockPick.mockResolvedValueOnce({ canceled: true });
  fireEvent.press(screen.getByLabelText('사진첩에서 직업 서류 선택'));
  await waitFor(() => expect(screen.queryByLabelText('사진 선택 중')).toBeNull());
  expect(screen.getByText('재직증명서.jpg')).toBeTruthy();
});

it('does not launch a camera without permission and preserves the photo-picker alternative', async () => {
  jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  const screen = render(<VerificationModal {...props} />);
  fireEvent.press(screen.getByLabelText('직업 서류 촬영'));
  await waitFor(() => expect(Alert.alert).toHaveBeenCalledWith('카메라 접근을 허용해 주세요', expect.any(String), expect.any(Array)));
  expect(mockCamera).not.toHaveBeenCalled();
  fireEvent.press(screen.getByLabelText('사진첩에서 직업 서류 선택'));
  await waitFor(() => expect(screen.getByText('재직증명서.jpg')).toBeTruthy());
});

it('clears private previews on close and ignores a picker result from a prior session', async () => {
  let finish!: (value: unknown) => void;
  mockPick.mockImplementationOnce(() => new Promise(resolve => { finish = resolve; }));
  const screen = render(<View><VerificationModal key="one" {...props} /></View>);
  fireEvent.press(screen.getByLabelText('사진첩에서 직업 서류 선택'));
  screen.rerender(<View><VerificationModal key="two" {...props} /></View>);
  await act(async () => { finish({ canceled: false, assets: [{ uri: 'file:///old.jpg', fileName: '이전 계정.jpg' }] }); });
  expect(screen.queryByText('이전 계정.jpg')).toBeNull();
  fireEvent.press(screen.getByLabelText('사진첩에서 직업 서류 선택'));
  await waitFor(() => expect(screen.getByText('재직증명서.jpg')).toBeTruthy());
  screen.rerender(<View><VerificationModal key="two" {...props} isOpen={false} /></View>);
  screen.rerender(<View><VerificationModal key="two" {...props} /></View>);
  expect(screen.queryByText('재직증명서.jpg')).toBeNull();
});

it('distinguishes submitted documents from approved job verification', () => {
  const screen = render(<VerificationModal {...props} submitted />);
  expect(screen.getByText('가입 때 서류를 추가했어요. 제출 여부만 확인할 수 있으며, 인증 결과는 아직 표시되지 않아요.')).toBeTruthy();
  expect(screen.queryByText('인증 완료')).toBeNull();
});

it('calls voice counts submissions and does not claim that pending or failed jobs completed learning', () => {
  const screen = render(<VoiceMissionCard />);
  expect(screen.getByText('녹음 제출 9회')).toBeTruthy();
  expect(screen.queryByText(/9회 학습|NaN/)).toBeNull();
});

it('keeps voice upload and learning completion distinct', () => {
  const screen = render(<VoiceUpdateButton status="analyzing" onPress={jest.fn()} onRetry={jest.fn()} />);
  expect(screen.getByText('녹음을 보내고 있어요…')).toBeTruthy();
  screen.rerender(<VoiceUpdateButton status="done" onPress={jest.fn()} onRetry={jest.fn()} />);
  expect(screen.getByText('학습을 요청했어요. 반영까지 시간이 걸릴 수 있어요.')).toBeTruthy();
  expect(screen.queryByText('학습 완료')).toBeNull();
});

it('shows cooldown on the next sentence button and permits it only after expiry', () => {
  const next = jest.fn();
  const screen = render(<VoiceUpdateButton status="done" cooldownRemainingSeconds={65} onPress={jest.fn()} onRetry={next} />);
  expect(screen.getByText('01:05 후 가능')).toBeTruthy();
  expect(screen.getByRole('button', { name: '다음 문장 읽기', disabled: true })).toBeTruthy();
  fireEvent.press(screen.getByLabelText('다음 문장 읽기'));
  expect(next).not.toHaveBeenCalled();
  screen.rerender(<VoiceUpdateButton status="done" cooldownRemainingSeconds={0} onPress={jest.fn()} onRetry={next} />);
  fireEvent.press(screen.getByLabelText('다음 문장 읽기'));
  expect(next).toHaveBeenCalledTimes(1);
});

it('provides status recovery after the next sentence cooldown lookup fails', () => {
  const retry = jest.fn();
  const screen = render(<VoiceUpdateButton status="done" isCooldownStatusError onRetryCooldownCheck={retry} onPress={jest.fn()} onRetry={jest.fn()} />);
  fireEvent.press(screen.getByLabelText('쿨다운 확인 다시 시도'));
  expect(retry).toHaveBeenCalledTimes(1);
  expect(screen.getByRole('button', { name: '다음 문장 읽기', disabled: true })).toBeTruthy();
});

it('keeps the prompt and failed recognition readable without text truncation', () => {
  mockDimensions = { width: 320, height: 568, fontScale: 2, scale: 3 };
  const screen = render(<><VoiceUpdatePrompt sentence="오늘도 평소 목소리로 차분하게 문장을 읽어보려고 해요." /><VoiceUpdateTranscriptBox transcript="다른 이야기" isRecording={false} similarity={0.5} /></>);
  expect(screen.getByText('오늘도 평소 목소리로 차분하게 문장을 읽어보려고 해요.').props.numberOfLines).toBeUndefined();
  expect(screen.getByText('문장 일치도 50% · 75% 이상 필요')).toBeTruthy();
  expect(screen.getByText(/녹음은 보내지 않았어요/).props.numberOfLines).toBeUndefined();
});

it('does not present the value-balance time lock as an AI processing status', () => {
  mockQuestion = { ...mockQuestion, questionId: null, locked: true, lockedUntil: '2026-10-06T14:30:00' };
  const screen = render(<ValueBalanceModal isOpen onClose={jest.fn()} />);
  expect(screen.getByText('이번 세트에 답했어요')).toBeTruthy();
  expect(screen.getByText('한국 시간 기준')).toBeTruthy();
  expect(screen.getByText('다음 질문 10/6 14:30')).toBeTruthy();
  expect(screen.queryByText(/분석 중|분석이 끝나면/)).toBeNull();
  expect(screen.getByRole('progressbar').props.accessibilityValue.now).toBe(8);
});

it('prevents double answers before mutation state rerenders and preserves the question on failure', async () => {
  let reject!: (error: Error) => void;
  mockSubmit.mockImplementationOnce(() => new Promise((_, fail) => { reject = fail; }));
  const screen = render(<ValueBalanceModal isOpen onClose={jest.fn()} />);
  act(() => { fireEvent.press(screen.getByLabelText('관계 우선')); fireEvent.press(screen.getByLabelText('내 시간 우선')); });
  expect(mockSubmit).toHaveBeenCalledTimes(1);
  expect(mockSubmit).toHaveBeenCalledWith({ questionId: 7, chosenSide: 'LEFT' });
  await act(async () => { reject(new Error('offline')); });
  expect(screen.getByLabelText('관계 우선')).toBeTruthy();
  expect(mockFlash).toHaveBeenCalledTimes(1);
  expect(mockRetry).not.toHaveBeenCalled();
});

it('does not promise completed AI analysis after all questions have been answered', () => {
  mockQuestion = { ...mockQuestion, questionId: null, completed: true };
  const screen = render(<ValueBalanceModal isOpen onClose={jest.fn()} />);
  expect(screen.getByText('답변을 모두 마쳤어요')).toBeTruthy();
  expect(screen.queryByText('분석 완료')).toBeNull();
});

it('uses an app sheet and rejects a stale account confirmation', async () => {
  const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  const screen = render(<TwinSimulationCard isReady isLoading={false} isError={false} onRetry={mockRetry} />);
  fireEvent.press(screen.getByLabelText('트윈 시뮬레이션 시작'));
  await waitFor(() => expect(screen.getByLabelText('대화 시작')).toBeEnabled());
  expect(screen.getByText('내 트윈과 대화할까요?')).toBeTruthy();
  expect(alert).not.toHaveBeenCalled();
  const confirm = screen.UNSAFE_getByType(CallStartConfirmSheet).props.onStart;
  mockUser = 'member-two';
  act(() => confirm({ userUuid: 'member-one', name: '내 트윈' }, false, 120));
  expect(mockPush).not.toHaveBeenCalled();
});

it('releases the iOS confirmation modal before opening the own-twin call', async () => {
  const screen = render(<TwinSimulationCard isReady isLoading={false} isError={false} onRetry={mockRetry} />);
  fireEvent.press(screen.getByLabelText('트윈 시뮬레이션 시작'));
  await waitFor(() => expect(screen.getByLabelText('대화 시작')).toBeEnabled());
  fireEvent.press(screen.getByLabelText('대화 시작'));
  expect(mockPush).not.toHaveBeenCalled();
  fireEvent(screen.UNSAFE_getByType(Modal), 'dismiss');
  expect(mockPush).toHaveBeenCalledTimes(1);
  expect(mockPush).toHaveBeenCalledWith({ pathname: '/ai-call', params: { targetName: '내 트윈', remainingSeconds: '120' } });
});

it('keeps an unready twin out of the call', () => {
  const screen = render(<TwinSimulationCard isReady={false} isLoading={false} isError={false} onRetry={mockRetry} />);
  fireEvent.press(screen.getByLabelText('내 트윈 준비 상태 확인'));
  expect(mockRetry).toHaveBeenCalledTimes(1);
  expect(mockPush).not.toHaveBeenCalled();
});

it.each([1, 2])('keeps long status, titles and unlock times visible at font scale %s', fontScale => {
  mockDimensions = { width: 320, height: 568, fontScale, scale: 3 };
  mockQuestion = { ...mockQuestion, locked: true, lockedUntil: '2026-10-06T14:30:00' };
  const screen = render(<ValueBalanceMissionCard onPress={jest.fn()} />);
  expect(screen.getByText('가치관 밸런스 게임').props.numberOfLines).toBeUndefined();
  expect(screen.getByText('휴식 중').props.numberOfLines).toBeUndefined();
  expect(screen.getByText('다음 질문 10/6 14:30').props.numberOfLines).toBeUndefined();
  expect(screen.queryByText(/이번 세트에 답했어요/)).toBeNull();
  expect(screen.getByLabelText('가치관 밸런스 게임').props.accessibilityHint).toContain('한국 시간');
});

it.each([[320, 568, 1], [320, 568, 2], [740, 360, 2]])('keeps the locked game sheet compact and scrollable at %sx%s, font %s', (width, height, fontScale) => {
  mockDimensions = { width, height, fontScale, scale: 3 };
  mockQuestion = { ...mockQuestion, locked: true, lockedUntil: '2026-10-06T14:30:00' };
  const screen = render(<ValueBalanceModal isOpen onClose={jest.fn()} />);
  expect(screen.getByTestId('sheet').props.height).toBeLessThanOrEqual(height - 56);
  if (fontScale === 1) expect(screen.getByTestId('sheet').props.height).toBeLessThan(400);
  expect(screen.UNSAFE_getByType(ScrollView).findByProps({ accessibilityLabel: '다음 가치관 질문 다시 확인' })).toBeTruthy();
  expect(screen.getByText('다음 질문 10/6 14:30').props.numberOfLines).toBeUndefined();
  fireEvent.press(screen.getByLabelText('다음 가치관 질문 다시 확인'));
  expect(mockRetry).toHaveBeenCalledTimes(1);
});

it('keeps waiting copy usable when the server has no valid unlock time', () => {
  mockQuestion = { ...mockQuestion, locked: true, lockedUntil: 'invalid' };
  const screen = render(<ValueBalanceMissionCard onPress={jest.fn()} />);
  expect(screen.getByText('다음 질문을 기다리고 있어요.')).toBeTruthy();
  expect(screen.queryByText(/undefined|NaN|Invalid Date/)).toBeNull();
});

it('returns job verification to the hero and permits accessible text to wrap', () => {
  const press = jest.fn();
  const screen = render(<GrowthHeroSection similarityPercent={72} isLoading={false} isError={false} jobSubmitted jobLoading={false} jobError={false} onVerifyPress={press} />);
  fireEvent.press(screen.getByLabelText('직업 인증하기'));
  expect(press).toHaveBeenCalledTimes(1);
  expect(screen.getByLabelText('직업 인증하기').props.accessibilityHint).toContain('심사 결과와는 별개');
});

it('places status in the heading and stacks it when the actual text area becomes narrow', () => {
  const screen = render(<GrowthMissionCard title="목소리 정밀 학습" subtitle="안내" status="녹음 제출 2회" icon="mic" accessibilityLabel="목소리" />);
  let heading = screen.getByTestId('growth-mission-heading');
  expect(StyleSheet.flatten(heading.props.style).flexDirection).toBe('row');
  fireEvent(screen.getByText('안내').parent!, 'layout', { nativeEvent: { layout: { width: 140 } } });
  heading = screen.getByTestId('growth-mission-heading');
  expect(StyleSheet.flatten(heading.props.style).flexDirection).toBe('column');
});

it.each([[320, 568, 2], [393, 852, 1], [740, 360, 2], [1024, 1366, 1.5]])('keeps document actions and long content scrollable at %sx%s, font %s', (width, height, fontScale) => {
  mockDimensions = { width, height, fontScale, scale: 3 };
  const screen = render(<VerificationModal {...props} />);
  const scroll = screen.UNSAFE_getByType(ScrollView);
  expect(scroll.findByProps({ accessibilityLabel: '직업 인증 나중에 하기' })).toBeTruthy();
  expect(screen.getByTestId('sheet').props.dragFromHandleOnly).toBe(true);
  expect(screen.getByTestId('sheet').props.height).toBeLessThanOrEqual(height - 44);
});

it('handles invalid lock dates and never promises a perfect twin score', () => {
  expect(valueBalanceUnlockLabel('invalid')).toBeNull();
  expect(valueBalanceUnlockLabel('2026-10-06T14:30:00')).toBe('10/6 14:30');
  expect(valueBalanceUnlockLabel('2026-10-06T05:30:00Z')).toEqual(valueBalanceUnlockLabel('2026-10-06T14:30:00'));
  expect(valueBalanceUnlockLabel('2026-12-31T15:00:00Z')).toBe('1/1 00:00');
  expect(getSyncCopy(95).subCopy).not.toMatch(/완벽|확률/);
  expect(getSyncCopy(100).headline).not.toMatch(/완벽/);
});
