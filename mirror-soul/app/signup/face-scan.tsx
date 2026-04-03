import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Platform, Animated } from 'react-native';
import { Colors } from '@/src/constants/theme';
import { useRouter } from 'expo-router';
import { useCameraDevice } from 'react-native-vision-camera';

// Step5 Component Imports
import FaceScanGlow from '@/src/components/signup/steps/Step5_FaceScan/components/FaceScanGlow';
import FaceScanHeader from '@/src/components/signup/steps/Step5_FaceScan/components/FaceScanHeader';
import FaceScanBody from '@/src/components/signup/steps/Step5_FaceScan/components/FaceScanBody';
import FaceScanButton from '@/src/components/signup/steps/Step5_FaceScan/components/FaceScanButton';
import FaceGuideOverlay from '@/src/components/signup/steps/Step5_FaceScan/components/FaceGuideOverlay';
import FaceCameraView from '@/src/components/signup/steps/Step5_FaceScan/components/FaceCameraView';

// Hook Imports
import { useFaceScan } from '@/src/components/signup/steps/Step5_FaceScan/hooks/useFaceScan';
import { useFaceProcessor } from '@/src/components/signup/steps/Step5_FaceScan/hooks/useFaceProcessor';

/**
 * 3D Face Scan 메인 화면
 *
 * 이 화면은 상단 안내(Header), 중앙 스캔 영역(Body), 하단 제어(Button)로 구성됩니다.
 * useFaceScan 훅을 통해 상태를 관리하고, useFaceProcessor 훅을 통해 고성능 카메라 엔진을 구동합니다.
 */
export default function FaceScanScreen() {
  const router = useRouter();
  const device = useCameraDevice('front');

  // 1. 상태 및 비즈니스 로직 관리
  const {
    cameraRef,
    phase,
    currentDirection,
    currentDirectionIndex,
    completedDirections,
    isDirectionMatching,
    startScan,
    handleFaceDetection,
  } = useFaceScan();

  // 2. 고성능 카메라 프레임 프로세서 엔진 (Ref Pattern 적용으로 Stale Closure 문제 해결)
  const { frameProcessor } = useFaceProcessor({
    onFaceDetected: handleFaceDetection,
    isActive: phase === 'scanning',
  });

  // --- 완료 애니메이션 제어 ---
  const completionAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (phase === 'completed') {
      Animated.spring(completionAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();
    } else {
      completionAnim.setValue(0);
    }
  }, [phase, completionAnim]);

  // --- 이벤트 핸들러 ---
  const handleNext = () => {
    // TODO: 프로퍼 파일 설정 후 다음 단계로 이동
    console.log('스캔 완료! 다음 단계로 이동합니다.');
  };

  // --- 텍스트 결정 로직 ---
  const guideMessage =
    phase === 'scanning'
      ? currentDirection.guideMessage
      : phase === 'finalizing'
        ? '스캔 데이터를 저장 중입니다...'
        : phase === 'completed'
          ? '스캔이 완료되었습니다!'
          : undefined;

  // --- Finalizing 애니메이션 ---
  const pulseAnim = useRef(new Animated.Value(0.8)).current;
  useEffect(() => {
    if (phase === 'finalizing') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.1, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 0.8, duration: 800, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
    }
  }, [phase, pulseAnim]);

  return (
    <View style={styles.baseContainer}>
      <FaceScanGlow />
      <View style={styles.contentContainer}>
        {/* 헤더 섹션 */}
        <View style={styles.headerWrapper}>
          <FaceScanHeader guideMessage={guideMessage} />
        </View>

        {/* 메인 스캔 영역 (Body) */}
        <View style={styles.bodyWrapper}>
          <FaceScanBody phase={phase}>
            {/* 카메라 뷰: 스캔 및 처리 중일 때만 표시 (마운트 유지를 통해 콜백 수신) */}
            {device && (phase === 'scanning' || phase === 'finalizing') && (
              <FaceCameraView
                ref={cameraRef}
                device={device}
                isActive={true}
                frameProcessor={frameProcessor}
              />
            )}

            {/* 가이드 오버레이 */}
            {phase === 'scanning' && (
              <FaceGuideOverlay
                currentDirection={currentDirection}
                currentDirectionIndex={currentDirectionIndex}
                completedDirections={completedDirections}
                isDirectionMatching={isDirectionMatching}
              />
            )}

            {/* Finalizing (저장 중) 애니메이션 오버레이: 카메라 화면 완전 가림 */}
            {phase === 'finalizing' && (
              <View style={[styles.completionOverlay, { backgroundColor: Colors.primary.soulBlack }]}>
                <Animated.View
                  style={[
                    styles.processingCircle,
                    { transform: [{ scale: pulseAnim }] },
                  ]}
                />
              </View>
            )}

            {/* 완료 체크마크 애니메이션 */}
            {phase === 'completed' && (
              <Animated.View
                style={[
                  styles.completionOverlay,
                  {
                    opacity: completionAnim,
                    transform: [{ scale: completionAnim }],
                  },
                ]}
              >
                <View style={styles.checkmarkCircle}>
                  <Animated.Text style={styles.checkmarkText}>✓</Animated.Text>
                </View>
              </Animated.View>
            )}
          </FaceScanBody>
        </View>

        {/* 하단 제어 섹션 */}
        <View style={styles.buttonWrapper}>
          <FaceScanButton
            phase={phase}
            onStartScan={startScan}
            onNext={handleNext}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  baseContainer: {
    flex: 1,
    backgroundColor: Colors.primary.soulBlack,
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 16 : 8,
    paddingBottom: 50,
    paddingHorizontal: 24,
  },
  headerWrapper: {
    width: '100%',
    maxWidth: 345,
  },
  bodyWrapper: {
    width: '100%',
    maxWidth: 345,
    marginTop: 32,
  },
  buttonWrapper: {
    width: '100%',
    maxWidth: 345,
    marginTop: 40,
  },
  completionOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  processingCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: Colors.primary.electricCyan,
    borderStyle: 'dashed',
  },
  checkmarkCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary.successGreen,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary.successGreen,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
  },
  checkmarkText: {
    color: Colors.primary.soulBlack,
    fontSize: 48,
    fontWeight: '700',
  },
});
