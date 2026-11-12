import apiClient from './apiClient';
import { queryClient } from './queryClient';
import {
  EndCallRequest,
  EndCallResponse,
  InitiateCallRequest,
  InitiateCallResponse,
  InProgressResponse,
} from '../types/api/call';
import { useAuthStore } from '../store/useAuthStore';
import { getErrorCode, getErrorDisplayMessage } from '../utils/apiErrorCode';
import { logger } from '../utils/logger';
import { clearPendingCall, readPendingCall, savePendingCall } from '../utils/pendingCallStorage';

/**
 * 통화(Call) 도메인 API 서비스 (SoC)
 */

const currentUserUuid = () => useAuthStore.getState().userUuid;

// 인터셉터가 Error가 아닌 일반 객체로 reject하므로 code/message/서버 상세(error)를 직접 꺼낸다.
const describeError = (error: unknown) => {
  const { code, message, error: detail } = (error ?? {}) as { code?: unknown; message?: unknown; error?: unknown };
  return { code, message: typeof message === 'string' ? message : String(error), detail };
};

// 통화 시작에서 PAYMENT_CONFLICT는 계정에 끝나지 않은 통화가 있다는 뜻이다 (서버가 상세 문구를 error 필드로만 보낸다).
const isActiveCallConflict = (error: unknown) => getErrorCode(error) === 'PAYMENT_CONFLICT';

const isCallUnendable = (error: unknown) => {
  const code = getErrorCode(error);
  return code === 'CALL_NOT_FOUND' || code === 'FORBIDDEN';
};

const toCallInProgressError = (cause: unknown) => ({
  code: 'CALL_ALREADY_IN_PROGRESS' as const,
  message: getErrorDisplayMessage({ code: 'CALL_ALREADY_IN_PROGRESS' }),
  error: describeError(cause).detail,
});

// 이 프로세스가 만들었고 아직 종료를 확인받지 못한 통화. 통화 화면이 쓰는 중일 수 있어 자동 정리에서 뺀다.
const liveCallIds = new Set<number>();

const trackStartedCall = async (callId: unknown) => {
  if (typeof callId !== 'number') return;
  liveCallIds.add(callId);
  const owner = currentUserUuid();
  if (!owner) return;
  try {
    await savePendingCall(owner, callId);
  } catch (error) {
    logger.warn('callService: failed to save pending call', error);
  }
};

const untrackEndedCall = async (callId: number) => {
  liveCallIds.delete(callId);
  const owner = currentUserUuid();
  if (!owner) return;
  try {
    await clearPendingCall(owner, callId);
  } catch (error) {
    logger.warn('callService: failed to clear pending call', error);
  }
};

const requestCall = async (url: string, data: InitiateCallRequest) => {
  const post = () => apiClient.post<InitiateCallResponse>(url, data);
  try {
    return await post();
  } catch (error) {
    if (!isActiveCallConflict(error)) throw error;
    // 이 기기가 남긴 통화라면 종료하고 한 번만 다시 시도한다.
    if (!(await reconcilePendingCall())) throw toCallInProgressError(error);
    try {
      return await post();
    } catch (retryError) {
      throw isActiveCallConflict(retryError) ? toCallInProgressError(retryError) : retryError;
    }
  }
};

/** 클론에게 음성 통화 걸기 */
export const initiateCall = async (
  cloneUserUuid: string,
  data: InitiateCallRequest
): Promise<InitiateCallResponse> => {
  const url = `/calls/clones/${cloneUserUuid}`;
  logger.debug('initiateCall:', { url, data });
  try {
    const response = await requestCall(url, data);
    await trackStartedCall(response.data.result?.callId);
    logger.info('initiateCall SUCCESS:', response.data);
    return response.data;
  } catch (error: unknown) {
    logger.error('initiateCall ERROR:', describeError(error));
    throw error;
  }
};

/** 통화 연결 완료 처리 */
export const setCallInProgress = async (
  callId: number
): Promise<InProgressResponse> => {
  const url = `/calls/${callId}/in-progress`;
  logger.debug('setCallInProgress:', { callId });
  try {
    const response = await apiClient.patch<InProgressResponse>(url);
    logger.info('setCallInProgress SUCCESS');
    return response.data;
  } catch (error: unknown) {
    logger.error('setCallInProgress ERROR:', {
      message: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
};

/** 통화 종료 */
export const endCall = async (
  callId: number,
  recordingUrl: string
): Promise<EndCallResponse> => {
  const url = `/calls/${callId}/end`;
  logger.debug('endCall:', { callId });
  const body: EndCallRequest = { recordingUrl };
  try {
    const response = await apiClient.post<EndCallResponse>(url, body);
    await untrackEndedCall(callId);
    logger.info('endCall SUCCESS:', response.data);
    return response.data;
  } catch (error: unknown) {
    if (isCallUnendable(error)) await untrackEndedCall(callId);
    logger.error('endCall ERROR:', describeError(error));
    throw error;
  }
};

/** 앱이 통화 중 종료/리로드되어 서버에 남은 이 기기의 통화를 종료한다. 종료했으면 true. */
export const reconcilePendingCall = async (): Promise<boolean> => {
  const owner = currentUserUuid();
  if (!owner) return false;
  try {
    const callId = await readPendingCall(owner);
    if (callId === null || liveCallIds.has(callId)) return false;
    await endCall(callId, '');
    void queryClient.invalidateQueries({ queryKey: ['profile', 'time'] });
    void queryClient.invalidateQueries({ queryKey: ['history', 'calls'] });
    void queryClient.invalidateQueries({ queryKey: ['history', 'weeklySummary'] });
    logger.info('reconcilePendingCall: ended a leftover call', { callId });
    return true;
  } catch (error) {
    logger.warn('reconcilePendingCall: could not end the leftover call', describeError(error));
    return false;
  }
};
