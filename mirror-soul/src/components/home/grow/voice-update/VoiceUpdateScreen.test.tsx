import React from 'react';
import { act, fireEvent, render, waitFor, within } from '@testing-library/react-native';
import { Alert } from 'react-native';
import VoiceUpdateScreen from '@/app/voice-update';

let mockDimensions = { width: 393, height: 852, scale: 3, fontScale: 1 };
const mockRefetchSentence = jest.fn();
let mockSentence = { data: { sentenceId: 7, speechLine: '읽어주세요' }, isError: false, isPending: false, isFetching: false, refetch: mockRefetchSentence };
jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({ __esModule: true, default: () => mockDimensions }));
jest.mock('@expo/vector-icons', () => ({ Feather: () => null }));
jest.mock('expo-font', () => ({ isLoaded: () => false }));
const mockAudio = {
  hasPermission: true, requestPermission: jest.fn(), startRecording: jest.fn(), stopRecording: jest.fn(),
};
const mockSTT = { transcript: '', startListening: jest.fn(), stopListening: jest.fn(), resetTranscript: jest.fn() };
const mockMutation = { mutateAsync: jest.fn(), reset: jest.fn() };
jest.mock('@/src/components/home/grow/voice-update/hooks/useVoiceRecording', () => ({ useVoiceRecording: () => mockAudio }));
jest.mock('@/src/hooks/useSTT', () => ({ useSTT: () => mockSTT }));
jest.mock('@/src/features/growth/hooks/useCompleteVoiceTrainingMutation', () => ({ useCompleteVoiceTrainingMutation: () => mockMutation }));
jest.mock('@/src/features/growth/hooks/useVoiceTrainingSentenceQuery', () => ({
  useVoiceTrainingSentenceQuery: () => mockSentence,
}));
jest.mock('@/src/features/growth/hooks/useTwinSyncQuery', () => ({ useTwinSyncQuery: () => ({ isPending: false, isError: false }) }));
jest.mock('@/src/components/home/grow/voice-update/VoiceUpdateButton', () => {
  const { Pressable, Text } = jest.requireActual('react-native');
  return function Button({ status, onPress, onRetry, recordingBlocked, cooldownRemainingSeconds }: { status: string; onPress: () => void; onRetry: () => void; recordingBlocked: boolean; cooldownRemainingSeconds?: number }) {
    return <><Pressable testID="record" disabled={status === 'idle' && recordingBlocked} onPress={onPress}><Text>{status}</Text></Pressable>
      {status === 'done' && <Pressable testID="next" disabled={!!cooldownRemainingSeconds} onPress={onRetry}><Text>다음 문장 읽기</Text></Pressable>}
    </>;
  };
});
jest.mock('@/src/components/home/grow/voice-update/VoiceUpdatePrompt', () => () => null);
jest.mock('@/src/components/home/grow/voice-update/VoiceUpdateTranscriptBox', () => () => null);
jest.mock('@/src/components/home/grow/GrowSubScreenHeader', () => () => null);
jest.mock('react-native-safe-area-context', () => ({ SafeAreaView: jest.requireActual('react-native').View }));
jest.mock('@/src/hooks/useLayout', () => ({ useLayout: () => ({ contentContainerStyle: {} }) }));
jest.mock('@/src/hooks/useThemeColors', () => ({ useThemeColors: () => ({ colors: jest.requireActual('@/src/constants/theme').lightTheme }) }));
jest.mock('@/src/utils/logger', () => ({ logger: { error: jest.fn() } }));

beforeEach(() => {
  jest.clearAllMocks();
  mockDimensions = { width: 393, height: 852, scale: 3, fontScale: 1 };
  mockSentence = { data: { sentenceId: 7, speechLine: '읽어주세요' }, isError: false, isPending: false, isFetching: false, refetch: mockRefetchSentence };
  jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  mockAudio.hasPermission = true;
  mockAudio.requestPermission.mockResolvedValue(true);
  mockAudio.startRecording.mockResolvedValue(undefined);
  mockAudio.stopRecording.mockResolvedValue({ uri: 'file:///take.wav', durationSeconds: 20 });
  mockSTT.startListening.mockResolvedValue(undefined);
  mockSTT.stopListening.mockResolvedValue('읽어주세요');
  mockMutation.mutateAsync.mockResolvedValue(undefined);
});
afterEach(() => jest.restoreAllMocks());

