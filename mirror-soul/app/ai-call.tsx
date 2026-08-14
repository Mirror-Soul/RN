import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Spacing } from '@/src/constants/theme';
import { useAICallFlow } from '@/src/hooks/useAICallFlow';
import CallHeader from '@/src/components/call/CallHeader';
import CallRemoteVideoView from '@/src/components/call/CallRemoteVideoView';
import CallLocalPreview from '@/src/components/call/CallLocalPreview';
import CallControls from '@/src/components/call/CallControls';
import CallConnectingView from '@/src/components/call/CallConnectingView';
import CallErrorFallback from '@/src/components/call/CallErrorFallback';
import CallScreenBackground from '@/src/components/call/CallScreenBackground';

/**
 * AI 트윈 영상통화 화면
 *
 * 진입 경로: Grow 탭 → 트윈 시뮬레이션 카드 클릭
 * 화면 진입 시 사용자 조작 없이 바로 통화가 걸린다("탭해서 시작" 단계를 거치지 않음).
 * 연결 완료 전(idle~connecting)에는 CallConnectingView(펄스 오브 + 스텝 인디케이터)를,
 * 연결된 이후에는 실제 영상통화 레이아웃을 보여준다.
 * 통화 종료 후 자동으로 이전 화면으로 돌아갑니다.
 *
 * 레이아웃은 영상통화 형태로 미리 잡아뒀지만(전체화면 상대 영상 + 우상단 내 셀프뷰 PIP),
 * AI 서버가 아직 비디오 트랙을 안 보내는 상태라 CallRemoteVideoView가 자동으로 기존
 * 아바타 자리표시자를 대신 그린다 — 실제 비디오 트랙이 붙으면 이 화면은 그대로 두고
 * CallRemoteVideoView 내부만 실 스트림을 받게 된다.
 *
 * 음소거/스피커는 react-native-incall-manager로 실제 오디오 라우팅까지 연결되어 있다
 * (useAICallFlow 참고, 연결 시 기본값 스피커 on = 한뼘통화). 카메라 토글은 아직 로컬 캡처
 * 연동 전이라 순수 UI 자리표시자다.
 *
 * 의도적으로 `useLayout()`의 컨텐츠 폭 캡을 적용하지 않는다 — 통화 화면은 몰입형
 * 풀블리드 UI(영상/컨트롤이 화면 전체를 채움)가 맞고, 태블릿에서도 좁은 칼럼으로
 * 가운데 정렬할 이유가 없다.
 */
export default function AICallScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    callStatus,
    remoteStream,
    startCall,
    hangUp,
    error,
    isSpeakerOn,
    toggleSpeaker,
    isMuted,
    toggleMute,
  } = useAICallFlow();

  // 카메라는 아직 로컬 캡처 연동 전이라 순수 UI 자리표시자 state로 남겨둔다.
  const [isCameraOn, setIsCameraOn] = useState(false);

  // 실제로 한 번이라도 'connected'에 도달했는지 추적한다. 연결 전(joining/inviting/connecting)에
  // 취소하면 callStatus가 잠깐 'ending'을 거치는데, 이때 실제 통화 레이아웃(빈 영상 배경 +
  // 비활성화된 컨트롤)이 한 프레임 스쳐 지나가는 게 아니라 계속 CallConnectingView에 머물러야 한다.
  const hasConnectedRef = useRef(false);
  useEffect(() => {
    if (callStatus === 'connected') hasConnectedRef.current = true;
  }, [callStatus]);

  // 화면 진입 시 자동으로 통화를 건다 — "탭해서 시작" 화면을 없애고 바로 연결 흐름으로 들어간다.
  // StrictMode 이중 렌더/재마운트에도 한 번만 걸리도록 ref로 막는다(startCall이 REST 방 생성을
  // 포함해서 두 번 걸리면 안 됨).
  const hasAutoStartedRef = useRef(false);
  useEffect(() => {
    if (hasAutoStartedRef.current) return;
    hasAutoStartedRef.current = true;
    startCall();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 통화 종료 시 화면 이탈 (단, 에러가 발생한 경우는 제외하여 사용자가 에러를 인지할 수 있도록 함)
  useEffect(() => {
    if (callStatus === 'ended' && !error) {
      router.back();
    }
  }, [callStatus, error, router]);

  // 에러 발생 시 안내 UI
  if (error) {
    return <CallErrorFallback message={error} onBack={() => router.back()} />;
  }

  // 연결 완료 전(idle~connecting)까지는 완전히 새로 디자인된 대기 화면을 보여주고,
  // 연결된 이후(및 그 뒤의 종료 처리 중)에만 실제 영상통화 레이아웃을 보여준다.
  // 한 번도 연결되지 않은 채 취소한 경우(hasConnectedRef가 false)엔 'ending'/'ended'로 바뀌어도
  // 계속 CallConnectingView에 머문다 — router.back()이 호출될 때까지 화면이 안 바뀐다.
  const isCallLayoutVisible =
    callStatus === 'connected' || (hasConnectedRef.current && (callStatus === 'ending' || callStatus === 'ended'));

  if (!isCallLayoutVisible) {
    // hangUp()은 세션이 이미 만들어졌으면(REST 응답 후) CALL_END 시그널 + endCall REST까지 정식으로
    // 보내고, 아직 없으면 로컬 정리만 한다 — 어느 단계에서 취소하든 서버가 항상 정확한 상태를 안다.
    // callStatus가 'ended'로 바뀌면 위 effect가 자동으로 router.back()을 호출한다.
    return <CallConnectingView callStatus={callStatus} onCancel={hangUp} />;
  }

  return (
    <CallScreenBackground>
      <CallRemoteVideoView callStatus={callStatus} remoteStream={remoteStream} />

      <View style={[styles.headerOverlay, { paddingTop: insets.top + Spacing.md }]}>
        <CallHeader callStatus={callStatus} />
      </View>

      {callStatus === 'connected' && (
        <View style={[styles.localPreviewOverlay, { top: insets.top + Spacing.massive }]}>
          <CallLocalPreview isCameraOn={isCameraOn} />
        </View>
      )}

      <View style={[styles.controlsOverlay, { paddingBottom: insets.bottom }]}>
        <CallControls
          callStatus={callStatus}
          onHangUp={hangUp}
          isMuted={isMuted}
          onToggleMute={toggleMute}
          isSpeakerOn={isSpeakerOn}
          onToggleSpeaker={toggleSpeaker}
          isCameraOn={isCameraOn}
          onToggleCamera={() => setIsCameraOn((prev) => !prev)}
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
  localPreviewOverlay: {
    position: 'absolute',
    right: Spacing.xl,
  },
  controlsOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});
