import CameraIcon from '@/assets/images/common/Camera_icon.svg';
import {Colors, Radii, FontFamily} from '@/src/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { ScanPhase } from '../types/faceScan';

interface FaceScanButtonProps {
  /** 현재 스캔 단계 */
  phase: ScanPhase;
  /** Start Scan 버튼 핸들러 */
  onStartScan?: () => void;
  /** 다음 단계 이동 핸들러 */
  onNext?: () => void;
}

/**
 * Face Scan 버튼 컴포넌트
 *
 * - idle: "Start Scan" (카메라 아이콘 + 그라데이션)
 * - scanning: 숨김 (스캔 중에는 버튼 불필요)
 * - finalizing: "영상 처리 중..." (스피너 아이콘, 클릭 불가)
 * - completed: "다음" (다음 단계로 이동)
 */
export default function FaceScanButton({
  phase,
  onStartScan,
  onNext,
}: FaceScanButtonProps) {
  // 스캔 중에는 버튼 숨김
  if (phase === 'scanning') return null;

  const isCompleted = phase === 'completed';
  const isFinalizing = phase === 'finalizing';

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={isCompleted ? onNext : onStartScan}
      disabled={isFinalizing}
      style={[styles.container, isFinalizing && styles.disabledContainer]}
    >
      <LinearGradient
        colors={isFinalizing ? [Colors.glass.slate95, Colors.glass.slate95] : Colors.gradient.cyanToPurple}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.gradient}
      >
        {!isCompleted && !isFinalizing && <CameraIcon width={24} height={24} />}
        {isFinalizing && <ActivityIndicator color={Colors.primary.electricCyan} />}
        <Text style={[styles.text, isFinalizing && styles.disabledText]}>
          {isFinalizing ? '영상 데이터 처리 중...' : isCompleted ? '다음' : 'Start Scan'}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 56,
    borderRadius: Radii.lg,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  text: {
    color: Colors.primary.soulBlack,
    textAlign: 'center',
    fontFamily: FontFamily.sans,
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
    letterSpacing: -0.312,
  },
  disabledContainer: {
    opacity: 0.7,
  },
  disabledText: {
    color: Colors.glass.white30,
  },
});
