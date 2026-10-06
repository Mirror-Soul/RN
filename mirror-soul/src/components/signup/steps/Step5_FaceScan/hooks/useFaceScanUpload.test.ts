import { act, renderHook } from '@testing-library/react-native';
import * as FileSystem from 'expo-file-system/legacy';
import { getPresignedUrl } from '@/src/services/fileService';
import { completeFaceUpdate } from '@/src/services/evolveService';
import { saveFaceScan } from '@/src/services/onboardingService';
import { uploadFileToS3 } from '@/src/services/s3Service';
import { useAuthStore } from '@/src/store/useAuthStore';
import { useFaceScanUpload } from './useFaceScanUpload';

jest.mock('expo-file-system/legacy', () => ({ getInfoAsync: jest.fn() }));
jest.mock('@/src/services/fileService', () => ({ getPresignedUrl: jest.fn() }));
jest.mock('@/src/services/evolveService', () => ({ completeFaceUpdate: jest.fn() }));
jest.mock('@/src/services/onboardingService', () => ({ saveFaceScan: jest.fn() }));
jest.mock('@/src/services/s3Service', () => ({ uploadFileToS3: jest.fn() }));
jest.mock('@/src/store/useAuthStore', () => ({ useAuthStore: { getState: jest.fn(), subscribe: jest.fn() } }));
let sessionChange: (state: { userUuid: string; isLoggedIn: boolean }) => void;
const ok = (result: unknown) => ({ isSuccess: true, result });
beforeEach(() => {
  jest.resetAllMocks();
  (useAuthStore.getState as jest.Mock).mockReturnValue({ userUuid: 'me', isLoggedIn: true });
  (useAuthStore.subscribe as jest.Mock).mockImplementation(fn => { sessionChange = fn; return jest.fn(); });
  (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({ exists: true, isDirectory: false, size: 1024 });
  (getPresignedUrl as jest.Mock).mockResolvedValue(ok({ presignedUrl: 'put', objectKey: 'face-videos/me/take.mp4', fileUrl: 'file-url' }));
  (uploadFileToS3 as jest.Mock).mockResolvedValue(undefined);
  (completeFaceUpdate as jest.Mock).mockResolvedValue(ok({ jobId: 25, status: 'PENDING' }));
  (saveFaceScan as jest.Mock).mockResolvedValue(ok({ saved: true, userUuid: 'me', objectKey: 'face-videos/me/take.mp4' }));
});
it('uploads mp4, requires confirmed server registration and exposes byte progress', async () => {
  const hook = renderHook(() => useFaceScanUpload());
  (uploadFileToS3 as jest.Mock).mockImplementation(async (_url, _uri, _type, progress) => {
    progress({ bytesSent: 50, totalBytes: 100 });
    progress({ bytesSent: 20, totalBytes: 100 });
  });
  await act(async () => { expect(await hook.result.current.uploadFaceVideo('file:///take.mp4')).toBe(true); });
  expect(getPresignedUrl).toHaveBeenCalledWith(expect.objectContaining({ contentType: 'video/mp4', fileName: 'face-capture.mp4' }));
  expect(saveFaceScan).toHaveBeenCalledWith({ objectKey: 'face-videos/me/take.mp4', fileUrl: 'file-url' });
  expect(hook.result.current.progress).toBe(1);
  expect(hook.result.current.isUploading).toBe(false);
});
it('retries server registration without uploading the same take twice', async () => {
  const hook = renderHook(() => useFaceScanUpload());
  (saveFaceScan as jest.Mock).mockRejectedValueOnce(new Error('offline'));
  await act(async () => { await expect(hook.result.current.uploadFaceVideo('file:///take.mp4')).rejects.toThrow('offline'); });
  await act(async () => { expect(await hook.result.current.uploadFaceVideo('file:///take.mp4')).toBe(true); });
  expect(uploadFileToS3).toHaveBeenCalledTimes(1);
  expect(saveFaceScan).toHaveBeenCalledTimes(2);
  expect(hook.result.current.error).toBeNull();
});
it('uploads a newly recorded path instead of reusing the previous video', async () => {
  const hook = renderHook(() => useFaceScanUpload());
  (saveFaceScan as jest.Mock).mockRejectedValueOnce(new Error('offline'));
  await act(async () => { await expect(hook.result.current.uploadFaceVideo('file:///take-1.mp4')).rejects.toThrow(); });
  await act(async () => { await hook.result.current.uploadFaceVideo('file:///take-2.mp4'); });
  expect(uploadFileToS3).toHaveBeenCalledTimes(2);
});
it.each([{ exists: false }, { exists: true, isDirectory: true, size: 1024 }, { exists: true, isDirectory: false, size: 0 }, { exists: true, isDirectory: false, size: 101 * 1024 * 1024 }])('rejects an unusable video before any upload: %p', async info => {
  const hook = renderHook(() => useFaceScanUpload());
  (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue(info);
  await act(async () => { await expect(hook.result.current.uploadFaceVideo('file:///take.mp4')).rejects.toThrow('영상을 읽을 수 없거나'); });
  expect(uploadFileToS3).not.toHaveBeenCalled();
  expect(saveFaceScan).not.toHaveBeenCalled();
});
it('does not connect an uploaded video after a session switch', async () => {
  const hook = renderHook(() => useFaceScanUpload());
  (uploadFileToS3 as jest.Mock).mockImplementation(async () => { sessionChange({ userUuid: 'other', isLoggedIn: true }); });
  await act(async () => { await expect(hook.result.current.uploadFaceVideo('file:///take.mp4')).rejects.toThrow('로그인 상태'); });
  expect(saveFaceScan).not.toHaveBeenCalled();
});
it.each([{ saved: false, userUuid: 'me', objectKey: 'face-videos/me/take.mp4' }, { saved: true, userUuid: 'other', objectKey: 'face-videos/me/take.mp4' }, { saved: true, userUuid: 'me', objectKey: 'wrong-key' }])('does not mark an unconfirmed response as successful: %p', async response => {
  const hook = renderHook(() => useFaceScanUpload());
  (saveFaceScan as jest.Mock).mockResolvedValue(ok(response));
  await act(async () => { await expect(hook.result.current.uploadFaceVideo('file:///take.mp4')).rejects.toThrow('영상 등록을 확인'); });
});
it('blocks a second tap synchronously while upload is pending', async () => {
  const hook = renderHook(() => useFaceScanUpload());
  let release!: () => void;
  (FileSystem.getInfoAsync as jest.Mock).mockImplementation(() => new Promise(resolve => { release = () => resolve({ exists: true, size: 1024 }); }));
  let pending!: Promise<boolean>;
  await act(async () => {
    pending = hook.result.current.uploadFaceVideo('file:///take.mp4');
    expect(await hook.result.current.uploadFaceVideo('file:///take.mp4')).toBe(false);
  });
  await act(async () => { release(); await pending; });
  expect(saveFaceScan).toHaveBeenCalledTimes(1);
});
it('offers login recovery for a refused registration without treating it as saved', async () => {
  const hook = renderHook(() => useFaceScanUpload());
  (saveFaceScan as jest.Mock).mockRejectedValue({ code: 'AUTH_4030', message: 'ONBOARD_D only' });
  await act(async () => { await expect(hook.result.current.uploadFaceVideo('file:///take.mp4')).rejects.toMatchObject({ code: 'AUTH_4030' }); });
  expect(hook.result.current.requiresLogin).toBe(true);
  expect(hook.result.current.error).toContain('다시 로그인');
});
it('preserves the friendly message of plain API errors', async () => {
  const hook = renderHook(() => useFaceScanUpload());
  (saveFaceScan as jest.Mock).mockRejectedValue({ code: 'NETWORK_ERROR', message: '네트워크 연결을 확인해주세요.' });
  await act(async () => { await expect(hook.result.current.uploadFaceVideo('file:///take.mp4')).rejects.toBeDefined(); });
  expect(hook.result.current.error).toBe('네트워크 연결을 확인해주세요.');
});

it('submits a new face video to the ACTIVE-member endpoint, never the onboarding endpoint', async () => {
  const hook = renderHook(() => useFaceScanUpload('update'));
  await act(async () => { expect(await hook.result.current.uploadFaceVideo('file:///take.mp4')).toBe(true); });
  expect(getPresignedUrl).toHaveBeenCalledWith(expect.objectContaining({ directory: 'face-videos', contentType: 'video/mp4' }));
  expect(completeFaceUpdate).toHaveBeenCalledWith({ objectKey: 'face-videos/me/take.mp4' });
  expect(saveFaceScan).not.toHaveBeenCalled();
});
it('keeps a retryable take after face-job submission fails', async () => {
  const hook = renderHook(() => useFaceScanUpload('update'));
  (completeFaceUpdate as jest.Mock).mockRejectedValueOnce(new Error('offline'));
  await act(async () => { await expect(hook.result.current.uploadFaceVideo('file:///take.mp4')).rejects.toThrow('offline'); });
  await act(async () => { expect(await hook.result.current.uploadFaceVideo('file:///take.mp4')).toBe(true); });
  expect(uploadFileToS3).toHaveBeenCalledTimes(1);
  expect(completeFaceUpdate).toHaveBeenCalledTimes(2);
});
it.each([{ jobId: 25, status: 'FAILED' }, { jobId: 0, status: 'PENDING' }, { jobId: 25 }])('does not claim a successful face request for an invalid response: %p', async result => {
  const hook = renderHook(() => useFaceScanUpload('update'));
  (completeFaceUpdate as jest.Mock).mockResolvedValue(ok(result));
  await act(async () => { await expect(hook.result.current.uploadFaceVideo('file:///take.mp4')).rejects.toThrow('얼굴 학습 접수'); });
});
it('does not submit a face job after the user changes during upload', async () => {
  const hook = renderHook(() => useFaceScanUpload('update'));
  (uploadFileToS3 as jest.Mock).mockImplementation(async () => sessionChange({ userUuid: 'other', isLoggedIn: true }));
  await act(async () => { await expect(hook.result.current.uploadFaceVideo('file:///take.mp4')).rejects.toThrow('로그인 상태'); });
  expect(completeFaceUpdate).not.toHaveBeenCalled();
});
