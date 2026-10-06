import { act, renderHook, waitFor } from '@testing-library/react-native';
import { Platform } from 'react-native';
import InCallManager from 'react-native-incall-manager';
import { setAudioModeAsync } from 'expo-audio';
import { initiateCall, endCall, setCallInProgress } from '../services/callService';
import { getPresignedUrl } from '../services/fileService';
import { uploadFileToS3 } from '../services/s3Service';
import { useAICallFlow } from './useAICallFlow';

const mockRecorder = { prepareToRecordAsync: jest.fn(), record: jest.fn(), stop: jest.fn(), pause: jest.fn(), uri: null as string | null };
const mockRTC = { remoteStream: null, localCameraStream: null, iceConnectionState: 'new', onLocalIceCandidateCb: { current: null }, initialize: jest.fn(), enableCamera: jest.fn(), disableCamera: jest.fn(), createOffer: jest.fn(), createAnswer: jest.fn(), applyAnswer: jest.fn(), applyOffer: jest.fn(), applyIceCandidate: jest.fn(), close: jest.fn(), setMicrophoneMuted: jest.fn() };
jest.mock('./useWebRTCCall', () => ({ useWebRTCCall: () => mockRTC }));
jest.mock('@/src/features/voice-audio/hooks/useRemoteAudioVolume', () => ({ useRemoteAudioVolume: jest.fn() }));
jest.mock('../store/useAuthStore', () => ({ useAuthStore: Object.assign(() => ({ userUuid: 'me' }), { getState: () => ({ userUuid: 'me', isLoggedIn: true }) }) }));
jest.mock('react-native-incall-manager', () => ({ start: jest.fn(), stop: jest.fn(), setForceSpeakerphoneOn: jest.fn(), setMicrophoneMute: jest.fn() }));
jest.mock('expo-audio', () => ({ useAudioRecorder: () => mockRecorder, RecordingPresets: { HIGH_QUALITY: {} }, AudioModule: { requestRecordingPermissionsAsync: jest.fn(async () => ({ granted: true })), getRecordingPermissionsAsync: jest.fn(async () => ({ granted: true })) }, setAudioModeAsync: jest.fn(async () => {}) }));
jest.mock('../services/callService', () => ({ initiateCall: jest.fn(async () => ({ isSuccess: true, result: { callId: 1, roomId: 'room', callerSignalId: 'caller', aiSignalId: 'ai', mediaType: 'VIDEO' } })), setCallInProgress: jest.fn(async () => {}), endCall: jest.fn(async () => ({ isSuccess: true, result: { callId: 1, status: 'COMPLETED' } })) }));
jest.mock('../services/fileService', () => ({ getPresignedUrl: jest.fn() }));
jest.mock('../services/s3Service', () => ({ uploadFileToS3: jest.fn() }));
jest.mock('../services/queryClient', () => ({ queryClient: { invalidateQueries: jest.fn() } }));
jest.mock('../utils/logger', () => ({ logger: { debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn() } }));

const originalWS = global.WebSocket;
let socket: { readyState: number; send: jest.Mock; close: jest.Mock; onmessage: (event: { data: string }) => Promise<void> };
beforeEach(() => {
  jest.clearAllMocks();
  process.env.EXPO_PUBLIC_API_BASE_URL = 'https://example.invalid';
  mockRTC.iceConnectionState = 'new';
  mockRecorder.uri = null;
  (endCall as jest.Mock).mockResolvedValue({ isSuccess: true, result: { callId: 1, status: 'COMPLETED', durationSec: 1, remainingTalkTime: 100 } });
  (setCallInProgress as jest.Mock).mockResolvedValue({ isSuccess: true });
  mockRTC.initialize.mockResolvedValue(undefined);
  mockRTC.createOffer.mockResolvedValue({ sdp: 'sdp' });
  mockRecorder.prepareToRecordAsync.mockResolvedValue(undefined);
  mockRecorder.stop.mockResolvedValue(undefined);
  global.WebSocket = Object.assign(jest.fn(() => {
    socket = { readyState: 1, send: jest.fn(), close: jest.fn(), onmessage: jest.fn() };
    return socket;
  }), { OPEN: 1 }) as unknown as typeof WebSocket;
});
afterEach(() => { global.WebSocket = originalWS; jest.restoreAllMocks(); });

async function connect() {
  const hook = renderHook(() => useAICallFlow());
  await act(async () => { await hook.result.current.startCall(); });
  await act(async () => { await socket.onmessage({ data: JSON.stringify({ type: 'CALL_ACCEPT' }) }); });
  mockRTC.iceConnectionState = 'connected';
  hook.rerender({});
  await waitFor(() => expect(mockRecorder.prepareToRecordAsync).toHaveBeenCalledTimes(1));
  return hook;
}

