# 📱 실무 Push 알림 아키텍처: 프론트엔드 ↔ 백엔드 완전 기술 가이드

> Mirror Soul 프로젝트 기준으로, 실제 Production 서비스에서 Push 알림을 어떻게 설계하고 구현하는지 프론트엔드와 백엔드의 전 과정을 기술합니다.

---

## 1. 전체 플로우 개요

Push 알림 시스템은 크게 3개의 주체가 통신합니다: **앱 클라이언트(React Native)**, **우리 서버(백엔드)**, 그리고 **플랫폼 Push Gateway(Apple APNs / Google FCM)**입니다.

```
[User Device]          [Our Backend]          [Push Gateway]
     |                      |                       |
     |  ① 토큰 발급         |                       |
     |--------------------> |                       |
     |  ② 설정 ON/OFF 전송  |                       |
     |--------------------> |                       |
     |                      |  ③ 푸시 발송 요청     |
     |                      |---------------------->|
     |                      |                       |  ④ 실제 메시지 전달
     |<-----------------------------------------------------------------|
```

각 단계를 하나씩 깊이 있게 풀어드립니다.

---

## 2. 핵심 개념: Push Token (FCM Token / APNs Device Token)

Push 알림의 핵심은 **"이 기기에 메시지를 보내려면 이 고유 주소를 써라"** 라는 개념입니다. 이것이 **Push Token**입니다.

- **iOS (APNs)**: Apple이 기기마다 발급하는 고유 토큰 (64바이트 16진수 문자열)
- **Android (FCM)**: Google Firebase가 기기마다 발급하는 고유 토큰 (약 150자 문자열)
- **Expo Push Token**: Expo 환경에서는 `expo-notifications` 라이브러리가 APNs/FCM 토큰을 내부적으로 처리하고, `ExponentPushToken[xxxx...]` 형태의 통합 토큰을 발급해줍니다. **Expo 토큰 하나로 iOS/Android 모두 대응 가능**하므로 현재 프로젝트에서는 이 방식이 가장 현실적입니다.

---

## 3. 단계별 구현 상세 (프론트엔드 관점)

### STEP 1: 권한 요청 및 Expo Push Token 발급

앱이 처음 실행될 때(또는 로그인 직후), 알림 권한을 요청하고 토큰을 발급받습니다.

```typescript
// src/services/pushNotification.ts (신규 생성 예정)
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

export async function registerForPushNotificationsAsync(): Promise<string | null> {
  // 1. 실기기 여부 확인 (시뮬레이터에서는 Push 토큰 발급 불가)
  if (!Device.isDevice) {
    console.warn('Push 알림은 실기기에서만 동작합니다.');
    return null;
  }

  // 2. 현재 권한 상태 확인
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // 3. 권한이 없으면 OS 수준의 권한 요청 팝업 표시
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  // 4. 사용자가 거부했다면 null 반환
  if (finalStatus !== 'granted') {
    return null;
  }

  // 5. Expo Push Token 발급 (iOS의 APNs, Android의 FCM을 Expo가 통합 처리)
  const token = (await Notifications.getExpoPushTokenAsync({
    projectId: 'YOUR_EAS_PROJECT_ID', // app.json의 extra.eas.projectId
  })).data;

  return token; // "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]"
}
```

### STEP 2: 토큰을 백엔드 서버에 저장 (등록)

발급받은 토큰은 **반드시 우리 서버에 저장**해야 합니다. 서버가 나중에 이 토큰으로 메시지를 보내야 하기 때문입니다. 이 과정을 **"토큰 등록(Token Registration)"** 이라고 합니다.

```typescript
// src/api/notificationApi.ts (신규 생성 예정)
import { apiClient } from './client'; // 기존 axios 인스턴스

export async function registerPushToken(pushToken: string): Promise<void> {
  await apiClient.post('/notifications/token', {
    pushToken,
    platform: Platform.OS, // 'ios' | 'android'
  });
}

// 토큰 삭제 (로그아웃 시 호출하여 해당 기기로의 알림 중단)
export async function unregisterPushToken(pushToken: string): Promise<void> {
  await apiClient.delete('/notifications/token', {
    data: { pushToken }
  });
}
```

**⚠️ 토큰 갱신 처리**: Push Token은 OS 업데이트, 앱 재설치, 오랜 미사용 등의 이유로 변경될 수 있습니다. 실무에서는 `Notifications.addPushTokenListener()`로 토큰 변경을 감지하고 서버에 자동으로 재등록합니다.

### STEP 3: 사용자 알림 설정 ON/OFF를 서버에 동기화

현재 구현된 Zustand 스토어는 **로컬 UI 상태**만 관리합니다. 실무에서는 이 설정값을 서버에도 동기화해야, 서버가 "이 유저는 이벤트 알림을 꺼놨으니 발송하지 말 것"을 판단할 수 있습니다.

```typescript
// src/api/notificationApi.ts
export interface NotificationSettings {
  timeLimitAlert: boolean;
  eventAlert: boolean;
  // missedCallAlert: boolean; // 추후 추가
}

export async function updateNotificationSettings(
  settings: NotificationSettings
): Promise<void> {
  await apiClient.put('/notifications/settings', settings);
}

export async function fetchNotificationSettings(): Promise<NotificationSettings> {
  const { data } = await apiClient.get<NotificationSettings>('/notifications/settings');
  return data;
}
```

그리고 `useNotificationSettings.ts` 훅에서 토글 시 즉시 API를 호출합니다:

