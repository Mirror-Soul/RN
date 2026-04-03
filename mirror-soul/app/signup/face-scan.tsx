import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Platform, Animated } from 'react-native';
import { Colors } from '@/src/constants/theme';
import { useRouter } from 'expo-router';
import { Camera } from 'react-native-vision-camera';

// Step5 Component Imports
import FaceScanGlow from '@/src/components/signup/steps/Step5_FaceScan/components/FaceScanGlow';
import FaceScanHeader from '@/src/components/signup/steps/Step5_FaceScan/components/FaceScanHeader';
import FaceScanBody from '@/src/components/signup/steps/Step5_FaceScan/components/FaceScanBody';
import FaceScanButton from '@/src/components/signup/steps/Step5_FaceScan/components/FaceScanButton';
import FaceGuideOverlay from '@/src/components/signup/steps/Step5_FaceScan/components/FaceGuideOverlay';

// Hook Import
import { useFaceScan } from '@/src/components/signup/steps/Step5_FaceScan/hooks/useFaceScan';

export default function FaceScanScreen() {
  const router = useRouter();

  const {
    cameraRef,
    device,
    phase,
    currentDirection,
    currentDirectionIndex,
    completedDirections,
    isDirectionMatching,
    startScan,
    frameProcessor,
  } = useFaceScan();

  // --- 완료 애니메이션 ---
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

  // --- 다음 단계 이동 핸들러 ---
  const handleNext = () => {
    // TODO: 다음 스텝 라우트가 정해지면 변경
    console.log('스캔 완료! 다음 단계로 이동합니다.');
  };

  // --- 방향 안내 메시지 결정 ---
  const guideMessage =
    phase === 'scanning'
      ? currentDirection.guideMessage
      : phase === 'completed'
        ? '스캔이 완료되었습니다!'
        : undefined;

  return (
    <View style={styles.baseContainer}>
      <FaceScanGlow />
      <View style={styles.contentContainer}>
        {/* 헤더: 타이틀 + 동적 서브타이틀 */}
        <View style={styles.headerWrapper}>
          <FaceScanHeader guideMessage={guideMessage} />
        </View>

        {/* 바디: 카메라 또는 플레이스홀더 */}
        <View style={styles.bodyWrapper}>
          <FaceScanBody phase={phase}>
            {/* scanning/completed 일 때 렌더링되는 children */}
            {device && (
              <Camera
                ref={cameraRef}
                device={device}
                isActive={phase === 'scanning'}
                video={true}
                audio={false}
                style={StyleSheet.absoluteFill}
                frameProcessor={frameProcessor}
              />
            )}

            {/* 스캔 중 가이드 오버레이 */}
            {phase === 'scanning' && (
              <FaceGuideOverlay
                currentDirection={currentDirection}
                currentDirectionIndex={currentDirectionIndex}
                completedDirections={completedDirections}
                isDirectionMatching={isDirectionMatching}
              />
            )}

            {/* 완료 애니메이션 */}
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

        {/* 버튼: Start Scan / 다음 */}
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
