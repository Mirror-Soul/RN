import { useEffect, useRef } from 'react';
import { AppState, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { router, useRootNavigationState, type Href } from 'expo-router';
import { useAuthStore } from '@/src/store/useAuthStore';
import { getOrCreateInstallationId } from '@/src/utils/installationIdStorage';
import { logger } from '@/src/utils/logger';
import { useRegisterPushDeviceMutation } from './useRegisterPushDeviceMutation';
import { queryClient } from '@/src/services/queryClient';
import { resetEvidenceDraft, useEvidenceDraft } from '@/src/features/job-verification/evidenceDraft';
import { jobReviewKey } from '@/src/features/job-verification/useJobReviewQuery';

/** 백엔드 FIREBASE_ANDROID_CHANNEL_ID 기본값(chat_messages)과 반드시 일치해야 한다. */
const ANDROID_CHANNEL_ID = 'chat_messages';

// expo-notifications는 이 핸들러를 설정하지 않으면 "앱이 포그라운드에 떠 있을 때 수신한
// 알림은 기본적으로 보여주지 않는다"(공식 문서 명시) — 백그라운드/종료 상태는 OS가 알아서
// 배너를 띄우므로 무관하지만, 포그라운드 중 도착한 채팅 알림은 이게 없으면 조용히 버려진다.
// 컴포넌트 렌더와 무관한 전역 1회성 등록이라 SplashScreen.preventAutoHideAsync()와 같은
// 방식으로 모듈 최상단에서 호출한다.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * 푸시 알림 설정 훅. 앱 루트(_layout.tsx)에서 1회만 호출한다.
 *
 * iOS는 APNs 인증키가 아직 발급되지 않아(Apple Developer Program 등록 전) 백엔드에 등록해도
 * 실제 발송은 안 되므로 지금은 Android만 처리한다 — iOS 준비되면 Platform.OS 가드만 풀면 된다.
 */
/**
 * Android 알림 채널 생성. Expo 공식 문서상 getDevicePushTokenAsync/getExpoPushTokenAsync보다
 * 반드시 먼저 호출되어야 한다(Android 13+ 알림 권한 프롬프트도 채널이 있어야 뜬다) —
 * setNotificationChannelAsync 자체는 upsert라 여러 번 호출해도 안전하다.
 */
async function ensureNotificationChannel() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
    name: '메시지와 서류 확인',
    importance: Notifications.AndroidImportance.HIGH,
    sound: 'default',
  });
}

