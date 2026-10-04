import { act, renderHook, waitFor } from '@testing-library/react-native';
import { Platform } from 'react-native';
import InCallManager from 'react-native-incall-manager';
import { setAudioModeAsync } from 'expo-audio';
import { useAICallFlow } from './useAICallFlow';

const mockRecorder = { prepareToRecordAsync: jest.fn(), record: jest.fn(), stop: jest.fn(), uri: null };
const mockRTC = { remoteStream: null, localCameraStream: null, iceConnectionState: 'new', onLocalIceCandidateCb: { current: null }, initialize: jest.fn(), enableCamera: jest.fn(), disableCamera: jest.fn(), createOffer: jest.fn(), createAnswer: jest.fn(), applyAnswer: jest.fn(), applyOffer: jest.fn(), applyIceCandidate: jest.fn(), close: jest.fn() };
jest.mock('./useWebRTCCall', () => ({ useWebRTCCall: () => mockRTC }));
jest.mock('@/src/features/voice-audio/hooks/useRemoteAudioVolume', () => ({ useRemoteAudioVolume: jest.fn() }));
jest.mock('../store/useAuthStore', () => ({ useAuthStore: () => ({ userUuid: 'me' }) }));
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
  mockRTC.iceConnectionState = 'new';
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
