import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Spacing } from '@/src/constants/theme';
import { useAICallFlow } from '@/src/hooks/useAICallFlow';
import CallHeader from '@/src/components/call/CallHeader';
import CallRemoteVideoView from '@/src/components/call/CallRemoteVideoView';
import CallLocalPreview from '@/src/components/call/CallLocalPreview';
import CallControls from '@/src/components/call/CallControls';
import CallConnectingView from '@/src/components/call/CallConnectingView';
import CallEndMeetingPrompt from '@/src/components/call/CallEndMeetingPrompt';
import CallErrorFallback from '@/src/components/call/CallErrorFallback';
import CallScreenBackground from '@/src/components/call/CallScreenBackground';

function parseTimeLimitSeconds(value: string | undefined): number | null {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : null;
}

/**
 * AI 트윈 영상통화 화면
 *
 * 진입 경로:
 * - Grow 탭 → 트윈 시뮬레이션 카드 클릭 (파라미터 없음 → 본인 클론에 통화)
 * - 발견/매칭 탭 → 상대 카드의 TWIN CALL (`targetUuid` 파라미터로 상대방 uuid 전달)
 * 화면 진입 시 사용자 조작 없이 바로 통화가 걸린다("탭해서 시작" 단계를 거치지 않음).
 * 연결 완료 전(idle~connecting)에는 CallConnectingView(펄스 오브 + 스텝 인디케이터)를,
 * 연결된 이후에는 실제 영상통화 레이아웃을 보여준다.
 * 통화 종료 후 자동으로 이전 화면으로 돌아갑니다.
 *
 * 전체화면 AI 영상 + 내 셀프뷰 PIP 형태다. AI 서버가 보낸 비디오 트랙은
 * CallRemoteVideoView가 자동으로 표시하고, 아직 트랙이 없을 때만 아바타 자리표시자를 쓴다.
 *
 * 음소거/스피커는 react-native-incall-manager로 실제 오디오 라우팅까지 연결되어 있다
 * (useAICallFlow 참고, 기본 라우팅은 OS가 결정한다). 카메라 토글은 내 화면에만
 * 보이는 셀프뷰를 실제로 켜고 끈다 — 의도적으로 AI 서버로는 보내지 않는다(어차피 비디오
 * 트랙을 받으면 버리는 서버라 지금은 효과가 없고, 이미 연결된 통화 중 재협상을 새로 거는
 * 위험을 감수할 이유가 없다).
 *
 * 셀프뷰 PIP는 탭하면 커졌다 작아졌다 토글되고, 드래그하면 네 모서리 중 가까운 곳으로
 * 스냅된다(CallLocalPreview 참고) — 위치는 헤더/컨트롤 오버레이의 실측 높이(onLayout)로
 * 계산한 안전 영역(localPreviewSafeArea) 안에서만 움직이고, 통화마다 기본 위치(우상단)로
 * 초기화된다(저장하지 않음).
 *
 * 의도적으로 `useLayout()`의 컨텐츠 폭 캡을 적용하지 않는다 — 통화 화면은 몰입형
 * 풀블리드 UI(영상/컨트롤이 화면 전체를 채움)가 맞고, 태블릿에서도 좁은 칼럼으로
 * 가운데 정렬할 이유가 없다.
 */