it('stops the audio capture when speech recognition cannot start and permits another attempt', async () => {
  mockSTT.startListening.mockRejectedValueOnce(new Error('STT unavailable'));
  const screen = render(<VoiceUpdateScreen />);
  fireEvent.press(screen.getByTestId('record'));
  await waitFor(() => expect(Alert.alert).toHaveBeenCalledWith('녹음을 시작하지 못했습니다', expect.any(String)));
  expect(mockAudio.stopRecording).toHaveBeenCalledTimes(1);
  expect(mockSTT.stopListening).toHaveBeenCalledTimes(1);
  expect(screen.getByText('idle')).toBeTruthy();
  fireEvent.press(screen.getByTestId('record'));
  await waitFor(() => expect(screen.getByText('recording')).toBeTruthy());
});

it('leaves analyzing if audio finalization rejects without submitting a training job', async () => {
  mockAudio.stopRecording.mockRejectedValueOnce(new Error('audio stop failed'));
  const screen = render(<VoiceUpdateScreen />);
  fireEvent.press(screen.getByTestId('record'));
  await waitFor(() => expect(screen.getByText('recording')).toBeTruthy());
  fireEvent.press(screen.getByTestId('record'));
  await waitFor(() => expect(screen.getByText('idle')).toBeTruthy());
  expect(Alert.alert).toHaveBeenCalledWith('녹음을 마무리하지 못했어요', expect.any(String));
  expect(mockSTT.stopListening).toHaveBeenCalledTimes(1);
  expect(mockMutation.mutateAsync).not.toHaveBeenCalled();
});

it('waits for both capture operations to settle after recognition stop fails', async () => {
  let finish!: () => void;
  mockSTT.stopListening.mockRejectedValueOnce(new Error('STT stop failed'));
  mockAudio.stopRecording.mockImplementationOnce(() => new Promise(resolve => { finish = () => resolve({ uri: 'file:///take.wav' }); }));
  const screen = render(<VoiceUpdateScreen />);
  fireEvent.press(screen.getByTestId('record'));
  await waitFor(() => expect(screen.getByText('recording')).toBeTruthy());
  fireEvent.press(screen.getByTestId('record'));
  expect(screen.getByText('analyzing')).toBeTruthy();
  expect(Alert.alert).not.toHaveBeenCalled();
  await act(async () => { finish(); });
  expect(screen.getByText('idle')).toBeTruthy();
  expect(mockMutation.mutateAsync).not.toHaveBeenCalled();
});

it('blocks repeated starts before initialization completes', async () => {
  let finish!: () => void;
  mockAudio.startRecording.mockImplementationOnce(() => new Promise<void>(resolve => { finish = resolve; }));
  const screen = render(<VoiceUpdateScreen />);
  fireEvent.press(screen.getByTestId('record'));
  fireEvent.press(screen.getByTestId('record'));
  expect(mockAudio.startRecording).toHaveBeenCalledTimes(1);
  expect(screen.getByText('starting')).toBeTruthy();
  await act(async () => { finish(); });
  expect(screen.getByText('recording')).toBeTruthy();
});

it('does not start recognition or submit a recording initialized after unmount', async () => {
  let finish!: () => void;
  mockAudio.startRecording.mockImplementationOnce(() => new Promise<void>(resolve => { finish = resolve; }));
  const screen = render(<VoiceUpdateScreen />);
  fireEvent.press(screen.getByTestId('record'));
  screen.unmount();
  await act(async () => { finish(); });
  expect(mockAudio.stopRecording).toHaveBeenCalledTimes(1);
  expect(mockSTT.startListening).not.toHaveBeenCalled();
  expect(mockMutation.mutateAsync).not.toHaveBeenCalled();
  expect(Alert.alert).not.toHaveBeenCalled();
});

it('submits the completed recording once despite repeated stop taps and then shows done', async () => {
  let finish!: () => void;
  mockMutation.mutateAsync.mockImplementationOnce(() => new Promise<void>(resolve => { finish = resolve; }));
  const screen = render(<VoiceUpdateScreen />);
  fireEvent.press(screen.getByTestId('record'));
  await waitFor(() => expect(screen.getByText('recording')).toBeTruthy());
  fireEvent.press(screen.getByTestId('record'));
  fireEvent.press(screen.getByTestId('record'));
  await waitFor(() => expect(mockMutation.mutateAsync).toHaveBeenCalledTimes(1));
  expect(mockAudio.stopRecording).toHaveBeenCalledTimes(1);
  expect(mockMutation.mutateAsync).toHaveBeenCalledWith({ sentenceId: 7, recordingUri: 'file:///take.wav', durationSeconds: 20 });
  await act(async () => { finish(); });
  expect(screen.getByText('done')).toBeTruthy();
});

