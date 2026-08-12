# 푸시 알림 기기 등록(`/push/devices`) 활용 가이드

> 이 문서는 실제 코드 변경 없이 **구현 방법을 설명하기 위한 가이드**다. 예시 코드는 전부
> 이 문서 안에만 존재하며, 실제 RN 프로젝트 파일은 건드리지 않았다.
>
> **루트 `PUSH_NOTIFICATION_ARCHITECTURE.md`(2026-07-10 작성)는 폐기 대상이다.**
> Expo Push Token(`ExponentPushToken[...]`) 방식을 가정하고 작성됐는데, 실제 백엔드
> (`PushNotificationService.java`)는 Firebase Admin SDK로 직접 발송하기 때문에
> **Expo Push Token을 그대로 보내면 발송이 실패한다.** 아래에서 왜 그런지, 무엇을
> 대신 써야 하는지 설명한다.

## 1. 백엔드 API가 실제로 하는 일

### `PUT /push/devices` — 기기 등록/토큰 갱신

```typescript
// request
{
  installationId: string; // UUID — "이 기기의 이 앱 설치"를 가리키는 클라이언트 발급 ID
  pushToken: string;      // FCM(Firebase Cloud Messaging) 등록 토큰
  platform: 'IOS' | 'ANDROID';
}

// response (ApiResponse<DeviceDTO>)
{
  installationId: string;
  platform: 'IOS' | 'ANDROID';
  enabled: boolean;
  lastSeenAt: string; // LocalDateTime
}
```

`PushDeviceService.register()`의 실제 동작(`PushDeviceService.java:26-58`):

1. `installationId`로 기존 row를 찾는다.
2. 동시에 `pushToken`으로도 찾는다 — 만약 같은 토큰이 **다른** installationId row에
   붙어 있다면(OS가 토큰을 재사용해서 준 경우) 그 오래된 row를 삭제한다(`push_token` UNIQUE 제약 때문).
3. `device.register(user, ...)`를 호출해서 **현재 로그인된 유저로 소유권을 재할당**하고
   `enabled=true`, `lastSeenAt=now`로 갱신한다.

**중요한 함의**: 이 호출은 "이 installationId는 지금부터 이 유저 것"이라고 서버에
선언하는 행위다. 그래서 **로그인할 때마다 다시 호출해야 한다** — 최초 설치 시 한 번만
부르면 안 된다. 같은 기기에서 A로 로그인했다가 로그아웃하고 B로 로그인하면, B가 로그인한
직후 다시 PUT을 불러야 이 기기가 B에게 재할당된다.

### `DELETE /push/devices/{installation-id}` — 기기 등록 해제

`(installationId, 현재 로그인 유저)`에 해당하는 row를 삭제한다. **로그아웃 시 호출**해서
로그아웃한 계정으로 더 이상 푸시가 안 가게 막는 용도다.

### 이 데이터가 실제로 쓰이는 곳

지금은 `ChatPushEventHandler`(새 채팅 메시지 도착 시)만 이 테이블을 조회해서 푸시를
보낸다(`PushNotificationService.sendChatMessage`). `push.firebase.enabled=true`
설정이 켜져 있어야 실제로 발송되고, 꺼져 있으면 등록 API 자체는 동작하지만 아무것도
발송되지 않는다(배포 환경 설정 확인 필요).

## 2. 왜 Expo Push Token이 아니라 진짜 FCM 토큰이어야 하는가

`PushNotificationService.java`를 보면:

```java
MulticastMessage message = MulticastMessage.builder()
        .setNotification(...)
        .setAndroidConfig(AndroidConfig.builder()...)
        .setApnsConfig(ApnsConfig.builder()...)
        .addAllTokens(tokens)   // ← 여기 들어가는 tokens가 진짜 FCM 토큰이어야 함
        .build();
firebaseMessaging.sendEachForMulticast(message);
```

