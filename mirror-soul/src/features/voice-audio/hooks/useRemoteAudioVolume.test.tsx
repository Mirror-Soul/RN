import { act, renderHook } from '@testing-library/react-native';
import type { MediaStream } from 'react-native-webrtc';
import { useRemoteAudioVolume } from './useRemoteAudioVolume';
import { normalizedPlaybackVolume } from '../playbackVolume';

let mockVolume: number | undefined = 25;
jest.mock('./useAudioSettingsQuery', () => ({ useAudioSettingsQuery: () => ({ data: mockVolume == null ? undefined : { opponentVoiceVolume: mockVolume } }) }));
jest.mock('@/src/utils/logger', () => ({ logger: { warn: jest.fn() } }));

it('applies the server volume to received tracks and to tracks added later', () => {
  const track = { _setVolume: jest.fn() };
  let added!: () => void;
  const stream = { getAudioTracks: () => [track], addEventListener: jest.fn((_type, listener) => { added = listener; }), removeEventListener: jest.fn() };
  const hook = renderHook(() => useRemoteAudioVolume(stream as unknown as MediaStream));
  expect(track._setVolume).toHaveBeenLastCalledWith(0.25);
  mockVolume = 75;
  hook.rerender({});
  expect(track._setVolume).toHaveBeenLastCalledWith(0.75);
  act(() => added());
  expect(track._setVolume).toHaveBeenCalledTimes(3);
  hook.unmount();
  expect(stream.removeEventListener).toHaveBeenCalledWith('addtrack', added);
});

it('uses device volume until settings arrive and clamps invalid amplification', () => {
  expect(normalizedPlaybackVolume(undefined)).toBe(1);
  expect(normalizedPlaybackVolume(NaN)).toBe(1);
  expect(normalizedPlaybackVolume(0)).toBe(0);
  expect(normalizedPlaybackVolume(50)).toBe(0.5);
  expect(normalizedPlaybackVolume(150)).toBe(1);
  expect(normalizedPlaybackVolume(-20)).toBe(0);
});
