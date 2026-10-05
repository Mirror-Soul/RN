import apiClient from './apiClient';
import { completeFaceUpdate } from './evolveService';

jest.mock('./apiClient', () => ({ __esModule: true, default: { post: jest.fn() } }));
jest.mock('../utils/logger', () => ({ logger: { debug: jest.fn(), info: jest.fn(), error: jest.fn() } }));

beforeEach(() => jest.clearAllMocks());

it('sends only objectKey to the face-update endpoint and returns the pending job', async () => {
  const data = { isSuccess: true, code: 'COMMON2000', result: { jobId: 51, status: 'PENDING' } };
  (apiClient.post as jest.Mock).mockResolvedValue({ data });
  expect(await completeFaceUpdate({ objectKey: 'face-videos/me/new.mp4' })).toEqual(data);
  expect(apiClient.post).toHaveBeenCalledWith('/evolve/face', { objectKey: 'face-videos/me/new.mp4' });
});

it('keeps an API failure retryable instead of treating it as a saved face', async () => {
  const error = { code: 'AUTH_4030', message: 'ACTIVE users only' };
  (apiClient.post as jest.Mock).mockRejectedValue(error);
  await expect(completeFaceUpdate({ objectKey: 'face-videos/me/new.mp4' })).rejects.toEqual(error);
});
