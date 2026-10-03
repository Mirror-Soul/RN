import React from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import VoiceUpdateScreen from '@/app/voice-update';

const mockAudio = {
  hasPermission: true, requestPermission: jest.fn(), startRecording: jest.fn(), stopRecording: jest.fn(),
};
const mockSTT = { transcript: '', startListening: jest.fn(), stopListening: jest.fn(), resetTranscript: jest.fn() };
const mockMutation = { mutateAsync: jest.fn(), reset: jest.fn() };
jest.mock('@/src/components/home/grow/voice-update/hooks/useVoiceRecording', () => ({ useVoiceRecording: () => mockAudio }));
jest.mock('@/src/hooks/useSTT', () => ({ useSTT: () => mockSTT }));
jest.mock('@/src/features/growth/hooks/useCompleteVoiceTrainingMutation', () => ({ useCompleteVoiceTrainingMutation: () => mockMutation }));
jest.mock('@/src/features/growth/hooks/useVoiceTrainingSentenceQuery', () => ({
  useVoiceTrainingSentenceQuery: () => ({ data: { sentenceId: 7, speechLine: '읽어주세요' }, isError: false, refetch: jest.fn() }),
}));
jest.mock('@/src/features/growth/hooks/useTwinSyncQuery', () => ({ useTwinSyncQuery: () => ({ isPending: false, isError: false }) }));
jest.mock('@/src/components/home/grow/voice-update/hooks/useVoiceTrainingCooldown', () => ({ useVoiceTrainingCooldown: () => ({ isInCooldown: false }) }));
jest.mock('@/src/components/home/grow/voice-update/VoiceUpdateButton', () => {
  const { Pressable, Text } = jest.requireActual('react-native');
  return function Button({ status, onPress }: { status: string; onPress: () => void }) {
    return <Pressable testID="record" onPress={onPress}><Text>{status}</Text></Pressable>;
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
  jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  mockAudio.hasPermission = true;
  mockAudio.requestPermission.mockResolvedValue(true);
  mockAudio.startRecording.mockResolvedValue(undefined);
  mockAudio.stopRecording.mockResolvedValue({ uri: 'file:///take.wav', durationSeconds: 20 });
  mockSTT.startListening.mockResolvedValue(undefined);
  mockSTT.stopListening.mockResolvedValue('실제로 읽은 문장');
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