Firebase Admin SDK의 `sendEachForMulticast`는 **iOS/Android 구분 없이 하나의 토큰
목록**을 받는다 — 이게 가능한 이유는 Firebase가 iOS에서도 APNs 토큰을 내부적으로 FCM
토큰으로 변환해서 발급해주기 때문이다. `ExponentPushToken[...]`(Expo 자체 프록시
토큰)은 Expo의 별도 푸시 서버(exp.host)를 거쳐야 실제 기기로 전달되는 형식이라,
Firebase Admin SDK에 그대로 넣으면 **유효하지 않은 토큰으로 실패**한다.

**결론**: RN에서는 `expo-notifications`의 `getExpoPushTokenAsync()`(Expo 프록시)가
아니라, **`@react-native-firebase/messaging`으로 진짜 FCM 토큰**을 받아야 한다.
iOS에서도 이 라이브러리를 쓰면 Firebase iOS SDK가 APNs↔FCM 토큰 교환을 알아서
처리해준다.

## 3. `installationId`는 어디서 오는가

서버 스키마상 유저 식별자가 아니라 **"이 기기의 이 앱 설치"**를 가리키는 값이다.
디바이스 하드웨어 ID를 쓰면 안 된다(App Store 정책 + 프라이버시 문제). 대신 앱이
직접 UUID를 하나 만들어서 로컬에 영구 저장하고 계속 재사용한다.

```typescript
// src/utils/installationId.ts (예시)
import * as SecureStore from 'expo-secure-store';
import { randomUUID } from 'expo-crypto';

const INSTALLATION_ID_KEY = 'installation_id';

export async function getOrCreateInstallationId(): Promise<string> {
  const existing = await SecureStore.getItemAsync(INSTALLATION_ID_KEY);
  if (existing) return existing;

  const newId = randomUUID();
  await SecureStore.setItemAsync(INSTALLATION_ID_KEY, newId);
  return newId;
}
```

앱 재설치 시엔 SecureStore도 함께 초기화되므로 자연스럽게 새 installationId가
생성된다 — "재설치 = 새 설치"라는 의미상 맞는 동작이다. `expo-secure-store`는
이미 프로젝트에 있고(`useVoiceAudioStore.ts`의 `secureStorage` 어댑터 패턴 참고),
`expo-crypto`는 신규 설치가 필요하다(네이티브 모듈 아님, JS 전용이라 빌드 리스크 없음).

## 4. 전체 플로우

```
[로그인 성공]
  → 알림 권한 요청 (최초 1회, 이후엔 상태만 확인)
  → FCM 토큰 발급 (@react-native-firebase/messaging)
  → getOrCreateInstallationId()
  → PUT /push/devices { installationId, pushToken, platform }

[앱 실행 중 토큰이 갱신되는 경우 — OS가 드물게 토큰을 재발급함]
  → messaging().onTokenRefresh(newToken => PUT /push/devices 재호출)

[로그아웃]
  → DELETE /push/devices/{installationId}
  → (기존 performLogout() 3단계보다 먼저 호출 — 토큰이 아직 메모리에 있을 때)
```

## 5. 예시 구현 (기존 컨벤션 그대로 — `types/api/<domain>.ts` + `<domain>Service.ts` + 훅)

```typescript
// src/types/api/push.ts
import { ApiResponse } from './common';

export type PushDevicePlatform = 'IOS' | 'ANDROID';

// ── PUT /push/devices ──
export interface RegisterPushDeviceRequest {
  installationId: string;
  pushToken: string;
  platform: PushDevicePlatform;
}

export interface PushDeviceResult {
  installationId: string;
  platform: PushDevicePlatform;
  enabled: boolean;
  lastSeenAt: string;
}

export type RegisterPushDeviceResponse = ApiResponse<PushDeviceResult>;

// ── DELETE /push/devices/{installation-id} ──
export type UnregisterPushDeviceResponse = ApiResponse<null>;
```

