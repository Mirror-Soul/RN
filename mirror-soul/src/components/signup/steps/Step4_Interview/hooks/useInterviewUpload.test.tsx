import React from 'react';
import { act, renderHook } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as FileSystem from 'expo-file-system/legacy';
import { getPresignedUrl } from '@/src/services/fileService';
import { uploadFileToS3 } from '@/src/services/s3Service';
import { saveInterviewAnswer } from '@/src/services/onboardingService';
import { useAuthStore } from '@/src/store/useAuthStore';
import { useInterviewUpload } from './useInterviewUpload';

jest.mock('expo-file-system/legacy', () => ({ getInfoAsync: jest.fn() }));
jest.mock('@/src/services/fileService', () => ({ getPresignedUrl: jest.fn() }));
jest.mock('@/src/services/s3Service', () => ({ uploadFileToS3: jest.fn() }));
jest.mock('@/src/services/onboardingService', () => ({ saveInterviewAnswer: jest.fn() }));
jest.mock('@/src/store/useAuthStore', () => ({ useAuthStore: { getState: jest.fn(), subscribe: jest.fn() } }));
const answer = { uri: 'file:///answer.wav', questionId: 17, userUuid: 'me', answerText: '의견을 듣고 제 생각을 말해요. 감정적으로 말하지 않으려고요.' };
let client: QueryClient;
function setup() {
  client = new QueryClient({ defaultOptions: { mutations: { retry: false, gcTime: Infinity } } });
  return renderHook(() => useInterviewUpload(), { wrapper: ({ children }: React.PropsWithChildren) => <QueryClientProvider client={client}>{children}</QueryClientProvider> });
}
beforeEach(() => {
  jest.resetAllMocks();
  (useAuthStore.getState as jest.Mock).mockReturnValue({ userUuid: 'me', isLoggedIn: true });
  (useAuthStore.subscribe as jest.Mock).mockReturnValue(jest.fn());
  (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({ exists: true, isDirectory: false, size: 10000 });
  (getPresignedUrl as jest.Mock).mockResolvedValue({ isSuccess: true, result: { presignedUrl: 'signed', objectKey: 'interviews/me/answer.wav' } });
  (uploadFileToS3 as jest.Mock).mockResolvedValue(undefined);
  (saveInterviewAnswer as jest.Mock).mockResolvedValue({ isSuccess: true, result: { saved: true, interviewId: 17 } });
});
afterEach(() => client?.clear());

it('retries only answer registration after a successful PUT, using corrected text', async () => {
  (saveInterviewAnswer as jest.Mock).mockRejectedValueOnce(new Error('timeout'));
  const { result } = setup();
  await act(async () => { await expect(result.current.saveAnswer(answer)).rejects.toThrow('timeout'); });
  await act(async () => { await result.current.saveAnswer({ ...answer, answerText: '수정한 실제 답변' }); });
  expect(getPresignedUrl).toHaveBeenCalledTimes(1);
  expect(uploadFileToS3).toHaveBeenCalledTimes(1);
  expect(saveInterviewAnswer).toHaveBeenLastCalledWith({ interviewId: 17, answerAudioObjectKey: 'interviews/me/answer.wav', answerText: '수정한 실제 답변' });
});

it('does not accept an envelope success with saved false or the wrong question', async () => {
  const { result } = setup();
  (saveInterviewAnswer as jest.Mock).mockResolvedValue({ isSuccess: true, result: { saved: false, interviewId: 17 } });
  await act(async () => { await expect(result.current.saveAnswer(answer)).rejects.toThrow('저장'); });
  (saveInterviewAnswer as jest.Mock).mockResolvedValue({ isSuccess: true, result: { saved: true, interviewId: 18 } });
  await act(async () => { await expect(result.current.saveAnswer(answer)).rejects.toThrow('저장'); });
});

it('blocks a second save before React rerenders', async () => {
  let finish!: () => void;
  (uploadFileToS3 as jest.Mock).mockImplementation(() => new Promise<void>(resolve => { finish = resolve; }));
  const { result } = setup();
  let first!: Promise<boolean>;
  await act(async () => {
    first = result.current.saveAnswer(answer);
    await expect(result.current.saveAnswer(answer)).resolves.toBe(false);
  });
  await act(async () => { finish(); await first; });
  expect(saveInterviewAnswer).toHaveBeenCalledTimes(1);
});

it('blocks empty files without claiming that short text is bad audio', async () => {
  const { result } = setup();
  (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({ exists: true, size: 0 });
  await act(async () => { await expect(result.current.saveAnswer(answer)).rejects.toThrow('파일'); });
  expect(uploadFileToS3).not.toHaveBeenCalled();
  (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({ exists: true, size: 1000 });
  await act(async () => { await result.current.saveAnswer({ ...answer, answerText: '아니요' }); });
  expect(saveInterviewAnswer).toHaveBeenCalledWith(expect.objectContaining({ answerText: '아니요' }));
});

it('never registers the old user recording after the account changes during PUT', async () => {
  (uploadFileToS3 as jest.Mock).mockImplementation(async () => {
    (useAuthStore.getState as jest.Mock).mockReturnValue({ userUuid: 'other', isLoggedIn: true });
  });
  const { result } = setup();
  await act(async () => { await expect(result.current.saveAnswer(answer)).rejects.toThrow('로그인'); });
  expect(saveInterviewAnswer).not.toHaveBeenCalled();
});
