import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from './logger';

const STORAGE_KEY = 'mirror-soul:blocked-room-ids';

/**
 * 클라이언트 사이드 임시 차단 목록.
 *
 * 서버에 차단 API가 아직 없어서(Track 3, 백엔드 협업 필요) 강제력은 없지만,
 * 최소한 이 기기에서는 차단한 대화방이 다시 보이지 않도록 로컬에 저장한다.
 * 실제 차단 API가 생기면 이 유틸은 그 API 호출로 교체하거나 병행해야 한다.
 */

const readBlockedIds = async (): Promise<string[]> => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    logger.error('blockList: failed to read blocked ids', error);
    return [];
  }
};

export const isRoomBlocked = async (roomId: string): Promise<boolean> => {
  const blocked = await readBlockedIds();
  return blocked.includes(roomId);
};

export const blockRoom = async (roomId: string): Promise<void> => {
  const blocked = await readBlockedIds();
  if (blocked.includes(roomId)) return;
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([...blocked, roomId]));
};

export const unblockRoom = async (roomId: string): Promise<void> => {
  const blocked = await readBlockedIds();
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(blocked.filter((id) => id !== roomId)));
};
