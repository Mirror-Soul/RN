import { act, renderHook } from '@testing-library/react-native';
import { useWebRTCCall } from './useWebRTCCall';

const mockAudio = { kind: 'audio', enabled: true, stop: jest.fn() };
const mockStream = { getTracks: () => [mockAudio], getAudioTracks: () => [mockAudio] };
const mockGetMedia = jest.fn();
const mockPeers: { listeners: Record<string, (event: unknown) => void>; close: jest.Mock }[] = [];
jest.mock('react-native-webrtc', () => ({
  RTCPeerConnection: class {
    listeners: Record<string, (event: unknown) => void> = {};
    close = jest.fn();
    addTrack = jest.fn();
    addTransceiver = jest.fn();
    getSenders = () => [{ track: mockAudio }];
    constructor() { mockPeers.push(this); }
    addEventListener(type: string, listener: (event: unknown) => void) { this.listeners[type] = listener; }
  },
  mediaDevices: { getUserMedia: (...args: unknown[]) => mockGetMedia(...args) },
}));
jest.mock('../utils/logger', () => ({ logger: { debug: jest.fn(), error: jest.fn() } }));
beforeEach(() => { jest.clearAllMocks(); mockAudio.enabled = true; mockPeers.length = 0; mockGetMedia.mockResolvedValue(mockStream); });

it('disables the actual sending audio track and restores it without affecting camera transmission', async () => {
  const hook = renderHook(useWebRTCCall);
  await act(async () => { await hook.result.current.initialize(); });
  act(() => hook.result.current.setMicrophoneMuted(true));
  expect(mockAudio.enabled).toBe(false);
  act(() => hook.result.current.setMicrophoneMuted(false));
  expect(mockAudio.enabled).toBe(true);
});

it('stops a microphone stream that arrives after the call has been canceled', async () => {
  let finish!: (value: typeof mockStream) => void;
  mockGetMedia.mockImplementationOnce(() => new Promise(resolve => { finish = resolve; }));
  const hook = renderHook(useWebRTCCall);
  let pending!: Promise<void>;
  act(() => { pending = hook.result.current.initialize(); });
  act(() => hook.result.current.close());
  const canceled = expect(pending).rejects.toThrow('통화 연결이 취소');
  await act(async () => { finish(mockStream); await canceled; });
  expect(mockAudio.stop).toHaveBeenCalled();
});

it('ignores events from an old peer after a fresh connection has initialized', async () => {
  const hook = renderHook(useWebRTCCall);
  await act(async () => { await hook.result.current.initialize(); });
  const old = mockPeers[0];
  act(() => hook.result.current.close());
  await act(async () => { await hook.result.current.initialize(); });
  act(() => old.listeners.track({ streams: [{ stale: true }] }));
  expect(hook.result.current.remoteStream).toBeNull();
});
