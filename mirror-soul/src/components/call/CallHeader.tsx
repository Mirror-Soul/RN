import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {Colors, FontFamily} from '@/src/constants/theme';
import type { CallStatus } from '@/src/hooks/useAICallFlow';

interface CallHeaderProps {
  callStatus: CallStatus;
}

const STATUS_TEXT: Record<CallStatus, string> = {
  idle: '연결 준비 중...',
  initiating: '통화를 시작하는 중...',
  joining: '서버에 연결 중...',
  inviting: 'AI 트윈에게 연결 중...',
  connecting: 'WebRTC 연결 중...',
  connected: 'AI 트윈과 대화 중',
  ending: '통화를 종료하는 중...',
  ended: '통화가 종료되었습니다',
};

export default function CallHeader({ callStatus }: CallHeaderProps) {
  const isConnected = callStatus === 'connected';

  return (
    <View style={styles.container}>
      <Text style={[styles.statusText, isConnected && styles.connectedText]}>
        {STATUS_TEXT[callStatus]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingTop: 16,
  },
  statusText: {
    color: Colors.neutral.lightGray,
    fontFamily: FontFamily.sans,
    fontSize: 14,
    fontWeight: '500',
  },
  connectedText: {
    color: Colors.primary.electricCyan,
  },
});
