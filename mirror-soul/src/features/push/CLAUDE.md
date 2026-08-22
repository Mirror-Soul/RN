# src/features/push/ (푸시 알림) — Claude Code 가이드

전체 아키텍처(왜 Expo Push Token이 아니라 순수 FCM 토큰인지, 전체 흐름)는 `../../../PUSH_NOTIFICATION_ARCHITECTURE.md` 참고 — 이 파일은 구현 중 실제로 겪은 레이스 컨디션/순서 문제만 다룬다. 전부 `usePushNotificationSetup.ts`(`feat/android-push-notifications`, CodeRabbit 리뷰 반영 커밋 `1534e25`)에서 발견/수정됨.

## 알림 채널 생성은 반드시 토큰 발급보다 먼저 완료돼야 한다

Expo 공식 문서상 `setNotificationChannelAsync`는 `getDevicePushTokenAsync`/`getExpoPushTokenAsync`보다 먼저 호출되어야 하는 필수 순서다(Android 13+ 알림 권한 프롬프트 자체가 채널이 있어야 뜬다). `usePushNotificationSetup.ts`엔 채널 생성 effect(마운트 시 1회)와 토큰 발급 effect(로그인 시)가 별도로 있는데, 이 둘은 독립 실행이라 순서가 보장 안 됐었다 — 공용 `ensureNotificationChannel()` 함수를 두고 토큰 발급 effect 안에서도 다시 `await`하는 방식으로 고쳤다. **새로운 곳에서 토큰을 발급받는 코드를 추가한다면 반드시 `ensureNotificationChannel()`을 먼저 `await`할 것.**

## cold start 딥링크가 인증 리다이렉트에 덮어써지는 레이스

`app/_layout.tsx`의 인증 리다이렉트 effect는 `rootNavigationState.key`가 준비되면 `setTimeout(fn, 0)`으로 `router.replace('/(main)')`(또는 `/login`)를 예약한다. `usePushNotificationSetup.ts`의 알림 탭 딥링크 effect도 같은 `rootNavigationState.key`를 기다리는데, 원래 `router.push`를 동기 실행했었다 — React 이펙트 순서상(자식 컴포넌트인 `PushNotificationSetup`이 부모 `RootLayout`보다 먼저 실행됨) 딥링크가 먼저 push되지만, 곧이어 `setTimeout(0)`이 발화하며 `router.replace`가 그 화면을 그대로 덮어써버린다.

지금은 딥링크 쪽 `router.push`를 100ms 지연시켜서(인증 effect의 0ms보다 확실히 늦게 스케줄되도록) 순서를 보장하는 방식으로 고쳤다 — **정확한 동기화가 아니라 지연 시간 차이에 기댄 방식**이라는 점을 알아둘 것. 두 effect의 스케줄링 방식이 바뀌면(예: `_layout.tsx`의 리다이렉트 딜레이가 100ms 이상으로 늘어나면) 다시 깨질 수 있다.

**아직 안 고친 잔여 갭**: 사용자가 로그아웃된 상태에서 예전 알림을 탭하면(세션 만료 후 알림 트레이에 남아있던 알림 등) 그 경로가 로그인 완료 후까지 유지되지 않는다 — 로그인 시점엔 이미 `lastNotificationResponse`를 소비할 기회를 놓친 뒤라 딥링크가 그냥 무시된다. 흔한 케이스는 아니라서(푸시 등록 자체가 로그인 상태에서만 일어남) 의도적으로 범위에서 뺐다. 필요해지면 "보류 중인 알림 경로"를 로그인 상태와 무관하게 별도로 저장했다가 로그인 완료 후 소비하는 방식으로 확장할 것.

## 로그아웃 시 푸시 기기 해제는 `/auth/logout`보다 먼저, 직렬로

`src/services/authService.ts`의 `performLogout()`은 기기 해제(`unregisterPushDevice`)와 서버 로그아웃(`logout()`)을 **병렬이 아니라 순서대로** 실행한다 — 둘 다 인증 토큰이 필요한 API인데, 서버가 로그아웃을 먼저 처리해 토큰을 무효화하면 기기 해제 요청이 인증 실패로 무시될 수 있어서다(로그아웃한 사용자의 기기에 등록이 그대로 남는 결과). 로그아웃 절차에 인증이 필요한 정리 작업을 새로 추가한다면 반드시 `useAuthStore.getState().logout()`(로컬 토큰 삭제) **이전에**, 그리고 `/auth/logout` 호출과 병렬이 아니라 그 앞에 넣을 것.

**해결 안 한 것**: 로그아웃과 거의 동시에 드물게 발생하는 토큰 롤링 재등록(`addPushTokenListener`)이 겹치는 경우까지는 안 막았다 — 발생 조건이 좁고, 막으려면 hook과 서비스 사이에 lifecycle 상태를 새로 공유해야 해서 복잡도 대비 실익이 낮다고 판단해 스킵함.

## 로그에 `installationId`(영구 기기 식별자) 남기지 말 것

`pushService.ts`의 `registerPushDevice`/`unregisterPushDevice`가 한때 `installationId`와 전체 응답(`response.data`)을 `logger.debug`/`logger.info`로 남겼었다 — 개발 콘솔에서만 보이는 값이긴 하지만(프로덕션에선 `logger.ts`가 `debug`/`info` 레벨 자체를 아예 출력 안 함), 영구 식별자는 습관적으로도 로그에 안 남기는 게 맞아서 제거함. 이 도메인에 로그를 추가할 때는 `platform`/`isSuccess` 같은 비식별 필드만 남길 것.