```typescript
// src/services/pushDeviceService.ts
import apiClient from './apiClient';
import {
  RegisterPushDeviceRequest,
  RegisterPushDeviceResponse,
  UnregisterPushDeviceResponse,
} from '../types/api/push';
import { logger } from '../utils/logger';

export const registerPushDevice = async (
  data: RegisterPushDeviceRequest
): Promise<RegisterPushDeviceResponse> => {
  logger.debug('registerPushDevice:', { installationId: data.installationId, platform: data.platform });
  try {
    const response = await apiClient.put<RegisterPushDeviceResponse>('/push/devices', data);
    logger.info('registerPushDevice SUCCESS');
    return response.data;
  } catch (error: unknown) {
    logger.error('registerPushDevice ERROR:', { message: error instanceof Error ? error.message : String(error) });
    throw error;
  }
};

export const unregisterPushDevice = async (
  installationId: string
): Promise<UnregisterPushDeviceResponse> => {
  logger.debug('unregisterPushDevice:', { installationId });
  try {
    const response = await apiClient.delete<UnregisterPushDeviceResponse>(`/push/devices/${installationId}`);
    logger.info('unregisterPushDevice SUCCESS');
    return response.data;
  } catch (error: unknown) {
    logger.error('unregisterPushDevice ERROR:', { message: error instanceof Error ? error.message : String(error) });
    throw error;
  }
};
```

```typescript
// src/features/push/hooks/useRegisterPushDeviceMutation.ts
import { useMutation } from '@tanstack/react-query';
import { Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import { registerPushDevice } from '@/src/services/pushDeviceService';
import { getOrCreateInstallationId } from '@/src/utils/installationId';

/**
 * 로그인 성공 직후 호출. 권한 요청 → FCM 토큰 발급 → 서버 등록까지 한 번에 처리한다.
 * (auth 도메인의 다단계 mutation 패턴과 동일 — useCreateAccountMutation.ts 참고)
 */
export const useRegisterPushDeviceMutation = () =>
  useMutation({
    mutationFn: async () => {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;
      if (!enabled) return null; // 사용자가 거부 — 조용히 종료 (Alert로 강요하지 않음)

      const pushToken = await messaging().getToken();
      const installationId = await getOrCreateInstallationId();

      return registerPushDevice({
        installationId,
        pushToken,
        platform: Platform.OS === 'ios' ? 'IOS' : 'ANDROID',
      });
    },
  });
```

```typescript
// src/features/push/hooks/useUnregisterPushDevice.ts
import { unregisterPushDevice } from '@/src/services/pushDeviceService';
import { getOrCreateInstallationId } from '@/src/utils/installationId';

/** performLogout()에서 호출 — 토큰 삭제 전에 먼저 실행돼야 한다. */
export async function unregisterCurrentPushDevice(): Promise<void> {
  try {
    const installationId = await getOrCreateInstallationId();
    await unregisterPushDevice(installationId);
  } catch (error) {
    // 로그아웃 자체를 막으면 안 되므로 실패는 무시 (authService.performLogout의
    // logout() 실패 처리와 동일한 원칙 — 서버 정리 실패가 로컬 로그아웃을 막지 않는다)
  }
}
```

**연결 지점**:
- `useCreateAccountMutation.ts`/`useLoginMutation.ts`의 `onSuccess` 안에서
  `useRegisterPushDeviceMutation().mutate()` 호출 (로그인 성공 직후).
- `authService.ts`의 `performLogout()` 맨 앞에 `await unregisterCurrentPushDevice()`
  추가 (토큰 정리보다 먼저).
- 토큰 갱신은 앱 최상위(`app/_layout.tsx`)에서 `messaging().onTokenRefresh(...)`
  리스너를 한 번 등록해두고, 새 토큰이 오면 `registerPushDevice`를 다시 호출.

## 6. 필요한 신규 설치 및 설정 (빌드 리스크 있음 — 미리 알아둘 것)

- **`@react-native-firebase/app`, `@react-native-firebase/messaging`** — 네이티브
  모듈이라 `npx expo prebuild` 재생성이 필요하다.
- **Android**: Firebase 콘솔에서 `google-services.json` 발급 후 `mirror-soul/` 루트에 배치.
- **iOS**: Firebase 콘솔에서 `GoogleService-Info.plist` 발급 + Apple Developer에서
  APNs 인증키(.p8) 발급 후 Firebase 콘솔에 업로드 + Xcode에서 Push Notifications
  capability 활성화 필요.
- **`expo-device`** 신규 설치 필요 — 시뮬레이터에서는 푸시 토큰 발급이 안 되므로
  `Device.isDevice` 체크로 스킵 처리 (기존 문서 Step 1 참고, 이 부분은 여전히 유효).
