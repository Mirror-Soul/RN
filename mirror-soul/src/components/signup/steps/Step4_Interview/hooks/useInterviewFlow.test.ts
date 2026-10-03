import { act, renderHook, waitFor } from '@testing-library/react-native';
import { AppState } from 'react-native';
import { useAuthStore } from '@/src/store/useAuthStore';
import { useInterviewFlow } from './useInterviewFlow';

const mockStartRecording = jest.fn();
const mockStopRecording = jest.fn();
const mockStartListening = jest.fn();
const mockStopListening = jest.fn();
const mockSave = jest.fn();
let mockSession: { isLoggedIn: boolean; userUuid: string; accessToken?: string } = { isLoggedIn: true, userUuid: 'me' };
let mockSessionListener: ((state: typeof mockSession) => void) | undefined;
let mockRecordingSequence = 0;
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
jest.mock('@/src/store/useAuthStore', () => ({ useAuthStore: { getState: jest.fn(), subscribe: jest.fn() } }));
jest.mock('expo-crypto', () => ({ randomUUID: () => `recording-${++mockRecordingSequence}` }));
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
  mockRecordingSequence = 0;
  mockSession = { isLoggedIn: true, userUuid: 'me' };
  (useAuthStore.getState as jest.Mock).mockImplementation(() => mockSession);
  (useAuthStore.subscribe as jest.Mock).mockImplementation(listener => {
    mockSessionListener = listener;
    return () => { mockSessionListener = undefined; };
  });
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
function changeSession(next: typeof mockSession) {
  mockSession = next;
  mockSessionListener?.(next);
}

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

it.each(['', '   '])('blocks editing and saving when the recording has no recognized speech (%j)', async recognized => {
  mockStopListening.mockResolvedValueOnce(recognized);
  const { result } = setup();
  await recorded(result);
  expect(result.current.phase).toBe('review');
  expect(result.current.draft?.uri).toBe('file:///answer.wav');
  expect(result.current.hasRecognizedSpeech).toBe(false);
  expect(result.current.canSaveAnswer).toBe(false);
  act(() => result.current.changeText('녹음하지 않고 직접 적은 답변'));
  expect(result.current.draft?.transcript).toBe('');
  await act(async () => { await result.current.saveAnswer(); });
  expect(mockSave).not.toHaveBeenCalled();
  expect(onSaved).not.toHaveBeenCalled();
});

it('does not use captions from an earlier take when recognition finalization fails', async () => {
  mockStopListening.mockRejectedValueOnce(new Error('인식 종료 실패'));
  const { result } = setup();
  await recorded(result);
  expect(result.current.draft?.recognizedTranscript).toBe('');
  expect(result.current.canSaveAnswer).toBe(false);
  act(() => result.current.changeText('입력만 한 문장'));
  await act(async () => { await result.current.saveAnswer(); });
  expect(mockSave).not.toHaveBeenCalled();
});

it('requires new recognized speech after a silent rerecording and recovers on a spoken take', async () => {
  const { result } = setup();
  await recorded(result);
  expect(result.current.canSaveAnswer).toBe(true);
  mockStopListening.mockResolvedValueOnce('');
  await recorded(result);
  expect(result.current.hasRecognizedSpeech).toBe(false);
  await act(async () => { await result.current.saveAnswer(); });
  expect(mockSave).not.toHaveBeenCalled();
  mockStopListening.mockResolvedValueOnce('저는 먼저 상대의 이야기를 들어요.');
  await recorded(result);
  expect(result.current.canSaveAnswer).toBe(true);
  await act(async () => { await result.current.saveAnswer(); });
  expect(mockSave).toHaveBeenCalledWith(expect.objectContaining({
    recordingId: 'recording-3', recognizedTranscript: '저는 먼저 상대의 이야기를 들어요.',
  }));
  expect(onSaved).toHaveBeenCalledTimes(1);
});

it('keeps the spoken original when corrected text is cleared and restored', async () => {
  const { result } = setup();
  await recorded(result);
  const original = result.current.draft?.recognizedTranscript;
  act(() => result.current.changeText(''));
  expect(result.current.hasRecognizedSpeech).toBe(true);
  expect(result.current.canSaveAnswer).toBe(false);
  await act(async () => { await result.current.saveAnswer(); });
  expect(mockSave).not.toHaveBeenCalled();
  act(() => result.current.changeText('인식된 내용의 오타를 고쳤어요.'));
  expect(result.current.draft?.recognizedTranscript).toBe(original);
  expect(result.current.canSaveAnswer).toBe(true);
  await act(async () => { await result.current.saveAnswer(); });
  expect(onSaved).toHaveBeenCalledTimes(1);
});

