import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/src/constants/theme';
import { useAICallFlow } from '@/src/hooks/useAICallFlow';
import CallHeader from '@/src/components/call/CallHeader';
import CallAIAvatar from '@/src/components/call/CallAIAvatar';
import CallControls from '@/src/components/call/CallControls';

/**
 * AI 트윈 음성 통화 화면
 *
 * 진입 경로: Grow 탭 → 나를 알아가는 인터뷰 카드 클릭
 * 통화 종료 후 자동으로 이전 화면으로 돌아갑니다.
 */
export default function AICallScreen() {
  const router = useRouter();
  const { callStatus, remoteStream, startCall, hangUp, error } = useAICallFlow();

  // 통화 종료 시 화면 이탈
  useEffect(() => {
    if (callStatus === 'ended') {
      router.back();
    }
  }, [callStatus, router]);

  return (
    <View style={styles.container}>
      {/* 상태 헤더 */}
      <CallHeader callStatus={callStatus} />

      {/* AI 아바타 (음성 활성 시 펄스 애니메이션) */}
      <CallAIAvatar callStatus={callStatus} />

      {/* 통화 제어 버튼 */}
      <CallControls
        callStatus={callStatus}
        onStartCall={startCall}
        onHangUp={hangUp}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary.soulBlack,
    paddingTop: 60,
  },
});