- 루트 CLAUDE.md에 기록된 대로 이 프로젝트는 **네이티브 의존성 추가 후 iOS 빌드에서
  반복적으로 문제가 있었다**(MLKit 시뮬레이터 이슈 등). Firebase 추가도 동일한 종류의
  리스크(pod 충돌, 시뮬레이터 아키텍처)가 있을 수 있으니, 작은 검증 스파이크(빌드만
  먼저 확인) 후 본 기능에 통합하는 순서를 권장한다.

## 7. 기존 알림 설정(`useNotificationStore`)과의 관계

`useNotificationStore.eventAlert`(zustand, 로컬 전용) 같은 "이 유형의 알림을 받을지
말지" 설정과, 이번 `/push/devices`(기기 자체가 푸시를 받을 수 있는 상태인지)는
**서로 다른 개념**이다:

- `/push/devices`의 `enabled`는 "이 기기 토큰이 유효한가"만 나타낸다 (FCM이
  `UNREGISTERED` 에러를 주면 서버가 자동으로 `false`로 내림 — `PushNotificationService
  .disableUnregisteredDevices` 참고).
- 알림 유형별 ON/OFF(예: 채팅 알림 끄기)는 지금 백엔드 어디에도 없다 — `Push
  Notification` 발송 로직(`sendChatMessage`)이 유저 설정을 전혀 확인하지 않고 무조건
  발송한다. 이 부분은 이번 등록 API와는 별개로, 필요하면 백엔드에 "알림 유형별 설정"
  테이블/체크 로직을 추가로 요청해야 한다.

## 8. 알려진 한계와 보완 방안

위 5~7장의 설계를 그대로 구현했을 때 실제로 터지는 문제들. 우선순위 순으로 정리했다.

### 8.1 알림을 탭해도 화면 이동이 안 됨 (가장 큰 누락)

백엔드가 이미 `route: "/chat/" + chatRoomId` 데이터를 실어 보내는데(`PushNotificationService.sendBatch`),
5장 예시엔 이걸 받아서 실제로 이동시키는 코드가 없다. 그대로면 알림은 뜨는데 탭해도 아무 반응이 없다.

**보완**: `app/_layout.tsx`에 `messaging().onNotificationOpenedApp()`(백그라운드에서 탭)과
`messaging().getInitialNotification()`(앱이 완전히 꺼진 상태에서 알림으로 실행)을 둘 다 등록하고,
`remoteMessage.data.route`를 `router.push()`로 넘긴다. 두 이벤트는 서로 다른 상황이라 하나만
등록하면 절반의 케이스만 동작한다.

### 8.2 앱이 포그라운드일 때 알림이 안 보임

iOS/Android 표준 동작상 포그라운드에서 푸시가 오면 OS가 배너를 자동으로 안 띄우고
`messaging().onMessage(...)`로 JS에만 조용히 전달된다. 처리 안 하면 "앱 켜놓고 테스트했더니
알림이 하나도 안 온다"는 버그로 보고된다.

**보완**: `onMessage` 핸들러에서 포그라운드일 땐 기존 `ToastProvider.tsx`의 `useToast()`로
in-app 표시, 백그라운드/종료 상태일 땐 OS 네이티브 배너(자동)로 나눠서 처리한다. 이렇게 하면
새 알림 UI 라이브러리를 추가로 안 넣어도 된다.

### 8.3 Android에서 알림이 조용히 안 뜰 수 있음

백엔드가 `channelId: "chat_messages"`(`application.yaml`의 `push.firebase.android-channel-id`
기본값)로 보내는데, Android는 클라이언트가 그 채널을 미리 만들어두지 않으면 안 띄우거나
기본 설정(무음 등)으로 띄운다.

**보완**: 앱 시작 시 한 번 `notifee.createChannel({ id: 'chat_messages', ... })`로 백엔드와
정확히 같은 채널 ID를 생성해둔다. 채널 ID는 상수 하나로 관리해서 백엔드 값과 벌어지지 않게 한다.

