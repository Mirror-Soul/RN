import apiClient from './apiClient';
import { queryClient } from './queryClient';
import { endCall, initiateCall, reconcilePendingCall } from './callService';
import { getErrorDisplayMessage } from '../utils/apiErrorCode';
import { clearPendingCall, readPendingCall, savePendingCall } from '../utils/pendingCallStorage';

jest.mock('../utils/logger', () => ({ logger: { debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn() } }));
jest.mock('./apiClient', () => ({ __esModule: true, default: { post: jest.fn(), patch: jest.fn() } }));
jest.mock('./queryClient', () => ({ queryClient: { invalidateQueries: jest.fn() } }));
jest.mock('../utils/pendingCallStorage', () => ({
  savePendingCall: jest.fn(),
  readPendingCall: jest.fn(),
  clearPendingCall: jest.fn(),
}));
let mockUserUuid: string | null = 'me';
jest.mock('../store/useAuthStore', () => ({ useAuthStore: { getState: () => ({ userUuid: mockUserUuid }) } }));

const post = (apiClient as unknown as { post: jest.Mock }).post;
const mockSave = savePendingCall as jest.Mock;
const mockRead = readPendingCall as jest.Mock;
const mockClear = clearPendingCall as jest.Mock;

const START_URL = '/calls/clones/clone-uuid';
const request = { mediaType: 'VIDEO' as const };
const envelope = <T,>(result: T) => ({ data: { isSuccess: true, code: 'COMMON200', message: 'ok', error: '', result } });
const started = (callId: number) => envelope({ callId, roomId: 'room', mediaType: 'VIDEO', status: 'READY', callerSignalId: 'c', aiSignalId: 'a', signalingUrl: '/ws/signaling' });
const ended = (callId: number) => envelope({ callId, status: 'CANCELLED', durationSec: 0, remainingTalkTime: 100 });
// apiClient 인터셉터가 실제로 reject하는 모양: message는 코드 기본 문구, 상세는 error 필드.
const activeCallConflict = () => ({ code: 'PAYMENT_4090', message: '결제 또는 멱등키 상태가 요청과 일치하지 않습니다.', error: '이미 진행 중인 통화가 있습니다.' });
const networkError = () => ({ code: 'NETWORK_ERROR', message: '네트워크 연결을 확인해주세요.', error: 'Network Error' });

beforeEach(() => {
  jest.clearAllMocks();
  mockUserUuid = 'me';
  post.mockReset();
  mockRead.mockReset().mockResolvedValue(null);
  mockSave.mockReset().mockResolvedValue(undefined);
  mockClear.mockReset().mockResolvedValue(undefined);
});

describe('initiateCall', () => {
  it('remembers the new call for the signed-in account so a later launch can end it', async () => {
    post.mockResolvedValueOnce(started(41));
    const response = await initiateCall('clone-uuid', request);
    expect(response.result.callId).toBe(41);
    expect(mockSave).toHaveBeenCalledWith('me', 41);
  });

  it('still starts the call when the record cannot be saved', async () => {
    mockSave.mockRejectedValue(new Error('keychain unavailable'));
    post.mockResolvedValueOnce(started(41));
    await expect(initiateCall('clone-uuid', request)).resolves.toMatchObject({ result: { callId: 41 } });
  });

  it('does not save a record without a signed-in account', async () => {
    mockUserUuid = null;
    post.mockResolvedValueOnce(started(41));
    await initiateCall('clone-uuid', request);
    expect(mockSave).not.toHaveBeenCalled();
  });

  it('passes unrelated errors through untouched without looking for a leftover call', async () => {
    const insufficient = { code: 'CALL_4001', message: '남은 대화 시간이 부족합니다.', error: '' };
    post.mockRejectedValueOnce(insufficient);
    await expect(initiateCall('clone-uuid', request)).rejects.toBe(insufficient);
    expect(mockRead).not.toHaveBeenCalled();
    expect(post).toHaveBeenCalledTimes(1);
  });

  it('ends this device’s leftover call and retries exactly once when the server reports an active call', async () => {
    mockRead.mockResolvedValue(9);
    post.mockRejectedValueOnce(activeCallConflict()).mockResolvedValueOnce(ended(9)).mockResolvedValueOnce(started(42));
    const response = await initiateCall('clone-uuid', request);
    expect(response.result.callId).toBe(42);
    expect(post.mock.calls.map(([url]) => url)).toEqual([START_URL, '/calls/9/end', START_URL]);
    expect(post.mock.calls[1][1]).toEqual({ recordingUrl: '' });
    expect(mockClear).toHaveBeenCalledWith('me', 9);
    expect(mockSave).toHaveBeenCalledWith('me', 42);
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['profile', 'time'] });
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['history', 'calls'] });
  });

  it('explains the situation instead of showing a payment message when nothing of ours is left to end', async () => {
    post.mockRejectedValueOnce(activeCallConflict());
    const failure = await initiateCall('clone-uuid', request).catch((error) => error);
    expect(failure).toMatchObject({ code: 'CALL_ALREADY_IN_PROGRESS', error: '이미 진행 중인 통화가 있습니다.' });
    expect(failure.message).toContain('이전 통화');
    expect(failure.message).not.toContain('결제');
    expect(getErrorDisplayMessage(failure)).toBe(failure.message);
    expect(post).toHaveBeenCalledTimes(1);
  });

  it('gives up with the same explanation when the leftover call cannot be ended right now', async () => {
    mockRead.mockResolvedValue(9);
    post.mockRejectedValueOnce(activeCallConflict()).mockRejectedValueOnce(networkError());
    await expect(initiateCall('clone-uuid', request)).rejects.toMatchObject({ code: 'CALL_ALREADY_IN_PROGRESS' });
    expect(post).toHaveBeenCalledTimes(2);
    expect(mockClear).not.toHaveBeenCalled();
  });

  it('does not loop when the account is still blocked after ending ours', async () => {
    mockRead.mockResolvedValue(9);
    post.mockRejectedValueOnce(activeCallConflict()).mockResolvedValueOnce(ended(9)).mockRejectedValueOnce(activeCallConflict());
    await expect(initiateCall('clone-uuid', request)).rejects.toMatchObject({ code: 'CALL_ALREADY_IN_PROGRESS' });
    expect(post).toHaveBeenCalledTimes(3);
  });

  it('reports a different failure of the retry as it is', async () => {
    const insufficient = { code: 'CALL_4001', message: '남은 대화 시간이 부족합니다.', error: '' };
    mockRead.mockResolvedValue(9);
    post.mockRejectedValueOnce(activeCallConflict()).mockResolvedValueOnce(ended(9)).mockRejectedValueOnce(insufficient);
    await expect(initiateCall('clone-uuid', request)).rejects.toBe(insufficient);
  });
});

