import React from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';
import { AppState, type AppStateStatus } from 'react-native';
import { setAudioModeAsync } from 'expo-audio';
import { AudioCheck } from './AudioCheck';

const mockPlayer = { volume: 1, seekTo: jest.fn(), play: jest.fn(), pause: jest.fn() };
const mockStatus = { isLoaded: true, playing: false, playbackState: 'ready' };
jest.mock('expo-audio', () => ({ useAudioPlayer: () => mockPlayer, useAudioPlayerStatus: () => mockStatus, setAudioModeAsync: jest.fn().mockResolvedValue(undefined) }));
jest.mock('expo-router', () => ({ useFocusEffect: (callback: () => void) => jest.requireActual('react').useEffect(callback, [callback]) }));
jest.mock('@/src/hooks/useThemeColors', () => ({ useThemeColors: () => ({ colors: jest.requireActual('@/src/constants/theme').lightTheme }) }));
jest.mock('@expo/vector-icons', () => ({ Feather: () => null }));
beforeEach(() => { jest.clearAllMocks(); mockPlayer.seekTo.mockResolvedValue(undefined); mockStatus.playing = false; });
afterEach(() => jest.restoreAllMocks());

it('plays the local test sound at the selected volume and rewinds every time', async () => {
  const screen = render(<AudioCheck volume={25} />);
  expect(mockPlayer.volume).toBe(0.25);
  await act(async () => fireEvent.press(screen.getByLabelText('소리 테스트')));
  await act(async () => fireEvent.press(screen.getByLabelText('소리 테스트')));
  expect(mockPlayer.seekTo).toHaveBeenCalledTimes(2);
  expect(mockPlayer.seekTo).toHaveBeenCalledWith(0);
  expect(mockPlayer.play).toHaveBeenCalledTimes(2);
  expect(setAudioModeAsync).toHaveBeenCalledWith({ allowsRecording: false, playsInSilentMode: true, shouldRouteThroughEarpiece: false });
});

it('does not offer an inaudible test when the volume is muted', () => {
  const screen = render(<AudioCheck volume={0} />);
  expect(screen.getByLabelText('소리 테스트')).toBeDisabled();
});

it('pauses the sample when the app moves to the background', () => {
  let change!: (state: AppStateStatus) => void;
  jest.spyOn(AppState, 'addEventListener').mockImplementation((_name, listener) => { change = listener; return { remove: jest.fn() }; });
  render(<AudioCheck volume={50} />);
  act(() => change('background'));
  expect(mockPlayer.pause).toHaveBeenCalledTimes(1);
});

it('stops the longer voice immediately without waiting for audio-session setup', async () => {
  mockStatus.playing = true;
  const screen = render(<AudioCheck volume={50} />);
  await act(async () => fireEvent.press(screen.getByLabelText('소리 테스트 정지')));
  expect(mockPlayer.pause).toHaveBeenCalledTimes(1);
  expect(setAudioModeAsync).not.toHaveBeenCalled();
});
