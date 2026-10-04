import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useVoiceAudioSettings } from './useVoiceAudioSettings';
import { useNotificationSettings } from '@/src/features/notification/hooks/useNotificationSettings';
import { getAudioSettings, updateAudioSettings, modifyAlarmSetting, getAlarmSetting } from '@/src/services/profileService';
import { profileQueryKeys } from '@/src/features/profile/hooks/profileQueryKeys';

let mockSession = { userUuid: 'me', isLoggedIn: true };
const mockToast = jest.fn();
jest.mock('@/src/store/useAuthStore', () => ({ useAuthStore: Object.assign((selector: (state: typeof mockSession) => unknown) => selector(mockSession), { getState: () => mockSession }) }));
jest.mock('@/src/components/common/Toast/ToastProvider', () => ({ useToast: () => ({ showToast: mockToast }) }));
jest.mock('@/src/services/profileService', () => ({ getAudioSettings: jest.fn(), updateAudioSettings: jest.fn(), getAlarmSetting: jest.fn(), modifyAlarmSetting: jest.fn() }));
let client: QueryClient;
const wrapper = ({ children }: { children: React.ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;
beforeEach(() => {
  jest.clearAllMocks();
  mockSession = { userUuid: 'me', isLoggedIn: true };
  client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } });
  client.setQueryData(profileQueryKeys.audioSettings('me'), { opponentVoiceVolume: 50, opponentSpeechSpeed: 'FAST' });
  client.setQueryData(profileQueryKeys.alarmSettings('me'), { lowTimeNotificationEnabled: false, missedCallNotificationEnabled: true });
});
afterEach(() => client.clear());

it('saves a bounded volume and preserves the existing speed without a speed control', async () => {
  (updateAudioSettings as jest.Mock).mockResolvedValue({ result: { opponentVoiceVolume: 100, opponentSpeechSpeed: 'FAST' } });
  const hook = renderHook(() => useVoiceAudioSettings(), { wrapper });
  act(() => hook.result.current.handleVolumeChange(120));
  await waitFor(() => expect(updateAudioSettings).toHaveBeenCalledWith({ opponentVoiceVolume: 100, opponentSpeechSpeed: 'FAST' }));
  await waitFor(() => expect(hook.result.current.volume).toBe(100));
});

it('blocks overlapping changes and preserves the last saved volume on failure', async () => {
  let fail!: (error: Error) => void;
  (updateAudioSettings as jest.Mock).mockImplementation(() => new Promise((_resolve, reject) => { fail = reject; }));
  const hook = renderHook(() => useVoiceAudioSettings(), { wrapper });
  act(() => { hook.result.current.handleVolumeChange(25); hook.result.current.handleVolumeChange(100); });
  await waitFor(() => expect(updateAudioSettings).toHaveBeenCalledTimes(1));
  await act(async () => fail(new Error('network')));
  await waitFor(() => expect(mockToast).toHaveBeenCalled());
  expect(hook.result.current.volume).toBe(50);
  await waitFor(() => expect(hook.result.current.isSaving).toBe(false));
});

it('does not write a late audio-setting response into another account', async () => {
  let finish!: (value: unknown) => void;
  (updateAudioSettings as jest.Mock).mockImplementation(() => new Promise(resolve => { finish = resolve; }));
  const hook = renderHook(() => useVoiceAudioSettings(), { wrapper });
  act(() => hook.result.current.handleVolumeChange(25));
  await waitFor(() => expect(updateAudioSettings).toHaveBeenCalled());
  mockSession = { userUuid: 'other', isLoggedIn: true };
  await act(async () => finish({ result: { opponentVoiceVolume: 25, opponentSpeechSpeed: 'FAST' } }));
  expect(client.getQueryData(profileQueryKeys.audioSettings('other'))).toBeUndefined();
  expect(client.getQueryData(profileQueryKeys.audioSettings('me'))).toHaveProperty('opponentVoiceVolume', 50);
});

it('ignores an old volume-change callback after switching accounts', () => {
  const hook = renderHook(() => useVoiceAudioSettings(), { wrapper });
  const oldChange = hook.result.current.handleVolumeChange;
  mockSession = { userUuid: 'other', isLoggedIn: true };
  client.setQueryData(profileQueryKeys.audioSettings('other'), { opponentVoiceVolume: 50, opponentSpeechSpeed: 'NORMAL' });
  act(() => oldChange(25));
  expect(updateAudioSettings).not.toHaveBeenCalled();
});

