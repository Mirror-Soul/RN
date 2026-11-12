import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { useCallDetail } from './useCallDetail';
import { getTalkLogs, updateTalkLog } from '@/src/services/historyService';
import { TRANSCRIPT_POLL_INTERVAL_MS, TRANSCRIPT_SETTLE_WINDOW_MS, markCallEnded } from '../callTranscriptSettle';

jest.mock('@/src/services/historyService', () => ({ getTalkLogs: jest.fn(), updateTalkLog: jest.fn() }));
jest.mock('@/src/store/useAuthStore', () => ({ useAuthStore: (selector: (state: { isLoggedIn: boolean }) => unknown) => selector({ isLoggedIn: true }) }));
jest.mock('@/src/components/common/Toast/ToastProvider', () => ({ useToast: () => ({ showToast: jest.fn() }) }));
const mockGet = getTalkLogs as jest.Mock;
const mockUpdate = updateTalkLog as jest.Mock;
function createWrapper() {
  // mutation 기본 gcTime(5분)이 언마운트 때 실제 타이머로 남아 Jest 종료를 막지 않게 0으로 둔다.
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 }, mutations: { gcTime: 0 } } });
  return function Wrapper({ children }: { children: React.ReactNode }) { return <QueryClientProvider client={client}>{children}</QueryClientProvider>; };
}
beforeEach(() => jest.clearAllMocks());

it.each([0, -1, 1.5, NaN, Infinity])('does not fetch an invalid history ID: %s', async callId => {
  renderHook(() => useCallDetail(callId), { wrapper: createWrapper() });
  await act(async () => { await Promise.resolve(); });
  expect(mockGet).not.toHaveBeenCalled();
});
it('fetches and refreshes the exact current record', async () => {
  mockGet.mockResolvedValue({ result: { callId: 41, talkLogs: [] } });
  const { result } = renderHook(() => useCallDetail(41), { wrapper: createWrapper() });
  await waitFor(() => expect(result.current.data?.callId).toBe(41));
  expect(mockGet).toHaveBeenCalledWith(41);
  await act(async () => { await result.current.refetch(); });
  expect(mockGet.mock.calls).toEqual([[41], [41]]);
});

