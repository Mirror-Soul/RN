import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { useAuthStore } from '@/src/store/useAuthStore';
import { getOrCreateInstallationId } from '@/src/utils/installationIdStorage';
import { logger } from '@/src/utils/logger';
import { useRegisterPushDeviceMutation } from './useRegisterPushDeviceMutation';

/** 백엔드 FIREBASE_ANDROID_CHANNEL_ID 기본값(chat_messages)과 반드시 일치해야 한다. */
const ANDROID_CHANNEL_ID = 'chat_messages';

/**
 * 푸시 알림 설정 훅. 앱 루트(_layout.tsx)에서 1회만 호출한다.
 *
 * iOS는 APNs 인증키가 아직 발급되지 않아(Apple Developer Program 등록 전) 백엔드에 등록해도
 * 실제 발송은 안 되므로 지금은 Android만 처리한다 — iOS 준비되면 Platform.OS 가드만 풀면 된다.
 */
export function usePushNotificationSetup() {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const registerMutation = useRegisterPushDeviceMutation();

  // 알림 채널은 로그인 여부와 무관하게 앱 시작 시 한 번만 있으면 된다.
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
      name: '채팅 메시지',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
    }).catch((error) => logger.warn('푸시 알림 채널 생성 실패', error));
  }, []);

  // 로그인 상태에서 권한 요청 → 기기 푸시 토큰 발급 → 서버 등록
  useEffect(() => {
    if (!isLoggedIn || Platform.OS !== 'android') return;
    let cancelled = false;

    (async () => {
      try {
        const current = await Notifications.getPermissionsAsync();
        const granted = current.granted || (await Notifications.requestPermissionsAsync()).granted;
        if (!granted || cancelled) return;

        const token = await Notifications.getDevicePushTokenAsync();
        if (cancelled) return;

        const installationId = await getOrCreateInstallationId();
        await registerMutation.mutateAsync({
          installationId,
          pushToken: token.data as string,
          platform: 'ANDROID',
        });
      } catch (error) {
        logger.warn('푸시 알림 등록 실패 (무시하고 계속 진행)', error);
      }
    })();

    return () => {
      cancelled = true;
    };
    // registerMutation은 mutateAsync 호출로 내부 상태(isPending 등)가 바뀔 때마다 새 객체가
    // 되는 react-query 훅이라, deps에 넣으면 등록 자체가 이 effect를 재실행시켜 반복 호출된다.
    // 로그인 상태가 바뀔 때만 실행하면 되므로 의도적으로 뺀다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  // 드물게 런타임 중 토큰이 롤링되는 경우 재등록 (expo-notifications 공식 권장 패턴)
  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const subscription = Notifications.addPushTokenListener(async (token) => {
      if (!useAuthStore.getState().isLoggedIn) return;
      try {
        const installationId = await getOrCreateInstallationId();
        await registerMutation.mutateAsync({
          installationId,
          pushToken: token.data as string,
          platform: 'ANDROID',
        });
      } catch (error) {
        logger.warn('푸시 토큰 갱신 재등록 실패', error);
      }
    });

    return () => subscription.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 알림 탭 → payload의 route로 딥링크 이동.
  // useLastNotificationResponse는 앱이 실행 중일 때의 탭뿐 아니라, 완전히 종료된 상태에서
  // 알림 탭으로 앱이 새로 실행된 경우(cold start)까지 하나로 커버한다 — 별도
  // addNotificationResponseReceivedListener 리스너로는 cold start 케이스를 놓친다.
  const lastNotificationResponse = Notifications.useLastNotificationResponse();
  useEffect(() => {
    const route = lastNotificationResponse?.notification.request.content.data?.route;
    if (typeof route === 'string') {
      router.push(route as any);
    }
  }, [lastNotificationResponse]);
}
