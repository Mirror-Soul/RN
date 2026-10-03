import React, { useState } from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';
import { AppState } from 'react-native';
import { setAudioModeAsync } from 'expo-audio';
import InterviewAnswerBox from './InterviewAnswerBox';

const mockPlayer = { play: jest.fn(), pause: jest.fn(), seekTo: jest.fn() };
jest.mock('@expo/vector-icons', () => ({ Feather: () => null }));
jest.mock('expo-audio', () => ({
  setAudioModeAsync: jest.fn(),
  useAudioPlayer: () => mockPlayer,
  useAudioPlayerStatus: () => ({ playing: false, didJustFinish: false, duration: 18, currentTime: 0 }),
}));
jest.mock('expo-router', () => ({
  useFocusEffect: (callback: () => () => void) => { jest.requireActual('react').useEffect(callback, [callback]); },
}));
jest.mock('@/src/hooks/useThemeColors', () => ({ useThemeColors: () => ({ colors: jest.requireActual('@/src/constants/theme').lightTheme }) }));
const props = { isRecording: false, isBusy: false, isListening: false, transcript: '내가 말한 답변', recordingUri: 'file:///answer.wav', durationMs: 18000, onChangeText: jest.fn() };
beforeEach(() => { jest.clearAllMocks(); Object.defineProperty(AppState, 'currentState', { configurable: true, writable: true, value: 'active' }); });
afterEach(() => jest.restoreAllMocks());

it('shows the answer without requiring edit or playback, and editing preserves the spoken content', () => {
  function Review() {
    const [text, setText] = useState('내가 말한 답변');
    return <InterviewAnswerBox {...props} transcript={text} onChangeText={setText} />;
  }
  const screen = render(<Review />);
  expect(screen.getByText('내가 말한 답변')).toBeTruthy();
  expect(screen.queryByLabelText('인식된 답변 수정')).toBeNull();
  expect(mockPlayer.play).not.toHaveBeenCalled();
  fireEvent.press(screen.getByRole('button', { name: '문장 수정' }));
  fireEvent.changeText(screen.getByLabelText('인식된 답변 수정'), '바르게 고친 답변');
  fireEvent.press(screen.getByRole('button', { name: '수정 마치기' }));
  expect(screen.getByText('바르게 고친 답변')).toBeTruthy();
});

it('keeps live captions optional while recording and shows elapsed time', () => {
  const screen = render(<InterviewAnswerBox {...props} isRecording isListening durationMs={25000} />);
  expect(screen.getByText('0:25')).toBeTruthy();
  expect(screen.queryByText('내가 말한 답변')).toBeNull();
  fireEvent.press(screen.getByRole('button', { name: '인식되는 문장 보기' }));
  expect(screen.getByText('내가 말한 답변')).toBeTruthy();
});

it('shows a rerecording recommendation for an uncertain transcript', () => {
  const screen = render(<InterviewAnswerBox {...props} recognitionIssue="일부 말을 인식하지 못했어요." />);
  expect(screen.getByText('재녹음을 권해요. 내용이 맞다면 확인 후 저장할 수 있어요.')).toBeTruthy();
});

it('does not start delayed playback after the user starts saving', async () => {
  let finish!: () => void;
  (setAudioModeAsync as jest.Mock).mockImplementation(() => new Promise<void>(resolve => { finish = resolve; }));
  const screen = render(<InterviewAnswerBox {...props} />);
  fireEvent.press(screen.getByRole('button', { name: '녹음 듣기' }));
  screen.rerender(<InterviewAnswerBox {...props} isBusy />);
  await act(async () => { finish(); });
  expect(mockPlayer.play).not.toHaveBeenCalled();
});