it.each(['ios', 'android'] as const)('restores automatic video routing after recorder preparation on %s', async os => {
  jest.replaceProperty(Platform, 'OS', os);
  const hook = await connect();
  await waitFor(() => expect(InCallManager.setForceSpeakerphoneOn).toHaveBeenCalledWith(null));
  expect(InCallManager.start).toHaveBeenCalledWith({ media: 'video', auto: true });
  expect(mockRecorder.record).toHaveBeenCalledTimes(1);
  expect(mockRecorder.prepareToRecordAsync.mock.invocationCallOrder[0]).toBeLessThan((InCallManager.setForceSpeakerphoneOn as jest.Mock).mock.invocationCallOrder[0]);
  expect(setAudioModeAsync).toHaveBeenCalledTimes(os === 'ios' ? 1 : 0);
  hook.unmount();
});

it('preserves a speaker choice made while recording preparation is pending', async () => {
  let finish!: () => void;
  mockRecorder.prepareToRecordAsync.mockImplementationOnce(() => new Promise<void>(resolve => { finish = resolve; }));
  const hook = await connect();
  act(() => hook.result.current.toggleSpeaker());
  await act(async () => { finish(); });
  expect(InCallManager.setForceSpeakerphoneOn).toHaveBeenLastCalledWith(true);
  act(() => hook.result.current.toggleSpeaker());
  expect(InCallManager.setForceSpeakerphoneOn).toHaveBeenLastCalledWith(null);
  expect(hook.result.current.isSpeakerOn).toBe(false);
  hook.unmount();
});

it('restores the call route even if recorder preparation fails', async () => {
  mockRecorder.prepareToRecordAsync.mockRejectedValueOnce(new Error('recording unavailable'));
  const hook = await connect();
  await waitFor(() => expect(InCallManager.setForceSpeakerphoneOn).toHaveBeenCalledWith(null));
  expect(hook.result.current.callStatus).toBe('connected');
  expect(mockRecorder.record).not.toHaveBeenCalled();
  hook.unmount();
});

it('does not start recording or reapply a route after the call ends during preparation', async () => {
  let finish!: () => void;
  mockRecorder.prepareToRecordAsync.mockImplementationOnce(() => new Promise<void>(resolve => { finish = resolve; }));
  const hook = await connect();
  await act(async () => { await hook.result.current.hangUp(); });
  await act(async () => { finish(); });
  expect(mockRecorder.record).not.toHaveBeenCalled();
  expect(mockRecorder.stop).toHaveBeenCalled();
  expect(InCallManager.setForceSpeakerphoneOn).not.toHaveBeenCalled();
  expect(hook.result.current.callStatus).toBe('ended');
  hook.unmount();
});


it('mutes both WebRTC transmission and the independent recording, then resumes both', async () => {
  const hook = await connect();
  act(() => hook.result.current.toggleMute());
  expect(mockRTC.setMicrophoneMuted).toHaveBeenLastCalledWith(true);
  expect(mockRecorder.pause).toHaveBeenCalledTimes(1);
  expect(hook.result.current.isMuted).toBe(true);
  expect(InCallManager.setMicrophoneMute).not.toHaveBeenCalled();
  act(() => hook.result.current.toggleMute());
  expect(mockRTC.setMicrophoneMuted).toHaveBeenLastCalledWith(false);
  expect(mockRecorder.record).toHaveBeenCalledTimes(2);
  expect(hook.result.current.isMuted).toBe(false);
});

it('does not start a recording if mute is chosen while preparation is pending', async () => {
  let finish!: () => void;
  mockRecorder.prepareToRecordAsync.mockImplementationOnce(() => new Promise<void>(resolve => { finish = resolve; }));
  const hook = await connect();
  act(() => hook.result.current.toggleMute());
  await act(async () => { finish(); });
  expect(mockRecorder.record).not.toHaveBeenCalled();
  act(() => hook.result.current.toggleMute());
  expect(mockRecorder.record).toHaveBeenCalledTimes(1);
});

it('closes transport before upload and never finalizes the same call twice', async () => {
  let finish!: () => void;
  mockRecorder.uri = 'file:///call.m4a';
  (getPresignedUrl as jest.Mock).mockResolvedValue({ result: { presignedUrl: 'https://upload.invalid', fileUrl: 'https://file.invalid' } });
  (uploadFileToS3 as jest.Mock).mockImplementationOnce(() => new Promise<void>(resolve => { finish = resolve; }));
  const hook = await connect();
  let stopped!: Promise<void>;
  act(() => { stopped = hook.result.current.hangUp(); void hook.result.current.hangUp(); });
  await waitFor(() => expect(uploadFileToS3).toHaveBeenCalledTimes(1));
  expect(mockRTC.close).toHaveBeenCalled();
  expect(InCallManager.stop).toHaveBeenCalled();
  expect(endCall).not.toHaveBeenCalled();
  expect(getPresignedUrl).toHaveBeenCalledWith(expect.objectContaining({ fileName: 'call-recording.m4a', contentType: 'audio/mp4' }));
  await act(async () => { finish(); await stopped; });
  expect(endCall).toHaveBeenCalledTimes(1);
});