describe('right after a call ends on this device', () => {
  const twinLog = (message: string) => ({
    talkLogId: 1, speaker: 'MY_TWIN', message, startedAt: '2026-10-05T14:30:00', endedAt: '2026-10-05T14:30:20',
    editable: true, edited: false, editedAt: null,
  });
  const flush = () => act(async () => { await jest.advanceTimersByTimeAsync(0); });
  // React Query는 구독자 알림을 타이머로 미루므로, 시간을 흘린 뒤 조금 더 흘려야 훅 결과에 반영된다.
  const advance = async (ms: number) => { await act(async () => { await jest.advanceTimersByTimeAsync(ms + 100); }); };
  beforeEach(() => { jest.useFakeTimers(); mockGet.mockReset(); mockUpdate.mockReset(); });
  afterEach(() => { jest.clearAllTimers(); jest.useRealTimers(); });

  it('re-reads the transcript while the AI server may still be saving it, then stops', async () => {
    markCallEnded(501);
    mockGet.mockResolvedValue({ result: { callId: 501, talkLogs: [] } });
    const { result } = renderHook(() => useCallDetail(501), { wrapper: createWrapper() });
    await flush(); await flush();
    expect(result.current.transcriptSettling).toBe(true);
    expect(mockGet).toHaveBeenCalledTimes(1);

    await advance(TRANSCRIPT_POLL_INTERVAL_MS);
    expect(mockGet).toHaveBeenCalledTimes(2);

    mockGet.mockResolvedValue({ result: { callId: 501, talkLogs: [twinLog('늦게 도착한 답변')] } });
    await advance(TRANSCRIPT_POLL_INTERVAL_MS);
    expect(result.current.data?.talkLogs).toHaveLength(1);

    await advance(TRANSCRIPT_SETTLE_WINDOW_MS);
    expect(result.current.transcriptSettling).toBe(false);
    const readsAtEnd = mockGet.mock.calls.length;
    await advance(TRANSCRIPT_POLL_INTERVAL_MS * 4);
    expect(mockGet).toHaveBeenCalledTimes(readsAtEnd);
  });

  it('reads an ordinary history record once without polling', async () => {
    mockGet.mockResolvedValue({ result: { callId: 502, talkLogs: [] } });
    const { result } = renderHook(() => useCallDetail(502), { wrapper: createWrapper() });
    await flush(); await flush();
    await advance(TRANSCRIPT_SETTLE_WINDOW_MS);
    expect(result.current.transcriptSettling).toBe(false);
    expect(mockGet).toHaveBeenCalledTimes(1);
  });

  it('does not report background re-reads as a busy screen', async () => {
    markCallEnded(503);
    mockGet.mockResolvedValue({ result: { callId: 503, talkLogs: [] } });
    const { result } = renderHook(() => useCallDetail(503), { wrapper: createWrapper() });
    await flush(); await flush();
    let release!: (value: unknown) => void;
    mockGet.mockImplementationOnce(() => new Promise(resolve => { release = resolve; }));
    await advance(TRANSCRIPT_POLL_INTERVAL_MS);
    expect(mockGet).toHaveBeenCalledTimes(2);
    expect(result.current.isFetching).toBe(false);
    await act(async () => { release({ result: { callId: 503, talkLogs: [] } }); });
  });

  it('reads once more when the settling period ends so a paused poll cannot freeze a partial transcript', async () => {
    const endedAt = Date.now();
    markCallEnded(505, endedAt);
    const readTimes: number[] = [];
    mockGet.mockImplementation(async () => { readTimes.push(Date.now()); return { result: { callId: 505, talkLogs: [] } }; });
    const { result } = renderHook(() => useCallDetail(505), { wrapper: createWrapper() });
    await flush(); await flush();
    await advance(TRANSCRIPT_SETTLE_WINDOW_MS);
    expect(result.current.transcriptSettling).toBe(false);
    expect(readTimes.some(time => time > endedAt + TRANSCRIPT_SETTLE_WINDOW_MS)).toBe(true);
    const reads = readTimes.length;
    await advance(TRANSCRIPT_POLL_INTERVAL_MS * 4);
    expect(readTimes).toHaveLength(reads);
  });

  it('does not report the final catch-up read as a busy screen either', async () => {
    markCallEnded(506);
    mockGet.mockResolvedValue({ result: { callId: 506, talkLogs: [] } });
    const { result } = renderHook(() => useCallDetail(506), { wrapper: createWrapper() });
    await flush(); await flush();
    await act(async () => { await jest.advanceTimersByTimeAsync(TRANSCRIPT_SETTLE_WINDOW_MS - 100); });
    let release!: (value: unknown) => void;
    mockGet.mockImplementation(() => new Promise(resolve => { release = resolve; }));
    await act(async () => { await jest.advanceTimersByTimeAsync(2_600); });
    expect(result.current.transcriptSettling).toBe(false);
    expect(result.current.isFetching).toBe(false);
    await act(async () => { release({ result: { callId: 506, talkLogs: [] } }); });
  });

  it('does not let an in-flight re-read overwrite an answer that was just saved', async () => {
    markCallEnded(504);
    mockGet.mockResolvedValue({ result: { callId: 504, talkLogs: [twinLog('옛 답변')] } });
    const { result } = renderHook(() => useCallDetail(504), { wrapper: createWrapper() });
    await flush(); await flush();
    let releaseStale!: (value: unknown) => void;
    mockGet.mockImplementationOnce(() => new Promise(resolve => { releaseStale = resolve; }));
    await advance(TRANSCRIPT_POLL_INTERVAL_MS);
    mockUpdate.mockResolvedValue({ result: { ...twinLog('새 답변'), edited: true } });
    await act(async () => { await result.current.updateTalkLog(1, '새 답변'); });
    await flush();
    expect(result.current.data?.talkLogs[0].message).toBe('새 답변');
    await act(async () => { releaseStale({ result: { callId: 504, talkLogs: [twinLog('옛 답변')] } }); });
    await flush();
    expect(result.current.data?.talkLogs[0].message).toBe('새 답변');
  });
});
