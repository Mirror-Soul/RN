import React from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { BackHandler, StyleSheet } from 'react-native';
import AICallScreen from '@/app/ai-call';
import type { CallStatus } from '@/src/hooks/useAICallFlow';
import { darkTheme } from '@/src/constants/theme';

let mockDimensions = { width: 393, height: 852, fontScale: 1, scale: 3 };
let mockParams: Record<string, string> = { targetUuid: 'partner', targetName: '이름이 아주 긴 상대방', remainingSeconds: '120' };
const mockBack = jest.fn();
const mockReplace = jest.fn();
const mockStart = jest.fn();
const mockHangup = jest.fn(async () => {});
const mockMute = jest.fn();
const mockCamera = jest.fn(async () => {});
const mockSpeaker = jest.fn();
const mockTime = jest.fn();
const baseFlow = () => ({ callStatus: 'connected' as CallStatus, startCall: mockStart, hangUp: mockHangup, error: null as string | null, errorKind: null as string | null, canRetry: false, canRetryEnd: false, remoteStream: null, localCameraStream: null, callDurationSeconds: 10, completedCall: null, isMuted: false, toggleMute: mockMute, isSpeakerOn: false, toggleSpeaker: mockSpeaker, isCameraOn: false, isCameraPending: false, toggleCamera: mockCamera, notice: null, dismissNotice: jest.fn(), openSettings: jest.fn() });
let mockFlow = baseFlow();
jest.mock('@/src/hooks/useAICallFlow', () => ({ useAICallFlow: () => mockFlow }));
jest.mock('@/src/services/profileService', () => ({ getMyTime: () => mockTime() }));
jest.mock('@/src/store/useAuthStore', () => ({ useAuthStore: { getState: () => ({ userUuid: 'me', isLoggedIn: true }) } }));
jest.mock('expo-router', () => ({ Stack: { Screen: () => null }, useRouter: () => ({ back: mockBack, replace: mockReplace, canGoBack: () => true }), useLocalSearchParams: () => mockParams }));
jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({ __esModule: true, default: () => mockDimensions }));
jest.mock('@expo/vector-icons', () => ({ Feather: () => null }));
jest.mock('expo-font', () => ({ isLoaded: () => false }));
jest.mock('expo-linear-gradient', () => ({ LinearGradient: jest.requireActual('react-native').View }));
jest.mock('react-native-safe-area-context', () => ({ SafeAreaView: jest.requireActual('react-native').View }));
jest.mock('react-native-webrtc', () => ({ RTCView: jest.requireActual('react-native').View }));
jest.mock('@/src/hooks/useThemeColors', () => ({ useThemeColors: () => ({ colors: jest.requireActual('@/src/constants/theme').lightTheme, isDark: false }) }));
jest.mock('./CallEndMeetingPrompt', () => () => null);
jest.mock('./CallLocalPreview', () => {
  const PreviewView = jest.requireActual('react-native').View;
  return { __esModule: true, default: ({ safeArea }: { safeArea: object }) => <PreviewView testID="self-preview" {...safeArea} /> };
});
beforeEach(() => { jest.clearAllMocks(); mockTime.mockResolvedValue({ result: { remainingTalkTime: 120 } }); mockFlow = baseFlow(); mockDimensions = { width: 393, height: 852, fontScale: 1, scale: 3 }; mockParams = { targetUuid: 'partner', targetName: '이름이 아주 긴 상대방', remainingSeconds: '120' }; });
afterEach(() => jest.restoreAllMocks());

it('keeps all four real controls reachable and hides an unused camera placeholder', () => {
  const screen = render(<AICallScreen />);
  fireEvent.press(screen.getByLabelText('마이크 끄기'));
  fireEvent.press(screen.getByLabelText('스피커로 전환'));
  fireEvent.press(screen.getByLabelText('내 모습 확인 켜기'));
  fireEvent.press(screen.getByLabelText('통화 종료'));
  expect(mockMute).toHaveBeenCalledTimes(1);
  expect(mockSpeaker).toHaveBeenCalledTimes(1);
  expect(mockCamera).toHaveBeenCalledTimes(1);
  expect(mockHangup).toHaveBeenCalledTimes(1);
  expect(screen.queryByTestId('self-preview')).toBeNull();
});

it('uses the existing dark media surface even when the rest of the app is light', () => {
  const screen = render(<AICallScreen />);
  expect(StyleSheet.flatten(screen.getByTestId('call-media-surface').props.style).backgroundColor).toBe(darkTheme.background.primary);
});

it.each([[240, 568, 1], [320, 568, 2], [740, 360, 2], [1024, 768, 1]])('keeps every call action reachable at %sx%s with font scale %s', (width, height, fontScale) => {
  mockDimensions = { width, height, fontScale, scale: 3 };
  const screen = render(<AICallScreen />);
  for (const label of ['마이크 끄기', '스피커로 전환', '내 모습 확인 켜기', '통화 종료']) {
    expect(screen.getByLabelText(label)).toBeTruthy();
  }
  if (width === 240) {
    expect(StyleSheet.flatten(screen.getByTestId('call-control-grid').props.style).flexWrap).toBe('wrap');
    expect(screen.getByTestId('call-accessibility-scroll')).toBeTruthy();
  }
});

