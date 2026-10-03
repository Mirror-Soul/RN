import { act, renderHook, waitFor } from '@testing-library/react-native';
import { INTERVIEW_RECORDING_PRESET } from '@/src/constants/audio';
import { useInterviewSpeech } from './useInterviewSpeech';

let mockSequence = 0;
let mockPrepared = false;
const mockFiles = new Map<string, string>();
const mockRecorder = {
  uri: 'file:///initial.wav',
  prepareToRecordAsync: jest.fn(), record: jest.fn(), stop: jest.fn(),
  getStatus: jest.fn(() => ({ durationMillis: 18000 })),
};
jest.mock('expo-audio', () => ({
  RecordingPresets: { HIGH_QUALITY: {} }, IOSOutputFormat: { LINEARPCM: 'lpcm' }, AudioQuality: { MAX: 127 },
  AudioModule: { getRecordingPermissionsAsync: jest.fn(async () => ({ granted: true, canAskAgain: true })) },
  setAudioModeAsync: jest.fn(async () => {}),
  useAudioRecorder: () => mockRecorder,
  useAudioRecorderState: () => ({ isRecording: false, durationMillis: 18000, metering: -20 }),
}));
jest.mock('expo-speech-recognition', () => ({
  ExpoSpeechRecognitionModule: { getPermissionsAsync: jest.fn(async () => ({ granted: true, canAskAgain: true })) },
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockSequence = 0;
  mockPrepared = false;
  mockFiles.clear();
  mockRecorder.uri = 'file:///initial.wav';
  // Match installed expo-audio iOS behavior: only explicit options replace the recorder URL.
  mockRecorder.prepareToRecordAsync.mockImplementation(async options => {
    if (mockPrepared) throw new Error('recorder already prepared');
    mockPrepared = true;
    if (options) mockRecorder.uri = `file:///take-${++mockSequence}.wav`;
    mockFiles.set(mockRecorder.uri, '');
  });
  mockRecorder.record.mockImplementation(() => { mockFiles.set(mockRecorder.uri, `spoken take ${mockSequence}`); });
  mockRecorder.stop.mockImplementation(async () => { mockPrepared = false; });
});

it('releases a prepared recorder after record fails and preserves the previous file for retry', async () => {
  const { result } = renderHook(() => useInterviewSpeech());
  await waitFor(() => expect(result.current.hasPermission).toBe(true));
  await act(async () => { await result.current.startRecording(); await result.current.stopRecording(); });
  const previousUri = mockRecorder.uri;
  mockRecorder.record.mockImplementationOnce(() => { throw new Error('record failed'); });
  await act(async () => { await expect(result.current.startRecording()).rejects.toThrow('record failed'); });
  expect(mockFiles.get(previousUri)).toBe('spoken take 1');
  expect(mockRecorder.stop).toHaveBeenCalledTimes(2);
  await act(async () => { await result.current.startRecording(); await result.current.stopRecording(); });
  expect(mockFiles.get(previousUri)).toBe('spoken take 1');
});

it('records consecutive takes into different files without changing the previous audio', async () => {
  const { result } = renderHook(() => useInterviewSpeech());
  await waitFor(() => expect(result.current.hasPermission).toBe(true));
  let first!: Awaited<ReturnType<typeof result.current.stopRecording>>;
  let second!: typeof first;
  await act(async () => { await result.current.startRecording(); first = await result.current.stopRecording(); });
  await act(async () => { await result.current.startRecording(); second = await result.current.stopRecording(); });
  expect(second.uri).not.toBe(first.uri);
  expect(mockFiles.get(first.uri!)).toBe('spoken take 1');
  expect(mockFiles.get(second.uri!)).toBe('spoken take 2');
  expect(mockRecorder.prepareToRecordAsync).toHaveBeenCalledWith({ ...INTERVIEW_RECORDING_PRESET, isMeteringEnabled: true });
  expect(first.durationMs).toBe(18000);
});
