import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, BackHandler, Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAICallFlow } from '@/src/hooks/useAICallFlow';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { darkTheme } from '@/src/constants/theme';
import { CallVideoAppearance } from '@/src/components/call/CallAppearance';
import { getMyTime } from '@/src/services/profileService';
import { useAuthStore } from '@/src/store/useAuthStore';
import { BrowseText as Text } from '@/src/components/home/common/BrowseText';
import CallHeader from '@/src/components/call/CallHeader';
import CallRemoteVideoView from '@/src/components/call/CallRemoteVideoView';
import CallLocalPreview from '@/src/components/call/CallLocalPreview';
import CallControls from '@/src/components/call/CallControls';
import CallConnectingView from '@/src/components/call/CallConnectingView';
import CallEndMeetingPrompt from '@/src/components/call/CallEndMeetingPrompt';
import CallErrorFallback from '@/src/components/call/CallErrorFallback';
import CallScreenBackground from '@/src/components/call/CallScreenBackground';

/** One call surface, with media kept away from controls and camera preview local only. */
export default function AICallScreen() {
  const router = useRouter();
  const { isDark } = useThemeColors();
  const colors = darkTheme;
  const { width, height, fontScale } = useWindowDimensions();
  const params = useLocalSearchParams<{ targetUuid?: string; targetName?: string; remainingSeconds?: string; preview?: string; receivedRequestId?: string }>();
  const targetUuid = typeof params.targetUuid === 'string' ? params.targetUuid : undefined;
  const targetName = typeof params.targetName === 'string' && params.targetName.trim() ? params.targetName : targetUuid ? '상대 트윈' : '내 트윈';
  const isPreview = params.preview === 'true';
  const partnerCall = !!targetUuid && !isPreview;
  const [retrySeconds, setRetrySeconds] = useState<number | null>(null);
  const [retrying, setRetrying] = useState(false);
  const [retryError, setRetryError] = useState<string | null>(null);
  const retryLock = useRef(false);
  const alive = useRef(true);
  const limit = Number(params.remainingSeconds);
  const timeLimit = retrySeconds ?? (Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : null);
  const flow = useAICallFlow(targetUuid);
  const { callStatus, remoteStream, localCameraStream, startCall, hangUp, error, errorKind, canRetry, canRetryEnd, isSpeakerOn, toggleSpeaker, isMuted, toggleMute, isCameraOn, isCameraPending, toggleCamera, callDurationSeconds, completedCall, notice, dismissNotice, openSettings } = flow;
  const [previewDuration, setPreviewDuration] = useState(0);
  const [previewMuted, setPreviewMuted] = useState(false);
  const [previewSpeaker, setPreviewSpeaker] = useState(false);
  const [previewCamera, setPreviewCamera] = useState(false);
  const [endedByTimeLimit, setEndedByTimeLimit] = useState(false);
  const [videoSize, setVideoSize] = useState({ width: 0, height: 0 });
  const [bodyHeight, setBodyHeight] = useState(Math.max(120, height - 180));
  const [controlHeight, setControlHeight] = useState(140);
  const autoStarted = useRef(false);
  const timedOut = useRef(false);
  const exitRequested = useRef(false);
  const hasConnected = useRef(isPreview);
  const landscape = width > height;
  const accessibleScroll = width < 280 || fontScale > 2.5 || (fontScale > 1.8 && height < 640);
  const controlRail = landscape && !accessibleScroll;
  const visibleStatus = isPreview ? 'connected' : callStatus;
  const duration = isPreview ? previewDuration : callDurationSeconds;
  const visibleCamera = isPreview ? previewCamera : isCameraOn;
  const goBack = useCallback(() => { if (router.canGoBack()) router.back(); else router.replace('/(main)'); }, [router]);
  const retryConnection = async () => {
    if (retryLock.current || !canRetry) return;
    retryLock.current = true;
    setRetrying(true); setRetryError(null);
    const owner = useAuthStore.getState().userUuid;
    try {
      const time = (await getMyTime()).result.remainingTalkTime;
      const current = useAuthStore.getState();
      if (!alive.current || !current.isLoggedIn || current.userUuid !== owner) return;
      if (!Number.isFinite(time) || time <= 0) { setRetryError('대화 시간이 없어요. 프로필에서 시간을 충전한 뒤 다시 연결해주세요.'); return; }
      setRetrySeconds(Math.floor(time));
      timedOut.current = false; exitRequested.current = false; hasConnected.current = false;
      setEndedByTimeLimit(false);
      await startCall();
    } catch { if (alive.current) setRetryError('남은 대화 시간을 확인하지 못했어요. 연결 상태를 확인하고 다시 시도해주세요.'); }
    finally { retryLock.current = false; if (alive.current) setRetrying(false); }
  };

  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);

  useEffect(() => {
    if (callStatus === 'connected' || callStatus === 'reconnecting') hasConnected.current = true;
  }, [callStatus]);
  useEffect(() => {
    if (isPreview || autoStarted.current) return;
    autoStarted.current = true;
    void startCall();
  }, [isPreview, startCall]);
  useEffect(() => {
    if (!isPreview) return;
    const start = Date.now();
    const timer = setInterval(() => setPreviewDuration(Math.floor((Date.now() - start) / 1000)), 1000);
    return () => clearInterval(timer);
  }, [isPreview]);
  useEffect(() => {
    if (isPreview || timeLimit == null || !['connected', 'reconnecting'].includes(callStatus) || callDurationSeconds < timeLimit || timedOut.current) return;
    timedOut.current = true;
    setEndedByTimeLimit(true);
    void hangUp();
  }, [callDurationSeconds, callStatus, hangUp, isPreview, timeLimit]);
  useEffect(() => {
    if (!isPreview && callStatus === 'ended' && !error && (exitRequested.current || !partnerCall || !completedCall)) goBack();
  }, [callStatus, completedCall, error, goBack, isPreview, partnerCall]);
  useEffect(() => {
    const back = BackHandler.addEventListener('hardwareBackPress', () => {
      if (isPreview || error || callStatus === 'ended' || callStatus === 'ending') { goBack(); return true; }
      exitRequested.current = true;
      void hangUp();
      return true;
    });
    return () => back.remove();
  }, [callStatus, error, goBack, hangUp, isPreview]);

  let content: React.ReactNode;
  let videoScreen = false;
  if (error) {
    content = <CallErrorFallback message={error} onBack={goBack} title={errorKind === 'end' ? '종료 상태를 확인해주세요' : errorKind === 'microphone' ? '마이크 사용을 허용해주세요' : '연결을 마치지 못했어요'}
      busy={callStatus === 'ending' || retrying} onRetry={canRetryEnd ? () => { void hangUp(); } : canRetry ? () => { void retryConnection(); } : undefined}
      retryLabel={canRetryEnd ? '종료 확인 다시 시도' : '다시 연결'} onSettings={errorKind === 'microphone' ? openSettings : undefined} secondaryMessage={retryError ?? notice} />;
  } else if (partnerCall && callStatus === 'ended' && completedCall && !exitRequested.current) {
    content = <CallEndMeetingPrompt hasReceivedRequest={!!params.receivedRequestId} partnerName={targetName} partnerUserUuid={targetUuid!} completedCall={completedCall} endedByTimeLimit={endedByTimeLimit}
      onClose={() => params.receivedRequestId ? router.replace({ pathname: '/(main)/match', params: { receivedRequestId: params.receivedRequestId, receivedRequestReturnToken: String(completedCall.callId) } }) : goBack()} />;
  } else if (!isPreview && (['idle', 'initiating', 'joining', 'inviting', 'connecting'].includes(callStatus) || (!hasConnected.current && ['ending', 'ended'].includes(callStatus)))) {
    content = <CallConnectingView callStatus={callStatus} targetName={targetName} onCancel={() => { exitRequested.current = true; void hangUp(); }} />;
  } else {
    videoScreen = true;
    content = <CallVideoAppearance><CallScreenBackground variant="video"><SafeAreaView style={styles.screen}>
      <CallResponsiveFrame scroll={accessibleScroll}>
      <CallHeader callStatus={visibleStatus} targetName={targetName} callDurationSeconds={duration} isPreview={isPreview} isMuted={isPreview ? previewMuted : isMuted} />
      {!!notice && <ScrollView style={{ height: Math.max(80, Math.min(140, height * 0.22)), flexGrow: 0 }}><View style={[styles.notice, { backgroundColor: colors.background.card, borderColor: colors.border.primary }]}>
        <Text style={[styles.noticeText, { color: colors.text.secondary }]}>{notice}</Text>
        <View style={styles.noticeActions}>{notice.includes('카메라') && <Pressable onPress={openSettings} accessibilityRole="button" accessibilityLabel="카메라 기기 설정 열기" style={styles.noticeButton}><Text style={[styles.noticeText, { color: colors.text.primary }]}>기기 설정</Text></Pressable>}
          <Pressable onPress={dismissNotice} accessibilityRole="button" accessibilityLabel="통화 안내 닫기" style={styles.noticeButton}><Text style={[styles.noticeText, { color: colors.text.primary }]}>확인</Text></Pressable></View>
      </View></ScrollView>}
      <View style={[styles.body, controlRail && styles.landscape, accessibleScroll && styles.accessibleBody]} onLayout={event => setBodyHeight(event.nativeEvent.layout.height)}>
        <View testID="call-video-area" style={styles.stage} onLayout={event => setVideoSize({ width: event.nativeEvent.layout.width, height: event.nativeEvent.layout.height })}>
          <CallRemoteVideoView callStatus={visibleStatus} remoteStream={isPreview ? null : remoteStream} targetName={targetName} isPreview={isPreview} />
          {visibleCamera && visibleStatus === 'connected' && <CallLocalPreview isCameraOn localStream={isPreview ? null : localCameraStream} safeArea={{ top: 0, left: 0, bottom: videoSize.height, right: videoSize.width }} />}
        </View>
        <ScrollView testID="call-control-area" onContentSizeChange={(_width, measuredHeight) => setControlHeight(measuredHeight)} style={[styles.controls, { backgroundColor: colors.background.card, borderColor: colors.border.primary }, controlRail ? styles.controlRail : { height: Math.min(controlHeight + 2, Math.max(96, bodyHeight * 0.45)) }]} contentContainerStyle={[styles.controlContent, !controlRail && styles.naturalControls]} showsVerticalScrollIndicator={false}>
          {callStatus === 'ending' && !isPreview && <ActivityIndicator color={colors.text.secondary} style={styles.endingSpinner} />}
          <CallControls callStatus={visibleStatus} vertical={controlRail} onHangUp={isPreview ? goBack : () => { void hangUp(); }} isMuted={isPreview ? previewMuted : isMuted} onToggleMute={isPreview ? () => setPreviewMuted(value => !value) : toggleMute}
            isSpeakerOn={isPreview ? previewSpeaker : isSpeakerOn} onToggleSpeaker={isPreview ? () => setPreviewSpeaker(value => !value) : toggleSpeaker}
            isCameraOn={visibleCamera} isCameraPending={isPreview ? false : isCameraPending} onToggleCamera={isPreview ? () => setPreviewCamera(value => !value) : () => { void toggleCamera(); }} />
        </ScrollView>
      </View>
      </CallResponsiveFrame>
    </SafeAreaView></CallScreenBackground></CallVideoAppearance>;
  }
  return <><Stack.Screen options={{ headerShown: false, gestureEnabled: false }} /><StatusBar style={videoScreen || isDark ? 'light' : 'dark'} />{content}</>;
}
function CallResponsiveFrame({ scroll, children }: { scroll: boolean; children: React.ReactNode }) {
  return scroll ? <ScrollView testID="call-accessibility-scroll" contentContainerStyle={styles.accessibleCanvas}>{children}</ScrollView> : <View style={styles.screen}>{children}</View>;
}
const styles = StyleSheet.create({
  screen: { flex: 1 }, body: { flex: 1, minHeight: 0, paddingTop: 4, paddingBottom: 10, gap: 10 },
  landscape: { flexDirection: 'row' }, stage: { flex: 1, minWidth: 0, minHeight: 0 },
  accessibleCanvas: { flexGrow: 1 }, accessibleBody: { flex: 0, height: 400 },
  controls: { flexGrow: 0, flexShrink: 0, marginHorizontal: 12, borderWidth: 1, borderRadius: 24 }, controlRail: { width: 170, flexGrow: 0, marginHorizontal: 0, marginRight: 12 },
  controlContent: { flexGrow: 1, justifyContent: 'center' }, naturalControls: { flexGrow: 0 }, endingSpinner: { marginTop: 12 },
  notice: { marginHorizontal: 16, marginBottom: 6, borderWidth: 1, borderRadius: 14, paddingHorizontal: 12, paddingTop: 10 },
  noticeText: { flexShrink: 1, fontSize: 12, lineHeight: 20 }, noticeActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  noticeButton: { minHeight: 44, minWidth: 44, justifyContent: 'center', alignItems: 'center' },
});
