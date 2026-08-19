# 📱 Push 알림 아키텍처 (Android)

> 2026-08-19 기준 실제 구현을 서술한다. 이전 버전(2026-07-10 작성)은 Expo Push Token 기반
> 설계를 전제로 `/notifications/*` 엔드포인트를 제안했는데, 실제 백엔드는 순수 FCM 토큰과
> `/push/devices` 엔드포인트로 구현되어 완전히 다르다 — 이 문서로 대체한다.

## 1. 왜 Expo Push Token이 아니라 순수 FCM 토큰인가

`expo-notifications`는 두 종류의 토큰을 발급할 수 있다.

- `getExpoPushTokenAsync()` → `ExponentPushToken[...]` — Expo가 운영하는 푸시 중계 서비스용. 백엔드가 `expo-server-sdk` 등으로 Expo 서버에 발송을 위임해야 한다.
- `getDevicePushTokenAsync()` → 플랫폼 네이티브 토큰(Android는 FCM 등록 토큰 문자열 그대로) — 백엔드가 Firebase Admin SDK로 **직접** FCM에 발송할 때 쓴다.

백엔드(`mirror-soul-back`)는 `firebase-admin` SDK로 직접 `FirebaseMessaging.sendEachForMulticast`를 호출하므로, FE는 반드시 **`getDevicePushTokenAsync()`**를 써야 한다. Expo 토큰을 보내면 백엔드가 FCM에 전달할 수 없는 문자열을 받게 된다.

## 2. 전체 흐름

```
[RN 앱]                          [백엔드]                      [FCM]
   |  ① 알림 권한 요청               |                              |
   |  ② getDevicePushTokenAsync()   |                              |
   |  ③ PUT /push/devices --------->|                              |
   |     {installationId,           |  device 저장/갱신             |
   |      pushToken, platform}      |                              |
   |                                |  채팅 메시지 발생 시           |
   |                                |  ----------------------------->|
   |<--------------------------------------------------------------|  ④ 알림 수신
   |  ⑤ 탭 → data.route로 딥링크    |                              |
```

## 3. FE 구현 (`mirror-soul/`)

| 역할 | 파일 |
|---|---|
| 타입 | `src/types/api/push.ts` |
| 서비스 (PUT/DELETE 호출) | `src/services/pushService.ts` |
| 기기 등록 mutation | `src/features/push/hooks/useRegisterPushDeviceMutation.ts` |
| 권한/토큰/등록/딥링크 오케스트레이션 | `src/features/push/hooks/usePushNotificationSetup.ts` |
| `installationId` 생성/영구 보관 | `src/utils/installationIdStorage.ts` |

### installationId — 옛 설계에는 없던 개념

백엔드는 토큰 자체가 아니라 **기기 설치 단위 UUID**(`installationId`)로 기기를 식별한다(`PushDeviceService.register`가 `installationId` 우선으로 upsert). 토큰은 언제든 바뀔 수 있지만 `installationId`는 앱 재설치 전까지 고정이라, 토큰 롤링 시에도 같은 기기로 인식된다. FE에서 최초 1회 생성해 `expo-secure-store`에 영구 보관한다(`getOrCreateInstallationId`).

### 등록 시점

`usePushNotificationSetup()`을 앱 루트(`app/_layout.tsx`)에서 1회 호출한다. `react-query`의 `useMutation`을 쓰므로 `QueryClientProvider` 하위(`PushNotificationSetup` 컴포넌트)에 배치해야 한다 — `useProactiveTokenRefresh()`처럼 Provider보다 먼저 실행되는 자리에 두면 컨텍스트 에러가 난다.

- 로그인 상태가 될 때: 권한 확인/요청 → `getDevicePushTokenAsync()` → `PUT /push/devices`
- 런타임 중 토큰이 롤링되는 드문 경우: `addPushTokenListener`로 감지해 재등록
- 로그아웃 시: `authService.performLogout()`이 인증이 살아있는 동안 `DELETE /push/devices/{installationId}`를 호출(토큰 정리 전에 해야 함 — 이후엔 Authorization 헤더가 없어 호출 자체가 실패)
- 알림 탭 시: `useLastNotificationResponse()`로 `data.route`를 읽어 `router.push` — 앱이 완전히 종료된 상태에서 알림 탭으로 실행된 경우(cold start)까지 포함해서 처리된다

### iOS는 아직 처리하지 않음

`usePushNotificationSetup()`은 `Platform.OS === 'android'`로 가드되어 있다. iOS는 APNs 인증키 발급에 Apple Developer Program(유료) 등록이 필요해 보류 중이다. 준비되면 이 가드만 풀면 되고, 백엔드는 이미 `ApnsConfig`까지 포함해 발송 로직을 구현해뒀다(`PushNotificationService.sendBatch`).

## 4. 백엔드 계약 (`mirror-soul-back`, 이미 구현·테스트 완료)

- `PUT /push/devices` — body: `{ installationId: UUID, pushToken: string, platform: 'IOS' | 'ANDROID' }`
- `DELETE /push/devices/{installation-id}`
- 채팅방 알림은 멤버십 단위(`ChatRoomMember.notificationEnabled`)로 켜져 있는 수신자에게만, 발신자를 제외하고 500개씩 분할 발송된다. `MessagingErrorCode.UNREGISTERED` 응답을 받은 기기는 자동으로 `enabled=false` 처리된다.
- 알림 payload의 `data.route`는 `/chat/{chatRoomId}` 형태.

## 5. 아직 안 끝난 것 (FE 코드 밖의 일)

1. **Firebase Console** — 서비스 계정 키 발급, `google-services.json`을 프로젝트에 배치(현재 없음).
2. **배포 파이프라인** — `mirror-soul-back/.github/workflows/deploy.yml`에 `FIREBASE_PUSH_ENABLED`/`FIREBASE_PROJECT_ID`/`GOOGLE_APPLICATION_CREDENTIALS`가 없어서, 지금 머지돼도 운영에서는 기능이 꺼진 채로 배포된다(`push.firebase.enabled` 기본값 `false`).
3. **실기기 테스트** — 시뮬레이터/에뮬레이터는 푸시 토큰 발급이 제한적이라 실기기(`npx expo run:android -d`)로 확인 필요.

---

*최초 작성: 2026-07-10 | 갱신: 2026-08-19 — 실제 구현 기준으로 전면 재작성*