export default function AICallScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();
  const { targetUuid, targetName, remainingSeconds, preview } = useLocalSearchParams<{
    targetUuid?: string;
    targetName?: string;
    remainingSeconds?: string;
    preview?: string;
  }>();
  const isPreview = preview === 'true';
  const isPartnerCall = !isPreview && typeof targetUuid === 'string' && targetUuid.length > 0;
  const timeLimitSeconds = parseTimeLimitSeconds(remainingSeconds);
  const {
    callStatus,
    remoteStream,
    localCameraStream,
    startCall,
    hangUp,
    error,
    isSpeakerOn,
    toggleSpeaker,
    isMuted,
    toggleMute,
    isCameraOn,
    toggleCamera,
    callDurationSeconds,
    completedCall,
  } = useAICallFlow(targetUuid);
  const [previewDurationSeconds, setPreviewDurationSeconds] = useState(0);
  const [previewMuted, setPreviewMuted] = useState(false);
  const [previewSpeakerOn, setPreviewSpeakerOn] = useState(false);
  const [previewCameraOn, setPreviewCameraOn] = useState(false);
  const [endedByTimeLimit, setEndedByTimeLimit] = useState(false);
  const hasTriggeredTimeLimitRef = useRef(false);

  // 목업 통화는 서버·권한 없이 화면만 검토하는 모드지만, 실제 화면과 같은 경과 시간 UI는
  // 확인할 수 있도록 로컬 타이머를 돌린다.
  useEffect(() => {
    if (!isPreview) return;
    const startedAt = Date.now();
    const updateDuration = () => setPreviewDurationSeconds(Math.floor((Date.now() - startedAt) / 1000));
    updateDuration();
    const intervalId = setInterval(updateDuration, 1000);
    return () => clearInterval(intervalId);
  }, [isPreview]);

  const visibleCallStatus = isPreview ? 'connected' : callStatus;
  const visibleDurationSeconds = isPreview ? previewDurationSeconds : callDurationSeconds;
  const visibleMuted = isPreview ? previewMuted : isMuted;
  const visibleSpeakerOn = isPreview ? previewSpeakerOn : isSpeakerOn;
  const visibleCameraOn = isPreview ? previewCameraOn : isCameraOn;

  // 발견에서 통화 직전 다시 읽은 잔여 시간을 전달받는다. 사용자가 결정한 기준대로
  // WebRTC 연결 완료 이후부터만 카운트하며, 0초가 되면 기존의 정식 hangUp 경로를 타서
  // signaling·녹음 종료·서버 종료 API가 모두 실행되게 한다.
  useEffect(() => {
    if (
      isPreview
      || timeLimitSeconds == null
      || callStatus !== 'connected'
      || callDurationSeconds < timeLimitSeconds
      || hasTriggeredTimeLimitRef.current
    ) {
      return;
    }

    hasTriggeredTimeLimitRef.current = true;
    setEndedByTimeLimit(true);
    void hangUp();
  }, [callDurationSeconds, callStatus, hangUp, isPreview, timeLimitSeconds]);

  // 셀프뷰 PIP 드래그 가능 영역(safeArea) 계산용 — 헤더/컨트롤 오버레이의 실제 렌더 높이를
  // onLayout으로 측정한다. Spacing 상수로 어림잡지 않는 이유: 두 오버레이 모두 내부 컴포넌트
  // (CallHeader/CallControls)의 실제 콘텐츠 높이가 포함돼야 정확한데, 그건 여기서 알 수 없다.
  const [headerHeight, setHeaderHeight] = useState(0);
  const [controlsHeight, setControlsHeight] = useState(0);
  const handleHeaderLayout = useCallback((event: LayoutChangeEvent) => {
    setHeaderHeight(event.nativeEvent.layout.height);
  }, []);
  const handleControlsLayout = useCallback((event: LayoutChangeEvent) => {
    setControlsHeight(event.nativeEvent.layout.height);
  }, []);
  // headerOverlay는 top:0, controlsOverlay는 bottom:0 절대 배치이므로, 측정된 높이가 곧
  // 화면 좌표계의 경계선이다.
  const localPreviewSafeArea = useMemo(
    () => ({
      top: headerHeight,
      bottom: windowHeight - controlsHeight,
      left: insets.left,
      right: windowWidth - insets.right,
    }),
    [headerHeight, controlsHeight, windowHeight, windowWidth, insets.left, insets.right]
  );

  // 실제로 한 번이라도 'connected'에 도달했는지 추적한다. 연결 전(joining/inviting/connecting)에
  // 취소하면 callStatus가 잠깐 'ending'을 거치는데, 이때 실제 통화 레이아웃(빈 영상 배경 +
  // 비활성화된 컨트롤)이 한 프레임 스쳐 지나가는 게 아니라 계속 CallConnectingView에 머물러야 한다.
  const hasConnectedRef = useRef(false);
  useEffect(() => {
    if (visibleCallStatus === 'connected') hasConnectedRef.current = true;
  }, [visibleCallStatus]);

  // 화면 진입 시 자동으로 통화를 건다 — "탭해서 시작" 화면을 없애고 바로 연결 흐름으로 들어간다.
  // StrictMode 이중 렌더/재마운트에도 한 번만 걸리도록 ref로 막는다(startCall이 REST 방 생성을
  // 포함해서 두 번 걸리면 안 됨).
  const hasAutoStartedRef = useRef(false);
  useEffect(() => {
    if (isPreview) return;
    if (hasAutoStartedRef.current) return;
    hasAutoStartedRef.current = true;
    startCall();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 본인 트윈 통화는 기존처럼 종료 즉시 돌아간다. 상대 트윈 통화는 서버가 반환한 COMPLETED
  // 결과가 있을 때만 만남 신청 화면을 거친다. 종료 API가 실패하면 검증할 callId가 없으므로
  // 신청 UI를 띄우지 않고 안전하게 이전 화면으로 복귀한다.
  useEffect(() => {
    if (!isPreview && callStatus === 'ended' && !error && (!isPartnerCall || completedCall == null)) {
      router.back();
    }
  }, [callStatus, completedCall, error, isPartnerCall, isPreview, router]);

  // 에러 발생 시 안내 UI
  if (error) {
    return <CallErrorFallback message={error} onBack={() => router.back()} />;
  }

  if (isPartnerCall && callStatus === 'ended' && completedCall != null) {
    return (
      <CallEndMeetingPrompt
        partnerName={targetName || '상대방'}
        partnerUserUuid={targetUuid}
        completedCall={completedCall}
        endedByTimeLimit={endedByTimeLimit}
        onClose={() => router.back()}
      />
    );
  }

  // 연결 완료 전(idle~connecting)까지는 완전히 새로 디자인된 대기 화면을 보여주고,
  // 연결된 이후(및 그 뒤의 종료 처리 중)에만 실제 영상통화 레이아웃을 보여준다.
  // 한 번도 연결되지 않은 채 취소한 경우(hasConnectedRef가 false)엔 'ending'/'ended'로 바뀌어도
  // 계속 CallConnectingView에 머문다 — router.back()이 호출될 때까지 화면이 안 바뀐다.
  const isCallLayoutVisible =
    isPreview || callStatus === 'connected' || (hasConnectedRef.current && (callStatus === 'ending' || callStatus === 'ended'));

  if (!isCallLayoutVisible) {
    // hangUp()은 세션이 이미 만들어졌으면(REST 응답 후) CALL_END 시그널 + endCall REST까지 정식으로
    // 보내고, 아직 없으면 로컬 정리만 한다 — 어느 단계에서 취소하든 서버가 항상 정확한 상태를 안다.
    // callStatus가 'ended'로 바뀌면 위 effect가 자동으로 router.back()을 호출한다.
    return <CallConnectingView callStatus={callStatus} onCancel={hangUp} />;
  }

  return (
    <CallScreenBackground>
      <CallRemoteVideoView callStatus={visibleCallStatus} remoteStream={isPreview ? null : remoteStream} />

      <View
        style={[styles.headerOverlay, { paddingTop: insets.top + Spacing.md }]}
        onLayout={handleHeaderLayout}
      >
        <CallHeader callStatus={visibleCallStatus} callDurationSeconds={visibleDurationSeconds} isPreview={isPreview} />
      </View>

      {visibleCallStatus === 'connected' && (
        <CallLocalPreview
          isCameraOn={visibleCameraOn}
          localStream={isPreview ? null : localCameraStream}
          safeArea={localPreviewSafeArea}
        />
      )}

      <View
        style={[styles.controlsOverlay, { paddingBottom: insets.bottom }]}
        onLayout={handleControlsLayout}
      >
        <CallControls
          callStatus={visibleCallStatus}
          onHangUp={isPreview ? () => router.back() : hangUp}
          isMuted={visibleMuted}
          onToggleMute={isPreview ? () => setPreviewMuted((value) => !value) : toggleMute}
          isSpeakerOn={visibleSpeakerOn}
          onToggleSpeaker={isPreview ? () => setPreviewSpeakerOn((value) => !value) : toggleSpeaker}
          isCameraOn={visibleCameraOn}
          onToggleCamera={isPreview ? () => setPreviewCameraOn((value) => !value) : toggleCamera}
        />
      </View>
    </CallScreenBackground>
  );
}

const styles = StyleSheet.create({
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  controlsOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});
