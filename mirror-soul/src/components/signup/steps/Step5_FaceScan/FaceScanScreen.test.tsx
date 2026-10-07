import React from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';
import FaceCaptureScreen from './FaceCaptureScreen';
import FaceScanScreen from '@/app/signup/face-scan';

const mockRouter = { replace: jest.fn(), back: jest.fn(), dismissTo: jest.fn(), canGoBack: jest.fn(() => true) };
const mockScan = {
  cameraRef: { current: null }, phase: 'idle', videoUri: null as string | null, error: null,
  cameraReady: false, matching: false, feedback: '얼굴을 맞춰주세요.', countdown: 3, stageProgress: 0,
  captureId: 1, currentDirectionIndex: 0, currentDirection: { label: '정면', guideMessage: '정면을 봐주세요.' },
  startScan: jest.fn(async () => {}), cancelScan: jest.fn(), beginCountdown: jest.fn(),
  handleFaceDetection: jest.fn(), setPreviewSize: jest.fn(), onCameraStarted: jest.fn(), onCameraError: jest.fn(),
};
const mockUpload = { uploadFaceVideo: jest.fn(), isUploading: false, error: null as string | null, stage: 'idle', progress: null as number | null, requiresLogin: false, clearError: jest.fn() };
const mockAuth = { userUuid: 'me', isLoggedIn: true, updateUserStatus: jest.fn(async () => {}), logout: jest.fn(async () => {}) };
jest.mock('expo-router', () => ({ useRouter: () => mockRouter }));
jest.mock('react-native-safe-area-context', () => ({ SafeAreaView: jest.requireActual('react-native').View }));
jest.mock('react-native-vision-camera', () => ({ useCameraDevice: () => ({ id: 'front' }), useCameraFormat: () => ({ videoWidth: 1280, videoHeight: 960, minFps: 1, maxFps: 30 }) }));
jest.mock('@/src/components/signup/steps/Step5_FaceScan/components/FaceCameraView', () => ({ __esModule: true, default: () => null }));
jest.mock('@/src/components/signup/steps/Step5_FaceScan/components/FaceGuideOverlay', () => ({ __esModule: true, default: () => null }));
jest.mock('@/src/components/signup/steps/Step5_FaceScan/hooks/useFaceScan', () => ({ useFaceScan: () => mockScan }));
jest.mock('@/src/components/signup/steps/Step5_FaceScan/hooks/useFaceProcessor', () => ({ useFaceProcessor: () => ({ frameProcessor: undefined }) }));
jest.mock('@/src/components/signup/steps/Step5_FaceScan/hooks/useFaceScanUpload', () => ({ useFaceScanUpload: () => mockUpload }));
jest.mock('@/src/store/useAuthStore', () => ({ useAuthStore: { getState: () => mockAuth, subscribe: () => jest.fn() } }));
jest.mock('@/src/hooks/useThemeColors', () => ({ useThemeColors: () => ({ colors: jest.requireActual('@/src/constants/theme').lightTheme }) }));
jest.mock('@expo/vector-icons', () => ({ Feather: () => null }));
beforeEach(() => {
  jest.clearAllMocks(); mockRouter.canGoBack.mockReturnValue(true); mockScan.phase = 'idle'; mockScan.videoUri = null;
  mockUpload.error = null; mockUpload.isUploading = false; mockUpload.requiresLogin = false;
  mockAuth.userUuid = 'me'; mockAuth.isLoggedIn = true;
  mockUpload.uploadFaceVideo.mockResolvedValue(true);
});
it('opens a camera preview before recording', () => {
  const view = render(<FaceScanScreen />);
  fireEvent.press(view.getByText('카메라 열기'));
  expect(mockScan.startScan).toHaveBeenCalledTimes(1);
  expect(mockUpload.uploadFaceVideo).not.toHaveBeenCalled();
});
it('does not automatically register a finished recording and waits for confirmation', async () => {
  mockScan.phase = 'completed'; mockScan.videoUri = 'file:///recording.mp4';
  const view = render(<FaceScanScreen />);
  expect(mockUpload.uploadFaceVideo).not.toHaveBeenCalled();
  expect(mockAuth.updateUserStatus).not.toHaveBeenCalled();
  await act(async () => fireEvent.press(view.getByText('영상 등록하기')));
  expect(mockUpload.uploadFaceVideo).toHaveBeenCalledWith(mockScan.videoUri);
  expect(view.getByText('트윈을 준비하고 있어요')).toBeTruthy();
  await act(async () => fireEvent.press(view.getByText('상대 둘러보기')));
  expect(mockAuth.updateUserStatus).toHaveBeenCalledWith('ACTIVE');
  expect(mockRouter.replace).toHaveBeenCalledWith('/(main)');
});
it('keeps the review screen after a failed registration, allowing a retry', async () => {
  mockScan.phase = 'completed'; mockScan.videoUri = 'file:///recording.mp4';
  mockUpload.uploadFaceVideo.mockRejectedValue(new Error('offline'));
  const view = render(<FaceScanScreen />);
  await act(async () => fireEvent.press(view.getByText('영상 등록하기')));
  expect(view.getByText('다시 촬영')).toBeTruthy();
  expect(mockAuth.updateUserStatus).not.toHaveBeenCalled();
  expect(mockRouter.replace).not.toHaveBeenCalled();
});
it('does not mark the next account as registered after a late response', async () => {
  mockScan.phase = 'completed'; mockScan.videoUri = 'file:///recording.mp4';
  mockUpload.uploadFaceVideo.mockImplementation(async () => { mockAuth.userUuid = 'other'; return true; });
  const view = render(<FaceScanScreen />);
  await act(async () => fireEvent.press(view.getByText('영상 등록하기')));
  expect(view.queryByText('상대 둘러보기')).toBeNull();
  expect(mockAuth.updateUserStatus).not.toHaveBeenCalled();
});
it('offers login recovery instead of treating a forbidden response as completion', async () => {
  mockScan.phase = 'completed'; mockScan.videoUri = 'file:///recording.mp4'; mockUpload.requiresLogin = true;
  const view = render(<FaceScanScreen />);
  await act(async () => fireEvent.press(view.getByText('다시 로그인하여 확인')));
  expect(mockAuth.logout).toHaveBeenCalledTimes(1);
  expect(mockRouter.replace).toHaveBeenCalledWith('/login');
  expect(mockAuth.updateUserStatus).not.toHaveBeenCalled();
});

