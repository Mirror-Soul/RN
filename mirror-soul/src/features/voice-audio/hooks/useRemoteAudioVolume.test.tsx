import { act, renderHook } from '@testing-library/react-native';
import type { MediaStream } from 'react-native-webrtc';
import { useRemoteAudioVolume } from './useRemoteAudioVolume';
import { normalizedPlaybackVolume, receivedCallVolume } from '../playbackVolume';

let mockVolume: number | undefined = 25;
let mockGain = 1;
jest.mock('@/src/store/useVoiceAudioStore', () => ({ useVoiceAudioStore: (selector: (state: { callVoiceGain: number }) => unknown) => selector({ callVoiceGain: mockGain }) }));
beforeEach(() => { mockVolume = 25; mockGain = 1; });
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


it('boosts only received audio and reapplies gain during an active stream without changing the server volume', () => {
  const track = { _setVolume: jest.fn() };
  const stream = { getAudioTracks: () => [track] };
  mockVolume = 50;
  const hook = renderHook(() => useRemoteAudioVolume(stream as unknown as MediaStream));
  expect(track._setVolume).toHaveBeenLastCalledWith(0.5);
  mockGain = 1.5; hook.rerender({});
  expect(track._setVolume).toHaveBeenLastCalledWith(0.75);
  mockGain = 2; hook.rerender({});
  expect(track._setVolume).toHaveBeenLastCalledWith(1);
  expect(mockVolume).toBe(50);
  mockVolume = 0; hook.rerender({});
  expect(track._setVolume).toHaveBeenLastCalledWith(0);
});

it('limits boosted receive gain to supported options and preserves silence', () => {
  expect(receivedCallVolume(100, 2)).toBe(2);
  expect(receivedCallVolume(100, 1.5)).toBe(1.5);
  expect(receivedCallVolume(100, 20)).toBe(1);
  expect(receivedCallVolume(0, 2)).toBe(0);
  expect(receivedCallVolume(-10, 2)).toBe(0);
});

it('continues applying volume when one received track fails', () => {
  const second = { _setVolume: jest.fn() };
  const stream = { getAudioTracks: () => [{ _setVolume: () => { throw new Error('released'); } }, second] };
  renderHook(() => useRemoteAudioVolume(stream as unknown as MediaStream));
  expect(second._setVolume).toHaveBeenCalledWith(0.25);
});