it('keeps the previous answer if rerecording cannot start', async () => {
  const { result } = setup();
  await recorded(result);
  const previous = result.current.draft;
  mockStartListening.mockRejectedValueOnce(new Error('인식을 시작하지 못했어요.'));
  mockStopRecording.mockResolvedValueOnce({ uri: 'file:///failed-replacement.wav', durationMs: 0 });
  await act(async () => { await result.current.beginRecording(); });
  expect(result.current.phase).toBe('review');
  expect(result.current.draft?.uri).toBe('file:///answer.wav');
  expect(result.current.draft).toEqual(previous);
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

it('assigns a new recording identity only when a replacement take is completed', async () => {
  const { result } = setup();
  await recorded(result);
  const previous = result.current.draft;
  await act(async () => { await result.current.beginRecording(); });
  expect(result.current.draft).toEqual(previous);
  await act(async () => { await result.current.finishRecording(); });
  expect(result.current.draft?.recordingId).not.toBe(previous?.recordingId);
});

it('leaves stopping and discards the old draft when the account changes during stop', async () => {
  let finish!: (audio: { uri: string; durationMs: number }) => void;
  mockStopRecording.mockImplementationOnce(() => new Promise(resolve => { finish = resolve; }));
  const { result } = setup();
  await act(async () => { await result.current.beginRecording(); });
  let stopping!: Promise<void>;
  act(() => { stopping = result.current.finishRecording(); });
  act(() => { changeSession({ isLoggedIn: true, userUuid: 'other' }); });
  expect(result.current.isBusy).toBe(false);
  expect(result.current.needsLoginCheck).toBe(true);
  await act(async () => { finish({ uri: 'file:///old.wav', durationMs: 18000 }); await stopping; });
  expect(result.current.phase).toBe('ready');
  expect(result.current.draft).toBeNull();
  expect(mockSave).not.toHaveBeenCalled();
});

it.each(['resolve', 'reject'])('leaves saving and ignores a stale upload that will %s', async outcome => {
  let finish!: () => void;
  mockSave.mockImplementationOnce(() => new Promise((resolve, reject) => {
    finish = () => outcome === 'resolve' ? resolve(true) : reject(new Error('old upload'));
  }));
  const { result } = setup();
  await recorded(result);
  let saving!: Promise<void>;
  act(() => { saving = result.current.saveAnswer(); });
  act(() => { changeSession({ isLoggedIn: false, userUuid: '' }); changeSession({ isLoggedIn: true, userUuid: 'me' }); });
  expect(result.current.isBusy).toBe(false);
  await act(async () => { finish(); await saving; });
  expect(result.current.draft).toBeNull();
  expect(result.current.needsLoginCheck).toBe(true);
  expect(onSaved).not.toHaveBeenCalled();
});

it('stops a capture initialized after its session was replaced without starting STT', async () => {
  let finish!: () => void;
  mockStartRecording.mockImplementationOnce(() => new Promise<void>(resolve => { finish = resolve; }));
  const { result } = setup();
  let starting!: Promise<void>;
  act(() => { starting = result.current.beginRecording(); });
  act(() => { changeSession({ isLoggedIn: true, userUuid: 'other' }); });
  await act(async () => { finish(); await starting; });
  expect(mockStopRecording).toHaveBeenCalledTimes(1);
  expect(mockStartListening).not.toHaveBeenCalled();
  expect(result.current.phase).toBe('ready');
  expect(result.current.needsLoginCheck).toBe(true);
});

it('does not interrupt recording when the same account refreshes its token', async () => {
  const { result } = setup();
  await act(async () => { await result.current.beginRecording(); });
  act(() => { changeSession({ ...mockSession, accessToken: 'refreshed-token' }); });
  expect(result.current.phase).toBe('recording');
  expect(mockStopRecording).not.toHaveBeenCalled();
  await act(async () => { await result.current.finishRecording(); await result.current.saveAnswer(); });
  expect(onSaved).toHaveBeenCalledTimes(1);
});

it('stops both capture engines and blocks saving when the account changes during recording', async () => {
  const { result } = setup();
  await act(async () => { await result.current.beginRecording(); });
  await act(async () => { changeSession({ isLoggedIn: true, userUuid: 'other' }); });
  expect(mockStopListening).toHaveBeenCalledTimes(1);
  expect(mockStopRecording).toHaveBeenCalledTimes(1);
  expect(result.current.phase).toBe('ready');
  expect(result.current.needsLoginCheck).toBe(true);
  expect(result.current.draft).toBeNull();
  await act(async () => { await result.current.saveAnswer(); });
  expect(mockSave).not.toHaveBeenCalled();
});
