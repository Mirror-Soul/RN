import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCompleteVoiceTrainingMutation } from './useCompleteVoiceTrainingMutation';
import { useSubmitValueBalanceAnswerMutation } from './useSubmitValueBalanceAnswerMutation';

const mockPresign = jest.fn();
const mockUpload = jest.fn();
const mockVoice = jest.fn();
const mockAnswer = jest.fn();
let mockSession = { userUuid: 'member-one', isLoggedIn: true };
jest.mock('@/src/store/useAuthStore', () => ({ useAuthStore: Object.assign((selector: (state: typeof mockSession) => unknown) => selector(mockSession), { getState: () => mockSession }) }));
jest.mock('@/src/services/fileService', () => ({ getPresignedUrl: (...args: unknown[]) => mockPresign(...args) }));
jest.mock('@/src/services/s3Service', () => ({ uploadFileToS3: (...args: unknown[]) => mockUpload(...args) }));
jest.mock('@/src/services/evolveService', () => ({ completeVoiceUpdate: (...args: unknown[]) => mockVoice(...args), submitValueBalanceAnswer: (...args: unknown[]) => mockAnswer(...args) }));
jest.mock('@/src/utils/logger', () => ({ logger: { debug: jest.fn() } }));

function setup<T>(hook: () => T) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity }, mutations: { retry: false, gcTime: Infinity } } });
  const invalidate = jest.spyOn(client, 'invalidateQueries').mockResolvedValue();
  const wrapper = ({ children }: { children: React.ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  return { ...renderHook(hook, { wrapper }), invalidate, client };
}
const params = { sentenceId: 7, recordingUri: 'file:///take.wav', durationSeconds: 20 };
const signed = { isSuccess: true, result: { objectKey: 'voice-updates/member-one/take.wav', presignedUrl: 'https://upload.invalid' } };
beforeEach(() => {
  jest.clearAllMocks();
  mockSession = { userUuid: 'member-one', isLoggedIn: true };
  mockPresign.mockResolvedValue(signed); mockUpload.mockResolvedValue(undefined);
  mockVoice.mockResolvedValue({ result: { jobId: 1, status: 'PENDING' } });
  mockAnswer.mockResolvedValue({ result: {} });
});

it('registers the uploaded voice as a pending job and refreshes its server-owned displays', async () => {
  const { result, invalidate } = setup(useCompleteVoiceTrainingMutation);
  await act(async () => { await result.current.mutateAsync(params); });
  expect(mockUpload).toHaveBeenCalledTimes(1);
  expect(mockVoice).toHaveBeenCalledWith({ sentenceId: 7, audioObjectKey: signed.result.objectKey, durationSeconds: 20 });
  expect(invalidate).toHaveBeenCalledWith({ queryKey: ['growth', 'twinSync'] });
  expect(invalidate).toHaveBeenCalledWith({ queryKey: ['profile', 'introduction'] });
});

it('updates the same member’s cached cooldown before the server refetch returns', async () => {
  const { result, client } = setup(useCompleteVoiceTrainingMutation);
  const key = ['growth', 'twinSync', 'member-one'];
  client.setQueryData(key, { syncRate: 72, voiceTrainingCount: 3, lastVoiceTrainingAt: null });
  await act(async () => { await result.current.mutateAsync(params); });
  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  const cached = client.getQueryData<{ lastVoiceTrainingAt: string; voiceTrainingCount: number }>(key)!;
  expect(Date.now() - Date.parse(cached.lastVoiceTrainingAt)).toBeLessThan(1000);
  expect(cached.voiceTrainingCount).toBe(3);
  expect(client.getQueryData(['growth', 'twinSync', 'member-two'])).toBeUndefined();
});

it('does not upload a document/audio for a session that changed while obtaining the URL', async () => {
  let finish!: (value: typeof signed) => void;
  mockPresign.mockImplementationOnce(() => new Promise(resolve => { finish = resolve; }));
  const { result } = setup(useCompleteVoiceTrainingMutation);
  let pending!: Promise<unknown>;
  act(() => { pending = result.current.mutateAsync(params); });
  await waitFor(() => expect(mockPresign).toHaveBeenCalledTimes(1));
  const failure = expect(pending).rejects.toThrow('다시 로그인해 주세요.');
  mockSession = { userUuid: 'member-two', isLoggedIn: true };
  await act(async () => { finish(signed); await failure; });
  expect(mockUpload).not.toHaveBeenCalled();
  expect(mockVoice).not.toHaveBeenCalled();
});

it('does not register an old recording with the new account after an in-flight upload', async () => {
  let finish!: () => void;
  mockUpload.mockImplementationOnce(() => new Promise<void>(resolve => { finish = resolve; }));
  const { result } = setup(useCompleteVoiceTrainingMutation);
  let pending!: Promise<unknown>;
  act(() => { pending = result.current.mutateAsync(params); });
  await waitFor(() => expect(mockUpload).toHaveBeenCalledTimes(1));
  const failure = expect(pending).rejects.toThrow('다시 로그인해 주세요.');
  mockSession = { userUuid: 'member-two', isLoggedIn: true };
  await act(async () => { finish(); await failure; });
  expect(mockVoice).not.toHaveBeenCalled();
});

it('does not refresh the new member’s value questions after an old submission finishes', async () => {
  let finish!: (value: unknown) => void;
  mockAnswer.mockImplementationOnce(() => new Promise(resolve => { finish = resolve; }));
  const { result, invalidate } = setup(useSubmitValueBalanceAnswerMutation);
  let pending!: Promise<unknown>;
  act(() => { pending = result.current.mutateAsync({ questionId: 7, chosenSide: 'LEFT' }); });
  await waitFor(() => expect(mockAnswer).toHaveBeenCalledTimes(1));
  mockSession = { userUuid: 'member-two', isLoggedIn: true };
  await act(async () => { finish({ result: {} }); await pending; });
  expect(invalidate).not.toHaveBeenCalled();
});