describe('a call this process is still running', () => {
  it('is never ended by a second start that the server refuses (for example a double-opened call screen)', async () => {
    post.mockResolvedValueOnce(started(77));
    await initiateCall('clone-uuid', request);
    mockRead.mockResolvedValue(77);
    post.mockRejectedValueOnce(activeCallConflict());
    await expect(initiateCall('clone-uuid', request)).rejects.toMatchObject({ code: 'CALL_ALREADY_IN_PROGRESS' });
    expect(post.mock.calls.map(([url]) => url)).toEqual([START_URL, START_URL]);
    expect(mockClear).not.toHaveBeenCalled();
    await expect(reconcilePendingCall()).resolves.toBe(false);
  });

  it('is no longer protected once the server confirms it has ended', async () => {
    post.mockResolvedValueOnce(started(78));
    await initiateCall('clone-uuid', request);
    post.mockResolvedValueOnce(ended(78));
    await endCall(78, '');
    mockRead.mockResolvedValue(78);
    post.mockResolvedValueOnce(ended(78));
    await expect(reconcilePendingCall()).resolves.toBe(true);
  });

  it('stays protected while ending it fails for a transient reason', async () => {
    post.mockResolvedValueOnce(started(79));
    await initiateCall('clone-uuid', request);
    post.mockRejectedValueOnce(networkError());
    await expect(endCall(79, '')).rejects.toMatchObject({ code: 'NETWORK_ERROR' });
    mockRead.mockResolvedValue(79);
    await expect(reconcilePendingCall()).resolves.toBe(false);
  });
});

describe('endCall', () => {
  it('sends the recording url and forgets the record once the server confirms', async () => {
    post.mockResolvedValueOnce(ended(9));
    const response = await endCall(9, 'https://file.invalid/a.m4a');
    expect(response.result.callId).toBe(9);
    expect(post).toHaveBeenCalledWith('/calls/9/end', { recordingUrl: 'https://file.invalid/a.m4a' });
    expect(mockClear).toHaveBeenCalledWith('me', 9);
  });

  it('keeps the record when ending fails for a transient reason', async () => {
    post.mockRejectedValueOnce(networkError());
    await expect(endCall(9, '')).rejects.toMatchObject({ code: 'NETWORK_ERROR' });
    expect(mockClear).not.toHaveBeenCalled();
  });

  it.each([
    ['CALL_4040', '서버에 없는 통화'],
    ['AUTH_4030', '내 통화가 아님'],
  ])('drops the record when the call can never be ended by this account (%s: %s)', async (code) => {
    post.mockRejectedValueOnce({ code, message: 'x', error: '' });
    await expect(endCall(9, '')).rejects.toMatchObject({ code });
    expect(mockClear).toHaveBeenCalledWith('me', 9);
  });

  it('still reports success when clearing the record fails', async () => {
    mockClear.mockRejectedValue(new Error('keychain unavailable'));
    post.mockResolvedValueOnce(ended(9));
    await expect(endCall(9, '')).resolves.toMatchObject({ result: { callId: 9 } });
  });
});

describe('reconcilePendingCall', () => {
  it('does nothing without a signed-in account or a stored call', async () => {
    mockUserUuid = null;
    await expect(reconcilePendingCall()).resolves.toBe(false);
    mockUserUuid = 'me';
    await expect(reconcilePendingCall()).resolves.toBe(false);
    expect(post).not.toHaveBeenCalled();
  });

  it('ends the stored call and refreshes balance and history', async () => {
    mockRead.mockResolvedValue(9);
    post.mockResolvedValueOnce(ended(9));
    await expect(reconcilePendingCall()).resolves.toBe(true);
    expect(post).toHaveBeenCalledWith('/calls/9/end', { recordingUrl: '' });
    expect(queryClient.invalidateQueries).toHaveBeenCalledTimes(3);
  });

  it('reports failure without throwing when the server cannot be reached or the record cannot be read', async () => {
    mockRead.mockResolvedValue(9);
    post.mockRejectedValueOnce(networkError());
    await expect(reconcilePendingCall()).resolves.toBe(false);
    mockRead.mockRejectedValue(new Error('keychain unavailable'));
    await expect(reconcilePendingCall()).resolves.toBe(false);
    expect(queryClient.invalidateQueries).not.toHaveBeenCalled();
  });
});