export function usePushNotificationSetup() {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const userUuid = useAuthStore(state => state.userUuid);
  const userStatus = useAuthStore(state => state.userStatus);
  const registerMutation = useRegisterPushDeviceMutation();
  const rootNavigationState = useRootNavigationState();
  const handled = useRef<string | null>(null);
  const pendingReview = useRef<{ id: string; owner: string | null } | null>(null);

  useEffect(() => {
    const draft = useEvidenceDraft.getState();
    if (!isLoggedIn || draft.owner !== userUuid) resetEvidenceDraft(isLoggedIn ? userUuid : null);
  }, [isLoggedIn, userUuid]);

  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      if (notification.request.content.data?.type !== 'JOB_VERIFICATION_REVIEWED') return;
      const session = useAuthStore.getState();
      if (session.isLoggedIn && session.userUuid) {
        void queryClient.invalidateQueries({ queryKey: jobReviewKey(session.userUuid) });
        void queryClient.invalidateQueries({ queryKey: ['profile', 'introduction', session.userUuid] });
      }
    });
    return () => subscription.remove();
  }, []);

  // 알림 채널은 로그인 여부와 무관하게 앱 시작 시 한 번만 있으면 된다.
  useEffect(() => {
    ensureNotificationChannel().catch((error) => logger.warn('푸시 알림 채널 생성 실패', error));
  }, []);

  // 로그인 때만 권한을 요청한다. 기기 설정에서 돌아올 때는 읽기만 하고,
  // 새로 허용된 기기의 토큰을 서버에 등록한다.
  useEffect(() => {
    if (!isLoggedIn || !userUuid || Platform.OS !== 'android') return;
    let cancelled = false;
    let registering = false;
    let registeredToken: string | null = null;
    const currentSession = () => !cancelled && useAuthStore.getState().isLoggedIn && useAuthStore.getState().userUuid === userUuid;
    const setup = async (askPermission: boolean) => {
      if (registering || !currentSession()) return;
      registering = true;
      try {
        await ensureNotificationChannel();
        if (!currentSession()) return;
        const current = await Notifications.getPermissionsAsync();
        const granted = current.granted || (askPermission && current.canAskAgain && (await Notifications.requestPermissionsAsync()).granted);
        if (!granted || !currentSession()) return;
        const token = await Notifications.getDevicePushTokenAsync();
        if (!currentSession() || token.data === registeredToken) return;
        const installationId = await getOrCreateInstallationId();
        if (!currentSession()) return;
        await registerMutation.mutateAsync({ installationId, pushToken: token.data as string, platform: 'ANDROID' });
        if (currentSession()) registeredToken = token.data as string;
      } catch (error) {
        logger.warn('푸시 알림 등록 실패 (무시하고 계속 진행)', error);
      } finally { registering = false; }
    };
    void setup(true);
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') void setup(false);
    });
    return () => { cancelled = true; subscription.remove(); };
    // mutation 객체는 저장 상태 변경마다 새로 만들어진다. 세션 변경에만 재등록한다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, userUuid]);

  // 드물게 런타임 중 토큰이 롤링되는 경우 재등록 (expo-notifications 공식 권장 패턴)
  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const subscription = Notifications.addPushTokenListener(async (token) => {
      const sessionUuid = useAuthStore.getState().userUuid;
      if (!useAuthStore.getState().isLoggedIn || !sessionUuid) return;
      try {
        const installationId = await getOrCreateInstallationId();
        if (!useAuthStore.getState().isLoggedIn || useAuthStore.getState().userUuid !== sessionUuid) return;
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
  // rootNavigationState.key가 준비되기 전에 router.push를 호출하면 실패할 수 있어 대기한다
  // (_layout.tsx의 기존 인증 리다이렉트 effect와 같은 가드).
  const lastNotificationResponse = Notifications.useLastNotificationResponse();
  useEffect(() => {
    if (!rootNavigationState?.key) return;
    const request = lastNotificationResponse?.notification.request;
    const data = request?.content.data;
    const id = request?.identifier;
    if (typeof id !== 'string') return;
    const isReview = data?.type === 'JOB_VERIFICATION_REVIEWED' || data?.route === '/job-verifications';
    if (isReview && handled.current !== id && !pendingReview.current) pendingReview.current = { id, owner: isLoggedIn ? userUuid : null };
    if (isReview) {
      const pending = pendingReview.current;
      if (!pending || !isLoggedIn || !userUuid || userStatus !== 'ACTIVE') return;
      if (pending.owner && pending.owner !== userUuid) { pendingReview.current = null; handled.current = id; return; }
      const timer = setTimeout(() => {
        if (!useAuthStore.getState().isLoggedIn || useAuthStore.getState().userUuid !== userUuid || useAuthStore.getState().userStatus !== 'ACTIVE') return;
        handled.current = id; pendingReview.current = null;
        void queryClient.invalidateQueries({ queryKey: jobReviewKey(userUuid) });
        router.push('/job-verifications' as Href);
      }, 100);
      return () => clearTimeout(timer);
    }
    const route = data?.route;
    if (typeof route !== 'string' || !route.startsWith('/') || handled.current === id) return;
    const timer = setTimeout(() => { handled.current = id; router.push(route as never); }, 100);
    return () => clearTimeout(timer);
  }, [lastNotificationResponse, rootNavigationState?.key, isLoggedIn, userUuid, userStatus]);
}
