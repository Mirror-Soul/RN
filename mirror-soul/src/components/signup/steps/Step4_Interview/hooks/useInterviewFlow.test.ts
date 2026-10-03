import { act, renderHook, waitFor } from '@testing-library/react-native';
import { AppState } from 'react-native';
import { useAuthStore } from '@/src/store/useAuthStore';
import { useInterviewFlow } from './useInterviewFlow';

const mockStartRecording = jest.fn();
const mockStopRecording = jest.fn();
const mockStartListening = jest.fn();
const mockStopListening = jest.fn();
const mockSave = jest.fn();
const mockFocus: { enter?: () => () => void; exit?: () => void } = {};
const mockSpeech = {
  startRecording: mockStartRecording, stopRecording: mockStopRecording,
  isRecording: false, recordingError: null, durationMs: 18000, metering: -20,
  hasPermission: true, canAskAgain: true, requestPermission: jest.fn(),
};
const mockSTT = {
  startListening: mockStartListening, stopListening: mockStopListening, resetTranscript: jest.fn(),
  transcript: '화면에 보이던 중간 문장', isListening: true, recognitionIssue: null,
  recognitionEnded: false, getRecognitionIssue: jest.fn(),
};
jest.mock('./useInterviewSpeech', () => ({ useInterviewSpeech: () => mockSpeech }));
jest.mock('@/src/hooks/useSTT', () => ({ useSTT: () => mockSTT }));
jest.mock('./useInterviewUpload', () => ({ useInterviewUpload: () => ({ saveAnswer: mockSave, stage: 'idle', uploadProgress: null }) }));
jest.mock('@/src/store/useAuthStore', () => ({ useAuthStore: { getState: jest.fn() } }));
jest.mock('expo-router', () => ({
  useFocusEffect: (callback: () => () => void) => {
    jest.requireActual('react').useEffect(() => {
      mockFocus.enter = callback;
      const exit = callback();
      mockFocus.exit = exit;
      return exit;
    }, [callback]);
  },
}));
const onSaved = jest.fn();
function setup() { return renderHook(() => useInterviewFlow(17, onSaved)); }
async function recorded(result: ReturnType<typeof setup>['result']) {
  await act(async () => { await result.current.beginRecording(); });
  await act(async () => { await result.current.finishRecording(); });
}
beforeEach(() => {
  jest.clearAllMocks();
  Object.defineProperty(AppState, 'currentState', { configurable: true, writable: true, value: 'active' });
  (useAuthStore.getState as jest.Mock).mockReturnValue({ isLoggedIn: true, userUuid: 'me' });
  mockStartRecording.mockResolvedValue(undefined);
  mockStartListening.mockResolvedValue(undefined);
  mockStopRecording.mockResolvedValue({ uri: 'file:///answer.wav', durationMs: 18000 });
  mockStopListening.mockResolvedValue('상대 이야기를 듣고 제 생각을 말해요. 감정적으로 말하지 않으려고요.');
  mockSTT.getRecognitionIssue.mockReturnValue(null);
  mockSTT.recognitionEnded = false;
  mockSave.mockResolvedValue(true);
  onSaved.mockResolvedValue(undefined);
});
afterEach(() => jest.restoreAllMocks());

it('finishes audio and recognition once, then requires a separate save', async () => {
  const { result } = setup();
  await act(async () => { await result.current.beginRecording(); });
  await act(async () => {
    const first = result.current.finishRecording();
    const second = result.current.finishRecording();
    await Promise.all([first, second]);
  });
  expect(mockStopListening).toHaveBeenCalledTimes(1);
  expect(mockStopRecording).toHaveBeenCalledTimes(1);
  expect(result.current.phase).toBe('review');
  expect(result.current.draft?.transcript).toContain('감정적으로');
  expect(mockSave).not.toHaveBeenCalled();
  await act(async () => { await result.current.saveAnswer(); });
  expect(onSaved).toHaveBeenCalledTimes(1);
});

