import React from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';
import { AppState, type AppStateStatus } from 'react-native';
import { VoicePreviewPlayer } from './VoicePreviewPlayer';

const mockPlayer = { pause: jest.fn(), play: jest.fn(), seekTo: jest.fn() };
let mockStatus = { playing: false, isLoaded: true, isBuffering: false, didJustFinish: false, duration: 10, currentTime: 0, playbackState: 'ready' };
jest.mock('@/src/features/voice-audio/hooks/useAudioSettingsQuery', () => ({ useAudioSettingsQuery: () => ({ data: { opponentVoiceVolume: 100 } }) }));
jest.mock('expo-audio', () => ({ useAudioPlayer: () => mockPlayer, useAudioPlayerStatus: () => mockStatus, setAudioModeAsync: jest.fn().mockResolvedValue(undefined) }));
jest.mock('expo-router', () => ({ useFocusEffect: (callback: () => void) => jest.requireActual('react').useEffect(callback, [callback]) }));
jest.mock('@expo/vector-icons', () => ({ Feather: () => null }));
jest.mock('@/src/hooks/useThemeColors', () => ({ useThemeColors: () => ({ colors: jest.requireActual('@/src/constants/theme').lightTheme }) }));
const voicePreview = { audioUrl: 'https://signed/audio.mp3', contentType: 'audio/mpeg', durationMs: 10000 };
beforeEach(() => {
  jest.clearAllMocks();
  mockStatus = { playing: false, isLoaded: true, isBuffering: false, didJustFinish: false, duration: 10, currentTime: 0, playbackState: 'ready' };
  mockPlayer.seekTo.mockResolvedValue(undefined);
  mockPlayer.pause.mockImplementation(() => {});
});
afterEach(() => { jest.useRealTimers(); jest.restoreAllMocks(); });

it('seeks to the beginning before replaying a completed sample', async () => {
  mockStatus = { ...mockStatus, didJustFinish: true, currentTime: 10 };
  const screen = render(<VoicePreviewPlayer voicePreview={voicePreview} />);
  await act(async () => fireEvent.press(screen.getByLabelText('음성 미리듣기 재생')));
  expect(mockPlayer.seekTo).toHaveBeenCalledWith(0);
  expect(mockPlayer.play).toHaveBeenCalledTimes(1);
  expect(mockPlayer.seekTo.mock.invocationCallOrder[0]).toBeLessThan(mockPlayer.play.mock.invocationCallOrder[0]);
});

it('shows a recoverable error after a stalled download and retries an unchanged URL', async () => {
  jest.useFakeTimers();
  mockStatus = { ...mockStatus, isLoaded: false };
  const reload = jest.fn().mockResolvedValue(undefined);
  const screen = render(<VoicePreviewPlayer voicePreview={voicePreview} onReload={reload} />);
  expect(screen.getByLabelText('음성 미리듣기 재생')).toBeDisabled();
  act(() => jest.advanceTimersByTime(15000));
  expect(screen.getByRole('alert')).toBeTruthy();
  mockStatus = { ...mockStatus, isLoaded: true };
  await act(async () => fireEvent.press(screen.getByLabelText('음성 미리듣기 다시 불러오기')));
  expect(reload).toHaveBeenCalledTimes(1);
  expect(screen.queryByRole('alert')).toBeNull();
  expect(screen.getByLabelText('음성 미리듣기 재생')).toBeEnabled();
});

it('keeps a failed refresh recoverable and prevents double reload requests', async () => {
  let reject!: (error: Error) => void;
  const reload = jest.fn(() => new Promise<void>((_resolve, fail) => { reject = fail; }));
  const screen = render(<VoicePreviewPlayer voicePreview={voicePreview} onReload={reload} />);
  fireEvent.press(screen.getByLabelText('음성 미리듣기 다시 불러오기'));
  fireEvent.press(screen.getByLabelText('음성 미리듣기 다시 불러오기'));
  expect(reload).toHaveBeenCalledTimes(1);
  await act(async () => reject(new Error('network')));
  expect(screen.getByRole('alert')).toBeTruthy();
  expect(screen.getByLabelText('음성 미리듣기 다시 불러오기')).toBeEnabled();
});

it('stops on backgrounding and tolerates an already released player when the URL changes', () => {
  let change!: (state: AppStateStatus) => void;
  jest.spyOn(AppState, 'addEventListener').mockImplementation((_event, listener) => {
    change = listener;
    return { remove: jest.fn() };
  });
  const screen = render(<VoicePreviewPlayer voicePreview={voicePreview} />);
  act(() => change('background'));
  expect(mockPlayer.pause).toHaveBeenCalledTimes(1);
  mockPlayer.pause.mockImplementation(() => { throw new Error('released'); });
  expect(() => screen.rerender(<VoicePreviewPlayer voicePreview={{ ...voicePreview, audioUrl: 'https://signed/new.mp3' }} />)).not.toThrow();
  expect(() => screen.unmount()).not.toThrow();
});

it('pauses for a call overlay and does not resume automatically when it closes', () => {
  mockStatus = { ...mockStatus, playing: true };
  const screen = render(<VoicePreviewPlayer voicePreview={voicePreview} />);
  screen.rerender(<VoicePreviewPlayer voicePreview={voicePreview} suspended />);
  expect(mockPlayer.pause).toHaveBeenCalledTimes(1);
  expect(screen.getByLabelText('음성 미리듣기 일시정지')).toBeDisabled();
  screen.rerender(<VoicePreviewPlayer voicePreview={voicePreview} />);
  expect(mockPlayer.play).not.toHaveBeenCalled();
});

it('does not start a pending playback after the call overlay opens', async () => {
  const { setAudioModeAsync } = jest.requireMock('expo-audio');
  let finish!: () => void;
  setAudioModeAsync.mockImplementationOnce(() => new Promise<void>(resolve => { finish = resolve; }));
  const screen = render(<VoicePreviewPlayer voicePreview={voicePreview} />);
  fireEvent.press(screen.getByLabelText('음성 미리듣기 재생'));
  screen.rerender(<VoicePreviewPlayer voicePreview={voicePreview} suspended />);
  await act(async () => finish());
  expect(mockPlayer.play).not.toHaveBeenCalled();
});
