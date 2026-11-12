import { resetEvidenceDraft, submitEvidenceDraft, useEvidenceDraft } from './evidenceDraft';
import { getPresignedUrl } from '@/src/services/fileService';
import { uploadFileToS3 } from '@/src/services/s3Service';
import { submitJobDocuments } from '@/src/services/jobVerificationService';
import { queryClient } from '@/src/services/queryClient';

let mockOwner = 'me';
jest.mock('@/src/store/useAuthStore', () => ({ useAuthStore: { getState: () => ({ isLoggedIn: true, userUuid: mockOwner }) } }));
jest.mock('@/src/services/fileService', () => ({ getPresignedUrl: jest.fn() }));
jest.mock('@/src/services/s3Service', () => ({ uploadFileToS3: jest.fn() }));
jest.mock('@/src/services/jobVerificationService', () => ({ submitJobDocuments: jest.fn() }));
jest.mock('@/src/features/job-verification/useJobReviewQuery', () => ({ jobReviewKey: (owner: string) => ['job-verification', owner] }));
jest.mock('@/src/services/queryClient', () => ({ queryClient: { invalidateQueries: jest.fn(), setQueryData: jest.fn() } }));
jest.mock('./prepareEvidencePhoto', () => ({ MAX_EVIDENCE_BYTES: 5 * 1024 * 1024, deleteEvidencePhoto: jest.fn() }));

const photo = (id: string) => ({ id, uri: `file:///${id}.jpg`, width: 1200, height: 1600, size: 50000 });
beforeEach(() => {
  jest.clearAllMocks(); mockOwner = 'me'; resetEvidenceDraft('me', 'IT_TECH');
  useEvidenceDraft.setState({ photos: [photo('one')] });
  (getPresignedUrl as jest.Mock).mockResolvedValue({ isSuccess: true, result: { presignedUrl: 'https://upload.test', objectKey: 'job-certifications/me/one' } });
  (uploadFileToS3 as jest.Mock).mockResolvedValue(undefined);
  (submitJobDocuments as jest.Mock).mockResolvedValue({ isSuccess: true, result: { requestId: 42, status: 'PENDING', claimedJob: 'IT_TECH' } });
});

it('keeps the same evidence keys and retries only submission after a lost response', async () => {
  (submitJobDocuments as jest.Mock).mockRejectedValueOnce(new Error('timeout'));
  await expect(submitEvidenceDraft()).rejects.toThrow('timeout');
  expect(useEvidenceDraft.getState().photos).toHaveLength(1);
  expect(useEvidenceDraft.getState().busy).toBe(false);
  await expect(submitEvidenceDraft()).resolves.toMatchObject({ requestId: 42 });
  expect(uploadFileToS3).toHaveBeenCalledTimes(1);
  expect(getPresignedUrl).toHaveBeenCalledTimes(1);
  expect(submitJobDocuments).toHaveBeenNthCalledWith(1, ['job-certifications/me/one']);
  expect(submitJobDocuments).toHaveBeenNthCalledWith(2, ['job-certifications/me/one']);
  expect(useEvidenceDraft.getState().photos).toHaveLength(0);
  expect(queryClient.setQueryData).toHaveBeenCalledWith(['job-verification', 'me'], expect.objectContaining({ requestId: 42, status: 'PENDING' }));
});

it('keeps successful files during a partial multi-photo upload and preserves order', async () => {
  useEvidenceDraft.setState({ photos: [photo('one'), photo('two')] });
  (getPresignedUrl as jest.Mock).mockResolvedValueOnce({ result: { presignedUrl: 'one', objectKey: 'key-one' } }).mockResolvedValue({ result: { presignedUrl: 'two', objectKey: 'key-two' } });
  (uploadFileToS3 as jest.Mock).mockResolvedValueOnce(undefined).mockRejectedValueOnce(new Error('network')).mockResolvedValue(undefined);
  await expect(submitEvidenceDraft()).rejects.toThrow('network');
  expect(submitJobDocuments).not.toHaveBeenCalled();
  await submitEvidenceDraft();
  expect(uploadFileToS3).toHaveBeenCalledTimes(3);
  expect(submitJobDocuments).toHaveBeenCalledWith(['key-one', 'key-two']);
});

it('does not post another member’s evidence when the account changes during upload', async () => {
  let finish!: () => void;
  (uploadFileToS3 as jest.Mock).mockImplementation(() => new Promise<void>(resolve => { finish = resolve; }));
  const operation = submitEvidenceDraft();
  await Promise.resolve(); await Promise.resolve();
  mockOwner = 'other'; resetEvidenceDraft('other', 'DESIGN');
  finish();
  await expect(operation).rejects.toThrow('계정이 바뀌었어요');
  expect(submitJobDocuments).not.toHaveBeenCalled();
  expect(useEvidenceDraft.getState()).toMatchObject({ owner: 'other', job: 'DESIGN', busy: false, photos: [] });
});

it('blocks double submission while the first upload is in flight', async () => {
  let finish!: () => void;
  (uploadFileToS3 as jest.Mock).mockImplementation(() => new Promise<void>(resolve => { finish = resolve; }));
  const operation = submitEvidenceDraft();
  await Promise.resolve(); await Promise.resolve();
  await expect(submitEvidenceDraft()).rejects.toThrow('서류를 보내고 있어요');
  finish(); await operation;
  expect(submitJobDocuments).toHaveBeenCalledTimes(1);
});

it('rejects oversized evidence before any upload', async () => {
  useEvidenceDraft.setState({ photos: [{ ...photo('one'), size: 5 * 1024 * 1024 + 1 }] });
  await expect(submitEvidenceDraft()).rejects.toThrow('5MB');
  expect(getPresignedUrl).not.toHaveBeenCalled();
});