it('keeps the draft and corrected text after a save failure', async () => {
  mockSave.mockRejectedValueOnce({ code: 'NETWORK_ERROR' }).mockResolvedValueOnce(true);
  const { result } = setup();
  await recorded(result);
  act(() => result.current.changeText('제가 실제로 말한 내용을 수정했어요.'));
  await act(async () => { await result.current.saveAnswer(); });
  expect(result.current.phase).toBe('review');
  expect(result.current.draft?.uri).toBe('file:///answer.wav');
  expect(result.current.draft?.transcript).toBe('제가 실제로 말한 내용을 수정했어요.');
  expect(onSaved).not.toHaveBeenCalled();
  await act(async () => { await result.current.saveAnswer(); });
  expect(mockSave).toHaveBeenLastCalledWith(expect.objectContaining({ answerText: '제가 실제로 말한 내용을 수정했어요.' }));
});

it('recommends recording again on recognition issues but allows confirmed text to be saved', async () => {
  mockSTT.getRecognitionIssue.mockReturnValue('일부 말을 인식하지 못했어요.');
  const { result } = setup();
  await recorded(result);
  expect(result.current.draft?.notice).toContain('인식하지');
  await act(async () => { await result.current.saveAnswer(); });
  expect(onSaved).toHaveBeenCalledTimes(1);
});

it('keeps the previous answer if rerecording cannot start', async () => {
  const { result } = setup();
  await recorded(result);
  mockStartListening.mockRejectedValueOnce(new Error('인식을 시작하지 못했어요.'));
  await act(async () => { await result.current.beginRecording(); });
  expect(result.current.phase).toBe('review');
  expect(result.current.draft?.uri).toBe('file:///answer.wav');
});

it('prevents edits and repeated save while the original snapshot is saving', async () => {
  let finish!: (value: boolean) => void;
  mockSave.mockImplementation(() => new Promise<boolean>(resolve => { finish = resolve; }));
  const { result } = setup();
  await recorded(result);
  let saving!: Promise<void>;
  await act(async () => {
    saving = result.current.saveAnswer();
    result.current.changeText('저장 중 바뀐 문장');
    await result.current.saveAnswer();
  });
  expect(mockSave).toHaveBeenCalledTimes(1);
  expect(mockSave.mock.calls[0][0].answerText).not.toContain('저장 중');
  await act(async () => { finish(true); await saving; });
});

it('does not claim completion when the server rejects the onboarding state', async () => {
  mockSave.mockRejectedValue({ code: 'AUTH_4030' });
  const { result } = setup();
  await recorded(result);
  await act(async () => { await result.current.saveAnswer(); });
  expect(result.current.needsLoginCheck).toBe(true);
  expect(result.current.draft).not.toBeNull();
  expect(onSaved).not.toHaveBeenCalled();
  await act(async () => { await result.current.saveAnswer(); await result.current.beginRecording(); });
  expect(mockSave).toHaveBeenCalledTimes(1);
  expect(result.current.needsLoginCheck).toBe(true);
});

it('ends file recording when recognition ends early and preserves its answer for review', async () => {
  const { result, rerender } = setup();
  await act(async () => { await result.current.beginRecording(); });
  mockSTT.recognitionEnded = true;
  rerender({});
  await waitFor(() => expect(result.current.phase).toBe('review'));
  expect(result.current.draft?.notice).toContain('먼저 끝났어요');
  expect(mockSave).not.toHaveBeenCalled();
});

it('advances once on return if the answer finished saving while the screen was away', async () => {
  let finish!: (value: boolean) => void;
  mockSave.mockImplementation(() => new Promise<boolean>(resolve => { finish = resolve; }));
  const { result } = setup();
  await recorded(result);
  let saving!: Promise<void>;
  await act(async () => { saving = result.current.saveAnswer(); mockFocus.exit?.(); });
  await act(async () => { finish(true); await saving; });
  expect(onSaved).not.toHaveBeenCalled();
  await act(async () => { mockFocus.enter?.(); });
  expect(onSaved).toHaveBeenCalledTimes(1);
  await act(async () => { mockFocus.enter?.(); });
  expect(onSaved).toHaveBeenCalledTimes(1);
});
