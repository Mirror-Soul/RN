import * as SecureStore from 'expo-secure-store';

// 서버가 계정당 진행 중 통화를 1개로 제한해서 계정별로 한 칸이면 충분하다.
const keyFor = (userUuid: string) => `pending_call_${userUuid.replace(/[^A-Za-z0-9._-]/g, '_')}`;

export const savePendingCall = (userUuid: string, callId: number): Promise<void> =>
  SecureStore.setItemAsync(keyFor(userUuid), String(callId));

export const readPendingCall = async (userUuid: string): Promise<number | null> => {
  const raw = await SecureStore.getItemAsync(keyFor(userUuid));
  const callId = raw === null ? NaN : Number(raw);
  return Number.isSafeInteger(callId) && callId > 0 ? callId : null;
};

// callId를 주면 저장된 통화가 그것일 때만 지워, 늦게 끝난 이전 통화가 새 통화의 기록을 지우지 못하게 한다.
export const clearPendingCall = async (userUuid: string, callId?: number): Promise<void> => {
  if (callId !== undefined && (await readPendingCall(userUuid)) !== callId) return;
  await SecureStore.deleteItemAsync(keyFor(userUuid));
};
