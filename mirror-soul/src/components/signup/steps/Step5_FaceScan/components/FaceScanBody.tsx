import { Colors, Radii } from '@/src/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ScanPhase } from '../types/faceScan';

interface FaceScanBodyProps {
  /** 현재 스캔 단계 */
  phase: ScanPhase;
  /** phase가 idle이 아닐 때 렌더링할 자식 요소 (Camera + Overlay) */
  children?: React.ReactNode;
}

/**
 * Face Scan 바디 영역 컴포넌트
 *
 * - idle: 기존 LinearGradient 플레이스홀더
 * - scanning/completed: children(카메라 + 가이드 오버레이) 렌더링
 */
export default function FaceScanBody({ phase, children }: FaceScanBodyProps) {
  return (
    <View style={styles.container}>
      {phase === 'idle' ? (
        <LinearGradient
          colors={[Colors.glass.slate95, Colors.primary.soulBlack]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.placeholder}
        />
      ) : (
        children
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 460,
    borderRadius: Radii.xl,
    borderWidth: 0.612,
    borderColor: Colors.glass.white10,
    overflow: 'hidden',
  },
  placeholder: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});