```typescript
// useNotificationSettings.ts 업그레이드 방향
const toggleTimeLimitAlert = async () => {
  const newValue = !timeLimitAlert;
  // Optimistic Update: UI를 먼저 바꾸고
  store.setTimeLimitAlert(newValue);
  try {
    // API 호출로 서버에 동기화
    await updateNotificationSettings({ timeLimitAlert: newValue, eventAlert });
  } catch (error) {
    // 실패 시 원래 상태로 롤백
    store.setTimeLimitAlert(!newValue);
    Alert.alert('설정 저장에 실패했습니다. 다시 시도해주세요.');
  }
};
```

> **Optimistic Update(낙관적 업데이트)**: UI를 서버 응답을 기다리지 않고 먼저 변경하는 최신 UX 패턴입니다. 네트워크 지연이 있어도 사용자는 즉각적인 피드백을 받으며, 실패 시에만 롤백합니다. `React Query`(TanStack Query)와 결합하면 더욱 강력하게 구현됩니다.

---

## 4. 백엔드 관점에서 본 Push 알림 발송 흐름

### 백엔드 DB 설계 (참고용)

```sql
-- 기기 토큰 테이블
CREATE TABLE device_tokens (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_uuid   UUID NOT NULL REFERENCES users(uuid) ON DELETE CASCADE,
  push_token  VARCHAR(255) NOT NULL UNIQUE,
  platform    VARCHAR(10) NOT NULL,     -- 'ios' | 'android'
  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP DEFAULT NOW()
);

-- 알림 설정 테이블
CREATE TABLE notification_settings (
  user_uuid         UUID PRIMARY KEY REFERENCES users(uuid) ON DELETE CASCADE,
  time_limit_alert  BOOLEAN DEFAULT TRUE,
  event_alert       BOOLEAN DEFAULT FALSE,
  missed_call_alert BOOLEAN DEFAULT FALSE,  -- 추후 활성화
  updated_at        TIMESTAMP DEFAULT NOW()
);
```

### 백엔드 발송 시나리오 예시 (Node.js / NestJS 기준)

```typescript
// 예시: 시간 소진 알림 발송 로직 (백엔드 코드)
import Expo, { ExpoPushMessage } from 'expo-server-sdk';

const expo = new Expo();

async function sendTimeLimitAlert(userUuid: string) {
  // 1. 해당 유저가 알림을 활성화했는지 DB에서 확인
  const settings = await db.notificationSettings.findOne({ userUuid });
  if (!settings?.timeLimitAlert) return; // 꺼져 있으면 발송 안 함

  // 2. 해당 유저의 모든 기기 토큰 조회 (멀티 디바이스 지원)
  const tokens = await db.deviceTokens.findMany({ userUuid });

  // 3. Expo Push 메시지 객체 구성
  const messages: ExpoPushMessage[] = tokens
    .filter(t => Expo.isExpoPushToken(t.pushToken))
    .map(t => ({
      to: t.pushToken,
      sound: 'default',
      title: 'Mirror Soul',
      body: '대화 가능 시간이 10분 미만입니다. 지금 충전하세요!',
      data: { type: 'TIME_LIMIT', screen: 'profile' }, // 딥링크용 데이터
      badge: 1,
    }));

  // 4. 배치로 발송 (Expo SDK가 내부적으로 APNs/FCM 라우팅 처리)
  const chunks = expo.chunkPushNotifications(messages);
  for (const chunk of chunks) {
    const receipts = await expo.sendPushNotificationsAsync(chunk);
    // 5. 영수증 확인으로 실패한 토큰(만료, 잘못된 토큰) 감지 및 DB 정리
    for (const receipt of receipts) {
      if (receipt.status === 'error' && receipt.details?.error === 'DeviceNotRegistered') {
        // 만료된 토큰 삭제
        await db.deviceTokens.delete({ pushToken: /* token */ });
      }
    }
  }
}
```

---

## 5. 실무 추가 고려사항 (Production 필수)

| 고려사항 | 설명 | 적용 기술 |
|---|---|---|
| **토큰 만료 처리** | 기기 토큰은 언제든 만료될 수 있음. `DeviceNotRegistered` 오류 시 DB에서 삭제 필요 | Expo Push Receipts API |
| **멀티 디바이스** | 한 유저가 iPad + iPhone 두 대 사용 시 두 기기 모두 발송 필요 | 1:N user ↔ token 관계 |
| **알림 클릭 핸들링 (딥링크)** | 알림 탭 시 특정 화면으로 이동 | `Notifications.addNotificationResponseReceivedListener` + expo-router |
| **로그아웃 시 토큰 삭제** | `useAuthStore.logout()` 호출 시 `DELETE /notifications/token` 호출하여 불필요한 알림 차단 | 기존 logout 훅에 추가 |
| **조용한 시간대(Quiet Hours)** | 야간(예: 23시~8시)에는 알림 발송을 억제하는 서버 로직 | 백엔드 스케줄러 + 유저 타임존 저장 |

---

## 6. 구현 로드맵 (현재 → 추후)

```
[현재 완료]
  ✅ 알림 설정 UI (토글 스위치)
  ✅ 로컬 상태 영속화 (Zustand + SecureStore)

[백엔드 협의 후 추가 구현]
  Step 1. expo-notifications 의존성 추가
  Step 2. 로그인 완료 직후 → registerForPushNotificationsAsync() 호출
  Step 3. 발급된 Expo Token → POST /notifications/token 서버 등록
  Step 4. 알림 설정 토글 → PUT /notifications/settings 실시간 동기화
  Step 5. 앱 시작 시 → GET /notifications/settings 로 서버 설정 fetch (Zustand 초기값 덮어쓰기)
  Step 6. 로그아웃 시 → DELETE /notifications/token 토큰 삭제
  Step 7. Notification Response Listener 추가 → 알림 탭 시 딥링크 처리
```

---

*최초 작성: 2026-07-10 | 대상: Mirror Soul 프론트엔드 & 백엔드 협의용*
