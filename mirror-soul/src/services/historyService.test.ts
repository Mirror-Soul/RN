import apiClient from './apiClient';
import { getCallHistory, getTalkLogs, getWeeklySummary, updateTalkLog } from './historyService';

// babel-plugin-jest-hoist가 이 호출을 파일 최상단(import보다 위)으로 끌어올려주므로
// 실행 순서상 문제는 없다 — import/first 린트 규칙과의 충돌을 피하려고 물리적 위치만 아래에 둔다.
jest.mock('./apiClient', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockedApiClient = apiClient as unknown as {
  get: jest.Mock;
  post: jest.Mock;
  patch: jest.Mock;
  delete: jest.Mock;
};

const okResponse = <T>(result: T) => ({
  data: { isSuccess: true, code: 'COMMON2000', message: 'ok', result, error: null },
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('historyService', () => {
  it('getCallHistory defaults to type=ALL', async () => {
    mockedApiClient.get.mockResolvedValueOnce(
      okResponse({ summary: { totalCount: 0, receivedCount: 0, sentCount: 0 }, groups: [] })
    );
    const response = await getCallHistory();
    expect(mockedApiClient.get).toHaveBeenCalledWith('/history/calls', { params: { type: 'ALL' } });
    expect(response.result.groups).toEqual([]);
  });

  it('getCallHistory passes the given type through as a query param', async () => {
    mockedApiClient.get.mockResolvedValueOnce(
      okResponse({ summary: { totalCount: 1, receivedCount: 1, sentCount: 0 }, groups: [] })
    );
    await getCallHistory('RECEIVED');
    expect(mockedApiClient.get).toHaveBeenCalledWith('/history/calls', { params: { type: 'RECEIVED' } });
  });

  it('getWeeklySummary calls GET /history/weekly-summary', async () => {
    mockedApiClient.get.mockResolvedValueOnce(
      okResponse({
        period: { startedAt: '2026-08-17T00:00:00', endedAt: '2026-08-24T00:00:00', nextResetAt: '2026-08-24T00:00:00' },
        totalTalkTimeSec: 3600,
        receivedCallCount: 3,
        sentCallCount: 2,
        changeRate: 12,
        trend: 'UP',
        comparable: true,
      })
    );
    const response = await getWeeklySummary();
    expect(mockedApiClient.get).toHaveBeenCalledWith('/history/weekly-summary');
    expect(response.result.trend).toBe('UP');
  });

  it('getTalkLogs calls GET /history/calls/{call-id}/talk-logs', async () => {
    mockedApiClient.get.mockResolvedValueOnce(
      okResponse({
        callId: 42,
        callNumber: 1,
        partner: { userUuid: 'uuid-1', name: '수빈', age: 28, profileImageUrl: null, twinSyncRate: 92 },
        description: '수빈의 Twin과 대화',
        startedAt: '2026-08-17T14:30:00',
        talkLogs: [],
      })
    );
    await getTalkLogs(42);
    expect(mockedApiClient.get).toHaveBeenCalledWith('/history/calls/42/talk-logs');
  });

  it('updateTalkLog patches { message } to /history/calls/{call-id}/talk-logs/{talk-log-id}', async () => {
    mockedApiClient.patch.mockResolvedValueOnce(
      okResponse({
        talkLogId: 7,
        speaker: 'MY_TWIN',
        message: '수정된 답변',
        startedAt: '2026-08-17T14:30:00',
        endedAt: '2026-08-17T14:30:05',
        editable: true,
        edited: true,
        editedAt: '2026-08-17T15:00:00',
      })
    );
    const response = await updateTalkLog(42, 7, '수정된 답변');
    expect(mockedApiClient.patch).toHaveBeenCalledWith('/history/calls/42/talk-logs/7', { message: '수정된 답변' });
    expect(response.result.edited).toBe(true);
  });

  it('rethrows errors from apiClient so callers can handle them', async () => {
    const apiError = { code: 'CALL_NOT_FOUND', message: '통화를 찾을 수 없습니다.' };
    mockedApiClient.get.mockRejectedValueOnce(apiError);
    await expect(getTalkLogs(999)).rejects.toEqual(apiError);
  });
});