it('reuses signup capture for a face update, waits for consent, and reports job submission only', async () => {
  mockScan.phase = 'completed'; mockScan.videoUri = 'file:///recording.mp4';
  const registered = jest.fn();
  const view = render(<FaceCaptureScreen mode="update" onRegistered={registered} />);
  expect(view.getByText('트윈의 얼굴 다시 담기')).toBeTruthy();
  expect(mockUpload.uploadFaceVideo).not.toHaveBeenCalled();
  await act(async () => fireEvent.press(view.getByText('얼굴 학습 요청하기')));
  expect(mockUpload.uploadFaceVideo).toHaveBeenCalledWith('file:///recording.mp4');
  expect(view.getByText('얼굴 영상을 보냈어요')).toBeTruthy();
  expect(view.queryByText('학습 완료')).toBeNull();
  expect(registered).toHaveBeenCalledTimes(1);
  await act(async () => fireEvent.press(view.getByText('성장으로 돌아가기')));
  expect(mockAuth.updateUserStatus).not.toHaveBeenCalled();
  expect(mockRouter.back).toHaveBeenCalledTimes(1);
  expect(mockRouter.replace).not.toHaveBeenCalled();
});

it('returns from face update to the existing growth screen once despite repeated back taps', () => {
  const view = render(<FaceCaptureScreen mode="update" />);
  fireEvent.press(view.getByLabelText('뒤로가기'));
  fireEvent.press(view.getByLabelText('뒤로가기'));
  expect(mockRouter.back).toHaveBeenCalledTimes(1);
  expect(mockRouter.replace).not.toHaveBeenCalled();
});
it('recovers a face update opened directly without a previous screen', () => {
  mockRouter.canGoBack.mockReturnValue(false);
  const view = render(<FaceCaptureScreen mode="update" />);
  fireEvent.press(view.getByLabelText('뒤로가기'));
  expect(mockRouter.dismissTo).toHaveBeenCalledWith('/(main)/grow');
  expect(mockRouter.back).not.toHaveBeenCalled();
});
it('keeps the face back button inactive during upload', () => {
  mockUpload.isUploading = true;
  const view = render(<FaceCaptureScreen mode="update" />);
  expect(view.getByLabelText('뒤로가기')).toBeDisabled();
  fireEvent.press(view.getByLabelText('뒤로가기'));
  expect(mockRouter.back).not.toHaveBeenCalled();
});