it('bounds a local-only camera to the measured video area', () => {
  mockFlow.isCameraOn = true;
  const screen = render(<AICallScreen />);
  fireEvent(screen.getByTestId('call-video-area'), 'layout', { nativeEvent: { layout: { width: 280, height: 220 } } });
  expect(screen.getByTestId('self-preview').props.right).toBe(280);
  expect(screen.getByTestId('self-preview').props.bottom).toBe(220);
  expect(screen.getByText('내 모습은 나에게만 보여요')).toBeTruthy();
});

it('gives the footer a measured nonzero viewport and caps overflowing controls for scrolling', () => {
  const screen = render(<AICallScreen />);
  const footer = screen.getByTestId('call-control-area');
  fireEvent(footer, 'contentSizeChange', 280, 120);
  expect(StyleSheet.flatten(screen.getByTestId('call-control-area').props.style).height).toBe(122);
  fireEvent(footer, 'contentSizeChange', 280, 1000);
  expect(StyleSheet.flatten(screen.getByTestId('call-control-area').props.style).height).toBeLessThan(1000);
  expect(screen.getByLabelText('통화 종료')).toBeTruthy();
});

it('automatically ends the own-twin call when its forwarded time limit is reached', () => {
  mockParams = { targetName: '내 트윈', remainingSeconds: '120' };
  mockFlow.callDurationSeconds = 120;
  render(<AICallScreen />);
  expect(mockHangup).toHaveBeenCalledTimes(1);
});

it('keeps cancellation on the connecting surface until server finalization ends', () => {
  mockFlow.callStatus = 'initiating';
  const screen = render(<AICallScreen />);
  mockFlow.callStatus = 'ending';
  screen.rerender(<AICallScreen />);
  expect(screen.getByText('연결을 마무리하고 있어요')).toBeTruthy();
  expect(screen.queryByLabelText('마이크 끄기')).toBeNull();
});

it('uses formal hangup for Android back navigation during a live call', () => {
  const listener = jest.spyOn(BackHandler, 'addEventListener');
  render(<AICallScreen />);
  const callback = listener.mock.calls.at(-1)![1];
  act(() => { callback(); });
  expect(mockHangup).toHaveBeenCalledTimes(1);
  expect(mockBack).not.toHaveBeenCalled();
});

it('lets users retry after changing microphone permission without leaving the error page', async () => {
  mockFlow.callStatus = 'ended';
  mockFlow.error = '마이크를 허용해주세요';
  mockFlow.errorKind = 'microphone';
  mockFlow.canRetry = true;
  const screen = render(<AICallScreen />);
  expect(screen.getByLabelText('기기 설정 열기')).toBeTruthy();
  const starts = mockStart.mock.calls.length;
  fireEvent.press(screen.getByLabelText('권한 확인 후 다시 연결'));
  await waitFor(() => expect(mockStart).toHaveBeenCalledTimes(starts + 1));
});

it('uses a fresh balance as the time limit for a retried call', async () => {
  mockFlow.callStatus = 'ended'; mockFlow.error = '연결 실패'; mockFlow.canRetry = true;
  mockTime.mockResolvedValueOnce({ result: { remainingTalkTime: 5 } });
  const screen = render(<AICallScreen />);
  fireEvent.press(screen.getByLabelText('다시 연결'));
  await waitFor(() => expect(mockTime).toHaveBeenCalledTimes(1));
  await waitFor(() => expect(mockStart).toHaveBeenCalledTimes(2));
  mockFlow.callStatus = 'connected'; mockFlow.error = null; mockFlow.callDurationSeconds = 6;
  screen.rerender(<AICallScreen />);
  expect(mockHangup).toHaveBeenCalledTimes(1);
});

it('keeps zero-balance retries out of the paid call flow', async () => {
  mockFlow.callStatus = 'ended'; mockFlow.error = '연결 실패'; mockFlow.canRetry = true;
  mockTime.mockResolvedValueOnce({ result: { remainingTalkTime: 0 } });
  const screen = render(<AICallScreen />);
  const starts = mockStart.mock.calls.length;
  fireEvent.press(screen.getByLabelText('다시 연결'));
  await waitFor(() => expect(screen.getByText(/프로필에서 시간을 충전/)).toBeTruthy());
  expect(mockStart).toHaveBeenCalledTimes(starts);
});

it.each([[320, 568, 2], [740, 360, 2]])('offers a scroll fallback for large text on a %sx%s screen', (width, height, fontScale) => {
  mockDimensions = { width, height, fontScale, scale: 3 };
  const screen = render(<AICallScreen />);
  expect(screen.getByTestId('call-accessibility-scroll')).toBeTruthy();
  expect(screen.getByLabelText('통화 종료')).toBeTruthy();
});
