import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';

const KEY = 'push_installation_id';

/**
 * 기기 설치(앱 재설치 전까지 고정) 단위 식별자.
 * 백엔드가 이 값으로 같은 기기의 토큰 갱신을 식별하므로(PushDeviceService.register),
 * 로그인 상태나 푸시 토큰과 무관하게 최초 1회 생성해 영구 보관한다.
 */
export const getOrCreateInstallationId = async (): Promise<string> => {
  const existing = await SecureStore.getItemAsync(KEY);
  if (existing) return existing;

  const generated = Crypto.randomUUID();
  await SecureStore.setItemAsync(KEY, generated);
  return generated;
};