it('offers inline sentence recovery without a modal and blocks starting from a stale sentence', () => {
  mockSentence.isError = true;
  const view = render(<VoiceUpdateScreen />);
  expect(view.getByText('읽을 문장을 불러오지 못했어요')).toBeTruthy();
  fireEvent.press(view.getByLabelText('낭독 문장 다시 불러오기'));
  expect(mockRefetchSentence).toHaveBeenCalledTimes(1);
  fireEvent.press(view.getByTestId('record'));
  expect(mockAudio.startRecording).not.toHaveBeenCalled();
  expect(Alert.alert).not.toHaveBeenCalled();
});
it('keeps the recording attached to the original sentence when a background refetch changes the question', async () => {
  const view = render(<VoiceUpdateScreen />);
  fireEvent.press(view.getByTestId('record'));
  await waitFor(() => expect(view.getByText('recording')).toBeTruthy());
  mockSentence = { ...mockSentence, data: { sentenceId: 99, speechLine: '새 문장' } };
  view.rerender(<VoiceUpdateScreen />);
  fireEvent.press(view.getByTestId('record'));
  await waitFor(() => expect(view.getByText('done')).toBeTruthy());
  expect(mockMutation.mutateAsync).toHaveBeenCalledWith(expect.objectContaining({ sentenceId: 7 }));
});
it('keeps recording actions next to the reading content on normal screens as well', () => {
  const view = render(<VoiceUpdateScreen />);
  expect(within(view.getByTestId('voice-update-scroll')).getByTestId('record')).toBeTruthy();
});

it('never uploads a different sentence and permits a new matching recording afterwards', async () => {
  mockSTT.stopListening.mockResolvedValueOnce('주변에서 다른 사람이 하는 이야기');
  const view = render(<VoiceUpdateScreen />);
  fireEvent.press(view.getByTestId('record'));
  await waitFor(() => expect(view.getByText('recording')).toBeTruthy());
  fireEvent.press(view.getByTestId('record'));
  await waitFor(() => expect(view.getByText('idle')).toBeTruthy());
  expect(mockMutation.mutateAsync).not.toHaveBeenCalled();
  expect(Alert.alert).not.toHaveBeenCalled();
  fireEvent.press(view.getByTestId('record'));
  await waitFor(() => expect(view.getByText('recording')).toBeTruthy());
  fireEvent.press(view.getByTestId('record'));
  await waitFor(() => expect(view.getByText('done')).toBeTruthy());
  expect(mockMutation.mutateAsync).toHaveBeenCalledTimes(1);
});

it.each(['', '...'])('does not submit unrecognized speech: %j', async spoken => {
  mockSTT.stopListening.mockResolvedValueOnce(spoken);
  const view = render(<VoiceUpdateScreen />);
  fireEvent.press(view.getByTestId('record'));
  await waitFor(() => expect(view.getByText('recording')).toBeTruthy());
  fireEvent.press(view.getByTestId('record'));
  await waitFor(() => expect(view.getByText('idle')).toBeTruthy());
  expect(mockMutation.mutateAsync).not.toHaveBeenCalled();
});

it('still requires an audio file even when recognition matches', async () => {
  mockAudio.stopRecording.mockResolvedValueOnce({ uri: null, durationSeconds: 20 });
  const view = render(<VoiceUpdateScreen />);
  fireEvent.press(view.getByTestId('record'));
  await waitFor(() => expect(view.getByText('recording')).toBeTruthy());
  fireEvent.press(view.getByTestId('record'));
  await waitFor(() => expect(view.getByText('idle')).toBeTruthy());
  expect(mockMutation.mutateAsync).not.toHaveBeenCalled();
});

it('prevents requesting a new sentence immediately after successful submission before server refetch', async () => {
  const view = render(<VoiceUpdateScreen />);
  fireEvent.press(view.getByTestId('record'));
  await waitFor(() => expect(view.getByText('recording')).toBeTruthy());
  fireEvent.press(view.getByTestId('record'));
  await waitFor(() => expect(view.getByText('done')).toBeTruthy());
  fireEvent.press(view.getByTestId('next'));
  expect(mockRefetchSentence).not.toHaveBeenCalled();
  expect(view.getByText('done')).toBeTruthy();
});
it.each([{ width: 320, height: 568, fontScale: 1 }, { width: 393, height: 852, fontScale: 2 }, { width: 740, height: 360, fontScale: 1 }])('keeps exactly one reachable recording action on a constrained screen: %j', dimensions => {
  mockDimensions = { ...dimensions, scale: 3 };
  const view = render(<VoiceUpdateScreen />);
  expect(within(view.getByTestId('voice-update-scroll')).getByTestId('record')).toBeTruthy();
  expect(view.getAllByTestId('record')).toHaveLength(1);
});