it('retains failed server finalization and retries only that call instead of creating a new room', async () => {
  (endCall as jest.Mock).mockRejectedValueOnce(new Error('offline'));
  const hook = await connect();
  await act(async () => { await hook.result.current.hangUp(); });
  expect(hook.result.current.canRetryEnd).toBe(true);
  expect(hook.result.current.canRetry).toBe(false);
  const starts = (initiateCall as jest.Mock).mock.calls.length;
  await act(async () => { await hook.result.current.startCall(); });
  expect(initiateCall).toHaveBeenCalledTimes(starts);
  await act(async () => { await hook.result.current.hangUp(); });
  expect(endCall).toHaveBeenCalledTimes(2);
  expect(hook.result.current.error).toBeNull();
});

it('cleans the server room when AI rejects the invite and explains readiness instead of rejection', async () => {
  const hook = renderHook(() => useAICallFlow());
  await act(async () => { await hook.result.current.startCall(); });
  await act(async () => { await socket.onmessage({ data: JSON.stringify({ type: 'CALL_REJECT', data: { callId: 1, reason: 'CLONE_NOT_READY' } }) }); });
  await waitFor(() => expect(hook.result.current.callStatus).toBe('ended'));
  expect(endCall).toHaveBeenCalledTimes(1);
  expect(hook.result.current.error).toContain('아직 통화 준비 중');
  expect(hook.result.current.canRetry).toBe(true);
});

it('closes a late-created room after cancellation without opening a socket', async () => {
  let finish!: (value: object) => void;
  const result = { isSuccess: true, result: { callId: 77, roomId: 'late', callerSignalId: 'caller', aiSignalId: 'ai', mediaType: 'VIDEO' } };
  (initiateCall as jest.Mock).mockImplementationOnce(() => new Promise(resolve => { finish = resolve; }));
  const hook = renderHook(() => useAICallFlow());
  let started!: Promise<void>;
  act(() => { started = hook.result.current.startCall(); });
  await waitFor(() => expect(initiateCall).toHaveBeenCalled());
  await act(async () => { await hook.result.current.hangUp(); });
  await act(async () => { finish(result); await started; });
  expect(endCall).toHaveBeenCalledWith(77, '');
  expect(global.WebSocket).not.toHaveBeenCalled();
});

it('finalizes on a signaling close instead of leaving the UI connected', async () => {
  const hook = await connect();
  const closed = (socket as unknown as { onclose: () => void }).onclose;
  await act(async () => { closed(); });
  await waitFor(() => expect(hook.result.current.callStatus).toBe('ended'));
  expect(hook.result.current.error).toContain('연결이 끊어졌어요');
  expect(endCall).toHaveBeenCalledTimes(1);
});


it('discards a recording when pausing for mute fails', async () => {
  mockRecorder.uri = 'file:///private.m4a';
  mockRecorder.pause.mockImplementationOnce(() => { throw new Error('pause failed'); });
  const hook = await connect();
  act(() => hook.result.current.toggleMute());
  await waitFor(() => expect(hook.result.current.callStatus).toBe('ended'));
  expect(mockRTC.setMicrophoneMuted).toHaveBeenCalledWith(true);
  expect(getPresignedUrl).not.toHaveBeenCalled();
  expect(hook.result.current.error).toContain('마이크 설정');
});

it('allows a brief ICE disconnect to recover without creating another call', async () => {
  jest.useFakeTimers();
  const hook = await connect();
  mockRTC.iceConnectionState = 'disconnected';
  hook.rerender({});
  expect(hook.result.current.callStatus).toBe('reconnecting');
  act(() => { jest.advanceTimersByTime(4000); });
  mockRTC.iceConnectionState = 'connected';
  hook.rerender({});
  expect(hook.result.current.callStatus).toBe('connected');
  await act(async () => { jest.advanceTimersByTime(2000); });
  expect(endCall).not.toHaveBeenCalled();
  expect(initiateCall).toHaveBeenCalledTimes(1);
  await act(async () => { await hook.result.current.hangUp(); });
  hook.unmount();
  act(() => jest.runAllTicks());
  jest.useRealTimers();
});

it('finalizes a room that never completes signaling JOIN', async () => {
  jest.useFakeTimers();
  const hook = renderHook(() => useAICallFlow());
  await act(async () => { await hook.result.current.startCall(); });
  await act(async () => { jest.advanceTimersByTime(11000); });
  expect(endCall).toHaveBeenCalledTimes(1);
  expect(hook.result.current.callStatus).toBe('ended');
  expect(hook.result.current.error).toContain('연결을 시작하지 못했어요');
  hook.unmount();
  act(() => jest.runAllTicks());
  jest.useRealTimers();
});