### 8.4 로그아웃 시 DELETE가 조용히 401로 실패할 수 있음

`DELETE /push/devices/{id}`는 인증이 필요하다. `unregisterCurrentPushDevice()`를
`useAuthStore.getState().logout()`(액세스 토큰 제거) **이후에** 잘못 넣으면 401로 실패하는데,
5장 예시의 `catch`가 이를 조용히 삼켜서 에러 로그 한 줄 없이 등록 해제가 안 되는 채로 넘어간다.

**보완**: `performLogout()` 맨 첫 줄에서 호출하도록 강제하고, `catch` 블록에 `logger.error`를
남겨 순서 실수가 나도 로그로 추적 가능하게 한다.

### 8.5 앱을 오래 안 열면 토큰이 오래된 채로 방치됨

지금 설계는 로그인 시점 + `onTokenRefresh` 리스너로만 갱신을 잡는데, 이 앱은 refresh token
기반이라 몇 달간 재로그인 없이 쓸 수 있다. 그 사이 앱이 꺼져 있을 때 토큰이 갱신되면
리스너가 못 잡고 서버엔 죽은 토큰만 남는다.

**보완**: 콜드 스타트마다(이미 로그인된 상태로 앱을 열 때) `messaging().getToken()`을 한 번
더 확인해서 로컬에 캐시된 마지막 등록 토큰과 다를 때만 재등록한다. 실제로 바뀐 경우만
호출하므로 API 콜이 불필요하게 늘지 않는다.

### 8.6 로그인마다 알림 권한 팝업을 다시 시도함

5장 예시는 로그인 성공마다 무조건 `requestPermission()`을 부른다. 기능적으로 깨지진 않지만
(iOS는 한 번 결정되면 재요청해도 팝업이 안 뜸), 최초 1회에 아무 설명 없이 바로 OS 팝업부터
뜨는 건 iOS 진영에서 opt-in률을 떨어뜨리는 대표적 안티패턴이다.

**보완**: `messaging().hasPermission()`으로 먼저 확인해서 `UNDETERMINED`일 때만 커스텀
안내 UI(간단한 바텀시트)를 먼저 보여주고, 사용자가 거기서 동의한 다음 실제 OS 권한 요청을
띄우는 2단계로 간다. 이미 결정된 상태면 바로 토큰 발급 단계로 넘어간다.

### 8.7 등록 실패 시 재시도가 없음

로그인 직후 백그라운드에서 조용히 한 번 시도하고 끝이라, 그 순간 네트워크가 불안정하면
그 세션 내내 등록이 안 된 채로 남고 아무도 인지하지 못한다.

**보완**: mutation에 `retry: 2` 정도의 기본 재시도를 추가한다. 8.5(콜드 스타트 재확인)가
사실상 "다음 기회에 재시도"하는 안전망 역할도 겸하므로 두 보완을 함께 적용하면 충분하다.

### 8.8 유저가 알림을 꺼도 계속 옴 (프론트만으로 해결 불가)

`PushNotificationService.sendChatMessage`가 유저 설정을 전혀 확인하지 않고 무조건 발송하므로,
`useNotificationStore`의 로컬 토글은 서버 발송 여부에 아무 영향을 못 준다. 이건 백엔드에
"알림 유형별 on/off" 테이블과 발송 전 체크 로직 추가를 별도로 요청해야 해결된다 (7장 참고).

## 9. 진행 현황 및 남은 작업 체크리스트

이 문서를 다시 볼 때 "지금 어디까지 됐고 다음에 뭘 해야 하는지" 한눈에 보기 위한 섹션.
비슷한 질문이 다시 나오면 이 섹션부터 확인할 것.

### 9.1 완료됨 (Firebase 없이 가능한 부분, `feat/push-device-registration` 브랜치)

- [x] `src/utils/installationId.ts` — UUID v4 발급 + SecureStore 영구 저장
- [x] `src/types/api/push.ts`, `src/services/pushDeviceService.ts` — API 서비스 레이어
- [x] `src/features/push/hooks/useRegisterPushDeviceMutation.ts` — `pushToken`을 인자로
      받는 구조라 Firebase 없이도 완성됨 (토큰 발급 지점만 나중에 연결하면 됨)
