import { act, renderHook } from '@testing-library/react-native';
import { AppState, type AppStateStatus } from 'react-native';
import type { Camera, RecordVideoOptions, VideoFile } from 'react-native-vision-camera';
import type { Face } from 'react-native-vision-camera-face-detector';
import * as FileSystem from 'expo-file-system/legacy';
import { useAuthStore } from '@/src/store/useAuthStore';
import { useFaceScan } from './useFaceScan';

jest.mock('react-native-vision-camera', () => ({ Camera: { requestCameraPermission: jest.fn(async () => 'granted') } }));
jest.mock('expo-file-system/legacy', () => ({ deleteAsync: jest.fn(async () => {}) }));
jest.mock('@/src/store/useAuthStore', () => ({ useAuthStore: { getState: jest.fn(), subscribe: jest.fn() } }));
let options: RecordVideoOptions;
let appChange: (state: AppStateStatus) => void;
let sessionChange: (state: { userUuid: string | null; isLoggedIn: boolean }) => void;
const camera = { startRecording: jest.fn(), stopRecording: jest.fn(), cancelRecording: jest.fn() };
const face = { bounds: { x: 90, y: 62, width: 120, height: 163 }, yawAngle: 0, pitchAngle: 0, rollAngle: 0 } as Face;
beforeEach(() => {
  jest.clearAllMocks(); jest.useFakeTimers();
  jest.spyOn(AppState, 'addEventListener').mockImplementation((_, listener) => { appChange = listener; return { remove: jest.fn() }; });
  (useAuthStore.getState as jest.Mock).mockReturnValue({ userUuid: 'me', isLoggedIn: true });
  (useAuthStore.subscribe as jest.Mock).mockImplementation(fn => { sessionChange = fn; return jest.fn(); });
  camera.startRecording.mockImplementation(value => { options = value; });
  camera.stopRecording.mockResolvedValue(undefined);
  camera.cancelRecording.mockResolvedValue(undefined);
});
afterEach(() => { jest.restoreAllMocks(); jest.useRealTimers(); });
function setup() {
  const hook = renderHook(() => useFaceScan());
  // Native ref attachment is simulated, not a device recording.
  (hook.result.current.cameraRef as { current: unknown }).current = camera as unknown as Camera;
  act(() => hook.result.current.setPreviewSize({ width: 300, height: 400 }));
  return hook;
}
async function prepare(hook: ReturnType<typeof setup>) {
  await act(async () => { await hook.result.current.startScan(); });
  act(() => hook.result.current.onCameraStarted());
  act(() => hook.result.current.handleFaceDetection([face]));
}
function frames(hook: ReturnType<typeof setup>, ms: number, yaw = 0) {
  for (let i = 0; i < ms / 200; i++) act(() => { jest.advanceTimersByTime(200); hook.result.current.handleFaceDetection([{ ...face, yawAngle: yaw }]); });
}
async function record(hook: ReturnType<typeof setup>) {
  await prepare(hook);
  act(() => hook.result.current.beginCountdown());
  frames(hook, 3000);
  expect(hook.result.current.phase).toBe('scanning');
}
it('previews before recording and cancels the countdown when the face disappears', async () => {
  const hook = setup(); await prepare(hook);
  expect(hook.result.current.phase).toBe('positioning');
  expect(camera.startRecording).not.toHaveBeenCalled();
  act(() => hook.result.current.beginCountdown());
  act(() => { hook.result.current.handleFaceDetection([]); jest.advanceTimersByTime(100); });
  expect(hook.result.current.phase).toBe('positioning');
  expect(camera.startRecording).not.toHaveBeenCalled();
});
it('never completes a segment when frames stop arriving', async () => {
  const hook = setup(); await record(hook);
  frames(hook, 1000);
  const progress = hook.result.current.stageProgress;
  act(() => jest.advanceTimersByTime(10000));
  expect(hook.result.current.currentDirectionIndex).toBe(0);
  expect(hook.result.current.stageProgress).toBe(progress);
  expect(hook.result.current.matching).toBe(false);
  expect(camera.stopRecording).not.toHaveBeenCalled();
});
it('saves only after all guided segments and rejects an unexpected partial recording', async () => {
  const hook = setup(); await record(hook);
  const oldOptions = options;
  act(() => oldOptions.onRecordingFinished({ path: '/partial.mp4', duration: 22 } as VideoFile));
  expect(hook.result.current.phase).toBe('idle');
  expect(hook.result.current.videoUri).toBeNull();
  expect(FileSystem.deleteAsync).toHaveBeenCalledWith('file:///partial.mp4', expect.anything());
  await record(hook);
  const durations = [4200, 3200, 7200, 2200, 2200, 3200];
  for (let i = 0; i < durations.length; i++) frames(hook, durations[i], i === 3 ? 25 : i === 4 ? -25 : 0);
  expect(hook.result.current.phase).toBe('finalizing');
  expect(camera.stopRecording).toHaveBeenCalledTimes(1);
  act(() => options.onRecordingFinished({ path: '/complete.mp4', duration: 24 } as VideoFile));
  expect(hook.result.current.phase).toBe('completed');
  expect(hook.result.current.videoUri).toBe('file:///complete.mp4');
});
it('discards a cancelled recording even if the native success callback arrives later', async () => {
  const hook = setup(); await record(hook);
  const oldOptions = options;
  act(() => hook.result.current.cancelScan());
  act(() => oldOptions.onRecordingFinished({ path: '/cancelled.mp4', duration: 24 } as VideoFile));
  expect(hook.result.current.videoUri).toBeNull();
  expect(camera.cancelRecording).toHaveBeenCalledTimes(1);
  expect(FileSystem.deleteAsync).toHaveBeenCalledWith('file:///cancelled.mp4', expect.anything());
});
it.each(['inactive', 'background'] as AppStateStatus[])('interrupts capture when the app becomes %s', async state => {
  const hook = setup(); await record(hook);
  act(() => appChange(state));
  expect(hook.result.current.phase).toBe('idle');
  expect(camera.cancelRecording).toHaveBeenCalledTimes(1);
});
it('ignores stale camera callbacks after restarting', async () => {
  const hook = setup(); await prepare(hook);
  const stale = hook.result.current.onCameraError;
  act(() => hook.result.current.cancelScan());
  await act(async () => { await hook.result.current.startScan(); });
  act(() => stale());
  expect(hook.result.current.phase).toBe('positioning');
});
it('cleans up a recording when the account changes', async () => {
  const hook = setup(); await record(hook);
  act(() => sessionChange({ userUuid: 'other', isLoggedIn: true }));
  expect(hook.result.current.phase).toBe('idle');
  expect(hook.result.current.videoUri).toBeNull();
  expect(camera.cancelRecording).toHaveBeenCalled();
});
it('recovers from start exceptions and camera startup timeouts', async () => {
  const hook = setup();
  camera.startRecording.mockImplementationOnce(() => { throw new Error('camera busy'); });
  await prepare(hook);
  act(() => hook.result.current.beginCountdown()); frames(hook, 3000);
  expect(hook.result.current.phase).toBe('idle');
  expect(hook.result.current.error).toContain('시작하지 못했어요');
  await act(async () => { await hook.result.current.startScan(); });
  act(() => jest.advanceTimersByTime(15000));
  expect(hook.result.current.error).toContain('준비가 지연');
});
it('recovers from a stop failure without offering a partial video', async () => {
  const hook = setup(); await record(hook);
  camera.stopRecording.mockRejectedValueOnce(new Error('device interrupted'));
  for (const [ms, yaw] of [[4200, 0], [3200, 0], [7200, 0], [2200, 25], [2200, -25], [3200, 0]]) frames(hook, ms, yaw);
  await act(async () => {});
  expect(hook.result.current.phase).toBe('idle');
  expect(hook.result.current.videoUri).toBeNull();
  expect(camera.cancelRecording).toHaveBeenCalled();
});
it('recovers if the native finish callback never arrives', async () => {
  const hook = setup(); await record(hook);
  for (const [ms, yaw] of [[4200, 0], [3200, 0], [7200, 0], [2200, 25], [2200, -25], [3200, 0]]) frames(hook, ms, yaw);
  expect(hook.result.current.phase).toBe('finalizing');
  act(() => jest.advanceTimersByTime(10000));
  expect(hook.result.current.phase).toBe('idle');
  expect(hook.result.current.error).toContain('저장이 지연');
});
it('bounds the capture time even if the user never matches a direction', async () => {
  const hook = setup(); await record(hook);
  act(() => jest.advanceTimersByTime(60000));
  expect(hook.result.current.phase).toBe('idle');
  expect(hook.result.current.videoUri).toBeNull();
  expect(camera.cancelRecording).toHaveBeenCalledTimes(1);
});
it('cancels on unmount and does not revive the screen on a late callback', async () => {
  const hook = setup(); await record(hook);
  const oldOptions = options;
  hook.unmount();
  expect(camera.cancelRecording).toHaveBeenCalledTimes(1);
  act(() => oldOptions.onRecordingFinished({ path: '/unmounted.mp4', duration: 24 } as VideoFile));
  expect(FileSystem.deleteAsync).toHaveBeenCalledWith('file:///unmounted.mp4', expect.anything());
});
