import { act, renderHook } from '@testing-library/react-native';
import { ExpoSpeechRecognitionModule } from 'expo-speech-recognition';
import { useSTT } from './useSTT';

const mockListeners: Record<string, (event?: any) => void> = {};
jest.mock('expo-speech-recognition', () => ({
  ExpoSpeechRecognitionModule: { start: jest.fn(), stop: jest.fn(), abort: jest.fn(), getStateAsync: jest.fn() },
  useSpeechRecognitionEvent: (event: string, callback: (value?: any) => void) => {
    const React = jest.requireActual('react');
    React.useEffect(() => {
      mockListeners[event] = callback;
      return () => { delete mockListeners[event]; };
    }, [event, callback]);
  },
}));
const resultEvent = (transcript: string, isFinal = true) => ({ isFinal, results: [{ transcript }] });
beforeEach(() => {
  jest.clearAllMocks();
  (ExpoSpeechRecognitionModule.getStateAsync as jest.Mock).mockResolvedValue('inactive');
});
afterEach(() => jest.useRealTimers());

it('keeps final words when result and end arrive in the same native event batch', async () => {
  const { result } = renderHook(() => useSTT());
  await act(async () => { await result.current.startListening(); });
  let stopped!: Promise<string>;
  act(() => {
    mockListeners.result(resultEvent('상대 이야기를 먼저 듣고', false));
    stopped = result.current.stopListening();
    mockListeners.result(resultEvent('상대 이야기를 먼저 듣고 제 생각을 말해요'));
    mockListeners.end();
  });
  await expect(stopped).resolves.toBe('상대 이야기를 먼저 듣고 제 생각을 말해요');
  expect(result.current.transcript).toBe('상대 이야기를 먼저 듣고 제 생각을 말해요');
});

it('shares one stop operation across rapid consecutive taps', async () => {
  const { result } = renderHook(() => useSTT());
  await act(async () => { await result.current.startListening(); });
  let first!: Promise<string>;
  let second!: Promise<string>;
  act(() => { first = result.current.stopListening(); second = result.current.stopListening(); mockListeners.end(); });
  expect(first).toBe(second);
  expect(ExpoSpeechRecognitionModule.stop).toHaveBeenCalledTimes(1);
  await expect(first).resolves.toBe('');
});

it('retains partial text and a warning when recognition fails before end', async () => {
  const { result } = renderHook(() => useSTT());
  await act(async () => { await result.current.startListening(); });
  act(() => {
    mockListeners.result(resultEvent('감정이 가라앉으면', false));
    mockListeners.error({ error: 'network' });
    mockListeners.end();
  });
  expect(result.current.recognitionIssue).toContain('연결이 끊겼어요');
  await expect(result.current.stopListening()).resolves.toBe('감정이 가라앉으면');
});

it('ignores late text after a recording ends and is reset', async () => {
  const { result } = renderHook(() => useSTT());
  await act(async () => { await result.current.startListening(); });
  act(() => { mockListeners.result(resultEvent('이전 답변')); mockListeners.end(); result.current.resetTranscript(); mockListeners.result(resultEvent('늦게 온 답변')); });
  expect(result.current.transcript).toBe('');
});

it('times out safely and refuses a new session while native stop is still pending', async () => {
  jest.useFakeTimers();
  const { result } = renderHook(() => useSTT());
  await act(async () => { await result.current.startListening(); });
  let stopped!: Promise<string>;
  act(() => { mockListeners.result(resultEvent('내가 말한 내용', false)); stopped = result.current.stopListening(); });
  await act(async () => { await jest.advanceTimersByTimeAsync(2500); });
  await expect(stopped).resolves.toBe('내가 말한 내용');
  expect(result.current.recognitionIssue).toContain('끝부분');
  expect(ExpoSpeechRecognitionModule.abort).toHaveBeenCalledTimes(1);
  (ExpoSpeechRecognitionModule.getStateAsync as jest.Mock).mockResolvedValue('stopping');
  await act(async () => { await expect(result.current.startListening()).rejects.toThrow('정리하고'); });
  expect(ExpoSpeechRecognitionModule.start).toHaveBeenCalledTimes(1);
});