- [x] `authService.performLogout()` 맨 앞에 `unregisterCurrentPushDevice()` 연결
      (액세스 토큰이 살아있는 시점 — 401 회피)
- [x] `expo-crypto` 설치 (표준 모듈, 빌드 리스크 없음)

### 9.2 Firebase 콘솔 준비 — 진행 방법은 별도 진행 중 (외부 계정 작업, 코드 아님)

- [ ] 백엔드 엔지니어에게 기존 Firebase 프로젝트 있는지 먼저 확인 (있으면 새로 만들지 말 것 —
      토큰이 백엔드가 인증하는 프로젝트와 안 맞으면 발송 자체가 실패함)
- [ ] (없으면) Firebase Console에서 프로젝트 생성
- [ ] Android 앱 등록 — 패키지명 `com.mirrorsoul.app` (`app.json`의 `android.package`와
      정확히 일치해야 함) → `google-services.json` 다운로드
- [ ] iOS 앱 등록 — 번들 ID `com.mirrorsoul.app` (`app.json`의 `ios.bundleIdentifier`와
      정확히 일치해야 함) → `GoogleService-Info.plist` 다운로드
- [ ] Apple Developer 계정에서 APNs 인증키(.p8) 발급 → Firebase Console
      "Apple 앱 구성"에 업로드 (Key ID, Team ID 포함) — Apple Developer 팀 관리자급 권한 필요
- [ ] 서비스 계정 키(JSON) 발급 → **시크릿이므로 깃에 커밋 금지, 1Password/DM 등으로만 전달**
      → 백엔드가 `GOOGLE_APPLICATION_CREDENTIALS` 환경변수로 설정
- [ ] 백엔드 배포 환경에 `FIREBASE_PUSH_ENABLED=true`, `FIREBASE_PROJECT_ID=<프로젝트ID>`
      설정 (`application.yaml` 기준 현재 `enabled` 기본값은 `false`)

### 9.3 Firebase 파일 준비된 후 진행할 코드 작업 (우선순위 순)

- [ ] `google-services.json`을 `mirror-soul/` 루트에 배치
- [ ] `GoogleService-Info.plist`를 `mirror-soul/` 루트에 배치
- [ ] `@react-native-firebase/app`, `@react-native-firebase/messaging` 설치 +
      `npx expo prebuild` (네이티브 의존성 — 작은 빌드 검증 스파이크 먼저 권장, 루트
      CLAUDE.md의 MLKit 이슈 이력 참고)
- [ ] 권한 요청 2단계 플로우: `hasPermission()` 확인 → `UNDETERMINED`일 때만 커스텀
      안내 UI 먼저 → OS 권한 요청 (8.6)
- [ ] `messaging().getToken()` 발급 → `useRegisterPushDeviceMutation().mutate({pushToken, platform})`
      호출을 로그인 성공 훅(`useLoginMutation`/`useCreateAccountMutation`의 `onSuccess`)에 연결
- [ ] `messaging().onTokenRefresh(...)` 리스너 등록 (`app/_layout.tsx`) — 토큰 갱신 시 재등록
- [ ] 콜드 스타트 시 토큰 재확인 로직 (8.5 — 로컬 캐시와 다를 때만 재등록)
- [ ] `messaging().onMessage(...)` — 포그라운드 수신 시 `useToast()`로 표시 (8.2)
- [ ] Android 알림 채널 생성 — `chat_messages`(백엔드 `push.firebase.android-channel-id`
      기본값과 정확히 일치) (8.3)
- [ ] `messaging().onNotificationOpenedApp()` + `getInitialNotification()` — 알림 탭 시
      `data.route`로 `router.push()` 딥링크 처리 (8.1, 가장 우선순위 높음)

### 9.4 이번 범위 밖 — 별도로 백엔드에 요청 필요

- [ ] 부재중 통화/시간 부족 알림 발송 로직 (User 엔티티에 토글 필드는 이미 있으나 발송
      트리거 코드가 없음 — 1번 질문 답변 참고)
- [ ] 알림 유형별 on/off를 서버가 실제로 체크하는 로직 (8.8)
