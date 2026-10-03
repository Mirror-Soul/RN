import * as FileSystem from 'expo-file-system/legacy';
import { uploadFileToS3 } from './s3Service';

jest.mock('expo-file-system/legacy', () => ({ createUploadTask: jest.fn(), FileSystemUploadType: { BINARY_CONTENT: 0 } }));
const upload = jest.fn();
const cancel = jest.fn();
beforeEach(() => {
  jest.resetAllMocks();
  (FileSystem.createUploadTask as jest.Mock).mockReturnValue({ uploadAsync: upload, cancelAsync: cancel });
  upload.mockResolvedValue({ status: 200, body: '' });
  cancel.mockResolvedValue(undefined);
});
afterEach(() => jest.useRealTimers());

it('forwards native byte counts and PUTs binary content without API credentials', async () => {
  const progress = jest.fn();
  await uploadFileToS3('signed-url', 'file:///photo.jpg', 'image/jpeg', progress);
  const [, , options, callback] = (FileSystem.createUploadTask as jest.Mock).mock.calls[0];
  expect(options).toEqual({ httpMethod: 'PUT', uploadType: 0, headers: { 'Content-Type': 'image/jpeg' } });
  callback({ totalBytesSent: 123, totalBytesExpectedToSend: 456 });
  expect(progress).toHaveBeenCalledWith({ bytesSent: 123, totalBytes: 456 });
});

it('continues to support existing callers without a progress callback', async () => {
  await expect(uploadFileToS3('signed-url', 'file:///voice.wav', 'audio/wav')).resolves.toBeUndefined();
  expect((FileSystem.createUploadTask as jest.Mock).mock.calls[0][3]).toBeUndefined();
});

it('rejects a failed HTTP response even when all bytes were sent', async () => {
  upload.mockResolvedValue({ status: 403, body: 'expired' });
  await expect(uploadFileToS3('signed-url', 'file:///photo.jpg', 'image/jpeg')).rejects.toThrow('S3 업로드 실패: 403');
});

it('cancels a stalled upload after the existing timeout', async () => {
  jest.useFakeTimers();
  let finish!: (value: undefined) => void;
  upload.mockImplementation(() => new Promise(resolve => { finish = resolve; }));
  cancel.mockImplementation(async () => { finish(undefined); });
  const promise = uploadFileToS3('signed-url', 'file:///photo.jpg', 'image/jpeg');
  const assertion = expect(promise).rejects.toThrow('시간이 초과');
  await jest.advanceTimersByTimeAsync(60000);
  await assertion;
  expect(cancel).toHaveBeenCalledTimes(1);
});