it('provides a recoverable read error and does not PATCH with guessed settings', async () => {
  client.removeQueries({ queryKey: profileQueryKeys.audioSettings('me') });
  (getAudioSettings as jest.Mock).mockRejectedValue(new Error('offline'));
  const hook = renderHook(() => useVoiceAudioSettings(), { wrapper });
  await waitFor(() => expect(hook.result.current.isError).toBe(true));
  expect(hook.result.current.volume).toBeNull();
  act(() => hook.result.current.handleVolumeChange(50));
  expect(updateAudioSettings).not.toHaveBeenCalled();
});

it('changes the missed-call toggle while preserving the low-time setting', async () => {
  (modifyAlarmSetting as jest.Mock).mockResolvedValue({ result: { lowTimeNotificationEnabled: false, missedCallNotificationEnabled: false } });
  const hook = renderHook(() => useNotificationSettings(), { wrapper });
  act(() => hook.result.current.handleToggleMissedCall());
  await waitFor(() => expect(modifyAlarmSetting).toHaveBeenCalledWith({ lowTimeNotificationEnabled: false, missedCallNotificationEnabled: false }));
  await waitFor(() => expect(hook.result.current.missedCallAlert).toBe(false));
});

it('keeps failed alarm changes at the server-confirmed value', async () => {
  (modifyAlarmSetting as jest.Mock).mockRejectedValue(new Error('offline'));
  const hook = renderHook(() => useNotificationSettings(), { wrapper });
  act(() => { hook.result.current.handleToggleTimeLimit(); hook.result.current.handleToggleMissedCall(); });
  await waitFor(() => expect(mockToast).toHaveBeenCalled());
  expect(modifyAlarmSetting).toHaveBeenCalledTimes(1);
  expect(hook.result.current.timeLimitAlert).toBe(false);
  expect(hook.result.current.missedCallAlert).toBe(true);
});

it('ignores an old alarm toggle callback after switching accounts', () => {
  const hook = renderHook(() => useNotificationSettings(), { wrapper });
  const oldToggle = hook.result.current.handleToggleMissedCall;
  mockSession = { userUuid: 'other', isLoggedIn: true };
  client.setQueryData(profileQueryKeys.alarmSettings('other'), { lowTimeNotificationEnabled: true, missedCallNotificationEnabled: true });
  act(() => oldToggle());
  expect(modifyAlarmSetting).not.toHaveBeenCalled();
});


it.each(['audio', 'alarm'] as const)('cancels a %s refresh started during save before applying the response', async kind => {
  const queryKey = kind === 'audio' ? profileQueryKeys.audioSettings('me') : profileQueryKeys.alarmSettings('me');
  const getter = (kind === 'audio' ? getAudioSettings : getAlarmSetting) as jest.Mock;
  const saver = (kind === 'audio' ? updateAudioSettings : modifyAlarmSetting) as jest.Mock;
  const old = client.getQueryData(queryKey);
  const saved = kind === 'audio' ? { opponentVoiceVolume: 25, opponentSpeechSpeed: 'FAST' } : { lowTimeNotificationEnabled: false, missedCallNotificationEnabled: false };
  let finishSave!: (response: unknown) => void;
  let finishRead!: (response: unknown) => void;
  let signal!: AbortSignal;
  saver.mockImplementation(() => new Promise(resolve => { finishSave = resolve; }));
  getter.mockImplementation((input: AbortSignal) => { signal = input; return new Promise(resolve => { finishRead = resolve; }); });
  const hook = renderHook(() => {
    const audio = useVoiceAudioSettings();
    const alarm = useNotificationSettings();
    return { save: () => kind === 'audio' ? audio.handleVolumeChange(25) : alarm.handleToggleMissedCall(), refetch: kind === 'audio' ? audio.refetch : alarm.refetch };
  }, { wrapper });
  act(() => hook.result.current.save());
  await waitFor(() => expect(saver).toHaveBeenCalled());
  act(() => { void hook.result.current.refetch(); });
  await waitFor(() => expect(getter).toHaveBeenCalled());
  await act(async () => { finishSave({ result: saved }); });
  await waitFor(() => expect(client.getQueryData(queryKey)).toEqual(saved));
  expect(signal.aborted).toBe(true);
  await act(async () => { finishRead({ result: old }); });
  expect(client.getQueryData(queryKey)).toEqual(saved);
});
