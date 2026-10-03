import React, { useState } from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';
import { AppState, View } from 'react-native';
import { setAudioModeAsync } from 'expo-audio';
import InterviewAnswerBox from './InterviewAnswerBox';

const mockPlayer = { play: jest.fn(), pause: jest.fn(), seekTo: jest.fn() };
let mockReleased = false;
let mockReleaseOnUnmount = false;
const mockFocus: { exit?: () => void } = {};
jest.mock('@expo/vector-icons', () => ({ Feather: () => null }));
jest.mock('expo-audio', () => ({
  setAudioModeAsync: jest.fn(),
  useAudioPlayer: () => {
    jest.requireActual('react').useEffect(() => () => {
      if (mockReleaseOnUnmount) mockReleased = true;
    }, []);
    return mockPlayer;
  },
  useAudioPlayerStatus: () => ({ playing: false, didJustFinish: false, duration: 18, currentTime: 0 }),
}));
jest.mock('expo-router', () => ({
  useFocusEffect: (callback: () => () => void) => {
    jest.requireActual('react').useEffect(() => {
      const exit = callback();
      mockFocus.exit = exit;
      return exit;
    }, [callback]);
  },
}));
jest.mock('@/src/hooks/useThemeColors', () => ({ useThemeColors: () => ({ colors: jest.requireActual('@/src/constants/theme').lightTheme }) }));
const props = { isRecording: false, isBusy: false, isListening: false, hasRecognizedSpeech: true, transcript: '내가 말한 답변', recordingUri: 'file:///answer.wav', durationMs: 18000, onChangeText: jest.fn() };
beforeEach(() => {
  jest.clearAllMocks();
  mockReleased = false;
  mockReleaseOnUnmount = false;
  (setAudioModeAsync as jest.Mock).mockResolvedValue(undefined);
  mockPlayer.pause.mockImplementation(() => {
    if (mockReleased) throw new Error('Unable to find the native shared object associated with given JavaScript object');
  });
  Object.defineProperty(AppState, 'currentState', { configurable: true, writable: true, value: 'active' });
});
afterEach(() => jest.restoreAllMocks());

it('requires rerecording instead of text entry when no speech was recognized', () => {
  const screen = render(<InterviewAnswerBox {...props} hasRecognizedSpeech={false} transcript="" recognitionIssue="말소리가 없어요." />);
  expect(screen.getByText('말한 내용을 인식하지 못했어요. 조용한 곳에서 휴대폰을 가까이 두고 다시 녹음해주세요.')).toBeTruthy();
  expect(screen.queryByRole('button', { name: '문장 수정' })).toBeNull();
  expect(screen.queryByLabelText('인식된 답변 수정')).toBeNull();
  expect(screen.queryByText('재녹음을 권해요. 내용이 맞다면 확인 후 저장할 수 있어요.')).toBeNull();
  expect(screen.getByRole('button', { name: '녹음 듣기' })).toBeTruthy();
});

it('removes an open editor if the new take has no recognized speech', () => {
  const screen = render(<InterviewAnswerBox {...props} />);
  fireEvent.press(screen.getByRole('button', { name: '문장 수정' }));
  expect(screen.getByLabelText('인식된 답변 수정')).toBeTruthy();
  screen.rerender(<InterviewAnswerBox {...props} hasRecognizedSpeech={false} transcript="직접 입력한 답변" />);
  expect(screen.queryByLabelText('인식된 답변 수정')).toBeNull();
  expect(screen.queryByRole('button', { name: '문장 수정' })).toBeNull();
  expect(screen.queryByText('직접 입력한 답변')).toBeNull();
});

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

it.each(['next question', 'record again'])('does not pause a released player when switching to %s', next => {
  mockReleaseOnUnmount = true;
  const screen = render(<InterviewAnswerBox {...props} />);
  mockPlayer.pause.mockClear();
  expect(() => screen.rerender(next === 'next question' ? <View /> : <InterviewAnswerBox {...props} isRecording />)).not.toThrow();
  expect(mockReleased).toBe(true);
  expect(mockPlayer.pause).not.toHaveBeenCalled();
});

it('still pauses a live player when the interview loses focus', () => {
  render(<InterviewAnswerBox {...props} />);
  mockPlayer.pause.mockClear();
  act(() => { mockFocus.exit?.(); });
  expect(mockPlayer.pause).toHaveBeenCalledTimes(1);
});

it('does not play a released recording after delayed audio preparation', async () => {
  mockReleaseOnUnmount = true;
  let finish!: () => void;
  (setAudioModeAsync as jest.Mock).mockImplementation(() => new Promise<void>(resolve => { finish = resolve; }));
  const screen = render(<InterviewAnswerBox {...props} />);
  fireEvent.press(screen.getByRole('button', { name: '녹음 듣기' }));
  screen.rerender(<View />);
  await act(async () => { finish(); });
  expect(mockReleased).toBe(true);
  expect(mockPlayer.play).not.toHaveBeenCalled();
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
