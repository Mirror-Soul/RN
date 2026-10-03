import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as FileSystem from 'expo-file-system/legacy';
import { getPresignedUrl } from '@/src/services/fileService';
import { uploadFileToS3 } from '@/src/services/s3Service';
import { deleteProfileImage, getMyProfile, modifyProfileImage } from '@/src/services/profileService';
import { useAuthStore } from '@/src/store/useAuthStore';
import { useProfilePhotoMutation } from './useProfilePhotoMutation';

jest.mock('expo-file-system/legacy', () => ({ getInfoAsync: jest.fn() }));
jest.mock('@/src/services/fileService', () => ({ getPresignedUrl: jest.fn() }));
jest.mock('@/src/services/s3Service', () => ({ uploadFileToS3: jest.fn() }));
jest.mock('@/src/services/profileService', () => ({ deleteProfileImage: jest.fn(), getMyProfile: jest.fn(), modifyProfileImage: jest.fn() }));
jest.mock('@/src/store/useAuthStore', () => ({ useAuthStore: { getState: jest.fn(), subscribe: jest.fn() } }));

const photo = { uri: 'file:///crop.jpg', width: 800, height: 1000, size: 10000 };
const key = 'profile-images/me/new.jpg';
const url = `https://bucket.s3.amazonaws.com/${key}`;
const ok = (result: unknown) => ({ isSuccess: true, result });
let client: QueryClient;
function setup() {
  client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity }, mutations: { retry: false, gcTime: Infinity } } });
  client.setQueryData(['profile', 'me'], { name: '소울', email: 'a@b.com', profileImageUrl: 'old' });
  return renderHook(() => useProfilePhotoMutation(), { wrapper: ({ children }: React.PropsWithChildren) => <QueryClientProvider client={client}>{children}</QueryClientProvider> });
}
beforeEach(() => {
  jest.resetAllMocks();
  (useAuthStore.getState as jest.Mock).mockReturnValue({ userUuid: 'me', isLoggedIn: true });
  (useAuthStore.subscribe as jest.Mock).mockReturnValue(jest.fn());
  (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({ exists: true, isDirectory: false, size: photo.size });
  (getPresignedUrl as jest.Mock).mockResolvedValue(ok({ presignedUrl: 'signed-put', objectKey: key }));
  (uploadFileToS3 as jest.Mock).mockResolvedValue(undefined);
  (modifyProfileImage as jest.Mock).mockResolvedValue(ok({ profileImageUrl: url }));
  (getMyProfile as jest.Mock).mockResolvedValue(ok({ profileImageUrl: 'old' }));
  (deleteProfileImage as jest.Mock).mockResolvedValue(ok(null));
});
afterEach(() => client?.clear());

it('uploads first, connects the key, and preserves account fields', async () => {
  const { result } = setup();
  await act(async () => { await result.current.save(photo); });
  expect(getPresignedUrl).toHaveBeenCalledWith({ fileName: 'profile.jpg', contentType: 'image/jpeg', directory: 'profile-images' });
  expect(uploadFileToS3).toHaveBeenCalledWith('signed-put', photo.uri, 'image/jpeg', expect.any(Function));
  expect((uploadFileToS3 as jest.Mock).mock.invocationCallOrder[0]).toBeLessThan((modifyProfileImage as jest.Mock).mock.invocationCallOrder[0]);
  expect(client.getQueryData(['profile', 'me'])).toEqual({ name: '소울', email: 'a@b.com', profileImageUrl: url });
});
it('does not PATCH after a failed PUT and keeps the old photo', async () => {
  (uploadFileToS3 as jest.Mock).mockRejectedValue(new Error('PUT failed'));
  const { result } = setup();
  await act(async () => { await expect(result.current.save(photo)).rejects.toThrow('PUT failed'); });
  expect(modifyProfileImage).not.toHaveBeenCalled();
  expect(client.getQueryData(['profile', 'me'])).toHaveProperty('profileImageUrl', 'old');
});
it('retries only PATCH after a failed connection', async () => {
  (modifyProfileImage as jest.Mock).mockRejectedValueOnce(new Error('PATCH failed')).mockResolvedValueOnce(ok({ profileImageUrl: url }));
  const { result } = setup();
  await act(async () => { await expect(result.current.save(photo)).rejects.toThrow('PATCH failed'); });
  await act(async () => { await result.current.save(photo); });
  expect(uploadFileToS3).toHaveBeenCalledTimes(1);
  expect(getPresignedUrl).toHaveBeenCalledTimes(1);
  expect(modifyProfileImage).toHaveBeenCalledTimes(2);
});
it('recognizes a successful PATCH whose response was lost', async () => {
  (modifyProfileImage as jest.Mock).mockRejectedValue(new Error('timeout'));
  (getMyProfile as jest.Mock).mockResolvedValue(ok({ profileImageUrl: `${url}?signature=abc` }));
  const { result } = setup();
  await act(async () => { await result.current.save(photo); });
  expect(client.getQueryData(['profile', 'me'])).toHaveProperty('profileImageUrl', `${url}?signature=abc`);
});
it('blocks a second save before React rerenders', async () => {
  let finish!: () => void;
  (uploadFileToS3 as jest.Mock).mockImplementation(() => new Promise<void>(resolve => { finish = resolve; }));
  const { result } = setup();
  let first!: Promise<string | null | undefined>;
  await act(async () => { first = result.current.save(photo); });
  await waitFor(() => expect(uploadFileToS3).toHaveBeenCalledTimes(1));
  await act(async () => {
    expect(await result.current.save(photo)).toBeUndefined();
    finish();
    await first;
  });
  expect(modifyProfileImage).toHaveBeenCalledTimes(1);
});
it('does not connect an old upload after logout', async () => {
  let listener!: (state: { isLoggedIn: boolean; userUuid: string | null }) => void;
  (useAuthStore.subscribe as jest.Mock).mockImplementation(callback => { listener = callback; return jest.fn(); });
  (uploadFileToS3 as jest.Mock).mockImplementation(async () => { listener({ isLoggedIn: false, userUuid: null }); });
  const { result } = setup();
  await act(async () => { await expect(result.current.save(photo)).rejects.toThrow('로그인 상태'); });
  expect(modifyProfileImage).not.toHaveBeenCalled();
  expect(client.getQueryData(['profile', 'me'])).toHaveProperty('profileImageUrl', 'old');
});
it('deletes without uploading and restores the default avatar', async () => {
  const { result } = setup();
  await act(async () => { await result.current.remove(); });
  expect(deleteProfileImage).toHaveBeenCalledTimes(1);
  expect(uploadFileToS3).not.toHaveBeenCalled();
  expect(client.getQueryData(['profile', 'me'])).toHaveProperty('profileImageUrl', null);
});
it('rejects a file over 5 MiB before requesting an upload URL', async () => {
  (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({ exists: true, isDirectory: false, size: 5 * 1024 * 1024 + 1 });
  const { result } = setup();
  await act(async () => { await expect(result.current.save(photo)).rejects.toThrow('용량'); });
  expect(getPresignedUrl).not.toHaveBeenCalled();
});

it('reports real bytes, ignores invalid totals and ignores late events after a failed attempt', async () => {
  type Progress = { bytesSent: number; totalBytes: number };
  let report!: (progress: Progress) => void;
  let fail!: (error: Error) => void;
  let finish!: () => void;
  (uploadFileToS3 as jest.Mock).mockImplementation((_url, _uri, _mime, callback) => {
    report = callback;
    return new Promise<void>((resolve, reject) => { finish = resolve; fail = reject; });
  });
  const { result } = setup();
  let first!: Promise<string | null | undefined>;
  let firstFailure!: Promise<unknown>;
  await act(async () => { first = result.current.save(photo); firstFailure = first.catch(error => error); });
  await waitFor(() => expect(result.current.stage).toBe('upload'));
  act(() => report({ bytesSent: 30, totalBytes: 0 }));
  expect(result.current.uploadProgress).toBeNull();
  act(() => report({ bytesSent: 40, totalBytes: 100 }));
  expect(result.current.uploadProgress).toBe(0.4);
  act(() => report({ bytesSent: 20, totalBytes: 100 }));
  expect(result.current.uploadProgress).toBe(0.4);
  const oldReport = report;
  await act(async () => { fail(new Error('PUT failed')); await firstFailure; });
  let second!: Promise<string | null | undefined>;
  await act(async () => { second = result.current.save(photo); });
  await waitFor(() => expect(uploadFileToS3).toHaveBeenCalledTimes(2));
  expect(result.current.uploadProgress).toBeNull();
  act(() => oldReport({ bytesSent: 100, totalBytes: 100 }));
  expect(result.current.uploadProgress).toBeNull();
  act(() => report({ bytesSent: 50, totalBytes: 100 }));
  expect(result.current.uploadProgress).toBe(0.5);
  await act(async () => { finish(); await second; });
  expect(result.current.uploadProgress).toBe(1);
});
