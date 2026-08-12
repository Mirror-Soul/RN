import * as SecureStore from 'expo-secure-store';
import { randomUUID } from 'expo-crypto';

/**
 * 푸시 기기 등록(`/push/devices`)에 쓰이는 installationId 관리.
 *
 * 디바이스 하드웨어 ID가 아니라 앱이 직접 발급하는 UUID다 — 최초 1회 생성해서
 * SecureStore에 영구 저장하고, 이후엔 항상 같은 값을 재사용한다. 앱 재설치 시
 * SecureStore도 함께 초기화되므로 자연스럽게 새 값이 발급된다("재설치 = 새 설치").
 *
 * 세션 내 반복 조회를 줄이기 위해 메모리 캐시를 둔다 (SecureStore 접근은
 * 네이티브 브릿지를 타므로 매번 조회하지 않는 게 낫다).
 */
const INSTALLATION_ID_KEY = 'installation_id';

let cachedInstallationId: string | null = null;

export async function getOrCreateInstallationId(): Promise<string> {
  if (cachedInstallationId) return cachedInstallationId;

  const existing = await SecureStore.getItemAsync(INSTALLATION_ID_KEY);
  if (existing) {
    cachedInstallationId = existing;
    return existing;
  }

  const newId = randomUUID();
  await SecureStore.setItemAsync(INSTALLATION_ID_KEY, newId);
  cachedInstallationId = newId;
  return newId;
}
